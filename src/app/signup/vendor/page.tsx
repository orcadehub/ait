"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Mail, ShieldCheck, ScrollText } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { OTPInput } from "@/components/otp-input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-hot-toast";

export default function VendorSignup() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, name: companyName }),
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

  const handleVerifyOTPAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Verify OTP first
      const verifyRes = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "Verification failed");
        setIsLoading(false);
        return;
      }

      // 2. If OTP is verified, create the account
      const signupRes = await fetch("/api/auth/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, email, password }),
      });
      
      const signupData = await signupRes.json();
      
      if (!signupRes.ok) {
        setError(signupData.error || "Signup failed");
        setIsLoading(false);
        return;
      }
      
      toast.success("Successfully registered and verified!");
      login(signupData.user);
      router.push("/dashboard/vendor");
    } catch (error) {
      setError("An error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border border-green-100 rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-white to-green-500" />
        <CardHeader className="space-y-1 pb-6 pt-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            {step === 1 ? <Building2 className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
          </div>
          <CardTitle className="text-2xl font-black text-slate-900">
            {step === 1 ? "Vendor Signup" : "Verify Email"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1
              ? "Create an account to start posting your training requirements."
              : `Enter the 6-digit OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Acme Corp" className="h-11" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="hr@acmecorp.com" className="pl-9 h-11" required value={email} onChange={e => setEmail(e.target.value)} />
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
                    Click here to read and accept the vendor agreement.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base rounded-xl shadow-lg shadow-green-200 cursor-pointer" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Continue"}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login/vendor" className="text-green-600 font-semibold hover:underline">
                  Login here
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTPAndSignup}>
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
                {isLoading ? "Verifying..." : "Verify & Create Account"}
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
              <ScrollText className="w-6 h-6 text-green-600" />
              Vendor Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Please read these terms carefully before registering your company on All India Trainings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-600 my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner h-64 overflow-y-auto">
            <h4 className="font-bold text-slate-900 text-base">1. Service Agreement</h4>
            <p>By registering as a Vendor on All India Trainings, you agree to comply with all local and national labor and contracting laws. You confirm that you have the authority to bind your company to these terms.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">2. Requirement Postings</h4>
            <p>All training requirements posted must be accurate, transparent, and non-discriminatory. We reserve the right to remove any postings that violate our community standards or appear fraudulent.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">3. Trainer Engagement</h4>
            <p>You agree to engage with Trainers professionally. Any contracts, payments, or agreements made between your company and a Trainer are strictly between the two parties. All India Trainings acts solely as a discovery platform and assumes no liability for disputes.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">4. Data Privacy</h4>
            <p>You agree not to misuse, sell, or distribute Trainer profiles or contact information obtained through this platform for any purpose other than the specific training requirements posted.</p>
            
            <h4 className="font-bold text-slate-900 text-base mt-4">5. Account Termination</h4>
            <p>We reserve the right to suspend or terminate vendor accounts without notice if suspicious activity, spamming, or abuse of the platform is detected.</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <DialogClose className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-12 px-4 py-2 w-full sm:w-auto rounded-md flex items-center justify-center cursor-pointer font-medium text-sm">Decline</DialogClose>
            <Button 
              className="w-full sm:w-auto h-12 bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-md"
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
