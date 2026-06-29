import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectToDatabase();

    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newTrainer = new Trainer({
      fullName,
      email,
      phone,
      passwordHash,
      isVerified: true,
      profileComplete: false,
    });

    await newTrainer.save();

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          name: newTrainer.fullName,
          email: newTrainer.email,
          type: "trainer",
          onboardingComplete: false,
          profileComplete: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
