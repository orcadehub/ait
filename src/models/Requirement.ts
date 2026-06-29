import mongoose, { Schema, Document, models } from "mongoose";

export interface IRequirement extends Document {
  title: string;
  startDate: string;
  durationMonths: number;
  durationDays: number;
  mode: "online" | "offline" | "hybrid";
  country: string;
  state?: string;
  city?: string;
  skills: string[];
  workingDays: string[];
  budgetType: "Daily" | "Monthly";
  budgetMin: number;
  budgetMax: number;
  contactNumber: string;
  contactEmail: string;
  description: string;
  vendorEmail: string;
  status: "Draft" | "Active" | "Deactive";
  totalTrainersNeeded: number;
  shortlistedTrainers: string[]; // array of trainer emails
  interestedTrainers: string[]; // array of trainer emails
  createdAt: Date;
}

const RequirementSchema = new Schema<IRequirement>({
  title: { type: String, required: true },
  startDate: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  mode: { type: String, enum: ["online", "offline", "hybrid"], required: true },
  country: { type: String, required: true, default: "India" },
  state: { type: String },
  city: { type: String },
  skills: [{ type: String }],
  workingDays: [{ type: String }],
  budgetType: { type: String, enum: ["Daily", "Monthly"], required: true },
  budgetMin: { type: Number, required: true },
  budgetMax: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  contactEmail: { type: String, required: true },
  description: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  status: { type: String, enum: ["Draft", "Active", "Deactive"], default: "Active" },
  totalTrainersNeeded: { type: Number, required: true, default: 1 },
  shortlistedTrainers: { type: [String], default: [] },
  interestedTrainers: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Requirement) {
  delete mongoose.models.Requirement;
}
export const Requirement = mongoose.model<IRequirement>("Requirement", RequirementSchema);
