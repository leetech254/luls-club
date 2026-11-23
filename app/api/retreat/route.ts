import { NextResponse } from 'next/server';
import { findMemberByLookup, getDb } from '@/lib/data';
import { getMpesaStatus, normalizeKenyanPhone, startMpesaPrompt } from '@/lib/leetec';

const phonePattern = /^\+254(?:1[0-9]|7[0-9])[0-9]{7}$/;
const paidStatuses = ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID', 'CONFIRMED'];
const rejectedStatuses = ['FAILED', 'FAILED_PAYMENT', 'CANCELLED', 'REJECTED'];

function paymentState(status: string) { return paidStatuses.includes(status) ? 'paid' : rejectedStatuses.includes(status) ? 'rejected' : 'pending'; }

async function findRetreatMember(lookup: string) {
  const member = await findMemberByLookup(lookup);
  if (!member) return { member: null, error: NextResponse.json({ error: 'No member account was found. New members must complete the KES 100 registration payment first.', requiresRegistration: true }, { status: 404 }) };
  if (member.status !== 'approved' || member.paymentStatus !== 'paid') return { member: null, error: NextResponse.json({ error: 'Retreat payment is available only to approved members. Complete the KES 100 registration payment first.', requiresRegistration: true }, { status: 403 }) };
  return { member, error: null };
}

export async function GET(req: Request) {
  try {
    const lookup = new URL(req.url).searchParams.get('lookup')?.trim() || '';
    if (!lookup) return NextResponse.json({ error: 'Enter your member name, registration number, or phone number.' }, { status: 400 });
    const { member, error } = await findRetreatMember(lookup);
    if (error || !member) return error;
    let status = member.retreatPaymentStatus || 'unpaid';
    let receipt = member.retreatPaymentReceipt;
    if (member.retreatPaymentRequestId && status === 'pending') {
      const result = await getMpesaStatus(member.retreatPaymentRequestId);
      status = paymentState(result.status);
      receipt = result.receipt || receipt;
      const db = await getDb();
      if (db && result.configured && result.status !== 'ERROR') {
        await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { retreatPaymentStatus: status, retreatPaymentReceipt: receipt, ...(status === 'paid' ? { retreatPaidAt: member.retreatPaidAt || new Date().toISOString() } : {}) } });
      }
    }
    return NextResponse.json({ eligible: true, member: { regNo: member.regNo, name: member.name, retreatPaymentStatus: status, retreatPaymentRequestId: member.retreatPaymentRequestId, retreatPaymentReceipt: receipt || null } });
  } catch { return NextResponse.json({ error: 'Unable to check retreat payment status.' }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lookup = String(body.lookup || '').trim();
    const phone = normalizeKenyanPhone(String(body.mpesaPhone || ''));
    if (!lookup) return NextResponse.json({ error: 'Enter your member name, registration number, or phone number.' }, { status: 400 });
    if (!phonePattern.test(phone)) return NextResponse.json({ error: 'Enter a valid Kenyan M-Pesa number for the KES 200 retreat payment.' }, { status: 400 });
    const { member, error } = await findRetreatMember(lookup);
    if (error || !member) return error;
    if (member.retreatPaymentStatus === 'paid') return NextResponse.json({ eligible: true, paymentStatus: 'paid', message: 'Your Thomson Falls retreat payment is already confirmed.', member: { regNo: member.regNo, name: member.name, retreatPaymentReceipt: member.retreatPaymentReceipt || null } });
    const prompt = await startMpesaPrompt({ phone, regNo: member.regNo, name: member.name, amount: 200, accountReference: `LULS-RETREAT-${member.regNo}` });
    if (!prompt.accepted) return NextResponse.json({ error: prompt.error || 'Unable to start the KES 200 retreat payment.' }, { status: 503 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this retreat payment.' }, { status: 503 });
    await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { retreatPaymentStatus: 'pending', retreatPaymentRequestId: prompt.requestId, retreatPaymentReference: prompt.requestId, retreatPaymentReceipt: null } });
    return NextResponse.json({ eligible: true, paymentStatus: 'pending', requestId: prompt.requestId, message: `KES 200 retreat payment prompt sent to ${phone}. Complete it on that phone, then refresh this page.` }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unable to start the retreat payment right now.' }, { status: 500 }); }
}
