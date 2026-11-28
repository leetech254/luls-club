import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/data';
import { sendRetreatAnnouncementEmail } from '@/lib/email';
import type { Member } from '@/lib/preview';

export async function POST() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'The database is not configured for this deployment.' }, { status: 503 });

  const members = await db.collection<Member>('members').find({ status: 'approved', email: { $type: 'string', $regex: /@/ }, retreatAnnouncementSentAt: { $exists: false } }).toArray();
  let sent = 0;
  let failed = 0;
  const failures: { regNo: string; error: string }[] = [];
  for (const member of members) {
    const result = await sendRetreatAnnouncementEmail(member);
    if (result.sent) {
      sent += 1;
      await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { retreatAnnouncementSentAt: new Date().toISOString(), retreatAnnouncementEmailId: result.id || null, retreatAnnouncementEmailStatus: 'sent' } });
    } else {
      failed += 1;
      failures.push({ regNo: member.regNo, error: result.error });
      await db.collection('members').updateOne({ regNo: member.regNo }, { $set: { retreatAnnouncementEmailStatus: 'failed' } });
    }
  }
  return NextResponse.json({ ok: true, eligible: members.length, sent, failed, failures });
}
