import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'luls-preview-secret-change-in-vercel');

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

export function isAllowedAdmin(email: string) {
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase());
}

export function verifyAdminCredentials(email: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD || '';
  if (!configuredPassword || !isAllowedAdmin(email)) return false;
  const supplied = digest(password);
  const expected = digest(configuredPassword);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function createAdminSession(user: { email: string; name?: string }) {
  return new SignJWT({ email: user.email.trim().toLowerCase(), name: user.name || user.email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function getAdminSession() {
  const token = cookies().get('luls_admin_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== 'admin' || typeof payload.email !== 'string') return null;
    return payload as { email: string; name?: string; role: 'admin' };
  } catch {
    return null;
  }
}
