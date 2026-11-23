import { NextResponse } from 'next/server';
import { findMemberByIdentity, findMemberByLookup, getDb } from '@/lib/data';
import { startMpesaPrompt, normalizeKenyanPhone } from '@/lib/leetec';
import { maskPhone } from '@/lib/privacy';

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
const regNoPattern = /^[A-Z]{2,5}\/[A-Z]{2,8}\/[0-9]{3,8}\/[0-9]{2}$/;
const kenyanMobilePattern = /^\+254(?:1[0-9]|7[0-9])[0-9]{7}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lookup = url.searchParams.get('lookup') || '';
  const regNo = url.searchParams.get('regNo') || '';
  const phone = url.searchParams.get('phone') || '';
  if (!lookup && (!regNo || !phone)) return NextResponse.json({ error: 'Enter a registration number, full name, or phone number.' }, { status: 400 });
  const member = lookup ? await findMemberByLookup(lookup) : await findMemberByIdentity(regNo, phone);
  if (!member) return NextResponse.json({ registered: false, message: 'No matching LULS registration was found.' }, { status: 404 });
  const membershipStatus = member.paymentStatus === 'paid' ? 'approved' : member.status;
  if (membershipStatus !== member.status) {
    const db = await getDb();
    if (db) await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { status: membershipStatus } });
  }
  return NextResponse.json({ registered: true, member: { regNo: member.regNo, status: membershipStatus, createdAt: member.createdAt, paymentPhone: maskPhone(member.paymentPhone), paymentStatus: member.paymentStatus, paymentAmount: member.paymentAmount, paymentCurrency: member.paymentCurrency, paymentReceipt: member.paymentReceipt, paidAt: member.paidAt } });
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
    if (!kenyanMobilePattern.test(phone)) return NextResponse.json({ error: 'Enter a valid Kenyan contact number, for example 0116 123 456, 0723 456 789, or 254723456789.' }, { status: 400 });
    if (!kenyanMobilePattern.test(mpesaPhone)) return NextResponse.json({ error: 'Enter a valid Kenyan M-Pesa number, for example 0116 123 456, 0723 456 789, or 254723456789.' }, { status: 400 });

    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The registration database is not configured yet.' }, { status: 503 });
    const existing = await db.collection('members').findOne({ regNo });
    if (existing) return NextResponse.json({ error: 'That registration number is already registered.' }, { status: 409 });
    const activePayment = await db.collection('registrationPayments').findOne({ regNo, status: 'pending' });
    if (activePayment) return NextResponse.json({ error: 'A registration payment is already in progress for that registration number. Complete it on the selected M-Pesa phone, then refresh the status.' }, { status: 409 });

    const name = String(body.name).trim();
    const prompt = await startMpesaPrompt({ phone: mpesaPhone, regNo, name });
    if (!prompt.accepted) return NextResponse.json({ error: prompt.error || 'Unable to start the M-Pesa prompt.' }, { status: 503 });

    const payment = {
      type: 'registration',
      regNo,
      name,
      email: String(body.email).trim().toLowerCase(),
      phone,
      paymentPhone: mpesaPhone,
      level: String(body.level).trim(),
      role: 'LULS member',
      interests: String(body.interests).split(',').map((x: string) => x.trim()).filter(Boolean),
      bio: String(body.bio).trim(),
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      paymentAmount: 100,
      paymentCurrency: 'KES' as const,
      paymentReference: prompt.requestId,
      paymentRequestId: prompt.requestId,
      paymentMethod: 'M-Pesa STK Push',
      createdAt: new Date().toISOString(),
    };
    await db.collection('registrationPayments').createIndex({ regNo: 1 }, { unique: true });
    await db.collection('registrationPayments').replaceOne({ regNo }, payment, { upsert: true });
    return NextResponse.json({ ok: true, paymentStarted: true, message: `M-Pesa prompt sent to ${mpesaPhone}. The member account will be created only after the KES 100 payment succeeds.`, requestId: prompt.requestId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to start registration payment right now.' }, { status: 500 });
  }
}
