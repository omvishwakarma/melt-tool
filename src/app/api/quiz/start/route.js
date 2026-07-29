import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email = '', phone = '', consent } = body || {};

    if (!consent) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
    }

    const participantId = `P-${randomUUID().slice(0, 8).toUpperCase()}`;
    const session = await Session.create({
      participantId,
      email,
      phone,
      consent: true,
      startTime: new Date(),
      status: 'started',
      catalogueVersion: process.env.CATALOGUE_VERSION || '1.0.0',
      scoringVersion: process.env.SCORING_VERSION || '1.0.0',
    });

    return NextResponse.json(
      { participantId: session.participantId, startTime: session.startTime },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to start' }, { status: 500 });
  }
}
