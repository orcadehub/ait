"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Vendor {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  location?: string;
  isBlocked: boolean;
}

export default function ManageVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      if (!res.ok) throw new Error("Failed to load vendors");
      const data = await res.json();
      setVendors(data.vendors);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        `Vendor successfully ${!currentStatus ? "blocked" : "unblocked"}`
      );
      setVendors(prev =>
        prev.map(v => (v._id === id ? { ...v, isBlocked: !currentStatus } : v))
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendors Directory</h1>
            <p className="text-slate-500">Audit and control access for all registered partner vendors.</p>
          </div>

          <Card className="shadow-lg border-slate-100">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Registered Vendors</CardTitle>
              <CardDescription>Click block/unblock to manage account status.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : vendors.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No vendors registered yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-700 font-bold text-sm">
                        <th className="p-4">Company Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendors.map(vendor => (
                        <tr key={vendor._id} className="text-slate-600 hover:bg-slate-50/55 transition-colors text-sm">
                          <td className="p-4 font-semibold text-slate-800">{vendor.companyName}</td>
                          <td className="p-4">{vendor.email}</td>
                          <td className="p-4">{vendor.phone || "N/A"}</td>
                          <td className="p-4">{vendor.location || "N/A"}</td>
                          <td className="p-4">
                            {vendor.isBlocked ? (
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
                              variant={vendor.isBlocked ? "outline" : "destructive"}
                              size="sm"
                              className="h-8 font-bold text-xs rounded-lg cursor-pointer transition-all"
                              disabled={togglingId === vendor._id}
                              onClick={() => handleToggleBlock(vendor._id, vendor.isBlocked)}
                            >
                              {togglingId === vendor._id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              {vendor.isBlocked ? "Unblock Access" : "Block Access"}
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
