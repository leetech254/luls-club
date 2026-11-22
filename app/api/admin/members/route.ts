import { NextResponse } from 'next/server';
import { getDb, listMembers } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';
import { normalizeKenyanPhone } from '@/lib/leetec';
import { buildLegacyMembers } from '@/lib/legacy-members';

const regNoPattern = /^[A-Z]{2,5}\/[A-Z]{2,8}\/[0-9]{3,8}\/[0-9]{2}$/;
const phonePattern = /^\+254(?:1[0-9]|7[0-9])[0-9]{7}$/;
const paymentStatuses = ['unpaid', 'pending', 'paid', 'rejected'] as const;

function cleanMemberInput(body: Record<string, unknown>, fallback?: { regNo?: string }) {
  const regNo = String(body.regNo || fallback?.regNo || '').trim().toUpperCase();
  const name = String(body.name || '').trim();
  const phone = normalizeKenyanPhone(String(body.phone || ''));
  const paymentPhone = normalizeKenyanPhone(String(body.paymentPhone || body.phone || ''));
  const paymentStatus = String(body.paymentStatus || 'unpaid') as (typeof paymentStatuses)[number];
  if (!regNo || !regNoPattern.test(regNo)) throw new Error('Use a registration number like ED/ART/1158/25 or LULS/LEGACY/0001/26.');
  if (!name) throw new Error('Member name is required.');
  if (!phonePattern.test(phone)) throw new Error('Enter a valid Kenyan phone number.');
  if (!phonePattern.test(paymentPhone)) throw new Error('Enter a valid M-Pesa phone number.');
  if (!paymentStatuses.includes(paymentStatus)) throw new Error('Choose a valid payment status.');
  return { regNo, name, phone, paymentPhone, email: String(body.email || '').trim().toLowerCase(), level: String(body.level || 'Legacy registered member').trim(), role: String(body.role || 'LULS member').trim(), interests: String(body.interests || 'LULS registered member').split(',').map((item) => item.trim()).filter(Boolean), bio: String(body.bio || 'Registered LULS member.').trim(), paymentStatus, paymentAmount: 100, paymentCurrency: 'KES' as const, paymentMethod: String(body.paymentMethod || 'M-Pesa'), paymentReference: String(body.paymentReference || '').trim(), paymentReceipt: String(body.paymentReceipt || '').trim(), status: paymentStatus === 'paid' ? 'approved' as const : 'pending' as const };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try { return NextResponse.json({ members: await listMembers(true) }); }
  catch { return NextResponse.json({ error: 'Unable to load members.' }, { status: 500 }); }
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await req.json();
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    if (body.action === 'import-legacy') {
      const legacyMembers = buildLegacyMembers();
      await db.collection('members').createIndex({ regNo: 1 }, { unique: true });
      const operations = legacyMembers.map((member) => ({ updateOne: { filter: { regNo: member.regNo }, update: { $setOnInsert: member }, upsert: true } }));
      const result = await db.collection('members').bulkWrite(operations, { ordered: false });
      return NextResponse.json({ ok: true, imported: result.upsertedCount, existing: legacyMembers.length - result.upsertedCount, total: legacyMembers.length });
    }
    const member = cleanMemberInput(body);
    const existing = await db.collection('members').findOne({ $or: [{ regNo: member.regNo }, { phone: member.phone }] });
    if (existing) return NextResponse.json({ error: 'A member with that registration number or phone is already registered.' }, { status: 409 });
    const now = new Date().toISOString();
    const record = { ...member, slug: `admin-${member.regNo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-5)}`, interests: member.interests, createdAt: now, ...(member.paymentStatus === 'paid' ? { paidAt: now } : {}) };
    await db.collection('members').insertOne(record);
    return NextResponse.json({ ok: true, member: record }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to add member.' }, { status: 400 }); }
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await req.json();
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    const originalRegNo = String(body.originalRegNo || body.regNo || '').trim().toUpperCase();
    if (!originalRegNo) return NextResponse.json({ error: 'Original registration number is required.' }, { status: 400 });
    if (!body.name && !body.phone) {
      const paymentStatus = String(body.paymentStatus || '') as (typeof paymentStatuses)[number];
      if (!paymentStatuses.includes(paymentStatus)) return NextResponse.json({ error: 'Choose a valid payment status.' }, { status: 400 });
      const result = await db.collection('members').updateOne({ regNo: originalRegNo }, { $set: { paymentStatus, status: paymentStatus === 'paid' ? 'approved' : 'pending', ...(paymentStatus === 'paid' ? { paidAt: new Date().toISOString() } : { paidAt: null }) } });
      if (!result.matchedCount) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, regNo: originalRegNo, paymentStatus });
    }
    const member = cleanMemberInput(body, { regNo: originalRegNo });
    if (member.regNo !== originalRegNo) {
      const duplicate = await db.collection('members').findOne({ regNo: member.regNo });
      if (duplicate) return NextResponse.json({ error: 'That new registration number is already in use.' }, { status: 409 });
    }
    const now = new Date().toISOString();
    const update = { ...member, ...(member.paymentStatus === 'paid' ? { paidAt: String(body.paidAt || now) } : { paidAt: null }) };
    const result = await db.collection('members').updateOne({ regNo: originalRegNo }, { $set: update });
    if (!result.matchedCount) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, member: { ...update, regNo: member.regNo } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update member.' }, { status: 400 }); }
}
