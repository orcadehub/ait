import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { TrainerProfile } from "@/models/TrainerProfile";
import { Trainer } from "@/models/Trainer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    const profile = await TrainerProfile.findOne({ userId: trainer._id });
    
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    // Auto-correct stale profileComplete status for trainers
    const isActuallyComplete = profile.completionPercentage === 100;
    if (trainer.profileComplete !== isActuallyComplete) {
      trainer.profileComplete = isActuallyComplete;
      await trainer.save();
    }

    // AuthContext expects profileComplete inside the profile object
    return NextResponse.json({ profile: { ...profile.toObject(), profileComplete: trainer.profileComplete } }, { status: 200 });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ...profileData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    const profile = await TrainerProfile.findOneAndUpdate(
      { userId: trainer._id },
      { $set: profileData },
      { upsert: true, new: true }
    );
    
    // Update trainer profile complete status
    const isActuallyComplete = profile.completionPercentage === 100;
    if (trainer.profileComplete !== isActuallyComplete) {
      trainer.profileComplete = isActuallyComplete;
      await trainer.save();
    }

    return NextResponse.json({ profile: { ...profile.toObject(), profileComplete: trainer.profileComplete }, message: "Profile saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Profile POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
