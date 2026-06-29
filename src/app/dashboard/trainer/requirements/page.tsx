"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Search, Calendar, Users, IndianRupee, Clock, MapPin, Laptop, CalendarDays, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RouteGuard, useAuth } from "@/context/auth-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { State, City } from "country-state-city";
import toast from "react-hot-toast";

interface Requirement {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
  startDate?: string;
  totalTrainersNeeded?: number;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: string;
  durationMonths?: number;
  durationDays?: number;
  city?: string;
  state?: string;
  workMode?: string;
  mode?: string;
  workingDays?: string[];
  createdAt: string;
  companyName?: string;
  vendorAbout?: string;
  vendorWebsite?: string;
  vendorLocation?: string;
  vendorPhone?: string;
  interestedTrainers?: string[];
  shortlistedTrainers?: string[];
}

export default function RequirementsPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterBudgetMin, setFilterBudgetMin] = useState("");
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const indianStates = State.getStatesOfCountry("IN");
  const selectedStateObj = indianStates.find(s => s.name === filterState);
  const cities = selectedStateObj ? City.getCitiesOfState("IN", selectedStateObj.isoCode) : [];

  const fetchData = async () => {
    try {
      if (user?.email) {
        const profileRes = await fetch(`/api/trainer/profile?email=${user.email}`);
        const profileData = await profileRes.json();
        if (profileData.profile) setTrainerProfile(profileData.profile);
      }
      const reqsRes = await fetch("/api/trainer/requirements");
      const reqsData = await reqsRes.json();
      if (reqsData.requirements) setRequirements(reqsData.requirements);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSendInterest = async (reqId: string) => {
    if (!trainerProfile?.userId) {
      toast.error("Could not verify trainer identity. Please ensure your profile is complete.");
      return;
    }

    try {
      setIsSendingInterest(true);
      const res = await fetch(`/api/trainer/requirements/${reqId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId: trainerProfile.userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Interest sent successfully!");
        setRequirements(requirements.map(req => 
          req._id === reqId 
            ? { ...req, interestedTrainers: data.interestedTrainers }
            : req
        ));
        if (selectedReq) {
          setSelectedReq({ ...selectedReq, interestedTrainers: data.interestedTrainers });
        }
      } else {
        toast.error(data.error || "Failed to send interest");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSendingInterest(false);
    }
  };

  const filteredReqs = requirements.filter(req => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!req.title.toLowerCase().includes(q) && !req.description.toLowerCase().includes(q) && !req.companyName?.toLowerCase().includes(q)) return false;
    }
    if (filterState && filterState !== "none" && req.state !== filterState) return false;
    if (filterCity && filterCity !== "none" && req.city !== filterCity) return false;
    if (filterBudgetMin) {
      // The user wants a minimum budget. So the post's MAX budget must be >= user's minimum budget.
      if (req.budgetMax && req.budgetMax < Number(filterBudgetMin)) return false;
    }
    if (filterSkills.length > 0) {
      const hasMatch = filterSkills.some(sq => req.skills.some(rs => rs.toLowerCase().includes(sq.toLowerCase())));
      if (!hasMatch) return false;
    }
    return true;
  });

  const trainerId = trainerProfile?.userId;
  const trainerSkills = trainerProfile?.skills || [];

  const interestAcceptedReqs = filteredReqs.filter(req => req.shortlistedTrainers?.includes(trainerId));
  const interestSentReqs = filteredReqs.filter(req => req.interestedTrainers?.includes(trainerId) && !req.shortlistedTrainers?.includes(trainerId));
  const matchedReqs = filteredReqs.filter(req => {
    if (req.shortlistedTrainers?.includes(trainerId) || req.interestedTrainers?.includes(trainerId)) return false;
    if (trainerSkills.length === 0) return false;
    return req.skills.some((rs: string) => trainerSkills.includes(rs));
  });

  const getSkillsMatchData = (reqSkills: string[], tSkills: string[]) => {
    if (!reqSkills || reqSkills.length === 0) return { percentage: 0, matchedCount: 0, total: 0 };
    if (!tSkills || tSkills.length === 0) return { percentage: 0, matchedCount: 0, total: reqSkills.length };
    
    const matchedCount = reqSkills.filter(rs => tSkills.includes(rs)).length;
    const percentage = Math.round((matchedCount / reqSkills.length) * 100);
    return { percentage, matchedCount, total: reqSkills.length };
  };

  const renderCards = (list: Requirement[]) => {
    if (list.length === 0) {
      return (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center flex flex-col items-center shadow-sm w-full mt-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-700 mb-2">No Requirements Found</h3>
          <p className="text-slate-500 max-w-sm font-medium leading-relaxed">No posts match this view or filter criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {list.map((req) => {
          const matchData = getSkillsMatchData(req.skills, trainerSkills);
          
          return (
          <div key={req._id} onClick={() => { setSelectedReq(req); setIsModalOpen(true); }} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-6 group cursor-pointer hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
            {/* Status overlay bar if shortlisted */}
            {req.shortlistedTrainers?.includes(trainerId) && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
            )}
            
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <div className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wide uppercase ${matchData.percentage >= 80 ? 'bg-green-100 text-green-700 border border-green-200' : matchData.percentage >= 50 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                {matchData.percentage}% Match
              </div>
              {req.mode && (
                <Badge variant="secondary" className={`whitespace-nowrap uppercase tracking-wider text-[10px] font-black ${req.mode === 'online' ? 'bg-emerald-100 text-emerald-700' : req.mode === 'offline' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                  {req.mode}
                </Badge>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-4 gap-4">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight pr-24">{req.title}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 font-medium mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{req.startDate ? new Date(req.startDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{req.totalTrainersNeeded || '1'} Trainers</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-green-500" />
                  <span>{req.budgetMin ? `₹${req.budgetMin} - ₹${req.budgetMax}` : 'Negotiable'} {req.budgetType === 'Monthly' ? '/Mo' : req.budgetType === 'Daily' ? '/Day' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{req.durationMonths ? `${req.durationMonths}m` : ''} {req.durationDays ? `${req.durationDays}d` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="truncate">{req.workMode === 'Remote' ? 'Remote' : (req.city && req.state ? `${req.city}, ${req.state}` : 'Location TBD')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-500" />
                  <span>{req.workingDays?.length || 0} days/week</span>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-auto">
              <span className="text-sm font-black uppercase tracking-wider text-slate-800 font-sans">{req.companyName || 'CONFIDENTIAL'}</span>
              <span className="text-blue-600 font-bold text-sm group-hover:underline flex items-center gap-1">View Details <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span></span>
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <RouteGuard requireAuth requireProfileComplete>
      <div className="w-full max-w-[1500px] mx-auto p-4 md:p-8 lg:px-10 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Filter Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-1/2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search requirements, companies..." 
                className="pl-9 h-10 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto h-10" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" /> {showFilters ? "Hide Filters" : "Advanced Filters"}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">State</Label>
                <Select value={filterState} onValueChange={(v) => {setFilterState(v === "none" ? "" : (v || "")); setFilterCity("");}}>
                  <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any State</SelectItem>
                    {indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">City</Label>
                <Select value={filterCity} onValueChange={(v) => setFilterCity(v === "none" ? "" : (v || ""))} disabled={!filterState}>
                  <SelectTrigger className="bg-slate-50 h-9"><SelectValue placeholder="Any City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any City</SelectItem>
                    {cities.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500">Min Budget Expectation (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 10000" 
                  className="h-9 bg-slate-50"
                  value={filterBudgetMin}
                  onChange={(e) => setFilterBudgetMin(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 flex justify-between">
                  Skills 
                  <span className="text-indigo-600 cursor-pointer" onClick={() => setFilterSkills([])}>Clear</span>
                </Label>
                <Input 
                  type="text" 
                  placeholder="Type skill & press Enter..." 
                  className="h-9 bg-slate-50"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && skillInput.trim()) {
                      e.preventDefault();
                      const val = skillInput.trim().toUpperCase();
                      if (!filterSkills.includes(val)) {
                        setFilterSkills([...filterSkills, val]);
                      }
                      setSkillInput("");
                    }
                  }}
                />
                {filterSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filterSkills.map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px] py-0 bg-indigo-50 text-indigo-700 border-indigo-100">
                        {s} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={()=>setFilterSkills(filterSkills.filter(x => x !== s))} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="matched" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-4 bg-slate-200 mb-6">
            <TabsTrigger value="matched" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 font-bold">
              Matched ({matchedReqs.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-slate-800 font-bold">
              All Posts ({filteredReqs.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 font-bold">
              Interest Sent ({interestSentReqs.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-white data-[state=active]:text-green-600 font-bold">
              Accepted ({interestAcceptedReqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matched" className="m-0 focus-visible:ring-0">
            {renderCards(matchedReqs)}
          </TabsContent>
          <TabsContent value="all" className="m-0 focus-visible:ring-0">
            {renderCards(filteredReqs)}
          </TabsContent>
          <TabsContent value="sent" className="m-0 focus-visible:ring-0">
            {renderCards(interestSentReqs)}
          </TabsContent>
          <TabsContent value="accepted" className="m-0 focus-visible:ring-0">
            {renderCards(interestAcceptedReqs)}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[95vw] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl bg-slate-50 max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-hidden">
          {selectedReq && (
            <div className="flex flex-col h-full min-h-[50vh]">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 sm:p-10 text-white rounded-t-3xl relative">
                <h2 className="text-3xl font-black leading-tight pr-8">{selectedReq.title}</h2>
                <div className="flex flex-wrap items-center gap-6 mt-6 text-slate-300 font-medium">
                  <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> {selectedReq.startDate ? new Date(selectedReq.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-400" /> {selectedReq.workMode === 'Remote' ? 'Remote' : (selectedReq.city ? `${selectedReq.city}, ${selectedReq.state}` : 'Location TBD')}</div>
                </div>
              </div>
              
              <div className="p-8 sm:p-10 space-y-10 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Description</h3>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{selectedReq.description}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Budget & Duration</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg"><IndianRupee className="w-5 h-5 text-green-600" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold mb-0.5">Budget</p>
                          <p className="font-bold text-slate-800">{selectedReq.budgetMin ? `₹${selectedReq.budgetMin} - ₹${selectedReq.budgetMax}` : 'Negotiable'} {selectedReq.budgetType === 'Monthly' ? '/Mo' : selectedReq.budgetType === 'Daily' ? '/Day' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold mb-0.5">Duration</p>
                          <p className="font-bold text-slate-800">{selectedReq.durationMonths ? `${selectedReq.durationMonths} Months` : ''} {selectedReq.durationDays ? `${selectedReq.durationDays} Days` : (selectedReq.durationMonths ? '' : 'TBD')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg"><CalendarDays className="w-5 h-5 text-teal-600" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold mb-0.5">Working Days</p>
                          <p className="font-bold text-slate-800">{selectedReq.workingDays?.length || 0} days a week</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Requirements</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg"><Laptop className="w-5 h-5 text-purple-600" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold mb-0.5">Mode</p>
                          <p className="font-bold text-slate-800 capitalize">{selectedReq.mode || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold mb-0.5">Trainers</p>
                          <p className="font-bold text-slate-800">{selectedReq.totalTrainersNeeded || '1'} Trainers Needed</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReq.skills.map((s, i) => <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">{s}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-slate-200 pt-10">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest font-sans mb-6">{selectedReq.companyName || 'CONFIDENTIAL'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-medium text-slate-600 bg-slate-100/50 p-6 rounded-2xl">
                    {selectedReq.vendorAbout && <div className="col-span-full mb-2"><p className="text-slate-500 leading-relaxed italic">{selectedReq.vendorAbout}</p></div>}
                    {selectedReq.vendorWebsite && <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Website</span><a href={selectedReq.vendorWebsite.startsWith('http') ? selectedReq.vendorWebsite : `https://${selectedReq.vendorWebsite}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">{selectedReq.vendorWebsite}</a></div>}
                    {selectedReq.vendorLocation && <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Headquarters</span><span className="text-slate-700 font-bold">{selectedReq.vendorLocation}</span></div>}
                    {selectedReq.vendorPhone && <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone</span><span className="text-slate-700 font-bold">{selectedReq.vendorPhone}</span></div>}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 sm:px-10 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex justify-end items-center gap-4">
                {selectedReq.shortlistedTrainers?.includes(trainerId) ? (
                  <div className="px-6 py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Interest Accepted!
                  </div>
                ) : selectedReq.interestedTrainers?.includes(trainerId) ? (
                  <div className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Interest Sent
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleSendInterest(selectedReq._id)} 
                    disabled={isSendingInterest}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 text-lg"
                  >
                    {isSendingInterest ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Interest'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RouteGuard>
  );
}
