import './globals.css';
import { Shell } from '@/components/Shell';

export const metadata = { title: 'LULS — Linguistics Scholars', description: 'Language, culture, and connection at Laikipia University.', icons: { icon: '/manus-storage/718299_0a2a8d46.jpg' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><Shell>{children}</Shell></body></html>; }
