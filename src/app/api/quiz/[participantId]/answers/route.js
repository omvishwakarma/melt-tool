import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { runCuration } from '@/lib/curation';
import Experience from '@/models/Experience';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { participantId } = await params;
    const body = await request.json();
    const answers = body?.answers;

    if (!answers) {
      return NextResponse.json({ error: 'Answers required' }, { status: 400 });
    }

    const session = await Session.findOne({ participantId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const experiences = await Experience.find({ bookingStatus: { $ne: 'inactive' } });
    const curation = runCuration(experiences, answers);

    session.answers = answers;
    session.filterLog = curation.filterLog;
    session.results = curation.results;
    session.scoreBreakdowns = curation.scoreBreakdowns;
    session.status = 'results_shown';
    session.catalogueVersion = process.env.CATALOGUE_VERSION || '1.0.0';
    session.scoringVersion = process.env.SCORING_VERSION || '1.0.0';
    await session.save();

    return NextResponse.json({
      participantId: session.participantId,
      results: curation.results,
      insufficient: curation.insufficient,
      message: curation.message,
      widenedNote: curation.widenedNote,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to score' }, { status: 500 });
  }
}
