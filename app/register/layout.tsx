import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register with LULS',
  description: 'Join the Laikipia University Language Scholars Community. Students from every course are welcome to research, share, and learn languages together.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
