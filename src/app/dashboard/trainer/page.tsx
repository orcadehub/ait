"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Building, MapPin, CheckCircle2, GraduationCap, X, PlusCircle, User, Briefcase, Mail, Phone, School, Star, Rocket, Loader2 } from "lucide-react";
import { RouteGuard, useAuth } from "@/context/auth-context";
import { State, City } from "country-state-city";
import { toast } from "react-hot-toast";

interface College { name: string; place: string; start: string; end: string; }
interface Experience { company: string; role: string; description: string; startDate: string; endDate: string; isCurrent: boolean; }
interface Education { college: string; place: string; branch: string; cgpa: string; year: string; }

export default function TrainerDashboard() {
  const { user, updateProfileStatus } = useAuth();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for Profile Sections
  const [roleTitle, setRoleTitle] = useState("");
  const [summary, setSummary] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [altEmail, setAltEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [careerStart, setCareerStart] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [gender, setGender] = useState("");

  const indianStates = State.getStatesOfCountry("IN");
  const selectedStateObj = indianStates.find(s => s.name === state);
  const cities = selectedStateObj ? City.getCitiesOfState("IN", selectedStateObj.isoCode) : [];

  const [btech, setBtech] = useState<Education>({ college: "", place: "", branch: "", cgpa: "", year: "" });
  const [mtech, setMtech] = useState<Education>({ college: "", place: "", branch: "", cgpa: "", year: "" });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const [colleges, setColleges] = useState<College[]>([]);
  const [newCollege, setNewCollege] = useState<College>({ name: "", place: "", start: "", end: "" });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [languages, setLanguages] = useState<string[]>([]);
  const INDIAN_LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi", "Odia", "Urdu", "Assamese"];

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExp, setNewExp] = useState<Experience>({ company: "", role: "", description: "", startDate: "", endDate: "", isCurrent: false });

  // Progress Calculation
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let completed = 0;
    const criteria = [
      roleTitle, summary, firstName, middleName, phone, whatsapp, email, altEmail, 
      state, city, dob, careerStart, maritalStatus, gender, 
      (btech.college && btech.place && btech.branch && btech.cgpa && btech.year) ? "true" : "",
      colleges.length >= 3 ? "true" : "",
      skills.length >= 5 ? "true" : "",
      languages.length > 0 ? "true" : "",
      experiences.length > 0 ? "true" : ""
    ];

    criteria.forEach(item => {
      if (item && item.trim() !== "") completed++;
    });

    const percent = Math.round((completed / criteria.length) * 100);
    setProgress(percent);
  }, [roleTitle, summary, firstName, middleName, phone, whatsapp, email, altEmail, state, city, dob, careerStart, maritalStatus, gender, btech, colleges, skills, languages, experiences]);

  const isSummaryComplete = !!(roleTitle && summary);
  const isPersonalComplete = !!(firstName && middleName && phone && whatsapp && email && altEmail && state && city && dob && careerStart && maritalStatus && gender && languages.length > 0);
  const isEducationComplete = !!(btech.college && btech.place && btech.branch && btech.cgpa && btech.year);
  const isCollegesComplete = colleges.length >= 3;
  const isSkillsComplete = skills.length >= 5;
  const isExperienceComplete = experiences.length >= 1;

  // Fetch Profile on Load
  const formatToYYYYMMDD = (dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[2].length === 4) {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }
    
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return "";
  };

  useEffect(() => {
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/trainer/profile?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setRoleTitle(p.roleTitle || "");
            setSummary(p.summary || "");
            setFirstName(p.firstName || "");
            setMiddleName(p.middleName || "");
            setLastName(p.lastName || "");
            setPhone(p.phone || "");
            setWhatsapp(p.whatsapp || "");
            setEmail(p.email || "");
            setAltEmail(p.altEmail || "");
            setCountry(p.country || "India");
            setState(p.state || "");
            setCity(p.city || "");
            setDob(formatToYYYYMMDD(p.dob || ""));
            setCareerStart(formatToYYYYMMDD(p.careerStart || ""));
            setMaritalStatus(p.maritalStatus || "");
            setGender(p.gender || "");
            if (p.btech) setBtech(p.btech);
            if (p.mtech) setMtech(p.mtech);
            if (p.colleges) setColleges(p.colleges);
            if (p.skills) setSkills(p.skills);
            if (p.languages) setLanguages(p.languages);
            if (p.experiences) setExperiences(p.experiences);
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Save Profile
  const handleSaveAll = async () => {
    if (!user?.email) return;
    setIsSaving(true);
    
    const profileData = {
      email: user.email,
      roleTitle, summary, firstName, middleName, lastName, 
      phone, whatsapp, altEmail, country, state, city, 
      dob, careerStart, maritalStatus, gender,
      btech, mtech, colleges, skills, languages, experiences,
      completionPercentage: progress
    };

    try {
      const res = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        toast.success("Profile saved successfully!");
        if (progress === 100) {
          updateProfileStatus(true);
        } else {
          updateProfileStatus(false);
        }
      } else {
        toast.error("Failed to save profile.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };


  // Handlers
  const addCollege = () => {
    if (colleges.length >= 7) return toast.error("Maximum 7 colleges allowed.");
    if (newCollege.name && newCollege.place) {
      setColleges([...colleges, newCollege]);
      setNewCollege({ name: "", place: "", start: "", end: "" });
    } else {
      toast.error("Please provide at least College Name and Place.");
    }
  };

  const removeCollege = (index: number) => setColleges(colleges.filter((_, i) => i !== index));

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const s = skillInput.trim().toUpperCase();
      if (s && !skills.includes(s)) {
        setSkills([...skills, s]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));

  const addLanguage = (lang: string) => {
    if (!languages.includes(lang)) setLanguages([...languages, lang]);
  };
  const removeLanguage = (lang: string) => setLanguages(languages.filter(l => l !== lang));

  const addExperience = () => {
    if (experiences.length >= 10) return toast.error("Maximum 10 experiences allowed.");
    if (newExp.company && newExp.role && newExp.startDate) {
      setExperiences([...experiences, newExp]);
      setNewExp({ company: "", role: "", description: "", startDate: "", endDate: "", isCurrent: false });
    } else {
      toast.error("Please fill Company, Role, and Start Date.");
    }
  };

  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));

  // Calculate Experience from Career Start
  const calculateExperience = (startDateStr: string) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    const now = new Date();
    if (isNaN(start.getTime())) return null;
    if (start > now) return "0 y and 0 m";

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (now.getDate() < start.getDate()) {
      months--;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} y and ${months} m`;
  };

  if (isLoadingProfile) {
    return (
      <RouteGuard requireAuth requireOnboarding>
        <div className="min-h-[calc(100vh-5.5rem)] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading your profile...</p>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth requireOnboarding>
      <div className="min-h-[calc(100vh-5.5rem)] bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 p-4 md:p-8">
        <div className="w-full max-w-screen-xl mx-auto space-y-6 md:px-8 lg:px-16 xl:px-24">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Rocket className="w-8 h-8 text-orange-500" /> Trainer Profile
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Welcome back, {firstName || user?.name || "Trainer"}! Let&apos;s build your professional presence.</p>
            </div>
            
            <div className="w-full md:w-64 text-right">
              <div className="flex justify-between items-center mb-1 text-sm font-bold text-slate-700">
                <span>Profile Completion</span>
                <span className={progress === 100 ? "text-green-600" : "text-orange-600"}>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-slate-100" />
              {progress === 100 && (
                <p className="text-xs text-green-600 mt-2 font-medium">Profile 100% Complete!</p>
              )}
            </div>
          </div>

          <Accordion defaultValue={["summary"]} className="w-full space-y-4">
            
            {/* SECTION: Professional Summary */}
            <AccordionItem value="summary" className="bg-white border-orange-100 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-orange-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Professional Summary</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Give a brief overview of your professional role and summary.</p>
                    </div>
                  </div>
                  {isSummaryComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 space-y-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label className="font-bold text-slate-700">Title of your role <span className="text-red-500">*</span></Label>
                      <span className={`text-xs font-medium ${roleTitle.length >= 50 ? 'text-red-500' : 'text-slate-400'}`}>{roleTitle.length}/50</span>
                    </div>
                    <Input maxLength={50} placeholder="e.g. Senior Technical Corporate Trainer" value={roleTitle} onChange={e=>setRoleTitle(e.target.value)} className="bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label className="font-bold text-slate-700">Professional Summary <span className="text-red-500">*</span></Label>
                      <span className={`text-xs font-medium ${summary.length >= 1000 ? 'text-red-500' : 'text-slate-400'}`}>{summary.length}/1000</span>
                    </div>
                    <Textarea maxLength={1000} placeholder="Briefly describe your expertise, years of experience, and training philosophy..." value={summary} onChange={e=>setSummary(e.target.value)} className="min-h-[100px] bg-slate-50 focus:bg-white resize-none" />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-orange-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100 font-bold">
                    {isSaving ? "Saving..." : "Save Summary"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION: Personal Details */}
            <AccordionItem value="personal" className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-blue-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Personal Details</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Your contact information and demographic details.</p>
                    </div>
                  </div>
                  {isPersonalComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
                  <div className="space-y-2"><Label className="font-bold">First Name <span className="text-red-500">*</span></Label><Input value={firstName} onChange={e=>setFirstName(e.target.value)} /></div>
                  <div className="space-y-2"><Label className="font-bold">Middle Name <span className="text-red-500">*</span></Label><Input value={middleName} onChange={e=>setMiddleName(e.target.value)} /></div>
                  <div className="space-y-2"><Label className="font-bold">Last Name</Label><Input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="(Optional)" /></div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Phone className="w-3 h-3"/> Call Number <span className="text-red-500">*</span></Label>
                    <Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-green-600 flex items-center gap-1">WhatsApp Number <span className="text-red-500">*</span></Label>
                    <Input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+91" className="border-green-200 focus:ring-green-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Mail className="w-3 h-3"/> Email ID <span className="text-red-500">*</span></Label>
                    <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Mail className="w-3 h-3"/> Alt Email ID <span className="text-red-500">*</span></Label>
                    <Input type="email" value={altEmail} onChange={e=>setAltEmail(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Country <span className="text-red-500">*</span></Label>
                    <Input value={country} disabled className="bg-slate-100 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">State <span className="text-red-500">*</span></Label>
                    <Select value={state} onValueChange={(val) => { setState(val || ""); setCity(""); }}>
                      <SelectTrigger className="bg-slate-50 hover:bg-slate-100 transition-colors"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {indianStates.map(s => <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">City <span className="text-red-500">*</span></Label>
                    <Select value={city} onValueChange={(val) => setCity(val || "")} disabled={!state}>
                      <SelectTrigger className="bg-slate-50 hover:bg-slate-100 transition-colors"><SelectValue placeholder={state ? "Select City" : "Select State First"} /></SelectTrigger>
                      <SelectContent>
                        {cities.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Date of Birth (As per PAN) <span className="text-red-500">*</span></Label>
                    <Input type="date" value={dob} onChange={e=>setDob(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex justify-between items-center">
                      <span>Career Started as Trainer <span className="text-red-500">*</span></span>
                      {careerStart && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-bold shadow-sm border border-orange-200">
                          {calculateExperience(careerStart)}
                        </span>
                      )}
                    </Label>
                    <Input type="date" value={careerStart} onChange={e=>setCareerStart(e.target.value)} className="bg-slate-50 hover:bg-slate-100 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Marital Status <span className="text-red-500">*</span></Label>
                    <Select value={maritalStatus} onValueChange={(val) => setMaritalStatus(val || "")}>
                      <SelectTrigger className="bg-slate-50 hover:bg-slate-100 transition-colors"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Gender <span className="text-red-500">*</span></Label>
                    <Select value={gender} onValueChange={(val) => setGender(val || "")}>
                      <SelectTrigger className="bg-slate-50 hover:bg-slate-100 transition-colors"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <Label className="font-bold">Languages Known <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col gap-2">
                      <Select onValueChange={(val: any) => { if (val) addLanguage(val); }}>
                        <SelectTrigger className="bg-slate-50 w-full md:w-1/3"><SelectValue placeholder="Select Languages" /></SelectTrigger>
                        <SelectContent>
                          {INDIAN_LANGUAGES.filter(l => !languages.includes(l)).map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {languages.map(lang => (
                          <Badge key={lang} variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            {lang} <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => removeLanguage(lang)} />
                          </Badge>
                        ))}
                        {languages.length === 0 && <span className="text-sm text-slate-400">No languages selected</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100 font-bold">
                    {isSaving ? "Saving..." : "Save Personal Details"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION: Education Background */}
            <AccordionItem value="education" className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-indigo-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Educational Background</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Your degree and university details.</p>
                    </div>
                  </div>
                  {isEducationComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 pb-6 space-y-8">
                  
                  {/* B.Tech Section */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-base border-b pb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full inline-block"></span> B.Tech Details <span className="text-red-500">*</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>College Name</Label>
                        <Input value={btech.college} onChange={e=>setBtech({...btech, college: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Place</Label>
                        <Input value={btech.place} onChange={e=>setBtech({...btech, place: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch</Label>
                        <Input value={btech.branch} onChange={e=>setBtech({...btech, branch: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA / Percentage</Label>
                        <Input value={btech.cgpa} onChange={e=>setBtech({...btech, cgpa: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Pass</Label>
                        <Select value={btech.year} onValueChange={(val) => setBtech({...btech, year: val || ""})}>
                          <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select Year" /></SelectTrigger>
                          <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* M.Tech Section */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-base border-b pb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-300 rounded-full inline-block"></span> M.Tech Details <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>College Name</Label>
                        <Input value={mtech.college} onChange={e=>setMtech({...mtech, college: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Place</Label>
                        <Input value={mtech.place} onChange={e=>setMtech({...mtech, place: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch</Label>
                        <Input value={mtech.branch} onChange={e=>setMtech({...mtech, branch: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA / Percentage</Label>
                        <Input value={mtech.cgpa} onChange={e=>setMtech({...mtech, cgpa: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Pass</Label>
                        <Select value={mtech.year} onValueChange={(val) => setMtech({...mtech, year: val || ""})}>
                          <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select Year" /></SelectTrigger>
                          <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold">
                    {isSaving ? "Saving..." : "Save Education Details"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION: Recent Colleges Handled */}
            <AccordionItem value="colleges" className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-purple-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <School className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Recent Colleges Handled
                        <Badge variant="outline" className="ml-2 font-bold bg-white">{colleges.length}/7 Added</Badge>
                      </h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">List up to 7 colleges where you have delivered training.</p>
                    </div>
                  </div>
                  {isCollegesComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 space-y-6 pb-4">
                  {colleges.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colleges.map((col, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-start group">
                          <div>
                            <p className="font-bold text-slate-800">{col.name}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {col.place}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{col.start} to {col.end}</p>
                          </div>
                          <button type="button" onClick={() => removeCollege(idx)} className="text-slate-400 hover:text-red-500 p-1 bg-white rounded-md border shadow-sm transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {colleges.length < 7 && (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-4">
                      <p className="text-sm font-bold text-slate-700">Add New College</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input placeholder="College Name" value={newCollege.name} onChange={e=>setNewCollege({...newCollege, name: e.target.value})} />
                        <Input placeholder="Place" value={newCollege.place} onChange={e=>setNewCollege({...newCollege, place: e.target.value})} />
                        <Input type="date" placeholder="Start Date" value={newCollege.start} onChange={e=>setNewCollege({...newCollege, start: e.target.value})} />
                        <Input type="date" placeholder="End Date" value={newCollege.end} onChange={e=>setNewCollege({...newCollege, end: e.target.value})} />
                      </div>
                      <Button type="button" onClick={addCollege} className="font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200">
                        Add
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100 font-bold">
                    {isSaving ? "Saving..." : "Save Colleges"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION: Skills */}
            <AccordionItem value="skills" className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-yellow-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Technical Skills</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Type a skill and press Enter.</p>
                    </div>
                  </div>
                  {isSkillsComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2 min-h-12 p-3 border rounded-xl bg-slate-50">
                    {skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1 text-sm flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeSkill(skill); }} className="focus:outline-none ml-1">
                          <X className="w-3 h-3 cursor-pointer hover:text-red-400" />
                        </button>
                      </Badge>
                    ))}
                    <input 
                      type="text" 
                      placeholder="e.g. REACTJS, ENTER to add..." 
                      className="flex-1 bg-transparent outline-none min-w-[200px] text-sm uppercase font-bold text-slate-700"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                    />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-100 font-bold">
                    {isSaving ? "Saving..." : "Save Skills"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION: Experience */}
            <AccordionItem value="experience" className="bg-white border-slate-200 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-emerald-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <Building className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Experience Section</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Add your past corporate or training experience.</p>
                    </div>
                  </div>
                  {isExperienceComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 space-y-6 pb-4">
                  {experiences.length > 0 && (
                    <div className="space-y-4">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-start group">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800">{exp.role} <span className="font-normal text-slate-500">at</span> {exp.company}</h4>
                            <p className="text-sm font-bold text-emerald-600 mt-1">
                              {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                            </p>
                            {exp.description && <p className="text-sm text-slate-600 mt-3 bg-white p-3 rounded-lg border">{exp.description}</p>}
                          </div>
                          <button type="button" onClick={() => removeExperience(idx)} className="text-slate-400 hover:text-red-500 p-2 bg-white rounded-md border shadow-sm transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {experiences.length < 10 && (
                    <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-4">
                      <p className="text-sm font-bold text-slate-700">Add Experience</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Company Name</Label><Input value={newExp.company} onChange={e=>setNewExp({...newExp, company: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Role</Label><Input value={newExp.role} onChange={e=>setNewExp({...newExp, role: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={newExp.startDate} onChange={e=>setNewExp({...newExp, startDate: e.target.value})} /></div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <div className="flex gap-2 items-center">
                            <Input type="date" value={newExp.endDate} disabled={newExp.isCurrent} onChange={e=>setNewExp({...newExp, endDate: e.target.value})} className={newExp.isCurrent ? "opacity-50" : ""} />
                            <Button type="button" variant={newExp.isCurrent ? "default" : "outline"} onClick={() => setNewExp({...newExp, isCurrent: !newExp.isCurrent, endDate: ""})} className={`whitespace-nowrap ${newExp.isCurrent ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                              {newExp.isCurrent ? <CheckCircle2 className="w-4 h-4 mr-1"/> : null} Currently Working
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={newExp.description} onChange={e=>setNewExp({...newExp, description: e.target.value})} className="resize-none" />
                      </div>
                      <Button type="button" onClick={addExperience} className="font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200">
                        Add
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold">
                    {isSaving ? "Saving..." : "Save Experience"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          {/* Global Save Button at the very bottom */}
          <div className="flex justify-end pt-4 pb-12">
            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg px-8 text-lg h-12 rounded-xl">
              {isSaving ? "Saving to Database..." : "Save All Changes"}
            </Button>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
