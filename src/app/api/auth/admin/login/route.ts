import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    if (email === "orcadehub2@gmail.com" && password === "Azzuzie@143") {
      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            name: "Administrator",
            email: "orcadehub2@gmail.com",
            type: "admin",
            onboardingComplete: true,
            profileComplete: true,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
