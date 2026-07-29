import {
  BUDGET_MAX,
  BUDGET_LABELS,
  DURATION_MAX_MINUTES,
  DURATION_LABELS,
  TRAVEL_BAND_MINUTES,
  LOCATION_TRAVEL_MINUTES,
  TIME_NEIGHBOURS,
  OCCASION_RELATED,
  CATEGORY_MAP,
  MOOD_LABELS,
  FRICTION_CODES,
} from '@/data/constants';

function travelMinutes(userLocation, experienceArea) {
  const map = LOCATION_TRAVEL_MINUTES[userLocation] || LOCATION_TRAVEL_MINUTES.Flexible;
  return map[experienceArea] ?? 60;
}

function isDining(exp) {
  return ['restaurant_dining', 'cafe_dessert'].includes(exp.primaryCategory);
}

function hardFilter(exp, answers, options = {}) {
  const reasons = [];
  const travelWiden = options.travelWiden || 0;
  const timeWiden = options.timeWiden || false;

  if (exp.bookingStatus !== 'active') {
    reasons.push('inactive_or_unverified');
  }

  const budgetMax = BUDGET_MAX[answers.budget];
  if (exp.normalTotalPrice > budgetMax) {
    reasons.push('over_budget');
  }

  if (answers.avoid?.length && !answers.avoid.includes('nothing')) {
    const hit = (exp.avoidTags || []).filter((t) => answers.avoid.includes(t));
    if (hit.length) reasons.push(`avoid:${hit.join(',')}`);
  }

  const dietary = answers.dietary || [];
  if (
    isDining(exp) &&
    dietary.length &&
    !dietary.includes('no_restrictions') &&
    !dietary.includes('not_relevant')
  ) {
    for (const tag of dietary) {
      if (tag === 'food_allergy') {
        if (!(exp.dietarySupport || []).includes('allergy_handling')) {
          reasons.push('dietary:allergy');
        }
      } else if (!(exp.dietarySupport || []).includes(tag)) {
        reasons.push(`dietary:${tag}`);
      }
    }
  }

  const durationMax = DURATION_MAX_MINUTES[answers.duration];
  if (exp.duration.minutes > durationMax) {
    reasons.push('duration_too_long');
  }

  const userTime = answers.time;
  if (userTime !== 'flexible') {
    const tags = exp.availableTimeTags || [];
    const exact = tags.includes(userTime) || tags.includes('flexible');
    const nearby = (TIME_NEIGHBOURS[userTime] || []).some((t) => tags.includes(t));
    if (!exact && !(timeWiden && nearby)) {
      reasons.push('time_unavailable');
    }
  }

  if (answers.location !== 'Flexible' && answers.travel !== 'anywhere') {
    let allowed = TRAVEL_BAND_MINUTES[answers.travel];
    if (travelWiden) {
      const bands = [15, 30, 60, 120, 9999];
      const idx = bands.indexOf(allowed);
      allowed = bands[Math.min(bands.length - 1, idx + travelWiden)] || allowed;
    }
    const mins = travelMinutes(answers.location, exp.location.area);
    if (mins > allowed) reasons.push('too_far');
  }

  return { passed: reasons.length === 0, reasons };
}

function categoryPoints(exp, ranked) {
  if (!ranked?.length) return 0;
  const primary = ranked[0];
  const secondary = ranked[1];
  const tertiary = ranked[2];

  if (exp.primaryCategory === primary) return 25;
  if (exp.primaryCategory === secondary) return 20;
  if (exp.primaryCategory === tertiary) return 15;

  if (exp.secondaryCategory === primary) return 18;
  if (exp.secondaryCategory === secondary) return 14;
  if (exp.secondaryCategory === tertiary) return 10;

  const related = exp.relatedCategories || [];
  if (related.includes(primary) || related.includes(secondary) || related.includes(tertiary)) {
    return 6;
  }
  return 0;
}

function moodPoints(exp, moods) {
  if (!moods?.length) return 0;
  let pts = 0;
  for (const m of moods.slice(0, 2)) {
    if ((exp.moodTags || []).includes(m)) pts += 10;
  }
  return Math.min(20, pts);
}

function occasionPoints(exp, occasion) {
  if ((exp.occasionTags || []).includes(occasion)) return 10;
  const related = OCCASION_RELATED[occasion] || [];
  if (related.some((o) => (exp.occasionTags || []).includes(o))) return 5;
  return 0;
}

function budgetPoints(exp, budgetKey) {
  const max = BUDGET_MAX[budgetKey];
  if (max >= 99999) return 10;
  const ratio = exp.normalTotalPrice / max;
  if (ratio <= 0.7) return 10;
  if (ratio <= 0.9) return 8;
  if (ratio <= 1) return 5;
  return 0;
}

function timePoints(exp, time, timeWiden) {
  if (time === 'flexible') return 5;
  const tags = exp.availableTimeTags || [];
  if (tags.includes(time) || tags.includes('flexible')) return 5;
  if (timeWiden && (TIME_NEIGHBOURS[time] || []).some((t) => tags.includes(t))) return 2;
  return 0;
}

function durationPoints(exp, durationKey) {
  const max = DURATION_MAX_MINUTES[durationKey];
  if (exp.duration.minutes <= max * 0.5 && exp.duration.minutes <= max) return 3;
  if (exp.duration.minutes <= max) return 5;
  return 0;
}

function travelPoints(exp, answers, travelWiden) {
  if (answers.location === 'Flexible' || answers.travel === 'anywhere') return 4;
  let allowed = TRAVEL_BAND_MINUTES[answers.travel];
  if (travelWiden) {
    const bands = [15, 30, 60, 120, 9999];
    const idx = bands.indexOf(allowed);
    allowed = bands[Math.min(bands.length - 1, idx + travelWiden)] || allowed;
  }
  const mins = travelMinutes(answers.location, exp.location.area);
  if (mins <= allowed / 2) return 5;
  if (mins <= allowed) return 3;
  return 0;
}

function baseMatchScore(exp, answers, options = {}) {
  const breakdown = {
    activity: categoryPoints(exp, answers.categories),
    feeling: moodPoints(exp, answers.moods),
    occasion: occasionPoints(exp, answers.occasion),
    budget: budgetPoints(exp, answers.budget),
    time: timePoints(exp, answers.time, options.timeWiden),
    duration: durationPoints(exp, answers.duration),
    travel: travelPoints(exp, answers, options.travelWiden),
  };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { total, breakdown };
}

function strongMatchBonus(exp, answers, base) {
  const catHit = base.breakdown.activity >= 15;
  const moodHit = base.breakdown.feeling >= 10;
  const occasionHit = base.breakdown.occasion >= 5;
  if (catHit && moodHit && occasionHit) return 10;
  if (catHit && moodHit) return 5;
  return 0;
}

function frictionSolverScore(exp, frictionCode) {
  const tags = exp.frictionTags || [];
  const mapped = FRICTION_CODES[frictionCode] || frictionCode;
  if (tags.includes(mapped)) return 10;
  if (frictionCode === 'better_ideas' && (exp.qualityScore || 0) >= 7) return 8;
  if (frictionCode === 'too_busy' && (exp.convenienceScore || 0) >= 7) return 7;
  if (frictionCode === 'too_expensive' && exp.normalTotalPrice <= 150) return 7;
  if (frictionCode === 'booking_hassle' && tags.includes('booking_hassle')) return 10;
  return 2;
}

function noveltyFitScore(exp, preference) {
  const n = exp.noveltyLevel || 5;
  const ranges = {
    safe_familiar: [2, 4],
    small_twist: [4, 6],
    completely_new: [8, 10],
    mixture: [6, 8],
  };
  const [lo, hi] = ranges[preference] || [5, 7];
  if (n >= lo && n <= hi) return 10;
  if (n >= lo - 1 && n <= hi + 1) return 6;
  if (n >= lo - 2 && n <= hi + 2) return 3;
  return 1;
}

function buildExplanation(lane, exp, answers) {
  const moods = (answers.moods || []).map((m) => MOOD_LABELS[m] || m).join(' and ');
  const cat = CATEGORY_MAP[answers.categories?.[0]] || 'your selected activities';
  const duration = DURATION_LABELS[answers.duration] || 'your available time';
  const budget = BUDGET_LABELS[answers.budget] || 'your budget';
  const problemLabels = {
    no_ideas: 'not knowing what to do',
    too_busy: 'being too busy',
    too_expensive: 'keeping costs down',
    cannot_agree: 'finding something you both enjoy',
    same_things: 'breaking out of the usual routine',
    childcare: 'fitting around family responsibilities',
    booking_hassle: 'avoiding booking hassle',
    better_ideas: 'wanting better ideas',
  };

  if (lane === 'made_for_you') {
    return `Recommended because you wanted ${moods || 'a great shared experience'}, selected ${cat}, have ${duration} available and set a budget of ${budget}.`;
  }
  if (lane === 'easy_win') {
    const traits = [];
    if ((exp.convenienceScore || 0) >= 7) traits.push('easy to book');
    if (exp.duration.minutes <= 180) traits.push('short');
    traits.push('within budget');
    return `This is the easiest fit because it is ${traits.join('/')} and directly addresses ${problemLabels[answers.friction] || 'your planning needs'}.`;
  }
  return `This gives you something new or different while still matching your interest in ${moods || cat} and staying within your practical limits.`;
}

function pickBest(candidates, scoreKey, usedIds, usedVenues, preferredAvoidCategories, minScore) {
  const sorted = [...candidates].sort((a, b) => {
    const diff = b.scores[scoreKey] - a.scores[scoreKey];
    if (diff !== 0) return diff;
    const q = (b.exp.qualityScore || 0) - (a.exp.qualityScore || 0);
    if (q !== 0) return q;
    const travel = a.travelMins - b.travelMins;
    if (travel !== 0) return travel;
    return a.exp.normalTotalPrice - b.exp.normalTotalPrice;
  });

  const eligible = sorted.filter(
    (c) =>
      c.scores[scoreKey] >= minScore &&
      !usedIds.has(c.exp.experienceId) &&
      !usedVenues.has(c.exp.venueId)
  );

  if (!eligible.length) {
    return sorted.find(
      (c) => !usedIds.has(c.exp.experienceId) && !usedVenues.has(c.exp.venueId)
    ) || null;
  }

  if (preferredAvoidCategories?.size) {
    const diverse = eligible.find((c) => !preferredAvoidCategories.has(c.exp.primaryCategory));
    if (diverse) return diverse;
  }
  return eligible[0];
}

export function runCuration(experiences, answers) {
  const attempts = [
    { timeWiden: false, travelWiden: 0 },
    { timeWiden: true, travelWiden: 0 },
    { timeWiden: true, travelWiden: 1 },
  ];

  let filterLog = [];
  let passed = [];
  let options = attempts[0];
  let widenedNote = null;

  for (const attempt of attempts) {
    options = attempt;
    filterLog = experiences.map((exp) => {
      const result = hardFilter(exp, answers, attempt);
      return {
        experienceId: exp.experienceId,
        title: exp.title,
        passed: result.passed,
        reasons: result.reasons,
      };
    });
    passed = experiences.filter((_, i) => filterLog[i].passed);

    if (attempt.timeWiden && !attempt.travelWiden) widenedNote = 'Nearby time periods included';
    if (attempt.travelWiden) widenedNote = 'Travel distance widened by one band';

    if (passed.length >= 3) break;
  }

  if (passed.length < 3) {
    const atHome = experiences.filter(
      (exp) =>
        exp.primaryCategory === 'at_home' &&
        hardFilter(exp, answers, { timeWiden: true, travelWiden: 1 }).passed &&
        !passed.some((p) => p.experienceId === exp.experienceId)
    );
    passed = [...passed, ...atHome];
    if (atHome.length) widenedNote = 'Suitable at-home options included';
  }

  const scored = passed.map((exp) => {
    const base = baseMatchScore(exp, answers, options);
    const bonus = strongMatchBonus(exp, answers, base);
    const madeForYou = base.total + (exp.qualityScore || 0) + bonus;
    const easyWin =
      base.total + (exp.convenienceScore || 0) + frictionSolverScore(exp, answers.friction);
    const tryNew =
      base.total + noveltyFitScore(exp, answers.novelty) + (exp.memorabilityScore || 0);

    return {
      exp,
      travelMins: travelMinutes(answers.location, exp.location.area),
      scores: {
        baseMatch: base.total,
        baseBreakdown: base.breakdown,
        quality: exp.qualityScore || 0,
        strongMatchBonus: bonus,
        madeForYou,
        convenience: exp.convenienceScore || 0,
        frictionSolver: frictionSolverScore(exp, answers.friction),
        easyWin,
        noveltyFit: noveltyFitScore(exp, answers.novelty),
        memorability: exp.memorabilityScore || 0,
        trySomethingNew: tryNew,
      },
    };
  });

  const usedIds = new Set();
  const usedVenues = new Set();
  const usedCategories = new Set();
  const results = [];

  const made = pickBest(scored, 'madeForYou', usedIds, usedVenues, null, 65);
  if (made) {
    usedIds.add(made.exp.experienceId);
    usedVenues.add(made.exp.venueId);
    usedCategories.add(made.exp.primaryCategory);
    results.push({
      lane: 'made_for_you',
      experienceId: made.exp.experienceId,
      title: made.exp.title,
      shortDescription: made.exp.shortDescription,
      category: made.exp.primaryCategory,
      categoryLabel: CATEGORY_MAP[made.exp.primaryCategory],
      venueId: made.exp.venueId,
      price: made.exp.normalTotalPrice,
      location: made.exp.location.area,
      explanation: buildExplanation('made_for_you', made.exp, answers),
      scores: made.scores,
      widenedNote,
    });
  }

  const easy = pickBest(scored, 'easyWin', usedIds, usedVenues, usedCategories, 60);
  if (easy) {
    usedIds.add(easy.exp.experienceId);
    usedVenues.add(easy.exp.venueId);
    usedCategories.add(easy.exp.primaryCategory);
    results.push({
      lane: 'easy_win',
      experienceId: easy.exp.experienceId,
      title: easy.exp.title,
      shortDescription: easy.exp.shortDescription,
      category: easy.exp.primaryCategory,
      categoryLabel: CATEGORY_MAP[easy.exp.primaryCategory],
      venueId: easy.exp.venueId,
      price: easy.exp.normalTotalPrice,
      location: easy.exp.location.area,
      explanation: buildExplanation('easy_win', easy.exp, answers),
      scores: easy.scores,
      widenedNote,
    });
  }

  const neu = pickBest(scored, 'trySomethingNew', usedIds, usedVenues, usedCategories, 58);
  if (neu) {
    usedIds.add(neu.exp.experienceId);
    usedVenues.add(neu.exp.venueId);
    results.push({
      lane: 'try_something_new',
      experienceId: neu.exp.experienceId,
      title: neu.exp.title,
      shortDescription: neu.exp.shortDescription,
      category: neu.exp.primaryCategory,
      categoryLabel: CATEGORY_MAP[neu.exp.primaryCategory],
      venueId: neu.exp.venueId,
      price: neu.exp.normalTotalPrice,
      location: neu.exp.location.area,
      explanation: buildExplanation('try_something_new', neu.exp, answers),
      scores: neu.scores,
      widenedNote,
    });
  }

  const scoreBreakdowns = {};
  for (const item of scored) {
    scoreBreakdowns[item.exp.experienceId] = item.scores;
  }

  return {
    results,
    filterLog,
    scoreBreakdowns,
    insufficient: results.length < 3,
    message:
      results.length < 3
        ? 'MELT needs more options for that request. Showing the best available matches.'
        : null,
    widenedNote,
  };
}
