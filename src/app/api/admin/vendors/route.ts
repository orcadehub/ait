import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Vendor } from "@/models/Vendor";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
