import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Trainer } from "@/models/Trainer";
import { Vendor } from "@/models/Vendor";
import { Requirement } from "@/models/Requirement";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const [totalTrainers, totalVendors, totalRequirements] = await Promise.all([
      Trainer.countDocuments(),
      Vendor.countDocuments(),
      Requirement.countDocuments(),
    ]);

    return NextResponse.json({
      totalTrainers,
      totalVendors,
      totalRequirements,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
