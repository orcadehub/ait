import { NextRequest, NextResponse } from "next/server";
import { Requirement } from "@/models/Requirement";
import connectToDatabase from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const requirements = await Requirement.aggregate([
      { $match: { status: "Active" } },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorEmail",
          foreignField: "email",
          as: "vendorDetails"
        }
      },
      { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          companyName: "$vendorDetails.companyName",
          vendorAbout: "$vendorDetails.about",
          vendorWebsite: "$vendorDetails.websiteUrl",
          vendorPhone: "$vendorDetails.phone",
          vendorLocation: "$vendorDetails.location",
          vendorRegistrationStatus: "$vendorDetails.registrationStatus",
          vendorIndustry: "$vendorDetails.industry",
          vendorState: "$vendorDetails.state",
          vendorCity: "$vendorDetails.city",
          vendorWhatsapp: "$vendorDetails.whatsapp",
          vendorEmail: "$vendorDetails.email",
          vendorAltEmail: "$vendorDetails.altEmail"
        }
      },
      { $project: { vendorDetails: 0 } },
      { $sort: { createdAt: -1 } }
    ]);
    return NextResponse.json({ requirements }, { status: 200 });
  } catch (error) {
    console.error("GET Requirements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
