import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Requirement } from "@/models/Requirement";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { trainerId } = body;

    if (!trainerId) {
      return NextResponse.json({ error: "Trainer ID required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const requirement = await Requirement.findById(id);
    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    const isShortlisted = requirement.shortlistedTrainers.includes(trainerId);
    
    if (isShortlisted) {
      // Remove from shortlist
      requirement.shortlistedTrainers = requirement.shortlistedTrainers.filter((id: string) => id !== trainerId);
    } else {
      // Add to shortlist
      requirement.shortlistedTrainers.push(trainerId);
    }

    await requirement.save();

    return NextResponse.json({ 
      message: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
      shortlistedTrainers: requirement.shortlistedTrainers 
    }, { status: 200 });

  } catch (error) {
    console.error("Shortlist toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
