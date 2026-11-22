import { NextResponse } from 'next/server';
import { findMemberByIdentity, findMemberByLookup, getDb } from '@/lib/data';
import { getMpesaStatus } from '@/lib/leetec';
import { sendPaymentWelcomeEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lookup = url.searchParams.get('lookup') || '';
    const regNo = url.searchParams.get('regNo') || '';
    const phone = url.searchParams.get('phone') || '';
    const member = lookup ? await findMemberByLookup(lookup) : await findMemberByIdentity(regNo, phone);
    if (!member) return NextResponse.json({ error: 'Member account not found.' }, { status: 404 });
    if (!member.paymentRequestId) return NextResponse.json({ paymentStatus: member.paymentStatus, paymentMessage: 'No active M-Pesa payment prompt was found.' });
    const result = await getMpesaStatus(member.paymentRequestId);
    const normalized = ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID', 'CONFIRMED'].includes(result.status) ? 'paid' : (['FAILED', 'CANCELLED', 'REJECTED', 'FAILED_PAYMENT'].includes(result.status) ? 'rejected' : 'pending');
    const db = await getDb();
    let emailStatus: 'sent' | 'already_sent' | 'failed' | 'not_configured' | 'not_persisted' = 'not_persisted';
    const paidAt = normalized === 'paid' ? (member.paidAt || new Date().toISOString()) : member.paidAt;
    const paymentReceipt = result.receipt || member.paymentReceipt;
    if (db && result.configured && result.status !== 'ERROR') {
      await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { paymentStatus: normalized, paymentReceipt, paidAt, ...(normalized === 'paid' ? { status: 'approved' } : {}) } });
      if (normalized === 'paid' && member.welcomeEmailSentAt) emailStatus = 'already_sent';
      else if (normalized === 'paid') {
        const email = await sendPaymentWelcomeEmail({ ...member, paymentStatus: 'paid', status: 'approved', paymentReceipt, paidAt }, paymentReceipt);
        if (email.sent) {
          emailStatus = 'sent';
          await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { welcomeEmailSentAt: new Date().toISOString(), welcomeEmailId: email.id, welcomeEmailStatus: 'sent' } });
        } else {
          emailStatus = email.configured ? 'failed' : 'not_configured';
          await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { welcomeEmailStatus: 'failed' } });
        }
      }
    }
    return NextResponse.json({ paymentStatus: normalized, membershipStatus: normalized === 'paid' ? 'approved' : member.status, providerStatus: result.status, providerConfigured: result.configured, receipt: paymentReceipt || null, emailStatus });
  } catch { return NextResponse.json({ error: 'Unable to check M-Pesa payment status.' }, { status: 500 }); }
}
