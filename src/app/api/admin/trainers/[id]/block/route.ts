import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    await connectToDatabase();
    const resolvedParams = await context.params;
    const trainerId = resolvedParams.id;
    const { isBlocked } = await req.json();

    const trainer = await Trainer.findByIdAndUpdate(
      trainerId,
      { isBlocked },
      { new: true }
    );

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Trainer successfully ${isBlocked ? "blocked" : "unblocked"}`,
      trainer,
    });
  } catch (error: any) {
    console.error("Block trainer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
