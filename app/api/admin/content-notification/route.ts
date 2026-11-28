import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getAdminSession } from '@/lib/auth';
import { getDb, listMembers } from '@/lib/data';
import { findPostById } from '@/lib/content';
import { sendContentAnnouncementEmail } from '@/lib/email';

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const body = await request.json() as { id?: string };
    if (!body.id || !ObjectId.isValid(body.id)) return NextResponse.json({ error: 'Event or retreat post not found.' }, { status: 404 });
    const post = await findPostById(body.id);
    if (!post || !post.published || !['event', 'retreat'].includes(post.type)) return NextResponse.json({ error: 'Publish an event or retreat post before sending notifications.' }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });
    const sentTo = new Set(post.notificationSentTo || []);
    const eligible = (await listMembers(true)).filter((member) => member.status === 'approved' && member.email);
    let sent = 0;
    let failed = 0;
    let lastError = '';
    for (const member of eligible) {
      if (sentTo.has(member.regNo)) continue;
      const result = await sendContentAnnouncementEmail(member, post);
      if (result.sent) {
        sentTo.add(member.regNo);
        sent += 1;
        await db.collection('contentPosts').updateOne({ _id: new ObjectId(body.id) }, { $addToSet: { notificationSentTo: member.regNo }, $set: { notificationSentAt: new Date().toISOString() }, $inc: { notificationSentCount: 1 } });
      } else {
        failed += 1;
        lastError = result.error || 'Email delivery failed.';
        await db.collection('contentPosts').updateOne({ _id: new ObjectId(body.id) }, { $inc: { notificationFailedCount: 1 } });
      }
    }
    return NextResponse.json({ ok: true, eligible: eligible.length, sent, failed, skipped: sentTo.size - sent, error: lastError || undefined });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send notifications.' }, { status: 400 });
  }
}
