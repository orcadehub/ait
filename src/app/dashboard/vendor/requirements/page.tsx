"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteGuard, useAuth } from "@/context/auth-context";
import { Loader2, PlusCircle, Calendar, Users, Briefcase, Edit2, Trash2, Eye, X, ChevronDown, Check, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { Country, State, City } from "country-state-city";

interface Requirement {
  _id: string;
  title: string;
  durationMonths: number;
  durationDays: number;
  mode: string;
  skills: string[];
  description: string;
  status: string;
  createdAt: string;
  startDate: string;
  totalTrainersNeeded: number;
  country: string;
  state: string;
  city: string;
  workingDays: string[];
  budgetType: string;
  budgetMin: number;
  budgetMax: number;
  contactNumber: string;
  contactEmail: string;
  shortlistedTrainers?: string[];
  interestedTrainers?: string[];
}

export default function VendorRequirementsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reqToDelete, setReqToDelete] = useState<string | null>(null);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);

  // Vendor Profile Pre-fill Data
  const [vendorPhone, setVendorPhone] = useState("");
  
  // Form States
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [mode, setMode] = useState("");
  
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const [budgetType, setBudgetType] = useState("Daily");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [totalTrainersNeeded, setTotalTrainersNeeded] = useState("1");
  
  // Dynamic Skills
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location Data
  const allCountries = Country.getAllCountries();
  const selectedCountryObj = allCountries.find(c => c.name === country);
  const states = selectedCountryObj ? State.getStatesOfCountry(selectedCountryObj.isoCode) : [];
  const selectedStateObj = states.find(s => s.name === state);
  const cities = selectedCountryObj && selectedStateObj ? City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode) : [];

  const fetchRequirements = async () => {
    if (!user?.email) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/vendor/requirements?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorProfile = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/vendor/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setVendorPhone(data.profile.phone || "");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchVendorProfile();
  }, [user]);

  // Pre-fill when modal opens
  useEffect(() => {
    if (isPostModalOpen && !editingReqId) {
      setContactEmail(user?.email || "");
      setContactNumber(vendorPhone);
    }
  }, [isPostModalOpen, user, vendorPhone, editingReqId]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim().toUpperCase();
      if (newSkill && !selectedSkills.includes(newSkill)) {
        setSelectedSkills([...selectedSkills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  // Validation Check
  const isFormValid = !!(
    title && startDate && durationMonths && durationDays && mode && 
    totalTrainersNeeded && Number(totalTrainersNeeded) > 0 &&
    country && state && city && 
    budgetType && budgetMin && budgetMax && Number(budgetMin) <= Number(budgetMax) &&
    workingDays.length > 0 && selectedSkills.length >= 3 && 
    contactNumber && contactEmail && description
  );

  const handlePostRequirement = async () => {
    if (!user?.email) return;
    if (!isFormValid) {
      return toast.error("Please fill all mandatory fields correctly.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vendorEmail: user.email,
        title,
        startDate,
        durationMonths: Number(durationMonths),
        durationDays: Number(durationDays),
        mode,
        totalTrainersNeeded: Number(totalTrainersNeeded),
        country,
        state,
        city,
        skills: selectedSkills,
        workingDays,
        budgetType,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        contactNumber,
        contactEmail,
        description,
        status
      };

      let res;
      if (editingReqId) {
        res = await fetch(`/api/vendor/requirements/${editingReqId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/vendor/requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingReqId ? "Requirement updated successfully!" : "Requirement posted successfully!");
        setIsPostModalOpen(false);
        setEditingReqId(null);
        // Reset form
        setTitle(""); setStartDate(""); setDurationMonths(""); setDurationDays(""); setMode(""); 
        setTotalTrainersNeeded("1");
        setCountry("India"); setState(""); setCity(""); setWorkingDays([]);
        setBudgetType("Daily"); setBudgetMin(""); setBudgetMax("");
        setDescription(""); setStatus("Active"); setSelectedSkills([]);
        fetchRequirements();
      } else {
        toast.error("Failed to post requirement");
      }
    } catch (error) {
      toast.error("Error posting requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequirement = async () => {
    if (!reqToDelete) return;
    try {
      const res = await fetch(`/api/vendor/requirements/${reqToDelete}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Requirement deleted");
        setRequirements(prev => prev.filter(r => r._id !== reqToDelete));
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting");
    } finally {
      setIsDeleteModalOpen(false);
      setReqToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setReqToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (req: Requirement) => {
    setTitle(req.title);
    setStartDate(req.startDate);
    setDurationMonths(req.durationMonths.toString());
    setDurationDays(req.durationDays.toString());
    setMode(req.mode);
    setTotalTrainersNeeded(req.totalTrainersNeeded ? req.totalTrainersNeeded.toString() : "1");
    setCountry(req.country);
    setState(req.state || "");
    setCity(req.city || "");
    setSelectedSkills(req.skills || []);
    setWorkingDays(req.workingDays || []);
    setBudgetType(req.budgetType || "Daily");
    setBudgetMin(req.budgetMin ? req.budgetMin.toString() : "");
    setBudgetMax(req.budgetMax ? req.budgetMax.toString() : "");
    setContactNumber(req.contactNumber || "");
    setContactEmail(req.contactEmail || "");
    setDescription(req.description || "");
    setStatus(req.status || "Active");
    setEditingReqId(req._id);
    setIsPostModalOpen(true);
  };

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vendor/requirements/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRequirements(prev => prev.map(r => r._id === reqId ? { ...r, status: newStatus } : r));
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  return (
    <RouteGuard requireAuth requireProfileComplete>
      <div className="min-h-[calc(100vh-5.5rem)] bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-green-600" /> My Requirements
              </h1>
              <p className="text-slate-500 mt-1">Manage your posted training requirements.</p>
            </div>
            <Button onClick={() => {
              setTitle(""); setStartDate(""); setDurationMonths(""); setDurationDays(""); setMode(""); 
              setTotalTrainersNeeded("1");
              setCountry("India"); setState(""); setCity(""); setWorkingDays([]);
              setBudgetType("Daily"); setBudgetMin(""); setBudgetMax("");
              setDescription(""); setStatus("Active"); setSelectedSkills([]);
              setEditingReqId(null);
              setIsPostModalOpen(true);
            }} className="bg-green-600 hover:bg-green-700 font-bold shadow-md shadow-green-200">
              <PlusCircle className="w-5 h-5 mr-2" /> Post Requirement
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">You have not posted any requirements yet.</p>
              <Button variant="outline" onClick={() => setIsPostModalOpen(true)} className="border-green-600 text-green-600 hover:bg-green-50">Post your first requirement</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map(req => (
                <Card key={req._id} className="relative group hover:shadow-lg transition-shadow border-slate-200 hover:border-green-300 bg-white">
                  <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => openEditModal(req)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => openDeleteModal(req._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start pr-8">
                      <CardTitle className="text-lg font-bold text-slate-800 line-clamp-2">{req.title}</CardTitle>
                    </div>
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <Select value={req.status || "Active"} onValueChange={(val) => { if(val) handleStatusChange(req._id, val); }}>
                        <SelectTrigger className={`h-7 px-3 w-fit text-xs font-bold border-none outline-none focus:ring-0 ${req.status === 'Active' ? 'bg-green-100 text-green-700' : req.status === 'Draft' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Deactive">Deactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium"><Calendar className="w-4 h-4 text-slate-400 shrink-0" /> {req.startDate ? new Date(req.startDate).toLocaleDateString() : "TBD"}</div>
                      <div className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4 text-slate-400 shrink-0" /> {req.shortlistedTrainers?.length || 0} / {req.totalTrainersNeeded || 1} Needed</div>
                      <div className="flex items-center gap-1.5 col-span-2 font-medium"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {req.city ? `${req.city}, ${req.state}` : "Remote"}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 text-xs">{skill}</Badge>
                      ))}
                      {req.skills.length > 3 && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs">+{req.skills.length - 3}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-slate-100 mt-2 p-4">
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-medium"
                      onClick={() => router.push(`/dashboard/vendor/requirements/${req._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View Details & Matches
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>

      <Dialog open={isPostModalOpen} onOpenChange={(open) => {
        setIsPostModalOpen(open);
        if (!open) setEditingReqId(null);
      }}>
        <DialogContent 
          showCloseButton={false}
          className="w-[95vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-white max-h-[95vh] overflow-y-auto p-6 md:p-10 border-none rounded-3xl shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
        >
          <DialogHeader className="flex flex-row justify-between items-center border-b border-slate-100 pb-6 mb-6">
            <DialogTitle className="text-3xl font-black text-slate-800">{editingReqId ? "Edit Requirement" : "Post a New Requirement"}</DialogTitle>
            <DialogClose className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center bg-transparent border-none cursor-pointer outline-none">
              <X className="w-5 h-5 text-slate-500" />
            </DialogClose>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 py-2">
            
            {/* Left Column (Wider for details) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-2">
                <Label className="font-bold">Training Title <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Advanced React.js Workshop" value={title} onChange={e=>setTitle(e.target.value)} className="bg-slate-50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Mode <span className="text-red-500">*</span></Label>
                  <Select value={mode} onValueChange={(val) => setMode(val || "")}>
                    <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Trainers Needed <span className="text-red-500">*</span></Label>
                  <Input type="number" min="1" placeholder="1" value={totalTrainersNeeded} onChange={e=>setTotalTrainersNeeded(e.target.value)} className="bg-slate-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Duration (Months) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" placeholder="0" value={durationMonths} onChange={e=>setDurationMonths(e.target.value)} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Duration (Days) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" placeholder="5" value={durationDays} onChange={e=>setDurationDays(e.target.value)} className="bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Working Days <span className="text-red-500">*</span></Label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-slate-50 px-3 py-2 text-sm shadow-sm hover:bg-slate-100 hover:text-accent-foreground outline-none">
                    {workingDays.length > 0 ? workingDays.join(", ") : "Select Days"}
                    <ChevronDown className="w-4 h-4 text-slate-400 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white" align="start">
                    {DAYS_OF_WEEK.map((day) => (
                      <DropdownMenuCheckboxItem
                        key={day}
                        checked={workingDays.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) setWorkingDays([...workingDays, day]);
                          else setWorkingDays(workingDays.filter(d => d !== day));
                        }}
                      >
                        {day}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Budget Type <span className="text-red-500">*</span></Label>
                <Select value={budgetType} onValueChange={(val) => setBudgetType(val || "")}>
                  <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Budget Min (₹) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" placeholder="Min" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Budget Max (₹) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" placeholder="Max" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className="bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Skills Needed <span className="text-red-500">*</span> <span className="text-slate-400 font-normal text-xs ml-2">(Min 3 required)</span></Label>
                <Input 
                  placeholder="Type a skill and press Enter..." 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="bg-slate-50"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} className="bg-slate-800 text-white border-none py-1.5 px-3 flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 focus:outline-none flex items-center justify-center cursor-pointer p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedSkills.length === 0 && <span className="text-sm text-slate-400 italic">No skills added yet.</span>}
                </div>
              </div>

            </div>

            {/* Right Column (Narrower for settings) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Location Details</h3>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Country <span className="text-red-500">*</span></Label>
                  <Select value={country} onValueChange={(val) => {setCountry(val || ""); setState(""); setCity("");}}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                      {allCountries.map(c => <SelectItem key={c.isoCode} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">State <span className="text-red-500">*</span></Label>
                    <Select value={state} onValueChange={(val) => {setState(val || ""); setCity("");}}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {states.map(s => <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">City <span className="text-red-500">*</span></Label>
                    <Select value={city} onValueChange={(val) => setCity(val || "")}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select City" /></SelectTrigger>
                      <SelectContent>
                        {cities.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-4">
                <h3 className="font-bold text-green-900 mb-2 border-b border-green-200 pb-2">Contact Point</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-green-800">Contact Number <span className="text-red-500">*</span></Label>
                    <Input value={contactNumber} onChange={e=>setContactNumber(e.target.value)} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-green-800">Contact Email <span className="text-red-500">*</span></Label>
                    <Input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} className="bg-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || "")}>
                  <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deactive">Deactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Full Width Footer Section */}
            <div className="lg:col-span-12 space-y-2 mt-4">
              <div className="flex justify-between items-end">
                <Label className="font-bold text-lg text-slate-800">Additional Details / TOC <span className="text-red-500">*</span></Label>
                <span className={`text-sm font-medium ${description.length >= 2000 ? 'text-red-500' : 'text-slate-400'}`}>{description.length}/2000</span>
              </div>
              <Textarea 
                placeholder="Paste Table of Contents or specific requirements here..." 
                className="resize-none min-h-[250px] bg-slate-50 font-mono text-sm leading-relaxed border-slate-200 focus:bg-white p-4 rounded-xl" 
                value={description} 
                onChange={e=>setDescription(e.target.value.slice(0, 2000))} 
              />
            </div>
            
          </div>
          
          <DialogFooter className="sm:justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
            <DialogClose className="border border-slate-300 px-6 py-6 font-bold rounded-md hover:bg-slate-100 flex items-center justify-center cursor-pointer bg-white text-slate-900" onClick={() => setIsPostModalOpen(false)}>Cancel</DialogClose>
            <Button 
              onClick={handlePostRequirement} 
              disabled={isSubmitting || !isFormValid}
              className={`px-10 py-6 text-lg font-bold shadow-lg transition-all ${isFormValid ? "bg-green-600 hover:bg-green-700 shadow-green-200 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isSubmitting ? (editingReqId ? "Updating..." : "Posting...") : (editingReqId ? "Update Requirement" : "Post Requirement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 font-medium">
            Are you sure you want to delete this requirement? This action cannot be undone and will permanently remove this requirement.
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="font-bold">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRequirement} className="bg-red-600 hover:bg-red-700 font-bold text-white shadow-md shadow-red-200">Yes, Delete It</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </RouteGuard>
  );
}
