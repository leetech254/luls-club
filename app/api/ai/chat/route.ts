import { NextResponse } from 'next/server';

const siteContext = `You are LULS AI, the friendly assistant for the Laikipia University Language Scholars Community. LULS is open to students from every Laikipia University course. It helps students research, share, and learn languages including German, Spanish, sign language, French, English, Kiswahili, and more. New members register with their university registration number, contact details, language interests, and biography, then pay a KES 100 registration fee through an M-Pesa STK Push. A member account is created only after successful payment. Members can look up their account by registration number, name, or phone number. The official WhatsApp group is https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2. The Thomson Falls member retreat is on Sunday, 29 November 2026; approved paid members contribute KES 200 for transport and entry. Never invent payment status, member records, dates, contacts, or policies. Do not request passwords, M-Pesa PINs, or private member details. Keep answers concise, warm, and practical.`;

function fallback(question: string) {
  const value = question.toLowerCase();
  if (value.includes('register') || value.includes('join') || value.includes('membership')) return 'All Laikipia University students are welcome, whatever their course. Open Register, complete your scholar details, choose the M-Pesa number for the KES 100 fee, and confirm the STK Push. Your member account is created only after successful payment.';
  if (value.includes('language') || value.includes('german') || value.includes('spanish') || value.includes('french') || value.includes('kiswahili') || value.includes('sign')) return 'You can explore German, Spanish, sign language, French, English, Kiswahili, and more. LULS is a space to research, share, and learn across languages and cultures.';
  if (value.includes('payment') || value.includes('mpesa') || value.includes('stk') || value.includes('100')) return 'The registration fee is KES 100. The M-Pesa STK Push is sent to the separate payment number you enter. Keep the phone available, confirm the merchant details, and enter your M-Pesa PIN. No member account is created if payment fails or is cancelled.';
  if (value.includes('account') || value.includes('search') || value.includes('lookup')) return 'Use Check account and search with your registration number, name, or phone number. Personal details are kept private.';
  if (value.includes('whatsapp') || value.includes('group')) return 'Join the official LULS WhatsApp group here: https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2';
  if (value.includes('retreat') || value.includes('thomson')) return 'The LULS member retreat is at Thomson Falls on Sunday, 29 November 2026. It is available to registered, approved, paid members, with a KES 200 contribution for transport and entry.';
  return 'I can help with joining LULS, language activities, the KES 100 registration payment, account lookup, the WhatsApp group, or the Thomson Falls retreat. What would you like to know?';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages.filter((message: unknown) => message && typeof message === 'object' && ['user', 'assistant'].includes(String((message as { role?: string }).role)) && typeof (message as { content?: unknown }).content === 'string').slice(-12) : [];
    const question = String(messages.at(-1)?.content || '').trim().slice(0, 500);
    if (!question) return NextResponse.json({ error: 'Ask LULS AI a question first.' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ message: fallback(question), provider: 'luls-fallback' });

    const baseUrl = (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await fetch(`${baseUrl}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature: 0.3, max_tokens: 220, messages: [{ role: 'system', content: siteContext }, ...messages.map((message: { role: 'user' | 'assistant'; content: string }) => ({ role: message.role, content: message.content.slice(0, 500) }))] }), signal: AbortSignal.timeout(12000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ message: fallback(question), provider: 'luls-fallback' });
    const message = data?.choices?.[0]?.message?.content;
    return NextResponse.json({ message: typeof message === 'string' && message.trim() ? message.trim() : fallback(question), provider: 'ai' });
  } catch {
    return NextResponse.json({ message: fallback('') , provider: 'luls-fallback' });
  }
}
