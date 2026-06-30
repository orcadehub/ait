"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Trainer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  completionPercentage?: number;
}

export default function ManageTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTrainers = async () => {
    try {
      const res = await fetch("/api/admin/trainers");
      if (!res.ok) throw new Error("Failed to load trainers");
      const data = await res.json();
      setTrainers(data.trainers);
    } catch (err) {
      toast.error("Failed to load trainers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/trainers/${id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        `Trainer successfully ${!currentStatus ? "blocked" : "unblocked"}`
      );
      setTrainers(prev =>
        prev.map(t => (t._id === id ? { ...t, isBlocked: !currentStatus } : t))
      );
    } catch (err) {
      toast.error("Failed to update block status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <RouteGuard requireAuth>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Back button & Title */}
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/admin" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium text-sm w-fit transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trainers Directory</h1>
            <p className="text-slate-500">Audit and control access for all registered trainers.</p>
          </div>

          <Card className="shadow-lg border-slate-100">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Registered Trainers</CardTitle>
              <CardDescription>Click block/unblock to manage account status.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : trainers.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No trainers registered yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-700 font-bold text-sm">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Profile Progress</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trainers.map(trainer => (
                        <tr key={trainer._id} className="text-slate-600 hover:bg-slate-50/55 transition-colors text-sm">
                          <td className="p-4 font-semibold text-slate-800">{trainer.fullName}</td>
                          <td className="p-4">{trainer.email}</td>
                          <td className="p-4">{trainer.phone || "N/A"}</td>
                          <td className="p-4 font-bold text-blue-600">
                            {trainer.completionPercentage !== undefined ? `${trainer.completionPercentage}%` : "0%"}
                          </td>
                          <td className="p-4">
                            {trainer.isBlocked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                <ShieldAlert className="w-3 h-3" /> Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                <ShieldCheck className="w-3 h-3" /> Active
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant={trainer.isBlocked ? "outline" : "destructive"}
                              size="sm"
                              className="h-8 font-bold text-xs rounded-lg cursor-pointer transition-all"
                              disabled={togglingId === trainer._id}
                              onClick={() => handleToggleBlock(trainer._id, trainer.isBlocked)}
                            >
                              {togglingId === trainer._id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              {trainer.isBlocked ? "Unblock Access" : "Block Access"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </RouteGuard>
  );
}
