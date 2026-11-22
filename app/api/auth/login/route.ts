import { NextResponse } from 'next/server';
import { createAdminSession, verifyAdminCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const response = NextResponse.redirect(new URL('/admin?error=invalid', request.url));

  if (!email || !password || !verifyAdminCredentials(email, password)) return response;

  const loggedIn = NextResponse.redirect(new URL('/admin', request.url));
  loggedIn.cookies.set('luls_admin_session', await createAdminSession({ email }), {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 604800,
    path: '/',
  });
  return loggedIn;
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/admin', request.url));
}
