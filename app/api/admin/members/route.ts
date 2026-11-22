import { NextResponse } from 'next/server';
import { listMembers, getDb } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try { return NextResponse.json({ members: await listMembers(true) }); }
  catch { return NextResponse.json({ error: 'Unable to load members.' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await req.json();
    const regNo = String(body.regNo || '').trim().toUpperCase();
    const paymentStatus = String(body.paymentStatus || '');
    if (!regNo || !['unpaid', 'pending', 'paid', 'rejected'].includes(paymentStatus)) return NextResponse.json({ error: 'Registration number and valid payment status are required.' }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'MongoDB is not configured for this deployment.' }, { status: 503 });
    const update = { paymentStatus, ...(paymentStatus === 'paid' ? { paidAt: new Date().toISOString() } : { paidAt: null }) };
    const result = await db.collection('members').updateOne({ regNo }, { $set: update });
    if (!result.matchedCount) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, regNo, paymentStatus });
  } catch { return NextResponse.json({ error: 'Unable to update payment status.' }, { status: 500 }); }
}
