import { MongoClient } from 'mongodb';
import { Member, previewMembers } from '@/lib/preview';
export type { Member } from '@/lib/preview';

let clientPromise: Promise<MongoClient> | null = null;
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'luls_portal');
}

export async function listMembers(includePending = false) {
  const db = await getDb();
  if (!db) return includePending ? previewMembers : previewMembers.filter((m) => m.status === 'approved');
  const query: Partial<Member> = includePending ? {} : { status: 'approved' };
  return (await db.collection<Member>('members').find(query).sort({ createdAt: -1 }).toArray()).map((m) => ({ ...m, _id: m._id?.toString() }));
}
