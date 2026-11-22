import type { Member } from '@/lib/preview';

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
}

function config() {
  return { apiKey: process.env.RESEND_API_KEY || '', from: process.env.EMAIL_FROM || '', replyTo: process.env.EMAIL_REPLY_TO || '' };
}

export async function sendPaymentWelcomeEmail(member: Member, receipt?: string) {
  const { apiKey, from, replyTo } = config();
  if (!apiKey || !from) return { sent: false as const, configured: false as const, error: 'Email is not configured. Add RESEND_API_KEY and EMAIL_FROM in Vercel.' };
  if (!member.email) return { sent: false as const, configured: true as const, error: 'Member email address is missing.' };

  const paidDate = member.paidAt ? new Date(member.paidAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
  const safeName = escapeHtml(member.name);
  const safeRegNo = escapeHtml(member.regNo);
  const safeReceipt = escapeHtml(receipt || member.paymentReceipt || 'Pending provider receipt');
  const safePaidDate = escapeHtml(paidDate);
  const safePhone = escapeHtml(member.paymentPhone || member.phone);
  const safeReference = escapeHtml(member.paymentReference || member.paymentRequestId || 'Available in your LULS account');
  const idempotencyKey = `luls-payment-welcome/${member.paymentRequestId || member.paymentReference || member.regNo}`.slice(0, 256);
  const subject = `Welcome to LULS, ${member.name} · KES 100 payment confirmed`;
  const text = `Dear ${member.name},\n\nThank you for registering with Laikipia University Linguistics Scholars. Your KES 100 registration payment has been confirmed with status SUCCESS, and you are now an official LULS member.\n\nRegistration number: ${member.regNo}\nM-Pesa number: ${member.paymentPhone || member.phone}\nM-Pesa receipt: ${receipt || member.paymentReceipt || 'Pending provider receipt'}\nPayment status: SUCCESS\nPayment date: ${paidDate}\nLee Tec request/payment reference: ${member.paymentReference || member.paymentRequestId || 'Available in your LULS account'}\nAmount: KES 100\n\nKeep this email for your records. You can check your account at ${process.env.NEXT_PUBLIC_SITE_URL || ''}/account.\n\nWelcome to the circle,\nLaikipia University Linguistics Scholars`;
  const html = `<div style="background:#f6f1e7;padding:32px 16px;font-family:Arial,sans-serif;color:#12244f"><div style="max-width:620px;margin:0 auto;background:#fffdf8;border:1px solid #e5ddce"><div style="background:#12244f;padding:28px 32px;color:#fffdf8"><div style="font-size:12px;letter-spacing:3px;color:#e8c36c;font-weight:700">LAIKIPIA UNIVERSITY</div><div style="font-size:18px;letter-spacing:2px;margin-top:8px">LINGUISTICS SCHOLARS</div></div><div style="padding:32px"><div style="color:#a07626;font-size:11px;letter-spacing:2px;font-weight:700">PAYMENT CONFIRMED · OFFICIAL MEMBER</div><h1 style="font-family:Georgia,serif;font-size:34px;margin:14px 0;color:#12244f">Welcome, ${safeName}.</h1><p style="font-size:16px;line-height:1.7;color:#546076">Thank you for registering. Your KES 100 payment has been confirmed with status <strong>SUCCESS</strong>, and you are now an official member of Laikipia University Linguistics Scholars.</p><div style="background:#f1eadc;padding:20px;margin:24px 0"><div style="font-size:11px;color:#806f55;letter-spacing:1px">MEMBERSHIP RECEIPT</div><p style="line-height:1.8;margin:10px 0"><strong>Registration number:</strong> ${safeRegNo}<br/><strong>M-Pesa number:</strong> ${safePhone}<br/><strong>Receipt:</strong> ${safeReceipt}<br/><strong>Payment status:</strong> SUCCESS<br/><strong>Payment date:</strong> ${safePaidDate}<br/><strong>Lee Tec reference:</strong> ${safeReference}<br/><strong>Amount:</strong> KES 100</p></div><p style="font-size:14px;line-height:1.7;color:#546076">Keep this email for your records. Your account is now available through the LULS member lookup.</p><a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL || '')}/account" style="display:inline-block;background:#c9962e;color:#12244f;padding:14px 18px;text-decoration:none;font-weight:700">View my LULS account</a><p style="font-size:14px;line-height:1.7;color:#546076;margin-top:28px">Welcome to the circle,<br/><strong>Laikipia University Linguistics Scholars</strong></p></div></div></div>`;
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey };
  const payload: Record<string, unknown> = { from, to: [member.email], subject, html, text };
  if (replyTo) payload.reply_to = replyTo;

  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false as const, configured: true as const, error: data?.message || data?.name || `Email provider returned HTTP ${response.status}.` };
    return { sent: true as const, configured: true as const, id: data?.id ? String(data.id) : undefined };
  } catch {
    return { sent: false as const, configured: true as const, error: 'Unable to connect to the email provider.' };
  }
}
