import { NextResponse } from 'next/server';
import { findMemberByIdentity, findMemberByLookup, getDb } from '@/lib/data';
import { startMpesaPrompt, normalizeKenyanPhone } from '@/lib/leetec';

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
const regNoPattern = /^[A-Z]{2,5}\/[A-Z]{2,8}\/[0-9]{3,8}\/[0-9]{2}$/;
const kenyanMobilePattern = /^\+254[17][0-9]{8}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lookup = url.searchParams.get('lookup') || '';
  const regNo = url.searchParams.get('regNo') || '';
  const phone = url.searchParams.get('phone') || '';
  if (!lookup && (!regNo || !phone)) return NextResponse.json({ error: 'Enter a registration number or phone number.' }, { status: 400 });
  const member = lookup ? await findMemberByLookup(lookup) : await findMemberByIdentity(regNo, phone);
  if (!member) return NextResponse.json({ registered: false, message: 'No matching LULS registration was found.' }, { status: 404 });
  return NextResponse.json({ registered: true, member: { regNo: member.regNo, name: member.name, status: member.status, role: member.role, level: member.level, interests: member.interests, createdAt: member.createdAt, paymentPhone: member.paymentPhone, paymentStatus: member.paymentStatus, paymentAmount: member.paymentAmount, paymentCurrency: member.paymentCurrency, paymentReference: member.paymentReference, paymentRequestId: member.paymentRequestId, paymentReceipt: member.paymentReceipt, paidAt: member.paidAt } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ['regNo', 'name', 'phone', 'mpesaPhone', 'email', 'level', 'role', 'interests', 'bio'];
    for (const key of required) if (!String(body[key] || '').trim()) return NextResponse.json({ error: `${key === 'mpesaPhone' ? 'M-Pesa STK Push number' : key} is required.` }, { status: 400 });

    const regNo = String(body.regNo).trim().toUpperCase();
    const phone = normalizeKenyanPhone(String(body.phone));
    const mpesaPhone = normalizeKenyanPhone(String(body.mpesaPhone));
    if (!regNoPattern.test(regNo)) return NextResponse.json({ error: 'Use a registration number like ED/ART/1158/25.' }, { status: 400 });
    if (!kenyanMobilePattern.test(phone)) return NextResponse.json({ error: 'Enter a valid Kenyan contact number, for example 0712 345 678.' }, { status: 400 });
    if (!kenyanMobilePattern.test(mpesaPhone)) return NextResponse.json({ error: 'Enter a valid Kenyan M-Pesa number, for example 0712 345 678.' }, { status: 400 });

    const db = await getDb();
    if (db) {
      const existing = await db.collection('members').findOne({ regNo });
      if (existing) return NextResponse.json({ error: 'That registration number is already registered.' }, { status: 409 });
    }

    const name = String(body.name).trim();
    const prompt = await startMpesaPrompt({ phone: mpesaPhone, regNo, name });
    if (!prompt.accepted) return NextResponse.json({ error: prompt.error || 'Unable to start the M-Pesa prompt.' }, { status: 503 });

    const member = { slug: `${slugify(name)}-${Date.now().toString().slice(-5)}`, regNo, name, email: String(body.email).trim().toLowerCase(), phone, paymentPhone: mpesaPhone, level: String(body.level).trim(), role: String(body.role).trim(), interests: String(body.interests).split(',').map((x: string) => x.trim()).filter(Boolean), bio: String(body.bio).trim(), photo: typeof body.photo === 'string' ? body.photo : '', status: 'pending' as const, paymentStatus: 'pending' as const, paymentAmount: 100, paymentCurrency: 'KES' as const, paymentReference: prompt.requestId, paymentRequestId: prompt.requestId, paymentMethod: 'M-Pesa STK Push', createdAt: new Date().toISOString() };
    if (db) { await db.collection('members').createIndex({ regNo: 1 }, { unique: true }); await db.collection('members').insertOne(member); }
    return NextResponse.json({ ok: true, paymentStarted: true, message: `M-Pesa prompt sent to ${mpesaPhone}. Complete the KES 100 payment on that phone, then check your account status.`, requestId: prompt.requestId, member: { ...member, _id: undefined } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to start registration payment right now.' }, { status: 500 });
  }
}
