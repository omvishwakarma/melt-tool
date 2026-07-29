export const CATALOGUE_VERSION = process.env.CATALOGUE_VERSION || '1.0.0';
export const SCORING_VERSION = process.env.SCORING_VERSION || '1.0.0';

export const BUDGET_MAX = {
  under_100: 100,
  '100_200': 200,
  '201_350': 350,
  '351_500': 500,
  '501_1000': 1000,
  above_1000: 99999,
};

export const BUDGET_LABELS = {
  under_100: 'Under RM100',
  '100_200': 'RM100-RM200',
  '201_350': 'RM201-RM350',
  '351_500': 'RM351-RM500',
  '501_1000': 'RM501-RM1,000',
  above_1000: 'Above RM1,000',
};

export const DURATION_MAX_MINUTES = {
  '1_2_hours': 120,
  '2_4_hours': 240,
  half_day: 360,
  full_day: 720,
  overnight: 1440,
  full_weekend: 2880,
};

export const DURATION_LABELS = {
  '1_2_hours': '1-2 hours',
  '2_4_hours': '2-4 hours',
  half_day: 'half a day',
  full_day: 'a full day',
  overnight: 'overnight',
  full_weekend: 'a full weekend',
};

export const TRAVEL_BAND_MINUTES = {
  under_15: 15,
  under_30: 30,
  under_60: 60,
  up_to_120: 120,
  anywhere: 9999,
};

export const LOCATION_TRAVEL_MINUTES = {
  'Kuala Lumpur': {
    'Kuala Lumpur': 10,
    'Petaling Jaya': 25,
    'Shah Alam': 40,
    'Subang Jaya': 35,
    Klang: 50,
    'Elsewhere in Selangor': 55,
    'Outside Klang Valley': 90,
  },
  'Petaling Jaya': {
    'Kuala Lumpur': 25,
    'Petaling Jaya': 10,
    'Shah Alam': 25,
    'Subang Jaya': 20,
    Klang: 35,
    'Elsewhere in Selangor': 40,
    'Outside Klang Valley': 90,
  },
  'Shah Alam': {
    'Kuala Lumpur': 40,
    'Petaling Jaya': 25,
    'Shah Alam': 10,
    'Subang Jaya': 20,
    Klang: 25,
    'Elsewhere in Selangor': 35,
    'Outside Klang Valley': 90,
  },
  'Subang Jaya': {
    'Kuala Lumpur': 35,
    'Petaling Jaya': 20,
    'Shah Alam': 20,
    'Subang Jaya': 10,
    Klang: 30,
    'Elsewhere in Selangor': 35,
    'Outside Klang Valley': 90,
  },
  Klang: {
    'Kuala Lumpur': 50,
    'Petaling Jaya': 35,
    'Shah Alam': 25,
    'Subang Jaya': 30,
    Klang: 10,
    'Elsewhere in Selangor': 40,
    'Outside Klang Valley': 100,
  },
  'Elsewhere in Selangor': {
    'Kuala Lumpur': 55,
    'Petaling Jaya': 40,
    'Shah Alam': 35,
    'Subang Jaya': 35,
    Klang: 40,
    'Elsewhere in Selangor': 20,
    'Outside Klang Valley': 80,
  },
  'Outside Klang Valley': {
    'Kuala Lumpur': 90,
    'Petaling Jaya': 90,
    'Shah Alam': 90,
    'Subang Jaya': 90,
    Klang: 100,
    'Elsewhere in Selangor': 80,
    'Outside Klang Valley': 30,
  },
  Flexible: {
    'Kuala Lumpur': 20,
    'Petaling Jaya': 20,
    'Shah Alam': 25,
    'Subang Jaya': 25,
    Klang: 35,
    'Elsewhere in Selangor': 40,
    'Outside Klang Valley': 70,
  },
};

export const TIME_NEIGHBOURS = {
  weekday_morning: ['weekday_afternoon'],
  weekday_afternoon: ['weekday_morning', 'weekday_evening'],
  weekday_evening: ['weekday_afternoon'],
  weekend_morning: ['weekend_afternoon'],
  weekend_afternoon: ['weekend_morning', 'weekend_evening'],
  weekend_evening: ['weekend_afternoon'],
  flexible: [],
};

export const OCCASION_RELATED = {
  normal_date: ['weekend_activity', 'no_specific'],
  anniversary: ['celebrate', 'surprise'],
  birthday: ['celebrate', 'surprise'],
  surprise: ['anniversary', 'birthday', 'celebrate'],
  reconnect: ['normal_date', 'weekend_activity'],
  celebrate: ['anniversary', 'birthday', 'surprise'],
  weekend_activity: ['normal_date', 'no_specific'],
  no_specific: ['normal_date', 'weekend_activity'],
};

export const CATEGORY_MAP = {
  restaurant_dining: 'Restaurant or dining',
  cafe_dessert: 'Cafe or dessert',
  staycation: 'Staycation',
  spa_wellness: 'Spa or wellness',
  outdoor: 'Outdoor activity',
  workshop: 'Workshop or class',
  live_entertainment: 'Live entertainment',
  arts_culture: 'Arts or culture',
  scenic: 'Scenic experience',
  sports: 'Sports or physical activity',
  road_trip: 'Road trip',
  at_home: 'At-home experience',
  surprise_package: 'Surprise package',
};

export const MOOD_LABELS = {
  romantic: 'romantic',
  relaxing: 'relaxing',
  fun_playful: 'fun and playful',
  adventurous: 'adventurous',
  luxurious: 'luxurious',
  creative: 'creative',
  private_intimate: 'private and intimate',
  meaningful: 'meaningful',
  social_energetic: 'social and energetic',
};

export const FRICTION_CODES = {
  no_ideas: 'no_ideas',
  too_busy: 'busy',
  too_expensive: 'budget',
  cannot_agree: 'disagreement',
  same_things: 'repetitive',
  childcare: 'childcare',
  booking_hassle: 'booking_hassle',
  better_ideas: 'no_ideas',
};
