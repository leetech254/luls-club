'use client';

import { useState } from 'react';

export function ShareButton({ title, text, url, className = 'button alt' }: { title: string; text: string; url?: string; className?: string }) {
  const [label, setLabel] = useState('Share ↗');
  async function share() {
    const shareUrl = url ? new URL(url, window.location.origin).toString() : window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); setLabel('Link copied ✓'); window.setTimeout(() => setLabel('Share ↗'), 2200); return; }
      setLabel('Shared ✓'); window.setTimeout(() => setLabel('Share ↗'), 2200);
    } catch { /* The user closed the native share sheet. */ }
  }
  return <button type="button" className={className} onClick={() => void share()}>{label}</button>;
}
