import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const sessions = await Session.find().sort({ createdAt: -1 });

  const headers = [
    'participantId',
    'email',
    'phone',
    'status',
    'startTime',
    'completionTime',
    'location',
    'occasion',
    'budget',
    'time',
    'duration',
    'moods',
    'categories',
    'avoid',
    'dietary',
    'travel',
    'friction',
    'novelty',
    'allergyNotes',
    'result1_lane',
    'result1_id',
    'result1_title',
    'result1_score',
    'result2_lane',
    'result2_id',
    'result2_title',
    'result2_score',
    'result3_lane',
    'result3_id',
    'result3_title',
    'result3_score',
    'favourite',
    'relevance',
    'bookingIntent',
    'searchComparison',
    'improvement',
    'catalogueVersion',
    'scoringVersion',
  ];

  const escape = (v) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const scoreFor = (r) => {
    if (!r?.scores) return '';
    if (r.lane === 'made_for_you') return r.scores.madeForYou;
    if (r.lane === 'easy_win') return r.scores.easyWin;
    return r.scores.trySomethingNew;
  };

  const rows = sessions.map((s) => {
    const a = s.answers || {};
    const r = s.results || [];
    const f = s.feedback || {};
    return [
      s.participantId,
      s.email,
      s.phone,
      s.status,
      s.startTime?.toISOString?.() || '',
      s.completionTime?.toISOString?.() || '',
      a.location,
      a.occasion,
      a.budget,
      a.time,
      a.duration,
      (a.moods || []).join('|'),
      (a.categories || []).join('|'),
      (a.avoid || []).join('|'),
      (a.dietary || []).join('|'),
      a.travel,
      a.friction,
      a.novelty,
      a.allergyNotes || '',
      r[0]?.lane,
      r[0]?.experienceId,
      r[0]?.title,
      scoreFor(r[0]),
      r[1]?.lane,
      r[1]?.experienceId,
      r[1]?.title,
      scoreFor(r[1]),
      r[2]?.lane,
      r[2]?.experienceId,
      r[2]?.title,
      scoreFor(r[2]),
      f.favourite,
      f.relevance,
      f.bookingIntent,
      f.searchComparison,
      f.improvement,
      s.catalogueVersion,
      s.scoringVersion,
    ]
      .map(escape)
      .join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="melt-export.csv"',
    },
  });
}
