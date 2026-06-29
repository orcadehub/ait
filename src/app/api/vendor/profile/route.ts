import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Vendor } from "@/models/Vendor";

// GET Vendor Profile
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const vendor = await Vendor.findOne({ email }).lean();
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Auto-correct stale profileComplete status
    const requiredFields = [
      "companyName", "about", "registrationStatus", "industry", 
      "websiteUrl", "state", "city", "phone", "whatsapp", "altEmail"
    ];
    const isActuallyComplete = requiredFields.every(field => !!(vendor as any)[field]);
    
    if (vendor.profileComplete !== isActuallyComplete) {
      await Vendor.updateOne({ email }, { $set: { profileComplete: isActuallyComplete } });
      vendor.profileComplete = isActuallyComplete;
    }

    // Omit sensitive data like passwordHash
    const { passwordHash, ...safeProfile } = vendor as any;

    return NextResponse.json({ profile: safeProfile }, { status: 200 });
  } catch (error) {
    console.error("Fetch vendor profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST/Update Vendor Profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, ...updateFields } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Ensure we are only updating allowed fields
    const allowedFields = [
      "companyName", "about", "registrationStatus", "industry", 
      "websiteUrl", "state", "city", "location", "profileComplete",
      "phone", "whatsapp", "altEmail"
    ];
    
    const sanitizedUpdate: any = {};
    for (const key of Object.keys(updateFields)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdate[key] = updateFields[key];
      }
    }

    // Auto calculate if profile is complete (server-side safety net)
    const requiredFields = [
      "companyName", "about", "registrationStatus", "industry", 
      "websiteUrl", "state", "city", "phone", "whatsapp", "altEmail"
    ];
    const isComplete = requiredFields.every(field => !!sanitizedUpdate[field] || !!updateFields[field]);
    
    if (updateFields.profileComplete !== undefined) {
       sanitizedUpdate.profileComplete = updateFields.profileComplete;
    } else {
       sanitizedUpdate.profileComplete = isComplete;
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { email },
      { $set: sanitizedUpdate },
      { new: true }
    ).lean();

    if (!updatedVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { passwordHash, ...safeProfile } = updatedVendor as any;

    return NextResponse.json(
      { message: "Profile updated successfully", profile: safeProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update vendor profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
