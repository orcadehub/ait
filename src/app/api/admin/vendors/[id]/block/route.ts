import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Vendor } from "@/models/Vendor";

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    await connectToDatabase();
    const resolvedParams = await context.params;
    const vendorId = resolvedParams.id;
    const { isBlocked } = await req.json();

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isBlocked },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Vendor successfully ${isBlocked ? "blocked" : "unblocked"}`,
      vendor,
    });
  } catch (error: any) {
    console.error("Block vendor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
