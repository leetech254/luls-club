import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registered Scholars Directory',
  description: 'Browse registered members of the Laikipia University Linguistics Scholars Club. Public listings show registration numbers while personal details remain private.',
  alternates: { canonical: '/scholars' },
  openGraph: {
    type: 'website',
    title: 'Registered Scholars Directory | LULS',
    description: 'The public registration-number directory for Laikipia University Linguistics Scholars Club.',
    url: '/scholars',
  },
};

export default function ScholarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
