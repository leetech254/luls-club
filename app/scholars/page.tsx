import Link from 'next/link';
import { listMembers } from '@/lib/data';
import { logoPath } from '@/lib/preview';

export default async function Scholars({ searchParams }: { searchParams?: { q?: string } }) {
  const query = (searchParams?.q || '').trim();
  const members = await listMembers();
  const filteredMembers = query
    ? members.filter((member) => `${member.regNo} ${member.name} ${member.role} ${member.level} ${member.interests.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    : members;

  return <div className="section"><div className="actions" style={{ marginBottom: 28 }}><Link className="button alt" href="/">← Back to homepage</Link><Link className="button gold" href="/register">Register as a scholar ↗</Link><Link className="button alt" href="/account">Check my account</Link></div><div className="directory-head"><div><div className="eyebrow">The public directory</div><h1 style={{ font: '600 58px/.98 Fraunces,serif', letterSpacing: '-.05em', margin: '0 0 14px' }}>Registered scholars</h1><p style={{ color: 'var(--muted)', maxWidth: 520, lineHeight: 1.7 }}>Registration numbers are public; names, phone numbers, photos, and scholar profiles remain private.</p></div><form method="get"><label className="sr-only" htmlFor="scholar-search">Search registration numbers</label><input className="search" id="scholar-search" name="q" defaultValue={query} placeholder="Search registration numbers…" /></form></div>{filteredMembers.length > 0 ? <div className="cards">{filteredMembers.map((member) => <div className="card member-card" key={member.slug}><img src={logoPath} alt="LULS member crest" /><div className="member-card-body"><div className="tag">Registered LULS member</div><h3>{member.regNo}</h3><p>Verified registration number. Personal member details are hidden from the public directory.</p></div></div>)}</div> : <div className="notice" style={{ marginTop: 28 }}>{query ? `No registration number matched “${query}”.` : 'No registered member numbers are currently available.'}</div>}</div>;
}
