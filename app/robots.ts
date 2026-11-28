import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://luls-club.leetec.online';
  return { rules: [{ userAgent: '*', allow: ['/', '/scholars', '/retreat', '/research', '/events/', '/retreats/'], disallow: ['/admin', '/api/', '/account', '/register'] }], sitemap: `${base}/sitemap.xml` };
}
