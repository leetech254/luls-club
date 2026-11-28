import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/Shell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luls-club.leetec.online';
const title = 'LULS — Language Scholars Community';
const description = 'Research, share, and learn languages with students across Laikipia University. Explore LULS projects, updates, events, and community membership.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s | LULS' },
  description,
  applicationName: 'LULS Scholar Portal',
  keywords: ['Laikipia University Language Scholars Community', 'Laikipia University', 'LULS', 'Kenya linguistics', 'multilingual learning'],
  authors: [{ name: 'Laikipia University Language Scholars Community' }],
  creator: 'Laikipia University Language Scholars Community',
  category: 'education',
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  alternates: { canonical: '/' },
  icons: { icon: '/icon.jpg', apple: '/icon.jpg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Laikipia University Language Scholars Community',
    title,
    description,
    locale: 'en_KE',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, type: 'image/png', alt: 'LULS — Laikipia University Language Scholars Community' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [{ url: '/opengraph-image', alt: 'LULS — Laikipia University Language Scholars Community' }] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationData = { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'Laikipia University Language Scholars Community', alternateName: 'LULS', description, url: siteUrl, logo: `${siteUrl}/icon.jpg`, areaServed: 'Kenya', sameAs: ['https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2'] };
  const websiteData = { '@context': 'https://schema.org', '@type': 'WebSite', name: title, url: siteUrl, description, inLanguage: 'en-KE', potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/research?query={search_term_string}`, 'query-input': 'required name=search_term_string' } };
  return <html lang="en"><body><Shell>{children}</Shell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }} /></body></html>;
}
