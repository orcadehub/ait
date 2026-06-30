import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    await connectToDatabase();

    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (trainer.isBlocked) {
      return NextResponse.json({ error: "Your account has been blocked by the administrator." }, { status: 403 });
    }

    if (!trainer.passwordHash) {
      // Auto-migrate: set the entered password as their new password
      const salt = await bcrypt.genSalt(10);
      trainer.passwordHash = await bcrypt.hash(password, salt);
      await trainer.save();
    } else {
      const isMatch = await bcrypt.compare(password, trainer.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          name: trainer.fullName,
          email: trainer.email,
          type: "trainer",
          onboardingComplete: true,
          profileComplete: trainer.profileComplete,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
