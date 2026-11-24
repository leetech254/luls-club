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
    images: [{ url: '/images/thomson-falls.jpg', alt: 'Thomson Falls in Nyahururu' }],
  },
};

export default function RetreatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
