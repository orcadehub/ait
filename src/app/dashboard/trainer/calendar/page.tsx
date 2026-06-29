"use client";

import { useEffect, useState } from "react";
import { useAuth, RouteGuard } from "@/context/auth-context";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  
  // We now store an object for each marked day containing the date and color
  const [markedDays, setMarkedDays] = useState<{date: Date, color: string}[]>([]);
  const [currentColor, setCurrentColor] = useState("blue");
  
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const fetchDays = async () => {
      try {
        const res = await fetch(`/api/trainer/calendar?email=${user.email}`);
        const data = await res.json();
        if (data.occupiedDays) {
          setMarkedDays(data.occupiedDays.map((str: string) => {
            const [dateStr, color] = str.split(':');
            return { date: new Date(dateStr), color: color || 'blue' };
          }));
        }
      } catch (err) {
        toast.error("Failed to fetch calendar data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchDays();
  }, [user]);

  const handleSave = async () => {
    if (!user?.email) return;
    setIsSaving(true);
    try {
      // Store dates as YYYY-MM-DD:color string
      const dateStrings = markedDays.map(d => {
         const offset = d.date.getTimezoneOffset();
         const local = new Date(d.date.getTime() - (offset*60*1000));
         const dateStr = local.toISOString().split('T')[0];
         return `${dateStr}:${d.color}`;
      });
      
      const res = await fetch("/api/trainer/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, occupiedDays: dateStrings }),
      });
      if (res.ok) {
        toast.success("Schedule updated successfully!");
      } else {
        toast.error("Failed to save schedule.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayClick = (day: Date) => {
    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getDate() === d2.getDate();

    const existing = markedDays.find(d => isSameDay(d.date, day));
    if (existing) {
      if (existing.color === currentColor) {
         // toggle off
         setMarkedDays(markedDays.filter(d => !isSameDay(d.date, day)));
      } else {
         // update color
         setMarkedDays(markedDays.map(d => isSameDay(d.date, day) ? { ...d, color: currentColor } : d));
      }
    } else {
      setMarkedDays([...markedDays, { date: day, color: currentColor }]);
    }
  };

  const today = new Date();
  const maxDate = addDays(today, 60);

  if (isLoading || isFetching) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const colors = [
    { id: 'blue', hex: '#3b82f6' },
    { id: 'orange', hex: '#f97316' },
    { id: 'green', hex: '#22c55e' },
    { id: 'red', hex: '#ef4444' },
    { id: 'purple', hex: '#a855f7' },
    { id: 'pink', hex: '#ec4899' },
  ];

  // Setup modifiers dynamically based on colors
  const modifiers = colors.reduce((acc, c) => {
    acc[c.id] = markedDays.filter(d => d.color === c.id).map(d => d.date);
    return acc;
  }, {} as any);
  
  const modifiersStyles = colors.reduce((acc, c) => {
    acc[c.id] = { backgroundColor: c.hex, color: 'white', borderRadius: '14px', transform: 'scale(0.82)' };
    return acc;
  }, {} as any);

  const filteredCount = markedDays.filter(d => {
    if (!filterFrom && !filterTo) return true;
    const target = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()).getTime();
    
    // Parse the input dates to local time midnight
    const fromTime = filterFrom ? new Date(filterFrom + 'T00:00:00').getTime() : -Infinity;
    const toTime = filterTo ? new Date(filterTo + 'T23:59:59').getTime() : Infinity;
    
    return target >= fromTime && target <= toTime;
  }).length;

  return (
    <RouteGuard requireAuth requireProfileComplete>
      <style>{`
        ${colors.map(c => `
          .rdp-day_${c.id} button:hover,
          .rdp-day_${c.id}:hover button,
          .rdp-day_${c.id}:hover {
            background-color: ${c.hex} !important;
            color: white !important;
            opacity: 0.85 !important;
          }
        `).join('\n')}
      `}</style>
      <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Your Schedule</h1>
              <p className="text-blue-100 mt-1">Select the days you are occupied/unavailable for training.</p>
            </div>
          </div>
        
        <div className="p-4 md:p-8 flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-6 shadow-inner w-full xl:w-auto flex flex-col items-center overflow-x-auto">
            
            {/* Color Palette Selector */}
            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-center w-full">
              <span className="text-sm font-bold text-slate-500">Pick a color:</span>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCurrentColor(c.id)}
                    className={`w-8 h-8 rounded-full transition-all border-2 border-transparent ${currentColor === c.id ? 'scale-125 shadow-md ring-2 ring-offset-2' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex, outlineColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <Calendar
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              onDayClick={handleDayClick}
              startMonth={today}
              endMonth={maxDate}
              disabled={[{ before: today }, { after: maxDate }]}
              className="bg-white rounded-2xl shadow-md border p-3 sm:p-5 [--cell-size:34px] sm:[--cell-size:40px] md:[--cell-size:46px] lg:[--cell-size:52px] text-sm md:text-base font-medium overflow-hidden"
            />
          </div>
          
          <div className="flex-1 space-y-6 w-full max-w-full overflow-hidden">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800">
              <h3 className="font-bold text-xl mb-4">How it works</h3>
              <ul className="list-disc pl-5 space-y-3 text-base text-blue-700">
                <li>You can only mark days within the exact next <strong>60 days</strong>.</li>
                <li>Pick any color swatch from the top.</li>
                <li>Click a date on the calendar to mark it with that color.</li>
                <li>Click a marked date again with the same color to unmark it.</li>
                <li>Vendors will instantly see your colored dates when shortlisting!</li>
              </ul>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mt-6 w-full">
              <h3 className="font-bold text-lg mb-4 text-slate-700">Calculate Occupied Days</h3>
              <div className="flex flex-col lg:flex-row flex-wrap gap-4 lg:items-end">
                <div className="flex-1 min-w-[140px] w-full">
                  <label className="text-sm font-semibold text-slate-600 block mb-1.5">From Date</label>
                  <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" />
                </div>
                <div className="flex-1 min-w-[140px] w-full">
                  <label className="text-sm font-semibold text-slate-600 block mb-1.5">To Date</label>
                  <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" />
                </div>
                <div className="bg-blue-600 text-white font-black text-xl px-6 py-2.5 rounded-xl flex items-center justify-center shadow-md w-full lg:w-auto shrink-0 min-h-[46px]">
                  {filteredCount} days
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 border-t border-slate-200 pt-8 mt-8">
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-black h-14 px-10 rounded-xl shadow-xl shadow-blue-200 transition-all duration-200 active:scale-95 w-full sm:w-auto">
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : null}
                Save Schedule
              </Button>
              <div className="bg-slate-50 px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">
                {markedDays.length} day(s) marked
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </RouteGuard>
  );
}
