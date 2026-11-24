import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findPost } from '@/lib/content';
import { ShareButton } from '@/components/ShareButton';

export async function generateMetadata({ params }: { params: { slug: string } }) { const post = await findPost('research', params.slug); return post ? { title: post.title, description: post.excerpt } : { title: 'Research post not found' }; }

export default async function ResearchPost({ params }: { params: { slug: string } }) {
  const post = await findPost('research', params.slug);
  if (!post) notFound();
  return <article className="post-page section"><div className="actions" style={{ marginBottom: 28 }}><Link className="button alt" href="/research">← All research and updates</Link><ShareButton title={post.title} text={post.excerpt} /></div><div className="post-header"><div className="eyebrow">Research note · {post.tags.join(' · ') || 'LULS'}</div><h1>{post.title}</h1><p className="post-excerpt">{post.excerpt}</p><div className="post-meta">{post.author} · Published {new Date(post.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><div className="post-body">{post.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>;
}
