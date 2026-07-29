import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Experience from '@/models/Experience';

export const runtime = 'nodejs';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const items = await Experience.find().sort({ experienceId: 1 });
  return NextResponse.json(items);
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const created = await Experience.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
