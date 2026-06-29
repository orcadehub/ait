import mongoose from "mongoose";
import "dotenv/config";

const VendorSchema = new mongoose.Schema({
  email: String
}, { strict: false });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Vendor.deleteMany({});
  console.log("Deleted vendors:", res.deletedCount);
  process.exit(0);
}
run();
