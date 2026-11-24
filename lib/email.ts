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
  const text = `Dear ${member.name},\n\nThank you for registering with Laikipia University Language Scholars Community. Your KES 100 registration payment has been confirmed with status SUCCESS, and you are now an official LULS member.\n\nRegistration number: ${member.regNo}\nM-Pesa number: ${member.paymentPhone || member.phone}\nM-Pesa receipt: ${receipt || member.paymentReceipt || 'Pending provider receipt'}\nPayment status: SUCCESS\nPayment date: ${paidDate}\nLee Tec request/payment reference: ${member.paymentReference || member.paymentRequestId || 'Available in your LULS account'}\nAmount: KES 100\n\nKeep this email for your records. You can check your account at ${process.env.NEXT_PUBLIC_SITE_URL || ''}/account.\n\nWelcome to the circle,\nLaikipia University Language Scholars Community`;
  const html = `<div style="background:#f6f1e7;padding:32px 16px;font-family:Arial,sans-serif;color:#12244f"><div style="max-width:620px;margin:0 auto;background:#fffdf8;border:1px solid #e5ddce"><div style="background:#12244f;padding:28px 32px;color:#fffdf8"><div style="font-size:12px;letter-spacing:3px;color:#e8c36c;font-weight:700">LAIKIPIA UNIVERSITY</div><div style="font-size:18px;letter-spacing:2px;margin-top:8px">LANGUAGE SCHOLARS COMMUNITY</div></div><div style="padding:32px"><div style="color:#a07626;font-size:11px;letter-spacing:2px;font-weight:700">PAYMENT CONFIRMED · OFFICIAL MEMBER</div><h1 style="font-family:Georgia,serif;font-size:34px;margin:14px 0;color:#12244f">Welcome, ${safeName}.</h1><p style="font-size:16px;line-height:1.7;color:#546076">Thank you for registering. Your KES 100 payment has been confirmed with status <strong>SUCCESS</strong>, and you are now an official member of Laikipia University Language Scholars Community.</p><div style="background:#f1eadc;padding:20px;margin:24px 0"><div style="font-size:11px;color:#806f55;letter-spacing:1px">MEMBERSHIP RECEIPT</div><p style="line-height:1.8;margin:10px 0"><strong>Registration number:</strong> ${safeRegNo}<br/><strong>M-Pesa number:</strong> ${safePhone}<br/><strong>Receipt:</strong> ${safeReceipt}<br/><strong>Payment status:</strong> SUCCESS<br/><strong>Payment date:</strong> ${safePaidDate}<br/><strong>Lee Tec reference:</strong> ${safeReference}<br/><strong>Amount:</strong> KES 100</p></div><p style="font-size:14px;line-height:1.7;color:#546076">Keep this email for your records. Your account is now available through the LULS member lookup.</p><a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL || '')}/account" style="display:inline-block;background:#c9962e;color:#12244f;padding:14px 18px;text-decoration:none;font-weight:700">View my LULS account</a><p style="font-size:14px;line-height:1.7;color:#546076;margin-top:28px">Welcome to the circle,<br/><strong>Laikipia University Language Scholars Community</strong></p></div></div></div>`;
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

export async function sendRetreatPaymentConfirmationEmail(member: Member, receipt?: string) {
  const { apiKey, from, replyTo } = config();
  if (!apiKey || !from) return { sent: false as const, configured: false as const, error: 'Email is not configured. Add RESEND_API_KEY and EMAIL_FROM in Vercel.' };
  if (!member.email) return { sent: false as const, configured: true as const, error: 'Member email address is missing.' };

  const paidDate = member.retreatPaidAt ? new Date(member.retreatPaidAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
  const safeName = escapeHtml(member.name);
  const safeRegNo = escapeHtml(member.regNo);
  const safeReceipt = escapeHtml(receipt || member.retreatPaymentReceipt || 'Pending provider receipt');
  const safePaidDate = escapeHtml(paidDate);
  const safePhone = escapeHtml(member.retreatPaymentPhone || member.paymentPhone || member.phone);
  const safeReference = escapeHtml(member.retreatPaymentReference || member.retreatPaymentRequestId || 'Available in your LULS account');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const idempotencyKey = `luls-retreat-payment/${member.retreatPaymentRequestId || member.retreatPaymentReference || member.regNo}`.slice(0, 256);
  const subject = `Thomson Falls retreat payment confirmed · ${member.name}`;
  const text = `Dear ${member.name},\n\nYour KES 200 Thomson Falls retreat payment has been confirmed. You are booked for the LULS member retreat on Sunday, 29 November 2026.\n\nEvent: LULS Thomson Falls member retreat\nRetreat date: Sunday, 29 November 2026\nDestination: Thomson Falls, Nyahururu\nRegistration number: ${member.regNo}\nEmail: ${member.email || 'Not supplied'}\nContact phone: ${member.phone}\nRetreat M-Pesa number: ${member.retreatPaymentPhone || member.paymentPhone || member.phone}\nM-Pesa receipt: ${receipt || member.retreatPaymentReceipt || 'Pending provider receipt'}\nPayment status: SUCCESS\nPayment date: ${paidDate}\nLee Tec reference: ${member.retreatPaymentReference || member.retreatPaymentRequestId || 'Available in your LULS account'}\nAmount: KES 200\n\nKeep this email for your records. You can check your booking at ${siteUrl}/retreat.\n\nWe look forward to travelling with you,\nLaikipia University Language Scholars Community`;
  const html = `<div style="background:#f6f1e7;padding:32px 16px;font-family:Arial,sans-serif;color:#12244f"><div style="max-width:620px;margin:0 auto;background:#fffdf8;border:1px solid #e5ddce"><div style="background:#12244f;padding:28px 32px;color:#fffdf8"><div style="font-size:12px;letter-spacing:3px;color:#e8c36c;font-weight:700">LAIKIPIA UNIVERSITY</div><div style="font-size:18px;letter-spacing:2px;margin-top:8px">LANGUAGE SCHOLARS COMMUNITY</div></div><div style="padding:32px"><div style="color:#a07626;font-size:11px;letter-spacing:2px;font-weight:700">RETREAT BOOKING CONFIRMED</div><h1 style="font-family:Georgia,serif;font-size:34px;margin:14px 0;color:#12244f">See you at Thomson Falls, ${safeName}.</h1><p style="font-size:16px;line-height:1.7;color:#546076">Your KES 200 contribution has been confirmed. You are booked for the LULS member retreat on <strong>Sunday, 29 November 2026</strong>.</p><div style="background:#f1eadc;padding:20px;margin:24px 0"><div style="font-size:11px;color:#806f55;letter-spacing:1px">RETREAT PAYMENT RECEIPT</div><p style="line-height:1.8;margin:10px 0"><strong>Member:</strong> ${safeName}<br/><strong>Registration number:</strong> ${safeRegNo}<br/><strong>Email:</strong> ${escapeHtml(member.email || 'Not supplied')}<br/><strong>Contact phone:</strong> ${escapeHtml(member.phone)}<br/><strong>Retreat M-Pesa number:</strong> ${safePhone}<br/><strong>Receipt:</strong> ${safeReceipt}<br/><strong>Payment status:</strong> SUCCESS<br/><strong>Payment date:</strong> ${safePaidDate}<br/><strong>Lee Tec reference:</strong> ${safeReference}<br/><strong>Amount:</strong> KES 200<br/><strong>Destination:</strong> Thomson Falls, Nyahururu</p></div><p style="font-size:14px;line-height:1.7;color:#546076">Keep this email for your records. It confirms your retreat payment and booking.</p><a href="${escapeHtml(`${siteUrl}/retreat`)}" style="display:inline-block;background:#c9962e;color:#12244f;padding:14px 18px;text-decoration:none;font-weight:700">View retreat details</a><p style="font-size:14px;line-height:1.7;color:#546076;margin-top:28px">We look forward to travelling with you,<br/><strong>Laikipia University Language Scholars Community</strong></p></div></div></div>`;
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey };
  const payload: Record<string, unknown> = { from, to: [member.email], subject, html, text };
  if (replyTo) payload.reply_to = replyTo;

  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false as const, configured: true as const, error: data?.message || data?.name || `Email provider returned HTTP ${response.status}.` };
    return { sent: true as const, configured: true as const, id: data?.id ? String(data.id) : undefined };
  } catch { return { sent: false as const, configured: true as const, error: 'Unable to connect to the email provider.' }; }
}
