import { NextRequest, NextResponse } from "next/server";
import { Requirement } from "@/models/Requirement";
import connectToDatabase from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { trainerId } = await req.json();

    if (!trainerId) {
      return NextResponse.json({ error: "Trainer ID is required" }, { status: 400 });
    }

    const requirement = await Requirement.findById(id);
    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    // Add trainer to interested list if not already present
    if (!requirement.interestedTrainers.includes(trainerId)) {
      requirement.interestedTrainers.push(trainerId);
      await requirement.save();
    }

    return NextResponse.json({ 
      message: "Interest sent successfully", 
      interestedTrainers: requirement.interestedTrainers 
    }, { status: 200 });
  } catch (error) {
    console.error("POST Interest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
