import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";
import { TrainerProfile } from "@/models/TrainerProfile";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch all trainers who have completed their profile
    const trainers = await Trainer.find({ profileComplete: true }).lean();
    
    const trainerIds = trainers.map(t => t._id);
    
    // Fetch their profiles
    const profiles = await TrainerProfile.find({ userId: { $in: trainerIds } }).lean();
    
    // Merge data
    const results = trainers.map(trainer => {
      const profile = profiles.find(p => p.userId.toString() === trainer._id.toString());
      return {
        _id: trainer._id,
        fullName: trainer.fullName,
        email: trainer.email,
        phone: profile?.phone || trainer.phone,
        isVerified: trainer.isVerified,
        skills: profile?.skills || [],
        languages: profile?.languages || [],
        experience: profile?.experiences ? profile.experiences.length : 0, // Using array length or we can calculate years
        experiences: profile?.experiences || [],
        state: profile?.state || "",
        city: profile?.city || "",
        mtech: profile?.mtech?.college ? true : false,
        profile: profile // Full profile for the modal
      };
    });

    return NextResponse.json({ trainers: results }, { status: 200 });
  } catch (error) {
    console.error("Fetch all trainers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
