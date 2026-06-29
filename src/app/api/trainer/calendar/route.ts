import { NextRequest, NextResponse } from "next/server";
import { TrainerProfile } from "@/models/TrainerProfile";
import { Trainer } from "@/models/Trainer";
import connectToDatabase from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const trainer = await Trainer.findOne({ email });
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const profile = await TrainerProfile.findOne({ userId: trainer._id });
    return NextResponse.json({ occupiedDays: profile?.occupiedDays || [] }, { status: 200 });
  } catch (error) {
    console.error("GET Calendar Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, occupiedDays } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const trainer = await Trainer.findOne({ email });
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const profile = await TrainerProfile.findOneAndUpdate(
      { userId: trainer._id },
      { $set: { occupiedDays: occupiedDays || [] } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, occupiedDays: profile.occupiedDays }, { status: 200 });
  } catch (error) {
    console.error("POST Calendar Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
