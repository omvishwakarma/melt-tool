import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Experience from '@/models/Experience';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const { id } = await params;
  const { bookingStatus } = await request.json();
  const updated = await Experience.findByIdAndUpdate(id, { bookingStatus }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
