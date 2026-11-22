'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, mpesaPhone, photo }) });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setMessage(body.error || 'Please review the form and try again.'); return; }
    setMessage(body.message || 'M-Pesa prompt sent. Complete the KES 100 payment on your phone.');
    e.currentTarget.reset();
    setPhoto('');
    setMpesaPhone('');
  }

  function readPhoto(file?: File) { if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); }

  return <div className="form-page"><div className="form-head"><div className="eyebrow">Join the circle</div><h1>Register as a LULS scholar.</h1><p>Submit your official details, choose the number that should receive the M-Pesa prompt, and complete the KES 100 registration fee securely on your phone.</p></div><form className="form-card" onSubmit={onSubmit}><div className="notice" style={{ marginBottom: 22 }}><strong>Registration fee: KES 100</strong><br />The STK Push is sent only to the M-Pesa number entered below. Keep that phone unlocked, check the name and amount, then enter your M-Pesa PIN.</div><div className="form-grid"><div className="field"><label>Registration number</label><input name="regNo" required pattern="[A-Za-z]{2,5}/[A-Za-z]{2,8}/[0-9]{3,8}/[0-9]{2}" placeholder="ED/ART/1158/25" /><span className="helper">Use your official university registration format.</span></div><div className="field"><label>Full name</label><input name="name" required placeholder="Your name" /></div><div className="field"><label>Contact phone number</label><input name="phone" type="tel" required placeholder="0712 345 678" /><span className="helper">Used for your LULS account lookup and contact.</span></div><div className="field"><label>M-Pesa STK Push number</label><input name="mpesaPhone" type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} required placeholder="0712 345 678" /><span className="helper">This is the handset that will display the payment prompt. It may be different from your contact number.</span></div><div className="field"><label>Email address</label><input name="email" type="email" required placeholder="you@example.com" /></div><div className="field"><label>Study level / programme</label><input name="level" required placeholder="Year 3 · Linguistics" /></div><div className="field"><label>Primary role</label><select name="role" defaultValue="Student scholar"><option>Student scholar</option><option>Research coordinator</option><option>Faculty adviser</option><option>Community partner</option></select></div><div className="field full"><label>Linguistic interests</label><input name="interests" required placeholder="e.g. sociolinguistics, oral history, language teaching" /><span className="helper">Separate interests with commas.</span></div><div className="field full"><label>Short biography</label><textarea name="bio" required placeholder="What questions are you exploring?"></textarea></div><div className="field full"><label>Profile photo</label><input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0])} /><span className="helper">A clear square portrait works best. Photos are stored with your application for admin review.</span></div></div><div className="card" style={{ marginTop: 22, background: '#f1eadc' }}><div className="eyebrow">Before you continue</div><strong>Confirm the STK Push number: {mpesaPhone || 'Enter the M-Pesa number above'}</strong><p className="helper">You will receive a KES 100 prompt on this number immediately after submitting. Do not close the page until the request is accepted.</p></div>{message && <div className="notice" style={{ marginTop: 20 }}>{message}<br /><Link href="/account" style={{ fontWeight: 800 }}>Check your account status →</Link></div>}<div className="actions" style={{ marginTop: 24 }}><button className="button gold" disabled={loading}>{loading ? 'Sending STK Push…' : 'Register & send M-Pesa prompt ↗'}</button></div></form></div>;
}
