import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/Shell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const title = 'LULS — Laikipia University Linguistics Scholars';
const description = 'Laikipia University Linguistics Scholars: a living circle of students, researchers, and language champions exploring language, culture, and connection across Kenya and beyond.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s | LULS' },
  description,
  applicationName: 'LULS Scholar Portal',
  keywords: ['Laikipia University', 'Linguistics Scholars', 'LULS', 'Kenya linguistics', 'language research'],
  authors: [{ name: 'Laikipia University Linguistics Scholars' }],
  creator: 'Laikipia University Linguistics Scholars',
  alternates: { canonical: '/' },
  icons: { icon: '/icon.jpg', apple: '/icon.jpg' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Laikipia University Linguistics Scholars',
    title,
    description,
    locale: 'en_KE',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LULS — Laikipia University Linguistics Scholars' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Shell>{children}</Shell></body></html>;
}
