import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Requirement } from "@/models/Requirement";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const requirement = await Requirement.findById(id).lean();

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json({ requirement }, { status: 200 });
  } catch (error) {
    console.error("Fetch single requirement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Requirement.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Requirement deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete requirement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await req.json();

    await connectToDatabase();

    const updated = await Requirement.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Requirement updated", requirement: updated }, { status: 200 });
  } catch (error) {
    console.error("Update requirement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
