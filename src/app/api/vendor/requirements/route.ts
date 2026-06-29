import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Requirement } from "@/models/Requirement";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch all requirements for the vendor
    const requirements = await Requirement.find({ vendorEmail: email }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ requirements }, { status: 200 });
  } catch (error) {
    console.error("Fetch requirements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      vendorEmail, title, startDate, durationMonths, durationDays, mode, totalTrainersNeeded,
      country, state, city, skills, workingDays, budgetType, budgetMin, budgetMax, contactNumber, contactEmail, description, status 
    } = body;

    if (!vendorEmail || !title || !startDate || durationMonths === undefined || durationDays === undefined || !mode || !totalTrainersNeeded || !country || !skills || !workingDays || !budgetType || budgetMin === undefined || budgetMax === undefined || !contactNumber || !contactEmail || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newRequirement = await Requirement.create({
      vendorEmail,
      title,
      startDate,
      durationMonths: Number(durationMonths),
      durationDays: Number(durationDays),
      mode,
      totalTrainersNeeded,
      country,
      state,
      city,
      skills,
      workingDays,
      budgetType,
      budgetMin,
      budgetMax,
      contactNumber,
      contactEmail,
      description,
      status: status || "Draft",
      shortlistedTrainers: []
    });

    return NextResponse.json(
      { message: "Requirement posted successfully", requirement: newRequirement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post requirement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
