import { listMembers } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';
import { AdminDashboard } from '@/components/AdminDashboard';

export default async function Admin({ searchParams }: { searchParams?: { error?: string } }) {
  const session = await getAdminSession();
  if (!session) return <div className="form-page"><div className="form-head"><div className="eyebrow">Private workspace</div><h1>Admin login.</h1><p>Use the LULS administrator email and password configured in Vercel to manage registrations, payments, exports, and the scholar directory.</p></div><form className="form-card" action="/api/auth/login" method="post"><div className="notice">Only email addresses listed in <strong>ADMIN_EMAILS</strong> can access this workspace.</div>{searchParams?.error === 'invalid' && <div className="notice" style={{ background: '#f8e3de', color: '#8a2c1c' }}>The email or password was not accepted. Check the Vercel environment variables and try again.</div>}<div className="field"><label htmlFor="admin-email">Admin email</label><input id="admin-email" name="email" type="email" autoComplete="username" required placeholder="admin@example.com" /></div><div className="field" style={{ marginTop: 18 }}><label htmlFor="admin-password">Admin password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your admin password" /></div><div className="actions" style={{ marginTop: 24 }}><button className="button gold" type="submit">Sign in to workspace ↗</button></div></form></div>;
  const members = await listMembers(true);
  return <AdminDashboard members={members} email={session.email} />;
}
