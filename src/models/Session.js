import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true, unique: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    consent: { type: Boolean, default: false },
    startTime: { type: Date },
    completionTime: { type: Date },
    status: {
      type: String,
      enum: ['started', 'answered', 'results_shown', 'completed'],
      default: 'started',
    },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    filterLog: [
      {
        experienceId: String,
        title: String,
        passed: Boolean,
        reasons: [String],
      },
    ],
    results: [
      {
        lane: String,
        experienceId: String,
        title: String,
        shortDescription: String,
        category: String,
        categoryLabel: String,
        venueId: String,
        price: Number,
        location: String,
        explanation: String,
        scores: mongoose.Schema.Types.Mixed,
        widenedNote: String,
      },
    ],
    scoreBreakdowns: { type: mongoose.Schema.Types.Mixed, default: {} },
    feedback: {
      favourite: String,
      relevance: String,
      bookingIntent: String,
      searchComparison: String,
      improvement: String,
    },
    catalogueVersion: String,
    scoringVersion: String,
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
