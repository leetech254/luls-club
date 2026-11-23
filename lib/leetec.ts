const DEFAULT_BASE_URL = 'https://leetec.online';

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('00254')) return `+${digits.slice(2)}`;
  if (digits.startsWith('254')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+254${digits.slice(1)}`;
  if (digits.length === 9 && /^[17]/.test(digits)) return `+254${digits}`;
  return value.trim();
}

function config() {
  return { baseUrl: (process.env.LEETEC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''), apiKey: process.env.LEETEC_API_KEY || '', tillId: process.env.LEETEC_TILL_ID || '' };
}

export async function startMpesaPrompt(input: { phone: string; regNo: string; name: string; amount?: number; accountReference?: string }) {
  const { baseUrl, apiKey, tillId } = config();
  if (!apiKey) return { configured: false as const, error: 'M-Pesa payments are not configured yet. Add LEETEC_API_KEY and LEETEC_BASE_URL in Vercel.' };
  const requestId = `LULS-${input.regNo.replace(/[^A-Z0-9]/gi, '')}-${Date.now()}`;
  const payload: { phoneNumber: string; amount: number; accountReference: string; requestId: string; tillId?: string } = { phoneNumber: normalizeKenyanPhone(input.phone), amount: input.amount || 100, accountReference: input.accountReference || input.regNo, requestId };
  if (tillId) payload.tillId = tillId;
  const response = await fetch(`${baseUrl}/api/v1/stkpush`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { configured: true as const, accepted: false as const, error: data?.message || data?.error || `Lee Tec returned HTTP ${response.status}.`, requestId };
  return { configured: true as const, accepted: true as const, requestId, response: data };
}

function collectValues(value: unknown, keys: Set<string>, output: unknown[] = []) {
  if (!value || typeof value !== 'object') return output;
  if (Array.isArray(value)) {
    value.forEach((item) => collectValues(item, keys, output));
    return output;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (keys.has(key.toLowerCase())) output.push(child);
    collectValues(child, keys, output);
  }
  return output;
}

function normalizeStatus(value: unknown) {
  return String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

export async function getMpesaStatus(requestId: string) {
  const { baseUrl, apiKey } = config();
  if (!apiKey) return { configured: false as const, status: 'UNCONFIGURED' };
  const response = await fetch(`${baseUrl}/api/v1/transactions/status?requestId=${encodeURIComponent(requestId)}`, { headers: { Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { configured: true as const, status: 'ERROR', error: data?.message || data?.error || `Lee Tec returned HTTP ${response.status}.` };

  const statusValues = collectValues(data, new Set(['status', 'paymentstatus', 'transactionstatus', 'resultstatus', 'state'])).map(normalizeStatus).filter(Boolean);
  const paidStatuses = new Set(['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID', 'CONFIRMED', 'TRUE']);
  const rejectedStatuses = new Set(['FAILED', 'FAILED_PAYMENT', 'CANCELLED', 'REJECTED', 'DECLINED', 'FALSE']);
  const status = statusValues.find((candidate) => paidStatuses.has(candidate)) || statusValues.find((candidate) => rejectedStatuses.has(candidate)) || statusValues[0] || 'PENDING';
  const receiptValues = collectValues(data, new Set(['receipt', 'receiptnumber', 'mpesareceiptnumber', 'transactionreceipt', 'transactionreceiptnumber']));
  const receipt = receiptValues.find((value) => value !== undefined && value !== null && String(value).trim()) as string | undefined;
  return { configured: true as const, status, response: data, receipt };
}
