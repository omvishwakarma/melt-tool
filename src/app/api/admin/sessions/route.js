import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const sessions = await Session.find().sort({ createdAt: -1 }).limit(500);
  return NextResponse.json(sessions);
}
