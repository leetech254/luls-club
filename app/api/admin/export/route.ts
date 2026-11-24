import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listMembers } from '@/lib/data';

export const dynamic = 'force-dynamic';
type ExportType = 'members' | 'registered-members' | 'payments' | 'retreat';

function csvCell(value: unknown) {
  const text = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csv(rows: Record<string, unknown>[], columns: string[]) {
  return [columns, ...rows.map((row) => columns.map((column) => row[column]))]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n') + '\r\n';
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  const type = new URL(request.url).searchParams.get('type') as ExportType | null;
  if (type !== 'members' && type !== 'registered-members' && type !== 'payments' && type !== 'retreat') return NextResponse.json({ error: 'Export type must be registered-members, payments, or retreat.' }, { status: 400 });

  try {
    const members = await listMembers(true);
    const exportedAt = new Date().toISOString();
    if (type === 'retreat') {
      const db = await (await import('@/lib/data')).getDb();
      const records = db ? await db.collection('retreatPayments').find({ status: 'paid' }).sort({ paidAt: -1, createdAt: -1 }).toArray() : [];
      const recordedMembers = new Set(records.map((record) => record.memberRegNo));
      const legacyRecords = members.filter((member) => member.retreatPaymentStatus === 'paid' && !recordedMembers.has(member.regNo)).map((member) => ({ memberRegNo: member.regNo, memberName: member.name, email: member.email, contactPhone: member.phone, mpesaPhone: member.retreatPaymentPhone || member.paymentPhone, amount: 200, currency: 'KES', status: 'paid', requestId: member.retreatPaymentRequestId, reference: member.retreatPaymentReference, receipt: member.retreatPaymentReceipt, paidAt: member.retreatPaidAt, event: 'Thomson Falls member retreat', retreatDate: '2026-11-29', destination: 'Thomson Falls, Nyahururu', emailStatus: member.retreatEmailStatus, emailSentAt: member.retreatEmailSentAt, emailId: member.retreatEmailId, createdAt: member.createdAt, updatedAt: member.retreatPaidAt }));
      const allRecords = [...records, ...legacyRecords];
      const columns = ['member_registration_number', 'member_name', 'email', 'contact_phone', 'mpesa_phone', 'event', 'retreat_date', 'destination', 'amount', 'currency', 'status', 'request_id', 'payment_reference', 'receipt', 'paid_at', 'email_status', 'email_sent_at', 'email_id', 'created_at', 'updated_at'];
      const rows = allRecords.map((record) => ({ member_registration_number: record.memberRegNo, member_name: record.memberName, email: record.email, contact_phone: record.contactPhone, mpesa_phone: record.mpesaPhone, event: record.event, retreat_date: record.retreatDate, destination: record.destination, amount: record.amount, currency: record.currency, status: record.status, request_id: record.requestId, payment_reference: record.reference, receipt: record.receipt, paid_at: record.paidAt, email_status: record.emailStatus, email_sent_at: record.emailSentAt, email_id: record.emailId, created_at: record.createdAt, updated_at: record.updatedAt }));
      const body = `\uFEFF${csv(rows, columns)}`;
      return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="luls-retreat-${exportedAt.slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } });
    }
    const memberExport = type === 'members' || type === 'registered-members';
    const columns = memberExport
      ? ['registration_number', 'name', 'email', 'contact_phone', 'mpesa_stk_phone', 'role', 'study_level', 'interests', 'bio', 'membership_status', 'payment_status', 'payment_amount', 'payment_currency', 'payment_reference', 'payment_method', 'payment_request_id', 'payment_receipt', 'paid_at', 'registered_at', 'welcome_email_status', 'welcome_email_sent_at', 'welcome_email_id', 'slug', 'photo']
      : ['registration_number', 'member_name', 'contact_phone', 'mpesa_stk_phone', 'email', 'payment_status', 'payment_amount', 'payment_currency', 'payment_reference', 'payment_method', 'payment_request_id', 'payment_receipt', 'paid_at', 'registered_at'];
    const rows = members.map((member) => memberExport
      ? { registration_number: member.regNo, name: member.name, email: member.email, contact_phone: member.phone, mpesa_stk_phone: member.paymentPhone, role: member.role, study_level: member.level, interests: member.interests, bio: member.bio, membership_status: member.status, payment_status: member.paymentStatus, payment_amount: member.paymentAmount, payment_currency: member.paymentCurrency, payment_reference: member.paymentReference, payment_method: member.paymentMethod, payment_request_id: member.paymentRequestId, payment_receipt: member.paymentReceipt, paid_at: member.paidAt, registered_at: member.createdAt, welcome_email_status: member.welcomeEmailStatus, welcome_email_sent_at: member.welcomeEmailSentAt, welcome_email_id: member.welcomeEmailId, slug: member.slug, photo: member.photo }
      : { registration_number: member.regNo, member_name: member.name, contact_phone: member.phone, mpesa_stk_phone: member.paymentPhone, email: member.email, payment_status: member.paymentStatus, payment_amount: member.paymentAmount, payment_currency: member.paymentCurrency, payment_reference: member.paymentReference, payment_method: member.paymentMethod, payment_request_id: member.paymentRequestId, payment_receipt: member.paymentReceipt, paid_at: member.paidAt, registered_at: member.createdAt });
    const body = `\uFEFF${csv(rows, columns)}`;
    return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="luls-${type}-${exportedAt.slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to export records.' }, { status: 500 });
  }
}
