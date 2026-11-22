'use client';
import { useState } from 'react';

type Account = { regNo: string; name: string; status: string; role: string; level: string; interests: string[]; createdAt?: string; paymentPhone?: string; paymentStatus?: string; paymentAmount?: number; paymentCurrency?: string; paymentReference?: string; paymentReceipt?: string; paidAt?: string };

export default function AccountLookup() {
  const [lookup, setLookup] = useState('');
  const [message, setMessage] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  async function search(e: React.FormEvent) { e.preventDefault(); setLoading(true); setMessage(''); setAccount(null); const res = await fetch(`/api/members?lookup=${encodeURIComponent(lookup)}`); const body = await res.json(); setLoading(false); if (!res.ok) { setMessage(body.message || body.error || 'No matching registration found.'); return; } setAccount(body.member); }
  const registeredOn = account?.createdAt ? new Date(account.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'On file';
  const paidOn = account?.paidAt ? new Date(account.paidAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  return <div className="form-page"><div className="form-head"><div className="eyebrow">Member access</div><h1>Check your LULS account.</h1><p>Search directly with either your university registration number or the contact phone number saved during registration.</p></div><form className="form-card" onSubmit={search}><div className="field"><label>Registration number or phone number</label><input value={lookup} onChange={(e) => setLookup(e.target.value.toUpperCase())} required placeholder="ED/ART/1158/25 or 0712 345 678" /><span className="helper">You can use either identifier; no second search field is required.</span></div>{message && <div className="notice" style={{ marginTop: 20 }}>{message}</div>}{account && <div className="notice account-result" style={{ marginTop: 20 }}><strong>{account.name}</strong><br />Registration number: {account.regNo}<br />Registered on: {registeredOn}<br />Role / level: {account.role} · {account.level}<br />Interests: {account.interests.join(', ')}<br />Membership status: <strong>{account.status}</strong><br />STK Push number: {account.paymentPhone || 'On file'}<br />Registration fee: <strong>{account.paymentCurrency} {account.paymentAmount} · {account.paymentStatus}</strong>{paidOn && <><br />Paid on: {paidOn}</>}{account.paymentReceipt && <><br />M-Pesa receipt: {account.paymentReceipt}</>}</div>}<div className="actions" style={{ marginTop: 24 }}><button className="button gold" disabled={loading}>{loading ? 'Searching…' : 'Search account ↗'}</button></div></form></div>;
}
