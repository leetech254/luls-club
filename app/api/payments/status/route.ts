import { NextResponse } from 'next/server';
import { findMemberByIdentity, findMemberByLookup, getDb } from '@/lib/data';
import { getMpesaStatus } from '@/lib/leetec';

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
    const normalized = result.status === 'SUCCESS' ? 'paid' : (['FAILED', 'CANCELLED', 'REJECTED'].includes(result.status) ? 'rejected' : 'pending');
    const db = await getDb();
    if (db && result.configured && result.status !== 'ERROR') await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { paymentStatus: normalized, paymentReceipt: result.receipt || member.paymentReceipt, paidAt: normalized === 'paid' ? (member.paidAt || new Date().toISOString()) : member.paidAt } });
    return NextResponse.json({ paymentStatus: normalized, providerStatus: result.status, providerConfigured: result.configured, receipt: result.receipt || null });
  } catch { return NextResponse.json({ error: 'Unable to check M-Pesa payment status.' }, { status: 500 }); }
}
