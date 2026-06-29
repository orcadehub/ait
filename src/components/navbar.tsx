"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { GraduationCap, Building2, Calendar, FileText, LayoutDashboard, Settings, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleRestrictedNav = (e: React.MouseEvent) => {
    if (user?.type === "trainer" && !user.profileComplete) {
      e.preventDefault();
      toast.error("Please complete your profile to 100% first!");
    }
  };

  const handleRestrictedPush = (path: string) => {
    if (user?.type === "trainer" && !user.profileComplete) {
      toast.error("Please complete your profile to 100% first!");
    } else {
      router.push(path);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow border-2 border-white">
              <span className="text-lg sm:text-xl font-black text-blue-900">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                All India <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-700 to-green-600">Trainings</span>
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase hidden sm:block">
                Connecting Trainers & Vendors Nationwide
              </span>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && user ? (
              // Authenticated View
              <>
                <Link href={`/dashboard/${user.type}`}>
                  <Button variant="ghost" className={`hidden sm:flex transition-colors ${pathname === `/dashboard/${user.type}` ? "text-orange-600 bg-orange-50 font-bold shadow-sm" : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                {user.type === "vendor" ? (
                  <Link href="/dashboard/vendor/requirements">
                    <Button variant="ghost" className={`hidden md:flex transition-colors ${pathname === `/dashboard/vendor/requirements` ? "text-green-600 bg-green-50 font-bold shadow-sm" : "text-slate-600 hover:text-green-600 hover:bg-green-50"}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      My Requirements
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/trainer/requirements" onClick={handleRestrictedNav}>
                    <Button variant="ghost" className={`hidden md:flex transition-colors ${pathname === `/dashboard/trainer/requirements` ? "text-orange-600 bg-orange-50 font-bold shadow-sm" : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Requirements
                    </Button>
                  </Link>
                )}
                
                {user.type === "trainer" && (
                  <Link href={`/dashboard/${user.type}/calendar`} onClick={handleRestrictedNav}>
                    <Button variant="ghost" className={`hidden md:flex transition-colors ${pathname === `/dashboard/${user.type}/calendar` ? "text-blue-600 bg-blue-50 font-bold shadow-sm" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendar
                    </Button>
                  </Link>
                )}

                <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-2 ring-slate-100 hover:ring-orange-200 transition-all cursor-pointer p-0 overflow-hidden outline-none">
                    <Avatar className="h-full w-full">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-100 to-green-100 text-slate-700 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          <span className="mt-1 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 w-fit capitalize">
                            {user.type}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/${user.type}`)} className={`cursor-pointer font-bold py-2.5 ${pathname === `/dashboard/${user.type}` ? "text-orange-600 bg-orange-50" : "text-slate-700 hover:text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-600"}`}>
                      <div className="flex items-center w-full">
                        <LayoutDashboard className="mr-3 h-4 w-4 shrink-0" />
                        <span>Dashboard</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRestrictedPush(`/dashboard/${user.type}/requirements`)} className={`cursor-pointer md:hidden font-bold py-2.5 ${pathname === `/dashboard/${user.type}/requirements` ? "text-orange-600 bg-orange-50" : "text-slate-700 hover:text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-600"}`}>
                      <div className="flex items-center w-full">
                        <FileText className="mr-3 h-4 w-4 shrink-0" />
                        <span>Requirements</span>
                      </div>
                    </DropdownMenuItem>
                    {user.type === "trainer" && (
                      <DropdownMenuItem onClick={() => handleRestrictedPush(`/dashboard/${user.type}/calendar`)} className={`cursor-pointer md:hidden font-bold py-2.5 ${pathname === `/dashboard/${user.type}/calendar` ? "text-blue-600 bg-blue-50" : "text-slate-700 hover:text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-600"}`}>
                        <div className="flex items-center w-full">
                          <Calendar className="mr-3 h-4 w-4 shrink-0" />
                          <span>Calendar</span>
                        </div>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push("/settings")} className={`cursor-pointer font-bold py-2.5 ${pathname === "/settings" ? "text-orange-600 bg-orange-50" : "text-slate-700 hover:text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-600"}`}>
                      <div className="flex items-center w-full">
                        <Settings className="mr-3 h-4 w-4 shrink-0" />
                        <span>Settings</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-bold text-red-600 focus:text-red-700 focus:bg-red-50 py-2.5 whitespace-nowrap">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Public View
              <>
                <Link href="/login/trainer">
                  <Button 
                    variant="outline" 
                    className="border-2 border-orange-400 text-orange-700 hover:bg-orange-50 hover:border-orange-500 font-semibold px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-base transition-all duration-200 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 mr-1.5 hidden sm:inline-block" /> Trainer
                  </Button>
                </Link>
                <Link href="/login/vendor">
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-base shadow-lg shadow-green-200 transition-all duration-200 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 mr-1.5 hidden sm:inline-block" /> Vendor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Tricolor stripe at bottom */}
      <div className="flex h-[3px]">
        <div className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
        <div className="flex-1 bg-gradient-to-r from-white to-blue-100"></div>
        <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600"></div>
      </div>
    </nav>
  );
}
