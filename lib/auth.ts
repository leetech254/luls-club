import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'luls-preview-secret-change-in-vercel');
export async function createAdminSession(user:{email:string;name?:string}) { return new SignJWT({ email:user.email, name:user.name || user.email, role:'admin' }).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret()); }
export async function getAdminSession() { const token = cookies().get('luls_admin_session')?.value; if(!token)return null; try { const {payload}=await jwtVerify(token,secret()); return payload as {email:string;name?:string;role:string}; } catch { return null; } }
export function isAllowedAdmin(email:string) { const allowed=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean); return allowed.length>0 && allowed.includes(email.toLowerCase()); }
