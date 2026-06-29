"use client";

import { useState } from "react";
import { useAuth, RouteGuard } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Settings, ShieldCheck, KeyRound, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/auth/vendor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user?.email, 
          currentPassword, 
          newPassword 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to update password");
        setIsSaving(false);
        return;
      }
      
      toast.success("Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("An error occurred while updating your password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RouteGuard requireAuth>
      <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Account Settings</h1>
              <p className="text-slate-300 mt-1">Manage your security and account preferences.</p>
            </div>
          </div>
          
          <div className="p-8 flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 w-full max-w-2xl">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-inner">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                </div>
                
                {user?.type === "trainer" ? (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Passwordless Security Active</h3>
                    <p className="text-blue-700/80 max-w-md mx-auto">
                      As a Trainer, you authenticate securely using One-Time Passwords (OTP) sent directly to your phone or email. You do not need to manage a password!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current" className="text-slate-700 font-bold">Current Password</Label>
                      <PasswordInput 
                        id="current" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                        placeholder="Enter your current password" 
                        required 
                        className="bg-white h-12"
                      />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="new" className="text-slate-700 font-bold">New Password</Label>
                      <PasswordInput 
                        id="new" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="Enter new password" 
                        required 
                        className="bg-white h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-slate-700 font-bold">Confirm New Password</Label>
                      <PasswordInput 
                        id="confirm" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm new password" 
                        required 
                        className="bg-white h-12"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSaving || !currentPassword || !newPassword || !confirmPassword} 
                      className="w-full sm:w-auto mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 px-10 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                      Update Password
                    </Button>
                  </form>
                )}
              </div>
            </div>
            
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Password Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-sm text-blue-700 font-medium">
                  <li>Must be at least <strong>8 characters</strong> long.</li>
                  <li>We recommend containing at least one uppercase letter.</li>
                  <li>We recommend containing at least one number or special character.</li>
                  <li>Do not use common dictionary words or easily guessable phrases.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
