import Link from 'next/link';
import { logoPath } from '@/lib/preview';
import { LulsAiChat } from '@/components/LulsAiChat';

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="site-shell">
    <div className="topline"><span>LAIKIPIA UNIVERSITY</span><span>LANGUAGE · CULTURE · CONNECTION</span></div>
    <header className="nav-wrap">
      <Link className="brand" href="/"><img src={logoPath} alt="LULS crest" /><span><b>LULS</b><small>Language Scholars Community</small></span></Link>
      <nav><Link href="/scholars">Scholars</Link><Link href="/research">Research & updates</Link><Link href="/#events">Events</Link><a href="https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2" target="_blank" rel="noreferrer">WhatsApp group ↗</a><Link href="/account">Check account</Link><Link className="nav-cta" href="/register">Join LULS <span>↗</span></Link></nav>
    </header>
    <main>{children}</main><LulsAiChat />
    <footer className="footer"><div><div className="footer-mark">LULS</div><p>A welcoming home for Laikipia University students who research, share, and learn languages together.</p></div><div className="footer-links"><Link href="/register">Membership</Link><Link href="/scholars">Directory</Link><Link href="/research">Research & updates</Link><a href="https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2" target="_blank" rel="noreferrer">WhatsApp group ↗</a><Link href="/admin">Admin</Link></div><small>© 2026 LULS · Laikipia University</small></footer>
  </div>;
}
