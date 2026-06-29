"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Building2, Briefcase, Loader2, MapPin, Phone } from "lucide-react";
import { RouteGuard, useAuth } from "@/context/auth-context";
import { State, City } from "country-state-city";
import { toast } from "react-hot-toast";

export default function VendorDashboard() {
  const { user, updateProfileStatus } = useAuth();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Fields
  const [companyName, setCompanyName] = useState("");
  const [about, setAbout] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [altEmail, setAltEmail] = useState("");

  const indianStates = State.getStatesOfCountry("IN");
  const selectedStateObj = indianStates.find(s => s.name === state);
  const cities = selectedStateObj ? City.getCitiesOfState("IN", selectedStateObj.isoCode) : [];

  const [progress, setProgress] = useState(0);

  // Calculate Progress
  useEffect(() => {
    let completed = 0;
    const criteria = [
      companyName, about, registrationStatus, industry, websiteUrl, state, city, phone, whatsapp, altEmail
    ];

    criteria.forEach(item => {
      if (item && item.trim() !== "") completed++;
    });

    const percent = Math.round((completed / criteria.length) * 100);
    setProgress(percent);
  }, [companyName, about, registrationStatus, industry, websiteUrl, state, city, phone, whatsapp, altEmail]);

  const isBasicInfoComplete = !!(companyName && about);
  const isDetailsComplete = !!(registrationStatus && industry && websiteUrl && state && city);
  const isContactComplete = !!(phone && whatsapp && altEmail);

  // Fetch Profile
  useEffect(() => {
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/vendor/profile?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setCompanyName(p.companyName || "");
            setAbout(p.about || "");
            setRegistrationStatus(p.registrationStatus || "");
            setIndustry(p.industry || "");
            setWebsiteUrl(p.websiteUrl || "");
            setState(p.state || "");
            setCity(p.city || "");
            setPhone(p.phone || "");
            setWhatsapp(p.whatsapp || "");
            setAltEmail(p.altEmail || "");

            if (p.profileComplete !== user.profileComplete) {
              updateProfileStatus(p.profileComplete);
            }
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
      companyName, about, registrationStatus, industry, websiteUrl, state, city,
      phone, whatsapp, altEmail,
      profileComplete: progress === 100
    };

    try {
      const res = await fetch("/api/vendor/profile", {
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

  if (isLoadingProfile) {
    return (
      <RouteGuard requireAuth>
        <div className="min-h-[calc(100vh-5.5rem)] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading your profile...</p>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth>
      <div className="min-h-[calc(100vh-5.5rem)] bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 p-4 md:p-8">
        <div className="w-full max-w-screen-xl mx-auto space-y-6 md:px-8 lg:px-16 xl:px-24">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-green-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-white to-green-500"></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-8 h-8 text-green-600" /> Vendor Profile
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Welcome back, {companyName || user?.name || "Vendor"}! Complete your profile to post requirements.</p>
            </div>
            
            <div className="w-full md:w-64 text-right">
              <div className="flex justify-between items-center mb-1 text-sm font-bold text-slate-700">
                <span>Profile Completion</span>
                <span className={progress === 100 ? "text-green-600" : "text-amber-500"}>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-slate-100 [&>div]:bg-green-600" />
              {progress === 100 && (
                <p className="text-xs text-green-600 mt-2 font-medium">Profile 100% Complete!</p>
              )}
            </div>
          </div>

          <Accordion defaultValue={["basic"]} className="w-full space-y-4">
            
            {/* SECTION 1: Basic Company Info */}
            <AccordionItem value="basic" className="bg-white border-green-100 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-green-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Briefcase className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Basic Company Info</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Provide your company name and description.</p>
                    </div>
                  </div>
                  {isBasicInfoComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 space-y-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label className="font-bold text-slate-700">Company Name <span className="text-red-500">*</span></Label>
                    </div>
                    <Input placeholder="e.g. Acme Corp" value={companyName} onChange={e=>setCompanyName(e.target.value)} className="bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label className="font-bold text-slate-700">Company Description <span className="text-red-500">*</span></Label>
                      <span className={`text-xs font-medium ${about.length >= 1000 ? 'text-red-500' : 'text-slate-400'}`}>{about.length}/1000</span>
                    </div>
                    <Textarea placeholder="Briefly describe your company, what you do, and your core values..." value={about} onChange={e=>setAbout(e.target.value.slice(0, 1000))} className="min-h-[100px] bg-slate-50 focus:bg-white resize-none" />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-green-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-green-200 text-green-800 hover:bg-green-100 font-bold">
                    {isSaving ? "Saving..." : "Save Basic Info"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION 2: Company Details */}
            <AccordionItem value="details" className="bg-white border-green-100 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-green-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <MapPin className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Company Details & Location</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Registration, industry, website, and base location.</p>
                    </div>
                  </div>
                  {isDetailsComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 pb-4 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Registration Status <span className="text-red-500">*</span></Label>
                      <Select value={registrationStatus} onValueChange={(val) => setRegistrationStatus(val || "")}>
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual / Freelancer</SelectItem>
                          <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="LLP">Limited Liability Partnership (LLP)</SelectItem>
                          <SelectItem value="PVT LTD">Private Limited</SelectItem>
                          <SelectItem value="Public LTD">Public Limited</SelectItem>
                          <SelectItem value="NGO">NGO / Trust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Industry <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. IT Services, Education..." value={industry} onChange={e=>setIndustry(e.target.value)} className="bg-slate-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Website URL <span className="text-red-500">*</span></Label>
                    <Input type="url" placeholder="https://www.yourcompany.com" value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} className="bg-slate-50" />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-700">Base Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">State <span className="text-red-500">*</span></Label>
                        <Select value={state} onValueChange={(val) => { setState(val || ""); setCity(""); }}>
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map(s => (
                              <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">City <span className="text-red-500">*</span></Label>
                        <Select value={city} onValueChange={(val) => setCity(val || "")} disabled={!state}>
                          <SelectTrigger className="bg-slate-50 disabled:opacity-50">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map(c => (
                              <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="bg-slate-50 border-t border-green-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-green-200 text-green-800 hover:bg-green-100 font-bold">
                    {isSaving ? "Saving..." : "Save Details"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SECTION 3: Contact Information */}
            <AccordionItem value="contact" className="bg-white border-green-100 shadow-md rounded-2xl overflow-hidden border-none">
              <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 hover:bg-green-50/50 transition-colors group [&>span]:w-full">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">Contact Information</h3>
                      <p className="text-sm font-normal text-slate-500 hidden md:block">Primary contact points for trainers.</p>
                    </div>
                  </div>
                  {isContactComplete ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-bold">Pending</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 border-t border-slate-100">
                <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Primary Email <span className="text-slate-400 font-normal">(Login ID)</span></Label>
                    <Input value={user?.email || ""} disabled className="bg-slate-100 font-medium text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Alternate Email <span className="text-red-500">*</span></Label>
                    <Input type="email" placeholder="e.g. hr@company.com" value={altEmail} onChange={e=>setAltEmail(e.target.value)} className="bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                    <Input type="tel" placeholder="+91" value={phone} onChange={e=>setPhone(e.target.value)} className="bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-green-600">WhatsApp Number <span className="text-red-500">*</span></Label>
                    <Input type="tel" placeholder="+91" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="bg-slate-50 focus:bg-white border-green-200 focus:ring-green-100" />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-green-100 flex justify-end p-4">
                  <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-green-200 text-green-800 hover:bg-green-100 font-bold">
                    {isSaving ? "Saving..." : "Save Contact Info"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Submit Action */}
          <div className="mt-8 flex justify-end">
             <Button 
                onClick={handleSaveAll} 
                disabled={isSaving || progress < 100} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
             >
               {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
               {progress === 100 ? "Finalize Profile" : "Complete All Sections to Continue"}
             </Button>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
