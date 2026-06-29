import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: String, required: true },
  start: { type: String },
  end: { type: String },
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  isCurrent: { type: Boolean, default: false },
});

const EducationSchema = new mongoose.Schema({
  college: { type: String },
  place: { type: String },
  branch: { type: String },
  cgpa: { type: String },
  year: { type: String },
});

const TrainerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  roleTitle: {
    type: String,
    maxLength: 50,
  },
  summary: {
    type: String,
    maxLength: 1000,
  },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  email: { type: String },
  altEmail: { type: String },
  country: { type: String, default: "India" },
  state: { type: String },
  city: { type: String },
  dob: { type: String },
  careerStart: { type: String },
  maritalStatus: { type: String },
  gender: { type: String },
  
  btech: EducationSchema,
  mtech: EducationSchema,
  
  colleges: [CollegeSchema],
  skills: [{ type: String }],
  languages: [{ type: String }],
  experiences: [ExperienceSchema],
  
  completionPercentage: {
    type: Number,
    default: 0,
  },
  occupiedDays: { 
    type: [String], 
    default: [] 
  },
}, { timestamps: true });

// Prevent mongoose caching issues during development when schema changes
if (mongoose.models.TrainerProfile) {
  delete mongoose.models.TrainerProfile;
}

export const TrainerProfile = mongoose.model("TrainerProfile", TrainerProfileSchema);
