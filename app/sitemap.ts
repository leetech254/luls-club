import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const now = new Date();
  return ['/', '/scholars', '/register', '/account', '/retreat'].map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: path === '/' ? 'weekly' : 'monthly', priority: path === '/' ? 1 : 0.7 }));
}
