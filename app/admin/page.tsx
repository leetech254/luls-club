import Link from 'next/link';
import { listMembers } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';
import { AdminDashboard } from '@/components/AdminDashboard';
import { logoPath } from '@/lib/preview';

export default async function Admin({ searchParams }: { searchParams?: { error?: string } }) {
  const session = await getAdminSession();
  if (!session) return <div className="form-page admin-login-page"><div className="admin-login-nav"><Link className="brand" href="/"><img src={logoPath} alt="LULS crest" /><span><b>LULS</b><small>Language Scholars Community</small></span></Link><Link className="button alt" href="/">← Back to homepage</Link></div><div className="form-head"><div className="eyebrow">Private workspace</div><h1>Admin login.</h1><p>Sign in to manage registrations, payments, imports, exports, and the scholar directory.</p></div><form className="form-card admin-login-card" action="/api/auth/login" method="post">{searchParams?.error === 'invalid' && <div className="notice" role="alert" style={{ background: '#f8e3de', color: '#8a2c1c' }}>The email or password was not accepted. Check your details and try again.</div>}<div className="notice">This is the private LULS administration workspace. Use an authorized administrator account.</div><div className="field"><label htmlFor="admin-email">Administrator email</label><input id="admin-email" name="email" type="email" autoComplete="username" required autoFocus placeholder="admin@example.com" /></div><div className="field" style={{ marginTop: 18 }}><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></div><div className="actions" style={{ marginTop: 24 }}><button className="button gold" type="submit">Sign in to admin workspace ↗</button><Link className="button alt" href="/">Return to homepage</Link></div></form></div>;
  const members = await listMembers(true);
  return <AdminDashboard members={members} email={session.email} />;
}
