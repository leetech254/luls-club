'use client';

import { useState } from 'react';

type Member = { slug: string; regNo: string; name: string; phone: string; paymentPhone?: string; email?: string; level: string; role: string; interests: string[]; bio: string; status: string; paymentStatus: string; paymentReference?: string; paymentReceipt?: string };
type Form = { regNo: string; name: string; phone: string; paymentPhone: string; email: string; level: string; role: string; interests: string; bio: string; paymentStatus: string; paymentReference: string; paymentReceipt: string };

const blank: Form = { regNo: '', name: '', phone: '', paymentPhone: '', email: '', level: 'Legacy registered member', role: 'LULS member', interests: 'LULS registered member', bio: 'Registered LULS member.', paymentStatus: 'paid', paymentReference: '', paymentReceipt: '' };
function toForm(member: Member): Form { return { regNo: member.regNo, name: member.name, phone: member.phone, paymentPhone: member.paymentPhone || member.phone, email: member.email || '', level: member.level, role: member.role, interests: member.interests.join(', '), bio: member.bio, paymentStatus: member.paymentStatus, paymentReference: member.paymentReference || '', paymentReceipt: member.paymentReceipt || '' }; }

export function AdminMemberManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  function update(key: keyof Form, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  function edit(member: Member) { setEditing(member.regNo); setForm(toForm(member)); setMessage('Editing member record.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset() { setEditing(null); setForm(blank); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/members', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing ? { ...form, originalRegNo: editing } : form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Unable to save member.');
      const saved = body.member as Member;
      setMembers((current) => editing ? current.map((member) => member.regNo === editing ? { ...member, ...saved } : member) : [saved, ...current]);
      setMessage(editing ? 'Member changes saved.' : 'Registered member added without starting a payment prompt.'); reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save member.'); }
    finally { setBusy(false); }
  }
  async function importLegacy() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'import-legacy' }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Unable to import the legacy list.');
      const refreshed = await fetch('/api/admin/members').then((result) => result.json());
      setMembers(refreshed.members || members);
      setMessage(`${body.imported} legacy members imported; ${body.existing} were already present. All imported records are marked approved and paid.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to import the legacy list.'); }
    finally { setBusy(false); }
  }
  return <div className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Registered members</div><h2 style={{ fontSize: 32 }}>{editing ? 'Edit member record' : 'Add a registered member'}</h2><p>Add legacy registrations without sending an M-Pesa prompt. The supplied legacy list can be imported once into MongoDB.</p></div><button className="button gold" type="button" onClick={() => void importLegacy()} disabled={busy}>Import legacy list ↗</button></div><form className="form-card" onSubmit={save} style={{ marginTop: 18, padding: 0, border: 0, boxShadow: 'none' }}><div className="form-grid"><div className="field"><label>Registration number</label><input value={form.regNo} onChange={(event) => update('regNo', event.target.value.toUpperCase())} required placeholder="LULS/LEGACY/0001/26" /></div><div className="field"><label>Full name</label><input value={form.name} onChange={(event) => update('name', event.target.value)} required placeholder="Member name" /></div><div className="field"><label>Contact phone</label><input value={form.phone} onChange={(event) => update('phone', event.target.value)} required placeholder="0712 345 678" /></div><div className="field"><label>M-Pesa phone</label><input value={form.paymentPhone} onChange={(event) => update('paymentPhone', event.target.value)} required placeholder="0712 345 678" /></div><div className="field"><label>Email (optional)</label><input value={form.email} onChange={(event) => update('email', event.target.value)} type="email" placeholder="member@example.com" /></div><div className="field"><label>Payment status</label><select value={form.paymentStatus} onChange={(event) => update('paymentStatus', event.target.value)}><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select></div><div className="field"><label>Role</label><input value={form.role} onChange={(event) => update('role', event.target.value)} required /></div><div className="field"><label>Study level</label><input value={form.level} onChange={(event) => update('level', event.target.value)} required /></div><div className="field full"><label>Interests</label><input value={form.interests} onChange={(event) => update('interests', event.target.value)} required /></div><div className="field"><label>Payment reference (optional)</label><input value={form.paymentReference} onChange={(event) => update('paymentReference', event.target.value)} /></div><div className="field"><label>M-Pesa receipt (optional)</label><input value={form.paymentReceipt} onChange={(event) => update('paymentReceipt', event.target.value)} /></div><div className="field full"><label>Bio</label><textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} required /></div></div>{message && <div className="notice" style={{ marginTop: 18 }}>{message}</div>}<div className="actions" style={{ marginTop: 18 }}><button className="button gold" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save member changes' : 'Add registered member'}</button>{editing && <button className="button alt" type="button" onClick={reset}>Cancel edit</button>}</div></form><div className="admin-table" style={{ marginTop: 28 }}><table><thead><tr><th>Registration</th><th>Name / phone</th><th>Membership</th><th>Payment</th><th>Action</th></tr></thead><tbody>{members.map((member) => <tr key={member.slug || member.regNo}><td><strong>{member.regNo}</strong></td><td><strong>{member.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{member.phone}</span></td><td><span className="status">{member.status}</span></td><td><span className="status">{member.paymentStatus}</span></td><td><button className="text-button" type="button" onClick={() => edit(member)}>Edit and save</button></td></tr>)}</tbody></table></div></div>;
}
