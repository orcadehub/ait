import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Vendor } from "@/models/Vendor";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
    }

    await connectToDatabase();

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, vendor.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    vendor.passwordHash = passwordHash;
    await vendor.save();

    return NextResponse.json({ message: "Password successfully updated." }, { status: 200 });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
