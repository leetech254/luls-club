import { NextResponse } from 'next/server'; import { listMembers } from '@/lib/data';
export async function GET(){try{return NextResponse.json({members:await listMembers(true)})}catch{ return NextResponse.json({error:'Unable to load members.'},{status:500})}}
