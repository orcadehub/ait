import mongoose, { Schema, Document, models } from "mongoose";

export interface ITrainer extends Document {
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  profileComplete: boolean;
  experience?: number;
  education?: string;
  bio?: string;
  skills: string[];
  createdAt: Date;
}

const TrainerSchema = new Schema<ITrainer>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  profileComplete: { type: Boolean, default: false },
  experience: { type: Number },
  education: { type: String },
  bio: { type: String },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Trainer = models.Trainer || mongoose.model<ITrainer>("Trainer", TrainerSchema);
