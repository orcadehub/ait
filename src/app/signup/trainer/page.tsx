"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Mail, Phone, ShieldCheck, ScrollText } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { OTPInput } from "@/components/otp-input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function TrainerSignup() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        setStep(2);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        // Sign up success - Log them in
        login({
          name: fullName,
          email,
          type: "trainer",
          onboardingComplete: false
        });
        router.push("/dashboard/trainer");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border border-orange-100 rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-400 via-white to-orange-400" />
        <CardHeader className="space-y-1 pb-6 pt-8">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            {step === 1 ? <GraduationCap className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
          </div>
          <CardTitle className="text-2xl font-black text-slate-900">
            {step === 1 ? "Trainer Signup" : "Verify Email"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1
              ? "Join India's largest network of professional trainers."
              : `Enter the 6-digit OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="h-11"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-9 h-11"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-9 h-11"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsTermsOpen(true)}>
                <Checkbox id="terms" checked={termsAccepted} className="pointer-events-none" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-800">
                    I accept the <span className="text-blue-600 font-bold hover:underline">Terms & Conditions</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Click here to read and accept the trainer agreement.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-200 cursor-pointer" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login/trainer" className="text-orange-600 font-semibold hover:underline">
                  Login here
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-6 mb-4">
              <div className="space-y-3">
                <Label className="text-center block text-base">Enter OTP</Label>
                <OTPInput onComplete={(otp) => setOtpValue(otp)} />
              </div>
              {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pb-8">
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base rounded-xl shadow-lg shadow-green-200 cursor-pointer" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => { setStep(1); setError(""); setOtpValue(""); }} className="w-full text-slate-500 cursor-pointer">
                Back to Edit
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-orange-600" />
              Trainer Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Please read these terms carefully before registering as a Trainer on All India Trainings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-600 my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner h-64 overflow-y-auto">
            <h4 className="font-bold text-slate-900 text-base">1. Professional Conduct</h4>
            <p>By registering as a Trainer, you agree to uphold the highest standards of professional conduct, delivering quality training services to the vendors and institutions you connect with through our platform.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">2. Accuracy of Information</h4>
            <p>You confirm that all information provided in your profile, including certifications, experience, and skills, is accurate and up to date. Misrepresentation of qualifications will result in immediate account suspension.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">3. Availability & Scheduling</h4>
            <p>You agree to accurately maintain your calendar availability. If you commit to a training requirement, you are expected to fulfill the obligation unless extenuating circumstances arise, which must be communicated promptly to the vendor.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">4. Direct Engagements</h4>
            <p>While All India Trainings facilitates connections between trainers and vendors, any formal contracts, payments, or negotiations are handled directly between you and the vendor. We do not act as an employer or mediator in financial disputes.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">5. Code of Ethics</h4>
            <p>You agree to foster inclusive, respectful, and safe learning environments. Any reports of discrimination, harassment, or unethical behavior during training sessions may result in a permanent ban from the platform.</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <DialogClose className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-12 px-4 py-2 w-full sm:w-auto rounded-md flex items-center justify-center cursor-pointer font-medium text-sm">Decline</DialogClose>
            <Button 
              className="w-full sm:w-auto h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 shadow-md"
              onClick={() => {
                setTermsAccepted(true);
                setIsTermsOpen(false);
                setError("");
              }}
            >
              I Accept the Terms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
