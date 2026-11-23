import { NextResponse } from 'next/server';
import { findMemberByIdentity, findMemberByLookup, getDb } from '@/lib/data';
import { getMpesaStatus } from '@/lib/leetec';
import { sendPaymentWelcomeEmail } from '@/lib/email';

const paidStatuses = new Set(['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID', 'CONFIRMED']);
const rejectedStatuses = new Set(['FAILED', 'CANCELLED', 'REJECTED', 'FAILED_PAYMENT', 'DECLINED']);

function paymentState(status: string) {
  if (paidStatuses.has(status)) return 'paid' as const;
  if (rejectedStatuses.has(status)) return 'rejected' as const;
  return 'pending' as const;
}

async function createPaidMember(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, payment: any, receipt: string | undefined, paidAt: string) {
  await db.collection('members').createIndex({ regNo: 1 }, { unique: true });
  let member: any = await db.collection('members').findOne({ regNo: payment.regNo });
  if (!member) {
    const candidate = {
      slug: `${payment.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-5)}`,
      regNo: payment.regNo,
      name: payment.name,
      email: payment.email,
      phone: payment.phone,
      paymentPhone: payment.paymentPhone,
      level: payment.level,
      role: 'LULS member',
      interests: payment.interests,
      bio: payment.bio,
      status: 'approved' as const,
      paymentStatus: 'paid' as const,
      paymentAmount: 100,
      paymentCurrency: 'KES' as const,
      paymentReference: payment.paymentReference,
      paymentMethod: payment.paymentMethod,
      paymentRequestId: payment.paymentRequestId,
      paymentReceipt: receipt,
      paidAt,
      createdAt: payment.createdAt,
    };
    try {
      await db.collection('members').insertOne(candidate);
      member = candidate;
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      member = await db.collection('members').findOne({ regNo: payment.regNo });
    }
  } else {
    await db.collection('members').updateOne({ regNo: payment.regNo }, { $set: { status: 'approved', paymentStatus: 'paid', paymentReceipt: receipt, paidAt } });
    member = { ...member, status: 'approved', paymentStatus: 'paid', paymentReceipt: receipt, paidAt };
  }
  return member;
}

async function sendWelcomeEmail(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, member: any, receipt: string | undefined, paidAt: string) {
  if (member.welcomeEmailSentAt) return 'already_sent';
  const email = await sendPaymentWelcomeEmail({ ...member, status: 'approved', paymentStatus: 'paid', paymentReceipt: receipt, paidAt }, receipt);
  if (email.sent) {
    await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { welcomeEmailSentAt: new Date().toISOString(), welcomeEmailId: email.id, welcomeEmailStatus: 'sent' } });
    return 'sent';
  }
  await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { welcomeEmailStatus: 'failed' } });
  return email.configured ? 'failed' : 'not_configured';
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lookup = url.searchParams.get('lookup') || '';
    const regNo = url.searchParams.get('regNo') || '';
    const phone = url.searchParams.get('phone') || '';
    const member = lookup ? await findMemberByLookup(lookup) : await findMemberByIdentity(regNo, phone);
    const db = await getDb();

    if (!member) {
      const pendingRegNo = (lookup || regNo).trim().toUpperCase();
      const payment = db && pendingRegNo ? await db.collection('registrationPayments').findOne({ regNo: pendingRegNo, status: 'pending' }) : null;
      if (!payment) return NextResponse.json({ error: 'Member account not found.' }, { status: 404 });
      const result = await getMpesaStatus(payment.paymentRequestId);
      const normalized = paymentState(result.status);
      if (!result.configured) return NextResponse.json({ paymentStatus: 'pending', providerConfigured: false, providerStatus: result.status, emailStatus: 'not_applicable' });
      if (result.status === 'ERROR') return NextResponse.json({ paymentStatus: 'pending', providerConfigured: true, providerStatus: result.status, emailStatus: 'not_applicable' });
      const paymentReceipt = result.receipt || payment.paymentReceipt;
      if (normalized === 'pending') return NextResponse.json({ paymentStatus: 'pending', providerConfigured: true, providerStatus: result.status, receipt: paymentReceipt || null, emailStatus: 'not_applicable' });
      if (normalized === 'rejected') {
        await db!.collection('registrationPayments').deleteOne({ regNo: payment.regNo });
        return NextResponse.json({ paymentStatus: 'rejected', membershipStatus: 'pending', providerConfigured: true, providerStatus: result.status, receipt: paymentReceipt || null, emailStatus: 'not_applicable' });
      }
      const paidAt = new Date().toISOString();
      const paidMember = await createPaidMember(db!, payment, paymentReceipt, paidAt);
      await db!.collection('registrationPayments').deleteOne({ regNo: payment.regNo });
      const emailStatus = await sendWelcomeEmail(db!, paidMember, paymentReceipt, paidAt);
      return NextResponse.json({ paymentStatus: 'paid', membershipStatus: 'approved', providerConfigured: true, providerStatus: result.status, receipt: paymentReceipt || null, emailStatus });
    }

    if (!member.paymentRequestId) return NextResponse.json({ paymentStatus: member.paymentStatus, membershipStatus: member.paymentStatus === 'paid' ? 'approved' : member.status, paymentMessage: 'No active M-Pesa payment prompt was found.' });
    const result = await getMpesaStatus(member.paymentRequestId);
    const normalized = paymentState(result.status);
    let emailStatus: 'sent' | 'already_sent' | 'failed' | 'not_configured' | 'not_persisted' = 'not_persisted';
    const paidAt = normalized === 'paid' ? (member.paidAt || new Date().toISOString()) : member.paidAt;
    const paymentReceipt = result.receipt || member.paymentReceipt;
    if (db && result.configured && result.status !== 'ERROR') {
      await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { paymentStatus: normalized, paymentReceipt, ...(paidAt ? { paidAt } : {}), ...(normalized === 'paid' ? { status: 'approved' } : {}) } });
      if (normalized === 'paid') emailStatus = await sendWelcomeEmail(db, { ...member, paymentStatus: 'paid', status: 'approved', paymentReceipt, paidAt }, paymentReceipt, paidAt || new Date().toISOString());
    }
    return NextResponse.json({ paymentStatus: normalized, membershipStatus: normalized === 'paid' ? 'approved' : member.status, providerStatus: result.status, providerConfigured: result.configured, receipt: paymentReceipt || null, emailStatus });
  } catch {
    return NextResponse.json({ error: 'Unable to check M-Pesa payment status.' }, { status: 500 });
  }
}
