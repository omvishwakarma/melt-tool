import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema(
  {
    experienceId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    location: {
      area: { type: String, required: true },
      locationCodes: [{ type: String }],
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    normalTotalPrice: { type: Number, required: true },
    primaryCategory: { type: String, required: true },
    secondaryCategory: { type: String, default: '' },
    relatedCategories: [{ type: String }],
    moodTags: [{ type: String }],
    occasionTags: [{ type: String }],
    availableTimeTags: [{ type: String }],
    duration: {
      code: { type: String, required: true },
      minutes: { type: Number, required: true },
    },
    avoidTags: [{ type: String }],
    dietarySupport: [{ type: String }],
    convenienceScore: { type: Number, min: 0, max: 10, default: 5 },
    qualityScore: { type: Number, min: 0, max: 10, default: 5 },
    noveltyLevel: { type: Number, min: 1, max: 10, default: 5 },
    memorabilityScore: { type: Number, min: 0, max: 10, default: 5 },
    frictionTags: [{ type: String }],
    venueId: { type: String, required: true },
    bookingStatus: {
      type: String,
      enum: ['active', 'inactive', 'unverified'],
      default: 'active',
    },
    provider: { type: String, default: '' },
    bookingLink: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
