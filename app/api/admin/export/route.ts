import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listMembers } from '@/lib/data';

export const dynamic = 'force-dynamic';

type ExportType = 'members' | 'payments';

function csvCell(value: unknown) {
  const text = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csv(rows: Record<string, unknown>[], columns: string[]) {
  return [columns, ...rows.map((row) => columns.map((column) => csvCell(row[column])))]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n') + '\r\n';
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });

  const type = new URL(request.url).searchParams.get('type') as ExportType | null;
  if (type !== 'members' && type !== 'payments') {
    return NextResponse.json({ error: 'Export type must be members or payments.' }, { status: 400 });
  }

  try {
    const members = await listMembers(true);
    const exportedAt = new Date().toISOString();
    const columns = type === 'members'
      ? ['registration_number', 'name', 'email', 'phone', 'role', 'study_level', 'interests', 'membership_status', 'payment_status', 'payment_amount', 'payment_currency', 'payment_reference', 'payment_method', 'payment_request_id', 'payment_receipt', 'paid_at', 'registered_at', 'slug', 'photo']
      : ['registration_number', 'member_name', 'phone', 'email', 'payment_status', 'payment_amount', 'payment_currency', 'payment_reference', 'payment_method', 'payment_request_id', 'payment_receipt', 'paid_at', 'registered_at'];

    const rows = members.map((member) => type === 'members'
      ? {
          registration_number: member.regNo,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          study_level: member.level,
          interests: member.interests,
          membership_status: member.status,
          payment_status: member.paymentStatus,
          payment_amount: member.paymentAmount,
          payment_currency: member.paymentCurrency,
          payment_reference: member.paymentReference,
          payment_method: member.paymentMethod,
          payment_request_id: member.paymentRequestId,
          payment_receipt: member.paymentReceipt,
          paid_at: member.paidAt,
          registered_at: member.createdAt,
          slug: member.slug,
          photo: member.photo,
        }
      : {
          registration_number: member.regNo,
          member_name: member.name,
          phone: member.phone,
          email: member.email,
          payment_status: member.paymentStatus,
          payment_amount: member.paymentAmount,
          payment_currency: member.paymentCurrency,
          payment_reference: member.paymentReference,
          payment_method: member.paymentMethod,
          payment_request_id: member.paymentRequestId,
          payment_receipt: member.paymentReceipt,
          paid_at: member.paidAt,
          registered_at: member.createdAt,
        });

    const body = `\uFEFF${csv(rows, columns)}`;
    const date = exportedAt.slice(0, 10);
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="luls-${type}-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to export records.' }, { status: 500 });
  }
}
