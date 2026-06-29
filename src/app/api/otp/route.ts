import { NextRequest, NextResponse } from "next/server";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// In-memory OTP store (for production, use Redis or DB)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    const otp = generateOTP();

    // Store OTP with 10 min expiry
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(email, otp, name);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// Verify OTP endpoint
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // OTP verified, clean up
    otpStore.delete(email);

    return NextResponse.json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
