"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, RouteGuard } from "@/context/auth-context";

export default function VendorOnboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      completeOnboarding();
      router.push("/dashboard/vendor");
    }, 1500);
  };

  return (
    <RouteGuard requireAuth>
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 py-12">
        <Card className="w-full max-w-xl shadow-2xl border border-green-100 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-green-500 via-white to-green-500" />
          
          <CardHeader className="space-y-1 pb-6 pt-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Company Profile</CardTitle>
            <CardDescription className="text-base">
              Complete your company profile before you can start posting requirements.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleComplete}>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="baseLocation">Base Location (HQ)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="baseLocation" placeholder="e.g. Hyderabad" className="pl-9 h-11" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="industry" placeholder="e.g. IT Services" className="pl-9 h-11" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" type="url" placeholder="https://..." className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <Textarea 
                  id="about" 
                  placeholder="Tell trainers a bit about your company and what you do..." 
                  className="min-h-[120px] resize-none" 
                  required 
                />
              </div>

            </CardContent>
            
            <CardFooter className="pb-8 pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base rounded-xl shadow-lg shadow-green-200 cursor-pointer" 
                disabled={isLoading}
              >
                {isLoading ? "Saving Profile..." : "Complete Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RouteGuard>
  );
}
