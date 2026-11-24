import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thomson Falls Member Retreat',
  description: 'Join the Laikipia University Language Scholars Community member retreat at Thomson Falls, Nyahururu on Sunday, 29 November 2026.',
  alternates: { canonical: '/retreat' },
  openGraph: {
    type: 'website',
    title: 'Thomson Falls Member Retreat | LULS',
    description: 'LULS member retreat at Thomson Falls, Nyahururu on Sunday, 29 November 2026. KES 200 for transport and entry.',
    url: '/retreat',
    images: [{ url: '/images/thomson-falls.jpg', width: 900, height: 506, type: 'image/jpeg', alt: 'Thomson Falls in Nyahururu — LULS member retreat' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thomson Falls Member Retreat | LULS',
    description: 'LULS member retreat at Thomson Falls, Nyahururu on Sunday, 29 November 2026. KES 200 for transport and entry.',
    images: ['/images/thomson-falls.jpg'],
  },
};

export default function RetreatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
