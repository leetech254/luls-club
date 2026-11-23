'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type RetreatMember = { regNo: string; name: string; retreatPaymentStatus: string; retreatPaymentRequestId?: string; retreatPaymentReceipt?: string | null };

type Notice = { kind: 'success' | 'error' | 'info'; text: string };

export default function RetreatPage() {
  const [lookup, setLookup] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [member, setMember] = useState<RetreatMember | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function findMember(event?: React.FormEvent) {
    event?.preventDefault();
    if (!lookup.trim()) return setNotice({ kind: 'error', text: 'Enter your name, registration number, or phone number.' });
    setLoading(true); setNotice(null); setMember(null);
    try {
      const response = await fetch(`/api/retreat?lookup=${encodeURIComponent(lookup)}`);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'No eligible member account was found.');
      setMember(body.member);
      setNotice({ kind: 'success', text: body.member.retreatPaymentStatus === 'paid' ? 'Your retreat payment is already confirmed.' : 'Member verified. You can now pay the KES 200 retreat fee.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to verify your member account.' }); }
    finally { setLoading(false); }
  }

  async function startPayment(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setNotice(null);
    try {
      const response = await fetch('/api/retreat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lookup, mpesaPhone }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Unable to start the retreat payment.');
      setMember((current) => current ? { ...current, retreatPaymentStatus: body.paymentStatus, retreatPaymentRequestId: body.requestId } : current);
      setNotice({ kind: 'success', text: body.message || 'KES 200 payment prompt sent. Complete it on your M-Pesa phone.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to start the retreat payment.' }); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!member?.retreatPaymentRequestId || member.retreatPaymentStatus !== 'pending') return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/retreat?lookup=${encodeURIComponent(member.regNo)}`);
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.member) return;
      setMember(body.member);
      if (body.member.retreatPaymentStatus === 'paid') setNotice({ kind: 'success', text: `Retreat payment confirmed${body.member.retreatPaymentReceipt ? ` · Receipt ${body.member.retreatPaymentReceipt}` : ''}. You are booked for Thomson Falls.` });
      if (body.member.retreatPaymentStatus === 'rejected') setNotice({ kind: 'error', text: 'The retreat payment was rejected or cancelled. You can try again.' });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [member?.retreatPaymentRequestId, member?.retreatPaymentStatus, member?.regNo]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return <div className="form-page retreat-page"><div className="retreat-hero"><img src="/images/thomson-falls.jpg" alt="Thomson Falls in Nyahururu" /><div className="retreat-hero-copy"><div className="eyebrow">LULS member retreat</div><h1>Thomson Falls.</h1><p>Join the LULS circle for a member day out on Sunday, 29 November 2026.</p><div className="retreat-meta"><strong>KES 200</strong><span>Transport + entry fee</span></div></div></div><div className="actions retreat-actions"><button type="button" className="button gold" onClick={() => void copyLink}>{copied ? 'Link copied ✓' : 'Copy retreat link ↗'}</button><Link className="button alt" href="/">← Back to home</Link></div><div className="retreat-grid"><section className="form-card"><div className="eyebrow">Member-only booking</div><h2>Reserve your place.</h2><p className="helper">Search your registered LULS account first. Only approved members who have completed the KES 100 registration payment can pay the KES 200 retreat contribution.</p><form onSubmit={findMember}><div className="field"><label>Name, registration number, or phone number</label><input value={lookup} onChange={(event) => setLookup(event.target.value)} required placeholder="James, ED/ART/1158/25, or 0712 345 678" /></div><button className="button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Check member eligibility ↗'}</button></form>{notice && <div className={`notice retreat-notice retreat-${notice.kind}`}>{notice.text}</div>}{member && <div className="retreat-payment-box"><div className="tag">Verified member</div><h3>{member.name}</h3><p>Registration number: <strong>{member.regNo}</strong></p>{member.retreatPaymentStatus === 'paid' ? <div className="notice retreat-success">KES 200 paid · You are booked for the retreat.{member.retreatPaymentReceipt && <><br />Receipt: {member.retreatPaymentReceipt}</>}</div> : <form onSubmit={startPayment}><div className="field"><label>M-Pesa number for KES 200</label><input value={mpesaPhone} onChange={(event) => setMpesaPhone(event.target.value)} required type="tel" placeholder="0712 345 678" /><span className="helper">This can be different from your LULS contact number.</span></div><button className="button gold" type="submit" disabled={loading}>{loading ? 'Sending prompt…' : 'Pay KES 200 retreat fee ↗'}</button></form>}</div>}</section><aside className="retreat-info card"><div className="eyebrow">Trip details</div><h2>Come with the circle.</h2><p>Bring your LULS community spirit and keep your M-Pesa phone available for the payment prompt.</p><div className="retreat-detail-list"><span>Date</span><strong>Sunday, 29 November 2026</strong><span>Destination</span><strong>Thomson Falls, Nyahururu</strong><span>Contribution</span><strong>KES 200 · Transport and entry</strong><span>Eligibility</span><strong>Approved, paid LULS members</strong></div><div className="notice" style={{ marginTop: 22 }}>Not registered yet? <Link href="/register"><strong>Pay the KES 100 registration fee first →</strong></Link></div></aside></div></div>;
}
