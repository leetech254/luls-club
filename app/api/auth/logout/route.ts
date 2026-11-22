import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin', request.url));
  response.cookies.set('luls_admin_session', '', { httpOnly: true, sameSite: 'none', secure: true, maxAge: 0, path: '/' });
  return response;
}
