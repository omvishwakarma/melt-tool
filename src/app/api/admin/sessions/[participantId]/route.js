import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const { participantId } = await params;
  const session = await Session.findOne({ participantId });
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(session);
}
