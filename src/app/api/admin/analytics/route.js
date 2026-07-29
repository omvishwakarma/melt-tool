import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';

export const runtime = 'nodejs';

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  await connectDB();
  const sessions = await Session.find();
  const started = sessions.length;
  const completed = sessions.filter((s) => s.status === 'completed').length;

  const countMap = (items, keyFn) => {
    const map = {};
    for (const item of items) {
      const keys = keyFn(item);
      for (const k of keys) {
        if (!k) continue;
        map[k] = (map[k] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  };

  const answered = sessions.filter((s) => s.answers && Object.keys(s.answers).length);
  const feedbackSessions = sessions.filter((s) => s.feedback?.favourite);
  const withResults = sessions.filter((s) => (s.results || []).length > 0);

  const selectedAny = feedbackSessions.filter(
    (s) => s.feedback.favourite && s.feedback.favourite !== 'none'
  ).length;
  const relevant = feedbackSessions.filter((s) =>
    ['very_relevant', 'mostly_relevant'].includes(s.feedback.relevance)
  ).length;
  const booking = feedbackSessions.filter((s) =>
    ['yes', 'maybe'].includes(s.feedback.bookingIntent)
  ).length;
  const easier = feedbackSessions.filter((s) =>
    ['much_easier', 'slightly_easier'].includes(s.feedback.searchComparison)
  ).length;

  return NextResponse.json({
    started,
    completed,
    completionRate: started ? Math.round((completed / started) * 100) : 0,
    commonBudgets: countMap(answered, (s) => [s.answers?.budget]),
    commonMoods: countMap(answered, (s) => s.answers?.moods || []),
    commonOccasions: countMap(answered, (s) => [s.answers?.occasion]),
    commonCategories: countMap(answered, (s) => s.answers?.categories || []),
    selectedAnyPct: feedbackSessions.length
      ? Math.round((selectedAny / feedbackSessions.length) * 100)
      : 0,
    relevantPct: feedbackSessions.length
      ? Math.round((relevant / feedbackSessions.length) * 100)
      : 0,
    bookingPct: feedbackSessions.length
      ? Math.round((booking / feedbackSessions.length) * 100)
      : 0,
    easierPct: feedbackSessions.length
      ? Math.round((easier / feedbackSessions.length) * 100)
      : 0,
    favouriteRates: countMap(feedbackSessions, (s) => [s.feedback?.favourite]),
    resultsShown: withResults.length,
  });
}
