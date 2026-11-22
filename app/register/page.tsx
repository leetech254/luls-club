'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Draft = { regNo: string; name: string; phone: string; email: string; level: string; role: string; interests: string; bio: string; mpesaPhone: string; photo: string; requestId?: string; paymentStatus?: string; paymentMessage?: string };
const emptyDraft: Draft = { regNo: '', name: '', phone: '', email: '', level: '', role: 'Student scholar', interests: '', bio: '', mpesaPhone: '', photo: '' };
const DRAFT_KEY = 'luls-registration-draft-v1';

export default function Register() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const saved = window.localStorage.getItem(DRAFT_KEY); if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) }); } catch { /* Ignore a damaged browser draft and start clean. */ }
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft, hydrated]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function clearDraft() { window.localStorage.removeItem(DRAFT_KEY); setDraft(emptyDraft); setStep(1); setMessage('Saved draft cleared from this device.'); }
  function readPhoto(file?: File) { if (!file) return; const reader = new FileReader(); reader.onload = () => update('photo', String(reader.result)); reader.readAsDataURL(file); }

  function continueToPayment(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof Draft)[] = ['regNo', 'name', 'phone', 'email', 'level', 'interests', 'bio'];
    if (required.some((key) => !String(draft[key]).trim())) { setMessage('Complete all scholar details before continuing to payment.'); return; }
    if (!/^[A-Za-z]{2,5}\/[A-Za-z]{2,8}\/[0-9]{3,8}\/[0-9]{2}$/.test(draft.regNo.trim())) { setMessage('Use a registration number like ED/ART/1158/25.'); return; }
    setMessage(''); setStep(2);
  }

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.mpesaPhone.trim()) { setMessage('Enter the separate M-Pesa number that should receive the STK Push.'); return; }
    setLoading(true); setMessage('');
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setMessage(body.error || 'Please review your details and try again.'); return; }
    setDraft((current) => ({ ...current, requestId: body.requestId, paymentStatus: 'pending', paymentMessage: body.message }));
    setMessage(body.message || 'STK Push sent. Complete the KES 100 payment on the selected phone.');
  }

  async function refreshPayment() {
    if (!draft.requestId) return;
    setLoading(true); setMessage('');
    const res = await fetch(`/api/payments/status?lookup=${encodeURIComponent(draft.regNo)}`);
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setMessage(body.error || 'Unable to refresh payment status.'); return; }
    setDraft((current) => ({ ...current, paymentStatus: body.paymentStatus, paymentMessage: body.paymentStatus === 'paid' ? `Payment confirmed${body.receipt ? ` · Receipt ${body.receipt}` : ''}.` : `Payment status: ${body.paymentStatus}.` }));
    setMessage(body.paymentStatus === 'paid' ? 'Payment confirmed and saved. Your LULS application remains available in this saved draft.' : `Payment status: ${body.paymentStatus}. If you have not entered your M-Pesa PIN yet, complete the prompt and refresh again.`);
  }

  return <div className="form-page"><div className="form-head"><div className="eyebrow">Join the circle</div><h1>Register as a LULS scholar.</h1><p>Complete your scholar details first. The next step is a separate payment screen where you choose the M-Pesa number for the KES 100 STK Push.</p></div><div className="draft-bar"><span><strong>Draft saved on this device.</strong> Your details stay here until you clear them.</span><button type="button" className="text-button" onClick={clearDraft}>Clear saved draft</button></div><div className="wizard-tabs"><div className={step === 1 ? 'wizard-tab active' : 'wizard-tab'}><span>01</span><strong>Scholar details</strong><small>Identity and profile</small></div><div className={step === 2 ? 'wizard-tab active' : 'wizard-tab'}><span>02</span><strong>M-Pesa payment</strong><small>Separate STK number</small></div></div>{step === 1 ? <form className="form-card" onSubmit={continueToPayment}><div className="notice"><strong>Step 1 of 2 · Save your scholar profile</strong><br />Your progress is automatically saved in this browser. You can return later and continue from the payment step.</div><div className="form-grid"><div className="field"><label>Registration number</label><input value={draft.regNo} onChange={(e) => update('regNo', e.target.value.toUpperCase())} required pattern="[A-Za-z]{2,5}/[A-Za-z]{2,8}/[0-9]{3,8}/[0-9]{2}" placeholder="ED/ART/1158/25" /><span className="helper">Use your official university registration format.</span></div><div className="field"><label>Full name</label><input value={draft.name} onChange={(e) => update('name', e.target.value)} required placeholder="Your name" /></div><div className="field"><label>Contact phone number</label><input value={draft.phone} onChange={(e) => update('phone', e.target.value)} required type="tel" placeholder="0712 345 678" /><span className="helper">Used for your LULS account lookup and contact.</span></div><div className="field"><label>Email address</label><input value={draft.email} onChange={(e) => update('email', e.target.value)} required type="email" placeholder="you@example.com" /></div><div className="field"><label>Study level / programme</label><input value={draft.level} onChange={(e) => update('level', e.target.value)} required placeholder="Year 3 · Linguistics" /></div><div className="field"><label>Primary role</label><select value={draft.role} onChange={(e) => update('role', e.target.value)}><option>Student scholar</option><option>Research coordinator</option><option>Faculty adviser</option><option>Community partner</option></select></div><div className="field full"><label>Linguistic interests</label><input value={draft.interests} onChange={(e) => update('interests', e.target.value)} required placeholder="e.g. sociolinguistics, oral history, language teaching" /><span className="helper">Separate interests with commas.</span></div><div className="field full"><label>Short biography</label><textarea value={draft.bio} onChange={(e) => update('bio', e.target.value)} required placeholder="What questions are you exploring?"></textarea></div><div className="field full"><label>Profile photo</label><input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0])} /><span className="helper">A clear square portrait works best. The selected photo is retained in your saved draft.</span></div></div>{message && <div className="notice" style={{ marginTop: 20 }}>{message}</div>}<div className="actions" style={{ marginTop: 24 }}><button className="button gold" type="submit">Save details & continue to payment ↗</button></div></form> : <form className="form-card" onSubmit={startPayment}><div className="notice"><strong>Step 2 of 2 · Pay the KES 100 registration fee</strong><br />This STK Push number is separate from your contact number. Choose the phone that is currently holding the active M-Pesa line.</div><div className="payment-step-card"><div className="eyebrow">M-Pesa STK Push number</div><h2>Where should the payment prompt appear?</h2><p>Lee Tec will send a KES 100 prompt to this number. Keep the phone unlocked, confirm the amount and merchant details, then enter the M-Pesa PIN.</p><div className="field"><label>Phone number for this payment</label><input value={draft.mpesaPhone} onChange={(e) => update('mpesaPhone', e.target.value)} required type="tel" placeholder="0116 123 456 or 0723 456 789" autoFocus /><span className="helper">Accepts 0116…, 0723…, 254…, +254…, or 00254… formats. It can be different from your saved contact number: {draft.phone || 'your contact number'}.</span></div><div className="payment-summary"><span>Registration fee</span><strong>KES 100</strong><span>Paying for</span><strong>{draft.name || 'LULS scholar registration'}</strong></div></div>{draft.requestId && <div className="notice" style={{ marginTop: 20 }}><strong>Payment details saved.</strong><br />Request: {draft.requestId}<br />Status: <strong>{draft.paymentStatus || 'pending'}</strong>{draft.paymentMessage && <><br />{draft.paymentMessage}</>}</div>}{message && <div className="notice" style={{ marginTop: 20 }}>{message}</div>}<div className="actions" style={{ marginTop: 24 }}><button className="button alt" type="button" onClick={() => { setMessage(''); setStep(1); }}>← Edit scholar details</button>{draft.requestId ? <button className="button gold" type="button" onClick={refreshPayment} disabled={loading}>{loading ? 'Checking payment…' : 'Refresh payment status'}</button> : <button className="button gold" type="submit" disabled={loading}>{loading ? 'Sending STK Push…' : 'Send KES 100 STK Push ↗'}</button>}</div><div className="actions" style={{ marginTop: 18 }}><Link href="/account" className="tag">Already submitted? Check your account →</Link></div></form>}</div>;
}
