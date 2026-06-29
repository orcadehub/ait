"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Zap, GraduationCap, MapPin, Star } from "lucide-react";
import { RouteGuard } from "@/context/auth-context";

// Mock data
const ALL_SKILLS = ["React", "Node.js", "Python", "AWS", "Docker", "Java", "Angular", "Vue", "Kubernetes", "TypeScript"];
const MOCK_TRAINERS = [
  { id: 1, name: "Arjun Reddy", location: "Hyderabad", rating: 4.9, skills: ["React", "Node.js", "TypeScript"], experience: "8 yrs", rate: "₹3000/hr" },
  { id: 2, name: "Priya Sharma", location: "Bangalore", rating: 4.8, skills: ["React", "Python", "AWS"], experience: "6 yrs", rate: "₹2500/hr" },
  { id: 3, name: "Karthik Nair", location: "Remote", rating: 4.7, skills: ["Python", "Docker", "Kubernetes"], experience: "10 yrs", rate: "₹4000/hr" },
  { id: 4, name: "Sneha Patel", location: "Mumbai", rating: 4.9, skills: ["Java", "React", "Angular"], experience: "7 yrs", rate: "₹2800/hr" },
];

export default function PostRequirementPage() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showMatches, setShowMatches] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const calculateMatchPercentage = (trainerSkills: string[]) => {
    if (selectedSkills.length === 0) return 0;
    const matchCount = selectedSkills.filter(s => trainerSkills.includes(s)).length;
    return Math.round((matchCount / selectedSkills.length) * 100);
  };

  const matchedTrainers = MOCK_TRAINERS
    .map(trainer => ({
      ...trainer,
      matchPercentage: calculateMatchPercentage(trainer.skills)
    }))
    .filter(trainer => trainer.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <RouteGuard requireAuth requireProfileComplete>
      <div className="min-h-[calc(100vh-5.5rem)] bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-heading">Post a Requirement</h1>
              <p className="text-slate-500 mt-1">Manage your training requirements and find expert trainers instantly.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Post Requirement Form */}
            <div className="lg:col-span-5">
              <Card className="border-green-100 shadow-xl bg-white sticky top-24">
                <div className="h-1.5 bg-gradient-to-r from-green-500 via-white to-green-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-green-600" /> Post a Requirement
                  </CardTitle>
                  <CardDescription>Fill in the details to find the perfect trainer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Training Title</Label>
                    <Input placeholder="e.g. Advanced React.js Workshop" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (Days)</Label>
                      <Input type="number" placeholder="5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mode</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline / On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      Required Skills
                      <span className="text-xs text-slate-400 font-normal">{selectedSkills.length} selected</span>
                    </Label>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {ALL_SKILLS.map(skill => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedSkills.includes(skill) 
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800" 
                              : "bg-white hover:bg-slate-100"
                          }`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Details</Label>
                    <Textarea placeholder="Any specific requirements or expectations..." className="resize-none h-20" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                    onClick={() => setShowMatches(true)}
                  >
                    Post & Find Trainers
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Instant Matches Section */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-green-100 rounded-xl shadow-sm p-6 min-h-[600px]">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" /> Instant Profile Matches
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSkills.length === 0 
                        ? "Select skills on the left to see instant matches." 
                        : `Found ${matchedTrainers.length} trainers matching your requirements.`}
                    </p>
                  </div>
                </div>

                {selectedSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Search className="w-12 h-12 mb-3 text-slate-300" />
                    <p>Select required skills to see matching trainers magically appear here.</p>
                  </div>
                ) : matchedTrainers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <p>No trainers match exactly these skills yet.</p>
                    <Button variant="link" className="text-green-600 mt-2" onClick={() => setSelectedSkills([])}>Clear filters</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedTrainers.map(trainer => (
                      <div key={trainer.id} className="border border-slate-200 hover:border-green-300 rounded-xl p-5 transition-all bg-white hover:shadow-md flex flex-col sm:flex-row gap-5 items-start">
                        
                        <div className="flex-shrink-0 relative">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">
                            {trainer.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {trainer.matchPercentage}%
                          </div>
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-slate-900">{trainer.name}</h3>
                            <div className="flex items-center text-amber-500 font-medium text-sm bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star className="w-3.5 h-3.5 fill-current mr-1" /> {trainer.rating}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 mb-3">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {trainer.location}</span>
                            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {trainer.experience}</span>
                            <span className="font-medium text-slate-900">{trainer.rate}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {trainer.skills.map(skill => (
                              <Badge 
                                key={skill} 
                                variant="secondary" 
                                className={`text-xs border-none ${selectedSkills.includes(skill) ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 border-none">View Full Profile</Button>
                            <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50">Shortlist</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
