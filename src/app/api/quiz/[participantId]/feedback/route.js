import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { participantId } = await params;
    const body = await request.json();
    const feedback = body?.feedback;

    if (!feedback?.favourite) {
      return NextResponse.json({ error: 'Feedback required' }, { status: 400 });
    }

    const session = await Session.findOne({ participantId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    session.feedback = feedback;
    session.completionTime = new Date();
    session.status = 'completed';
    await session.save();

    return NextResponse.json({ ok: true, participantId: session.participantId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to save feedback' }, { status: 500 });
  }
}
