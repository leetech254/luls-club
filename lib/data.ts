import { MongoClient } from 'mongodb';
import { Member, previewMembers } from '@/lib/preview';
import { normalizeKenyanPhone } from '@/lib/leetec';
import { buildLegacyMembers } from '@/lib/legacy-members';
export type { Member } from '@/lib/preview';

let clientPromise: Promise<MongoClient> | null = null;
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'luls_portal');
}

async function ensureLegacyMembers(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) return;
  const legacyMembers = buildLegacyMembers();
  const existing = await db.collection<Member>('members').countDocuments({ regNo: { $regex: /^LULS\/LEGACY\// } });
  if (existing >= legacyMembers.length) return;
  await db.collection('members').createIndex({ regNo: 1 }, { unique: true });
  try { await db.collection<Member>('members').bulkWrite(legacyMembers.map((member) => ({ updateOne: { filter: { regNo: member.regNo }, update: { $setOnInsert: member }, upsert: true } })), { ordered: false }); } catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
}

export async function listMembers(includePending = false) {
  const db = await getDb();
  if (!db) { const members = [...previewMembers, ...buildLegacyMembers()]; return includePending ? members : members.filter((m) => m.status === 'approved'); }
  await ensureLegacyMembers(db);
  const query: Partial<Member> = includePending ? {} : { status: 'approved' };
  return (await db.collection<Member>('members').find(query).sort({ createdAt: -1 }).toArray()).map((m) => ({ ...m, _id: m._id?.toString() }));
}

export async function findMemberByIdentity(regNo: string, phone: string) {
  const normalizedRegNo = regNo.trim().toUpperCase();
  const normalizedPhone = normalizeKenyanPhone(phone);
  const db = await getDb();
  if (!db) return [...previewMembers, ...buildLegacyMembers()].find((m) => m.regNo === normalizedRegNo && m.phone === normalizedPhone) || null;
  await ensureLegacyMembers(db);
  const member = await db.collection<Member>('members').findOne({ regNo: normalizedRegNo, phone: normalizedPhone });
  return member ? { ...member, _id: member._id?.toString() } : null;
}

export async function findMemberByLookup(value: string) {
  const input = value.trim();
  const normalizedRegNo = input.toUpperCase();
  const normalizedPhone = normalizeKenyanPhone(input);
  const escapedName = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const db = await getDb();
  if (!db) {
    const members = [...previewMembers, ...buildLegacyMembers()];
    return members.find((m) => m.regNo === normalizedRegNo || m.phone === normalizedPhone || m.name.toLowerCase() === input.toLowerCase())
      || members.find((m) => m.name.toLowerCase().includes(input.toLowerCase()))
      || null;
  }
  await ensureLegacyMembers(db);
  const exactName = await db.collection<Member>('members').findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } });
  if (exactName) return { ...exactName, _id: exactName._id?.toString() };
  const member = await db.collection<Member>('members').findOne({ $or: [{ regNo: normalizedRegNo }, { phone: normalizedPhone }, { name: { $regex: escapedName, $options: 'i' } }] });
  return member ? { ...member, _id: member._id?.toString() } : null;
}
