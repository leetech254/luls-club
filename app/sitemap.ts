import type { MetadataRoute } from 'next';
import { listPosts } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://luls-club.leetec.online';
  const now = new Date();
  const pages = ['/', '/scholars', '/retreat', '/research'].map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const, priority: path === '/' ? 1 : 0.8 }));
  const posts = await listPosts({ publishedOnly: true });
  const postPages = posts.map((post) => ({ url: `${base}/${post.type === 'research' ? 'research' : 'updates'}/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: 'monthly' as const, priority: 0.7 }));
  return [...pages, ...postPages];
}
