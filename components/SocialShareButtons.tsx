'use client';

import { useEffect, useState } from 'react';

export function SocialShareButtons({ title, text, url }: { title: string; text: string; url?: string }) {
  const [shareUrl, setShareUrl] = useState(url || '');

  useEffect(() => {
    setShareUrl(new URL(url || window.location.href, window.location.origin).toString());
  }, [url]);

  const message = `${title}\n${text}\n${shareUrl}`;
  const whatsappUrl = shareUrl ? `https://wa.me/?text=${encodeURIComponent(message)}` : '#';
  const facebookUrl = shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` : '#';

  return <div className="social-share" aria-label="Share on social media"><span className="social-share-label">Share on</span><a className="social-share-button whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp ↗</a><a className="social-share-button facebook" href={facebookUrl} target="_blank" rel="noreferrer">Facebook ↗</a></div>;
}
