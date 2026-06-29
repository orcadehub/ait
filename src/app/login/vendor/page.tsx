"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-hot-toast";

export default function VendorLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/vendor/login", {
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
      
      toast.success("Successfully logged in!");
      login(data.user);
      router.push("/dashboard/vendor");
    } catch (error) {
      toast.error("An error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border border-green-100 rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-white to-green-500" />
        <CardHeader className="space-y-1 pb-6 pt-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900">Vendor Login</CardTitle>
          <CardDescription className="text-base">
            Manage your training requirements and find expert trainers.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="hr@acmecorp.com" className="pl-9 h-11" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="password">Password</Label>
              <PasswordInput 
                id="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2 pb-8">
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base rounded-xl shadow-lg shadow-green-200 cursor-pointer" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup/vendor" className="text-green-600 font-semibold hover:underline">
                Register company
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
