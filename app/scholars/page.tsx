import Link from 'next/link';
import { listMembers } from '@/lib/data';
import { logoPath } from '@/lib/preview';

export default async function Scholars({ searchParams }: { searchParams?: { q?: string } }) {
  const query = (searchParams?.q || '').trim();
  const members = await listMembers();
  const filteredMembers = query
    ? members.filter((member) => `${member.name} ${member.role} ${member.level} ${member.interests.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    : members;

  return <div className="section"><div className="directory-head"><div><div className="eyebrow">The public directory</div><h1 style={{ font: '600 58px/.98 Fraunces,serif', letterSpacing: '-.05em', margin: '0 0 14px' }}>Our scholars</h1><p style={{ color: 'var(--muted)', maxWidth: 520, lineHeight: 1.7 }}>People asking better questions about how language moves through communities.</p></div><form method="get"><label className="sr-only" htmlFor="scholar-search">Search scholars</label><input className="search" id="scholar-search" name="q" defaultValue={query} placeholder="Search scholars…" /></form></div>{filteredMembers.length > 0 ? <div className="cards">{filteredMembers.map((member) => <Link className="card member-card" href={`/scholars/${member.slug}`} key={member.slug}><img src={member.photo || logoPath} alt={member.name} /><div className="member-card-body"><div className="tag">{member.role} · {member.level}</div><h3>{member.name}</h3><p>{member.bio}</p><div className="interests">{member.interests.map((interest) => <span className="pill" key={interest}>{interest}</span>)}</div></div></Link>)}</div> : <div className="notice" style={{ marginTop: 28 }}>{query ? `No scholars matched “${query}”.` : 'No scholar profiles are currently available.'}</div>}</div>;
}
