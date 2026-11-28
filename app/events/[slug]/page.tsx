import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentPath, findPost } from '@/lib/content';
import { ShareButton } from '@/components/ShareButton';
import { SocialShareButtons } from '@/components/SocialShareButtons';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await findPost('event', params.slug);
  if (!post) return { title: 'Event not found' };
  return { title: post.title, description: post.excerpt, alternates: { canonical: contentPath(post) }, openGraph: { type: 'article', url: contentPath(post), title: post.title, description: post.excerpt }, twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt } };
}

export default async function EventPost({ params }: { params: { slug: string } }) {
  const post = await findPost('event', params.slug);
  if (!post) notFound();
  return <article className="post-page section"><div className="actions" style={{ marginBottom: 28 }}><Link className="button alt" href="/research">← All research and events</Link><ShareButton title={post.title} text={post.excerpt} /><SocialShareButtons title={post.title} text={post.excerpt} /></div><div className="post-header"><div className="eyebrow">Event · {post.eventDate || 'Details inside'} · {post.eventLocation || 'LULS'}</div><h1>{post.title}</h1><p className="post-excerpt">{post.excerpt}</p><div className="post-meta">{post.author} · Published {new Date(post.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><div className="post-body">{post.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>;
}
