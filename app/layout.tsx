import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/Shell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://luls-club.leetec.online');
const title = 'Laikipia University Linguistics Scholars Club | LULS';
const description = 'Laikipia University Linguistics Scholars Club connects students and researchers exploring language, culture, identity, and community across Kenya.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s | LULS' },
  description,
  applicationName: 'LULS Scholar Portal',
  keywords: ['Laikipia University Linguistics Scholars Club', 'Laikipia University', 'LULS', 'Kenya linguistics', 'language research'],
  authors: [{ name: 'Laikipia University Linguistics Scholars Club' }],
  creator: 'Laikipia University Linguistics Scholars Club',
  alternates: { canonical: '/' },
  icons: { icon: '/icon.jpg', apple: '/icon.jpg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Laikipia University Linguistics Scholars Club',
    title,
    description,
    locale: 'en_KE',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Laikipia University Linguistics Scholars Club' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'Laikipia University Linguistics Scholars Club', alternateName: 'LULS', description, url: siteUrl, logo: `${siteUrl}/icon.jpg`, areaServed: 'Kenya' };
  return <html lang="en"><body><Shell>{children}</Shell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
