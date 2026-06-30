"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Mail } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back, Administrator!");
      login(data.user);
      router.push("/dashboard/admin");
    } catch (error) {
      toast.error("An error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border border-slate-750 bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-blue-500 to-green-500" />
        <CardHeader className="space-y-1 pb-6 pt-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/30">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-100">Admin Control Panel</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Enter administrative credentials to log in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 text-slate-200">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-9 h-11 bg-slate-800 border-slate-700 text-white placeholder-slate-550 focus:ring-red-500 focus:border-red-500"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="password" className="text-slate-300">Admin Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-550 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2 pb-8">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base rounded-xl shadow-lg shadow-red-900/20 cursor-pointer transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Access Control"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
