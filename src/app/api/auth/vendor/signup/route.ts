import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Vendor } from "@/models/Vendor";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { companyName, email, password } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectToDatabase();

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newVendor = new Vendor({
      companyName,
      email,
      passwordHash,
      profileComplete: false,
    });

    await newVendor.save();

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          name: newVendor.companyName,
          email: newVendor.email,
          type: "vendor",
          onboardingComplete: newVendor.profileComplete,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
