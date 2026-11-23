import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register with LULS',
  description: 'Register with the Laikipia University Linguistics Scholars Club.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
