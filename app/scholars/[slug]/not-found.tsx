import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Scholar not found',
  description: 'The requested LULS scholar profile could not be found.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/scholars' },
};

export default function ScholarNotFound() {
  return (
    <div className="form-page">
      <div className="form-head">
        <div className="eyebrow">Public directory</div>
        <h1>Scholar profile not found.</h1>
        <p>The requested registration profile is not available. Return to the public directory to browse current LULS registration numbers.</p>
        <div className="actions" style={{ marginTop: 24 }}>
          <Link className="button" href="/scholars">Back to directory ↗</Link>
          <Link className="button alt" href="/">Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}
