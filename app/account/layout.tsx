import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member account lookup',
  description: 'Private LULS member account lookup.',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
