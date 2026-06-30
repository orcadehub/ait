import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const trainers = await Trainer.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ trainers });
  } catch (error: any) {
    console.error("Fetch trainers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
