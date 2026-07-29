import mongoose from 'mongoose';
import { starterExperiences } from '../src/data/catalogue.js';

const ExperienceSchema = new mongoose.Schema(
  {
    experienceId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    location: {
      area: { type: String, required: true },
      locationCodes: [{ type: String }],
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
    convenienceScore: { type: Number, default: 5 },
    qualityScore: { type: Number, default: 5 },
    noveltyLevel: { type: Number, default: 5 },
    memorabilityScore: { type: Number, default: 5 },
    frictionTags: [{ type: String }],
    venueId: { type: String, required: true },
    bookingStatus: { type: String, default: 'active' },
    provider: { type: String, default: '' },
    bookingLink: { type: String, default: '' },
  },
  { timestamps: true }
);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const Experience = mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
  await Experience.deleteMany({});
  await Experience.insertMany(starterExperiences);
  console.log(`Seeded ${starterExperiences.length} experiences into Atlas`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
