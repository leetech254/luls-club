'use client';

import { useState } from 'react';

export function ShareButton({ title, text, className = 'button alt' }: { title: string; text: string; className?: string }) {
  const [label, setLabel] = useState('Share ↗');
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else { await navigator.clipboard.writeText(url); setLabel('Link copied ✓'); window.setTimeout(() => setLabel('Share ↗'), 2200); return; }
      setLabel('Shared ✓'); window.setTimeout(() => setLabel('Share ↗'), 2200);
    } catch { /* The user closed the native share sheet. */ }
  }
  return <button type="button" className={className} onClick={() => void share()}>{label}</button>;
}
