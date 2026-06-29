"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Briefcase, FileText, Upload, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, RouteGuard } from "@/context/auth-context";
import { Progress } from "@/components/ui/progress";

const skillsList = ["React", "Node.js", "Python", "AWS", "Docker", "Java", "Angular", "Cybersecurity", "Data Science"];

export default function TrainerOnboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      completeOnboarding();
      router.push("/dashboard/trainer");
    }, 1500);
  };

  return (
    <RouteGuard requireAuth>
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 py-12">
        <Card className="w-full max-w-xl shadow-2xl border border-orange-100 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-400 via-white to-orange-400" />
          
          <CardHeader className="space-y-1 pb-4 pt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-600 mb-1">Step {step} of 3</p>
                <Progress value={(step / 3) * 100} className="w-32 h-2 bg-orange-100" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Complete Your Profile</CardTitle>
            <CardDescription className="text-base">
              You must complete your profile 100% to view training requirements.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleComplete}>
            <CardContent className="space-y-6 pt-4">
              
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-5 h-5 text-orange-500" /> Professional Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Job Title</Label>
                      <Input placeholder="e.g. Senior Frontend Developer" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input type="number" min="0" placeholder="e.g. 5" required />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn Profile URL</Label>
                      <Input type="url" placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Plus className="w-5 h-5 text-orange-500" /> Core Skills
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">Select the primary technologies you train on.</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map(skill => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 text-sm rounded-xl transition-all ${
                          selectedSkills.includes(skill)
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200"
                            : "hover:bg-orange-50 hover:border-orange-200 text-slate-600 border-slate-200"
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {selectedSkills.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Please select at least one skill.</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-orange-500" /> Resume & Certifications
                  </h3>
                  
                  <div className="border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-2xl p-8 text-center hover:bg-orange-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="font-bold text-slate-700 mb-1">Upload your updated resume</p>
                    <p className="text-xs text-slate-500">PDF, DOCX up to 5MB</p>
                  </div>
                </div>
              )}

            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-slate-100 pt-6 pb-8">
              {step > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Back
                </Button>
              ) : <div></div>}
              
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 px-8" 
                disabled={isLoading || (step === 2 && selectedSkills.length === 0)}
              >
                {isLoading ? "Saving..." : step === 3 ? "Complete Profile" : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RouteGuard>
  );
}
