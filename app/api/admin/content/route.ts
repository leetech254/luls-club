import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/data';
import { findPostById, listPosts, type ContentType, type PublicPost } from '@/lib/content';
import { ObjectId } from 'mongodb';

const types: ContentType[] = ['research', 'update', 'event', 'retreat'];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
function clean(body: Record<string, unknown>, existing?: PublicPost) {
  const title = String(body.title ?? existing?.title ?? '').trim();
  const type = String(body.type ?? existing?.type ?? 'research') as ContentType;
  const excerpt = String(body.excerpt ?? existing?.excerpt ?? '').trim();
  const contentBody = String(body.body ?? existing?.body ?? '').trim();
  const author = String(body.author ?? existing?.author ?? 'LULS Research Desk').trim();
  const eventDate = String(body.eventDate ?? existing?.eventDate ?? '').trim();
  const eventLocation = String(body.eventLocation ?? existing?.eventLocation ?? '').trim();
  const tags = String(body.tags ?? existing?.tags?.join(',') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
  const slug = slugify(String(body.slug ?? existing?.slug ?? title));
  if (!title || title.length < 4) throw new Error('Add a clear post title.');
  if (!types.includes(type)) throw new Error('Choose Research, Community update, Event, or Retreat.');
  if (!excerpt || !contentBody) throw new Error('Add a short summary and post content.');
  if ((type === 'event' || type === 'retreat') && !eventDate) throw new Error('Add the event or retreat date.');
  if ((type === 'event' || type === 'retreat') && !eventLocation) throw new Error('Add the event or retreat location.');
  if (!slug) throw new Error('A usable post link could not be created.');
  return { title, type, excerpt, body: contentBody, author: author || 'LULS Research Desk', tags, slug, eventDate: eventDate || undefined, eventLocation: eventLocation || undefined, published: body.published === undefined ? (existing?.published ?? false) : Boolean(body.published), featured: body.featured === undefined ? (existing?.featured ?? false) : Boolean(body.featured) };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  return NextResponse.json({ posts: await listPosts() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    const values = clean(body);
    const duplicate = await db.collection('contentPosts').findOne({ type: values.type, slug: values.slug });
    if (duplicate) return NextResponse.json({ error: 'A post with this title/link already exists in this section.' }, { status: 409 });
    const now = new Date().toISOString();
    const post = { ...values, createdAt: now, updatedAt: now };
    const result = await db.collection('contentPosts').insertOne(post);
    return NextResponse.json({ ok: true, post: { ...post, _id: result.insertedId.toString() } }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create post.' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = String(body.id || '');
    const existing = await findPostById(id);
    if (!existing || !ObjectId.isValid(id)) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    const values = clean(body, existing);
    const duplicate = await db.collection('contentPosts').findOne({ type: values.type, slug: values.slug, _id: { $ne: new ObjectId(id) } });
    if (duplicate) return NextResponse.json({ error: 'Another post already uses this section and link.' }, { status: 409 });
    const update = { ...values, updatedAt: new Date().toISOString() };
    await db.collection('contentPosts').updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ ok: true, post: { ...existing, ...update, _id: id } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update post.' }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await request.json() as { id?: string };
    if (!body.id || !ObjectId.isValid(body.id)) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    const result = await db.collection('contentPosts').deleteOne({ _id: new ObjectId(body.id) });
    if (!result.deletedCount) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Unable to delete post.' }, { status: 400 }); }
}
