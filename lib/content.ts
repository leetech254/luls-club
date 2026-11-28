import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/data';

export type ContentType = 'research' | 'update' | 'event' | 'retreat';
export type PublicPost = {
  _id?: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string[];
  author: string;
  published: boolean;
  featured: boolean;
  eventDate?: string;
  eventLocation?: string;
  notificationSentAt?: string;
  notificationSentCount?: number;
  notificationFailedCount?: number;
  notificationSentTo?: string[];
  createdAt: string;
  updatedAt: string;
};

export function contentPath(post: Pick<PublicPost, 'type' | 'slug'>) {
  const section = post.type === 'research' ? 'research' : post.type === 'update' ? 'updates' : post.type === 'event' ? 'events' : 'retreats';
  return `/${section}/${post.slug}`;
}

const starterPosts = [
  { type: 'research' as const, title: 'Language learning across disciplines', slug: 'language-learning-across-disciplines', excerpt: 'A starting note on how students from every course can use language research to connect classrooms, communities, and cultures.', body: 'LULS welcomes questions from every Laikipia University course. Language learning becomes richer when students bring different academic backgrounds, lived experiences, and curiosity into the same conversation.\n\nOur research circle will share practical questions, reading suggestions, field observations, and student-led work across German, Spanish, sign language, French, English, Kiswahili, and more.', tags: ['multilingual learning', 'student research'], author: 'LULS Research Desk', published: true, featured: true },
  { type: 'update' as const, title: 'LULS public research desk is open', slug: 'luls-public-research-desk-is-open', excerpt: 'Follow this space for research notes, language activities, event notices, and community updates from LULS.', body: 'The LULS public research desk is now open for students and friends of the community. We will use this space to share new research ideas, member activities, language resources, and important announcements.\n\nTo contribute a question or join the conversation, register with LULS and connect through the official WhatsApp group.', tags: ['LULS news', 'community'], author: 'LULS Coordination Desk', published: true, featured: true },
];

async function ensureStarterPosts(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) return;
  const collection = db.collection('contentPosts');
  if (await collection.estimatedDocumentCount()) return;
  const now = new Date().toISOString();
  await collection.insertMany(starterPosts.map((post) => ({ ...post, createdAt: now, updatedAt: now })));
}

function serialize(post: PublicPost & { _id?: ObjectId | string }): PublicPost {
  return { ...post, _id: post._id?.toString() };
}

export async function listPosts(options: { type?: ContentType; publishedOnly?: boolean } = {}) {
  const db = await getDb();
  if (!db) return [] as PublicPost[];
  await ensureStarterPosts(db);
  const query: Record<string, unknown> = {};
  if (options.type) query.type = options.type;
  if (options.publishedOnly) query.published = true;
  const posts = await db.collection<PublicPost>('contentPosts').find(query).sort({ featured: -1, createdAt: -1 }).toArray();
  return posts.map(serialize);
}

export async function findPost(type: ContentType, slug: string, publishedOnly = true) {
  const db = await getDb();
  if (!db) return null;
  const query: Record<string, unknown> = { type, slug };
  if (publishedOnly) query.published = true;
  const post = await db.collection<PublicPost>('contentPosts').findOne(query);
  return post ? serialize(post) : null;
}

export async function findPostById(id: string) {
  const db = await getDb();
  if (!db || !ObjectId.isValid(id)) return null;
  const post = await db.collection<any>('contentPosts').findOne({ _id: new ObjectId(id) });
  return post ? serialize(post) : null;
}
