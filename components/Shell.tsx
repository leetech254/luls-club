import Link from 'next/link';
import { logoPath } from '@/lib/preview';

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="site-shell">
    <div className="topline"><span>LAIKIPIA UNIVERSITY</span><span>LANGUAGE · CULTURE · CONNECTION</span></div>
    <header className="nav-wrap">
      <Link className="brand" href="/"><img src={logoPath} alt="LULS crest" /><span><b>LULS</b><small>Linguistics Scholars</small></span></Link>
      <nav><Link href="/scholars">Scholars</Link><Link href="/#research">Research</Link><Link href="/#events">Events</Link><Link href="/account">Check account</Link><Link className="nav-cta" href="/register">Join LULS <span>↗</span></Link></nav>
    </header>
    <main>{children}</main>
    <footer className="footer"><div><div className="footer-mark">LULS</div><p>A scholarly home for language, culture, and connection at Laikipia University.</p></div><div className="footer-links"><Link href="/register">Membership</Link><Link href="/scholars">Directory</Link><Link href="/admin">Admin</Link></div><small>© 2026 LULS · Laikipia University</small></footer>
  </div>;
}
