'use client';

import Link from 'next/link';
import { useState } from 'react';

export function RetreatBell() {
  const [open, setOpen] = useState(false);

  return <div className="retreat-bell-wrap">
    <button className="retreat-bell" type="button" aria-label="Open retreat announcement" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      <span className="retreat-bell-count">1</span>
    </button>
    {open && <div className="retreat-bell-panel" role="dialog" aria-label="Retreat announcement">
      <div className="retreat-bell-panel-top"><span className="tag">New announcement</span><button type="button" aria-label="Close announcement" onClick={() => setOpen(false)}>×</button></div>
      <h3>Thomson Falls retreat</h3>
      <p>Join LULS members on Sunday, 29 November 2026. Contribution: KES 200 for transport and entry.</p>
      <Link className="button gold" href="/retreat" onClick={() => setOpen(false)}>View retreat details ↗</Link>
    </div>}
  </div>;
}
