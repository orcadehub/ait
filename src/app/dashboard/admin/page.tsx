"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, FileText, Users, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Stats {
  totalTrainers: number;
  totalVendors: number;
  totalRequirements: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTrainers: 0,
    totalVendors: 0,
    totalRequirements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to load stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <RouteGuard requireAuth>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Overview of platform activity and user management.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Trainers</CardTitle>
                <GraduationCap className="h-6 w-6 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">
                  {isLoading ? "..." : stats.totalTrainers}
                </div>
                <p className="text-xs text-slate-400 mt-1">Registered trainers nationwide</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Vendors</CardTitle>
                <Building2 className="h-6 w-6 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">
                  {isLoading ? "..." : stats.totalVendors}
                </div>
                <p className="text-xs text-slate-400 mt-1">Registered partner businesses</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Requirements</CardTitle>
                <FileText className="h-6 w-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">
                  {isLoading ? "..." : stats.totalRequirements}
                </div>
                <p className="text-xs text-slate-400 mt-1">Active and completed postings</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="shadow-md hover:shadow-lg transition-all border-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 font-extrabold text-xl">
                  <Users className="w-5 h-5 text-orange-500" />
                  Manage Trainers
                </CardTitle>
                <CardDescription>
                  View, audit, block, or unblock trainers registered on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/dashboard/admin/trainers">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 cursor-pointer">
                    Go to Trainers Directory <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all border-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 font-extrabold text-xl">
                  <Users className="w-5 h-5 text-green-500" />
                  Manage Vendors
                </CardTitle>
                <CardDescription>
                  Audit vendor details and control access to requirement posting tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/dashboard/admin/vendors">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 cursor-pointer">
                    Go to Vendors Directory <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
