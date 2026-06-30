import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";
import { TrainerProfile } from "@/models/TrainerProfile";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const trainers = await Trainer.find({}).sort({ createdAt: -1 }).lean();

    const trainersWithProgress = await Promise.all(
      trainers.map(async (trainer) => {
        const profile = await TrainerProfile.findOne({ userId: trainer._id }, { completionPercentage: 1 }).lean();
        return {
          ...trainer,
          completionPercentage: profile ? (profile as any).completionPercentage : 0,
        };
      })
    );

    return NextResponse.json({ trainers: trainersWithProgress });
  } catch (error: any) {
    console.error("Fetch trainers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
