import mongoose, { Schema, Document, models } from "mongoose";

export interface IVendor extends Document {
  companyName: string;
  email: string;
  passwordHash: string;
  location?: string;
  state?: string;
  city?: string;
  industry?: string;
  about?: string;
  registrationStatus?: string;
  websiteUrl?: string;
  phone?: string;
  whatsapp?: string;
  altEmail?: string;
  profileComplete: boolean;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  location: { type: String },
  state: { type: String },
  city: { type: String },
  industry: { type: String },
  about: { type: String },
  registrationStatus: { type: String },
  websiteUrl: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  altEmail: { type: String },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Vendor) {
  delete mongoose.models.Vendor;
}
export const Vendor = mongoose.model<IVendor>("Vendor", VendorSchema);
