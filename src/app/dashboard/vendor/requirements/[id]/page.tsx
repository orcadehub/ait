"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteGuard } from "@/context/auth-context";
import { Search, Loader2, ArrowLeft, Building2, MapPin, CheckCircle, CheckCircle2, Clock, Award, Star, Mail, Phone, ExternalLink, Download, FileText, Briefcase, ChevronRight, Filter, X, Eye, ThumbsUp, Calendar, CalendarDays, Laptop, IndianRupee, Languages, GraduationCap, Copy, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { State, City } from "country-state-city";

const INDIAN_LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi", "Odia", "Urdu", "Assamese"];
const ALL_SKILLS = ["React", "Node.js", "Python", "AWS", "Docker", "Java", "Angular", "Vue", "Kubernetes", "TypeScript", "C++", "C#", "Go", "Rust"];
const EXP_YEARS = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).concat(["30+"]);

interface Requirement {
  _id: string;
  title: string;
  startDate: string;
  durationMonths: number;
  durationDays: number;
  mode: string;
  workMode?: string;
  country: string;
  state?: string;
  city?: string;
  skills: string[];
  contactNumber: string;
  contactEmail: string;
  description: string;
  status: string;
  totalTrainersNeeded: number;
  shortlistedTrainers: string[];
  interestedTrainers: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: string;
  workingDays?: string[];
}

export default function RequirementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [req, setReq] = useState<Requirement | null>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLanguages, setFilterLanguages] = useState<string[]>([]);
  const [filterExperience, setFilterExperience] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterEducation, setFilterEducation] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [confirmTrainerId, setConfirmTrainerId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const indianStates = State.getStatesOfCountry("IN");
  const selectedStateObj = indianStates.find(s => s.name === filterState);
  const cities = selectedStateObj ? City.getCitiesOfState("IN", selectedStateObj.isoCode) : [];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, trainersRes] = await Promise.all([
        fetch(`/api/vendor/requirements/${id}`),
        fetch("/api/vendor/trainers")
      ]);

      if (reqRes.ok) {
        const rData = await reqRes.json();
        setReq(rData.requirement);
      }
      if (trainersRes.ok) {
        const tData = await trainersRes.json();
        setTrainers(tData.trainers || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const openConfirmModal = (trainerId: string) => {
    if (!req) return;
    const isAlreadyShortlisted = req.shortlistedTrainers.includes(trainerId);
    if (!isAlreadyShortlisted && req.shortlistedTrainers.length >= (req.totalTrainersNeeded || 1)) {
      toast.error(`You can only shortlist up to ${req.totalTrainersNeeded || 1} trainers.`);
      return;
    }
    setConfirmTrainerId(trainerId);
    setIsConfirmModalOpen(true);
  };

  const toggleShortlist = async (trainerId: string) => {
    if (!req) return;
    
    const isAlreadyShortlisted = req.shortlistedTrainers.includes(trainerId);
    if (!isAlreadyShortlisted && req.shortlistedTrainers.length >= (req.totalTrainersNeeded || 1)) {
      toast.error(`You can only shortlist up to ${req.totalTrainersNeeded || 1} trainers.`);
      return;
    }
    
    try {
      const res = await fetch(`/api/vendor/requirements/${id}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId })
      });
      if (res.ok) {
        const updatedReq = { ...req };
        if (isAlreadyShortlisted) {
          updatedReq.shortlistedTrainers = updatedReq.shortlistedTrainers.filter(id => id !== trainerId);
          toast.success("Trainer removed from shortlist");
        } else {
          updatedReq.shortlistedTrainers = [...updatedReq.shortlistedTrainers, trainerId];
          toast.success("Trainer added to shortlist");
        }
        setReq(updatedReq);
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update shortlist");
    }
  };

  const getSkillsMatchedData = (trainer: any) => {
    if (!req?.skills || req.skills.length === 0) return { count: 0, percentage: 0 };
    const matched = req.skills.filter((s: string) => trainer.skills?.includes(s));
    return {
      count: matched.length,
      percentage: Math.round((matched.length / req.skills.length) * 100)
    };
  };

  const sortedAndMappedTrainers = trainers
    .map(t => ({ ...t, skillsMatchData: getSkillsMatchedData(t) }))
    .sort((a, b) => b.skillsMatchData.percentage - a.skillsMatchData.percentage);

  // Filter Logic
  const filteredTrainers = sortedAndMappedTrainers.filter(trainer => {
    // 1. Search Query (Name, Email, Phone, Bio, Skills)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = trainer.fullName?.toLowerCase().includes(q);
      const matchEmail = trainer.email?.toLowerCase().includes(q);
      const matchPhone = trainer.phone?.includes(q);
      const matchSkills = trainer.skills?.some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchPhone && !matchSkills) return false;
    }

    // 2. Skills (must have ALL selected skills)
    if (filterSkills.length > 0) {
      const hasAllSkills = filterSkills.every(s => trainer.skills?.includes(s));
      if (!hasAllSkills) return false;
    }

    // 3. State & City
    if (filterState && trainer.state !== filterState) return false;
    if (filterCity && trainer.city !== filterCity) return false;

    // 4. Languages (must have at least one of the selected languages)
    if (filterLanguages.length > 0) {
      const hasLanguage = filterLanguages.some(l => trainer.languages?.includes(l));
      if (!hasLanguage) return false;
    }

    // 5. Experience
    if (filterExperience) {
      if (filterExperience === "30+") {
        if (trainer.experience < 30) return false;
      } else {
        if (trainer.experience < Number(filterExperience)) return false;
      }
    }

    // 6. Gender
    if (filterGender && trainer.profile?.gender !== filterGender) return false;

    // 7. Education
    if (filterEducation) {
      if (filterEducation === "B.Tech" && !trainer.profile?.btech?.college) return false;
      if (filterEducation === "M.Tech" && !trainer.profile?.mtech?.college) return false;
    }

    return true;
  });

  const shortlistedFiltered = filteredTrainers.filter(t => req?.shortlistedTrainers?.includes(t._id));
  const interestedFiltered = filteredTrainers.filter(t => req?.interestedTrainers?.includes(t._id) && !req?.shortlistedTrainers?.includes(t._id));


  const isTrainerAvailable = (trainer: any) => {
    if (!req?.startDate) return true;
    const occupied = trainer.profile?.occupiedDays || [];
    if (occupied.length === 0) return true;

    let current = new Date(req.startDate);
    let totalDays = (req.durationMonths || 0) * 30 + (req.durationDays || 0);
    if (totalDays === 0) totalDays = 1;
    
    const requiredDates = [];
    for(let i = 0; i < totalDays; i++) {
      const offset = current.getTimezoneOffset();
      const localDate = new Date(current.getTime() - (offset*60*1000));
      requiredDates.push(localDate.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    // If ANY required date overlaps with an occupied date, they are NOT available
    return !requiredDates.some(reqDate => occupied.some((occ: string) => occ.startsWith(reqDate)));
  };

  const availableFiltered = filteredTrainers.filter(t => 
    isTrainerAvailable(t) && 
    !req?.shortlistedTrainers?.includes(t._id) && 
    !req?.interestedTrainers?.includes(t._id)
  );

  const renderCalendarMonth = (offsetMonths: number, occupiedDays: string[]) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offsetMonths, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthName = targetDate.toLocaleString('default', { month: 'long' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full">
        <h4 className="text-center font-bold text-slate-800 mb-4">{monthName} {year}</h4>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="font-bold text-slate-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="h-8"></div>;
            const offset = date.getTimezoneOffset();
            const localDateStr = new Date(date.getTime() - (offset*60*1000)).toISOString().split('T')[0];
            
            const todayOffset = today.getTimezoneOffset();
            const localTodayStr = new Date(today.getTime() - (todayOffset*60*1000)).toISOString().split('T')[0];

            const occupiedEntry = occupiedDays.find(d => d.startsWith(localDateStr));
            const isOccupied = !!occupiedEntry;
            const isToday = localDateStr === localTodayStr;

            const colorMapping: Record<string, string> = {
              red: "bg-red-100 text-red-700 font-bold border border-red-200",
              green: "bg-green-100 text-green-700 font-bold border border-green-200",
              purple: "bg-purple-100 text-purple-700 font-bold border border-purple-200",
              pink: "bg-pink-100 text-pink-700 font-bold border border-pink-200",
            };
            const defaultOccupiedClass = "bg-rose-100 text-rose-700 font-bold border border-rose-200";
            const occupiedClass = occupiedEntry && occupiedEntry.includes(':') ? (colorMapping[occupiedEntry.split(':')[1]] || defaultOccupiedClass) : defaultOccupiedClass;

            return (
              <div 
                key={`date-${i}`} 
                className={`h-8 flex items-center justify-center rounded-md text-sm font-medium ${isOccupied ? occupiedClass : isToday ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700 cursor-default'}`}
                title={isOccupied ? "Occupied" : "Available"}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Table
  const renderTrainerTable = (data: any[], showSkillsMatch: boolean = false) => {
    if (data.length === 0) return <div className="p-8 text-center text-slate-500">No trainers found matching the criteria.</div>;
    
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-sm">
              <th className="p-4 w-[300px]">Trainer Profile</th>
              {showSkillsMatch && <th className="p-4">Skills Matched</th>}
              <th className="p-4">Location</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Education</th>
              <th className="p-4 text-center">Availability</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map(trainer => (
              <tr key={trainer._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                      {trainer.fullName?.charAt(0) || "T"}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{trainer.fullName}</div>
                      <div className="text-slate-500 mt-1 line-clamp-1">{trainer.skills?.slice(0, 3).join(", ") || "No skills listed"}</div>
                    </div>
                  </div>
                </td>
                {showSkillsMatch && (
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{trainer.skillsMatchData?.count} / {req?.skills?.length || 0}</span>
                      <Badge variant="outline" className={`w-fit ${trainer.skillsMatchData?.percentage >= 80 ? 'bg-green-50 text-green-700 border-green-200' : trainer.skillsMatchData?.percentage >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {trainer.skillsMatchData?.percentage}% Match
                      </Badge>
                    </div>
                  </td>
                )}
                <td className="p-4">
                  <div className="font-medium text-slate-700">{trainer.city || "N/A"}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{trainer.state || "N/A"}</div>
                </td>
                <td className="p-4 text-slate-700">
                  <span className="font-medium text-slate-700">
                    {(() => {
                      if (!trainer.profile?.careerStart) return `${trainer.experience || 0} Yrs`;
                      const start = new Date(trainer.profile.careerStart);
                      const todayDate = new Date();
                      let y = todayDate.getFullYear() - start.getFullYear();
                      let m = todayDate.getMonth() - start.getMonth();
                      if (m < 0) { y--; m += 12; }
                      if (y === 0 && m === 0) return "Just Started";
                      if (y === 0) return `${m}m`;
                      if (m === 0) return `${y}y`;
                      return `${y}y ${m}m`;
                    })()}
                  </span>
                </td>
                <td className="p-4">
                  {trainer.profile?.mtech?.college ? (
                     <Badge className="bg-blue-100 text-blue-700 border-none">M.Tech</Badge>
                  ) : trainer.profile?.btech?.college ? (
                     <span className="text-slate-500 text-sm">B.Tech</span>
                  ) : (
                     <span className="text-slate-400 text-sm">Other</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {isTrainerAvailable(trainer) ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-200">Available</Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-200">Occupied</Badge>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" onClick={() => { setSelectedTrainer(trainer); setIsProfileModalOpen(true); }}>
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant={req?.shortlistedTrainers.includes(trainer._id) ? "default" : "secondary"}
                      className={`w-full ${req?.shortlistedTrainers.includes(trainer._id) ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                      onClick={() => openConfirmModal(trainer._id)}
                    >
                      <Star className={`w-3.5 h-3.5 mr-1 ${req?.shortlistedTrainers.includes(trainer._id) ? "fill-white" : ""}`} /> 
                      {req?.shortlistedTrainers.includes(trainer._id) ? "Shortlisted" : "Shortlist"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  if (!req) return <div className="min-h-screen p-8">Requirement not found.</div>;

  return (
    <RouteGuard requireAuth requireProfileComplete>
      <div className="min-h-[calc(100vh-5.5rem)] bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <Button variant="ghost" className="text-slate-500 mb-2" onClick={() => router.push("/dashboard/vendor/requirements")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Requirements
          </Button>

          {/* Requirement Summary Card */}
          <Card className="bg-white border-green-100 shadow-sm border-t-4 border-t-green-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">{req.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-indigo-500" /> Start: {new Date(req.startDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /> {req.durationMonths ? `${req.durationMonths}M` : ''} {req.durationDays ? `${req.durationDays}D` : ''}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4 text-green-500" /> ₹{req.budgetMin} - ₹{req.budgetMax} {req.budgetType === 'Monthly' ? '/Mo' : '/Day'}</span>
                    <span className="flex items-center gap-1"><Laptop className="w-4 h-4 text-purple-500" /> <span className="capitalize">{req.mode}</span></span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-teal-500" /> {req.workingDays?.length || 0} days/week</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-rose-500" /> {req.workMode === 'Remote' ? 'Remote' : (req.city ? `${req.city}, ${req.state}` : 'Location TBD')}</span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200 shadow-sm ml-auto sm:ml-0"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Shortlisted: {req.shortlistedTrainers.length} / {req.totalTrainersNeeded || 1}</span>
                  </div>
                </div>
                <Badge className={req.status === 'Active' ? 'bg-green-100 text-green-700 font-bold tracking-wider' : 'bg-slate-100 text-slate-700 font-bold'}>{req.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-wrap gap-2">
                {req.skills.map(s => <Badge key={s} className="bg-slate-800 text-white border-none">{s}</Badge>)}
              </div>
            </CardContent>
          </Card>

          {/* Filter & Search Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="relative w-full md:w-1/2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input placeholder="Search trainers by name, phone, email or skills..." className="pl-9 bg-slate-50" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" className="w-full md:w-auto" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" /> {showFilters ? "Hide Filters" : "Advanced Filters"}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500">Min Experience</Label>
                  <Select value={filterExperience} onValueChange={(val) => setFilterExperience(val || "")}>
                    <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Experience</SelectItem>
                      {EXP_YEARS.map(y => <SelectItem key={y} value={y}>{y} Years</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500">Gender</Label>
                  <Select value={filterGender} onValueChange={(val) => setFilterGender(val || "")}>
                    <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Gender</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500">Education</Label>
                  <Select value={filterEducation} onValueChange={(val) => setFilterEducation(val || "")}>
                    <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Education</SelectItem>
                      <SelectItem value="B.Tech">B.Tech</SelectItem>
                      <SelectItem value="M.Tech">M.Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500">State</Label>
                  <Select value={filterState} onValueChange={(v) => {setFilterState(v === "none" ? "" : (v || "")); setFilterCity("");}}>
                    <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any State" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any State</SelectItem>
                      {indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500">City</Label>
                  <Select value={filterCity} onValueChange={(v) => setFilterCity(v === "none" ? "" : (v || ""))} disabled={!filterState}>
                    <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any City" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any City</SelectItem>
                      {cities.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                   <Label className="text-xs font-bold text-slate-500 flex justify-between">Languages 
                     <span className="text-green-600 cursor-pointer" onClick={() => setFilterLanguages([])}>Clear</span>
                   </Label>
                   <Select onValueChange={(val: any) => val && !filterLanguages.includes(val) && setFilterLanguages([...filterLanguages, val])}>
                     <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Add Languages" /></SelectTrigger>
                     <SelectContent>{INDIAN_LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                   </Select>
                   <div className="flex flex-wrap gap-1 mt-1">
                     {filterLanguages.map(l => (
                       <Badge key={l} variant="secondary" className="text-[10px] py-0">{l} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={()=>setFilterLanguages(filterLanguages.filter(x => x !== l))} /></Badge>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Tabs */}
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full max-w-4xl grid-cols-4 bg-slate-200">
              <TabsTrigger value="available" className="data-[state=active]:bg-white data-[state=active]:text-green-700 font-bold">
                Available Matches ({availableFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 font-bold">
                All Matches ({filteredTrainers.length})
              </TabsTrigger>
              <TabsTrigger value="interests" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 font-bold">
                Interests ({interestedFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="shortlisted" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 font-bold">
                Shortlisted ({shortlistedFiltered.length})
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="available" className="m-0 focus-visible:ring-0">
                {renderTrainerTable(availableFiltered, true)}
              </TabsContent>
              <TabsContent value="all" className="m-0 focus-visible:ring-0">
                {renderTrainerTable(filteredTrainers, true)}
              </TabsContent>
              <TabsContent value="interests" className="m-0 focus-visible:ring-0">
                {renderTrainerTable(interestedFiltered, true)}
              </TabsContent>
              <TabsContent value="shortlisted" className="m-0 focus-visible:ring-0">
                {renderTrainerTable(shortlistedFiltered, true)}
              </TabsContent>
            </div>
          </Tabs>

        </div>
      </div>

      {/* Trainer Full Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent 
          showCloseButton={false}
          className="w-[95vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-slate-50 max-h-[95vh] overflow-y-auto p-0 border-none rounded-3xl shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {selectedTrainer && (
            <div>
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white relative rounded-t-3xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black">{selectedTrainer.fullName}</h2>
                    <p className="text-blue-200 mt-2 text-lg font-medium">{selectedTrainer.profile?.roleTitle || "Technical Trainer"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedTrainer.isVerified && (
                       <Badge className="bg-blue-500/30 text-blue-100 border border-blue-400/50 backdrop-blur-sm text-sm py-1 px-3"><CheckCircle2 className="w-5 h-5 mr-2" /> Verified Profile</Badge>
                    )}
                    <DialogClose className="h-8 w-8 rounded-full hover:bg-white/20 text-white m-0 p-0 flex items-center justify-center bg-transparent border-none cursor-pointer outline-none">
                      <X className="w-5 h-5" />
                    </DialogClose>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-8 text-sm text-blue-100 font-medium bg-black/20 p-4 rounded-xl w-fit">
                  <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-300" /> {selectedTrainer.city}, {selectedTrainer.state}</span>
                  <span className="flex items-center gap-2" title={`Started: ${selectedTrainer.profile?.careerStart || "N/A"}`}>
                    <Briefcase className="w-5 h-5 text-blue-300" /> 
                    {(() => {
                      if (!selectedTrainer.profile?.careerStart) return `${selectedTrainer.experience || 0} Yrs Total Exp`;
                      const start = new Date(selectedTrainer.profile.careerStart);
                      const todayDate = new Date();
                      let y = todayDate.getFullYear() - start.getFullYear();
                      let m = todayDate.getMonth() - start.getMonth();
                      if (m < 0) { y--; m += 12; }
                      if (y === 0 && m === 0) return "Just Started";
                      if (y === 0) return `${m} m Total Exp`;
                      if (m === 0) return `${y} y Total Exp`;
                      return `${y} y and ${m} m Total Exp`;
                    })()}
                  </span>
                  <span className="flex items-center gap-2"><Languages className="w-5 h-5 text-blue-300" /> {selectedTrainer.languages?.length > 0 ? selectedTrainer.languages.join(", ") : "English"}</span>
                  {selectedTrainer.profile?.dob && <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-300" /> DOB: {new Date(selectedTrainer.profile.dob).toLocaleDateString()}</span>}
                  {selectedTrainer.profile?.maritalStatus && <span className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-300" /> {selectedTrainer.profile.maritalStatus}</span>}
                </div>
              </div>

              <div className="p-8 space-y-8">
                
                {/* Contact Actions */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                   <div className="flex-1 flex">
                     <a href={`tel:${selectedTrainer.phone}`} className="flex-1 flex justify-center items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-l-lg font-bold transition-colors border-r border-green-200/50">
                       <Phone className="w-5 h-5" /> Call {selectedTrainer.phone}
                     </a>
                     <Button variant="ghost" className="h-auto px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-none rounded-r-lg" onClick={() => { navigator.clipboard.writeText(selectedTrainer.phone); toast.success("Phone copied"); }} title="Copy Phone">
                       <Copy className="w-5 h-5" />
                     </Button>
                   </div>
                   
                   <div className="flex-1 flex">
                     <a href={`mailto:${selectedTrainer.email}`} className="flex-1 flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-l-lg font-bold transition-colors border-r border-blue-200/50">
                       <Mail className="w-5 h-5" /> Email Trainer
                     </a>
                     <Button variant="ghost" className="h-auto px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-none rounded-r-lg" onClick={() => { navigator.clipboard.writeText(selectedTrainer.email); toast.success("Email copied"); }} title="Copy Email">
                       <Copy className="w-5 h-5" />
                     </Button>
                   </div>
                   <Button 
                      variant={req.shortlistedTrainers.includes(selectedTrainer._id) ? "default" : "outline"}
                      className={`flex-1 py-6 h-auto ${req.shortlistedTrainers.includes(selectedTrainer._id) ? "bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-200" : "border-amber-200 text-amber-700 hover:bg-amber-50 font-bold"}`}
                      onClick={() => openConfirmModal(selectedTrainer._id)}
                    >
                      <Star className={`w-5 h-5 mr-2 ${req.shortlistedTrainers.includes(selectedTrainer._id) ? "fill-white" : ""}`} /> 
                      {req.shortlistedTrainers.includes(selectedTrainer._id) ? "Shortlisted" : "Add to Shortlist"}
                   </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column (Main Info) */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6 text-indigo-500" /> Professional Summary</h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">{selectedTrainer.profile?.summary || "No summary provided."}</p>
                    </div>

                    {/* Experiences */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="w-6 h-6 text-amber-500" /> Work Experience History</h3>
                      {selectedTrainer.experiences && selectedTrainer.experiences.length > 0 ? (
                        <div className="space-y-8">
                          {selectedTrainer.experiences.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-8 border-l-2 border-slate-200">
                              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-[3px] border-amber-500"></div>
                              <h4 className="text-lg font-bold text-slate-800">{exp.role}</h4>
                              <div className="font-semibold text-amber-600 mb-2 mt-1">{exp.company} <span className="text-slate-400 font-normal ml-3 px-2 py-0.5 bg-slate-50 rounded text-sm">{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</span></div>
                              <p className="text-slate-600 mt-2">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">No experience added.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Side Info) */}
                  <div className="space-y-8">
                    
                    {/* Skills */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Star className="w-6 h-6 text-pink-500" /> Core Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.skills?.map((s:string) => (
                           <Badge key={s} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-none text-sm px-3 py-1">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-emerald-500" /> Education</h3>
                      <div className="space-y-5">
                        {selectedTrainer.profile?.mtech?.college && (
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="font-bold text-slate-800 text-lg">M.Tech - {selectedTrainer.profile.mtech.branch}</div>
                            <div className="text-slate-500 mt-1">{selectedTrainer.profile.mtech.college}</div>
                            <div className="text-sm font-bold text-emerald-600 mt-2">Class of {selectedTrainer.profile.mtech.year} • {selectedTrainer.profile.mtech.cgpa}</div>
                          </div>
                        )}
                        {selectedTrainer.profile?.btech?.college && (
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="font-bold text-slate-800 text-lg">B.Tech - {selectedTrainer.profile.btech.branch}</div>
                            <div className="text-slate-500 mt-1">{selectedTrainer.profile.btech.college}</div>
                            <div className="text-sm font-bold text-emerald-600 mt-2">Class of {selectedTrainer.profile.btech.year} • {selectedTrainer.profile.btech.cgpa}</div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-6 h-6 text-indigo-500" /> Availability Calendar</h3>
                    <div className="flex gap-4 text-sm font-medium">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> Today</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded-sm"></div> Occupied</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded-sm"></div> Available</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderCalendarMonth(0, selectedTrainer.profile?.occupiedDays || [])}
                    {renderCalendarMonth(1, selectedTrainer.profile?.occupiedDays || [])}
                    {renderCalendarMonth(2, selectedTrainer.profile?.occupiedDays || [])}
                  </div>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmTrainerId && req?.shortlistedTrainers.includes(confirmTrainerId)
                ? "Are you sure you want to remove this trainer from your shortlist? You will no longer be prioritizing their profile."
                : "Are you sure you want to shortlist this trainer? This will indicate your interest in proceeding with them."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="default"
              className={confirmTrainerId && req?.shortlistedTrainers.includes(confirmTrainerId) ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
              onClick={() => {
                if (confirmTrainerId) toggleShortlist(confirmTrainerId);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </RouteGuard>
  );
}
