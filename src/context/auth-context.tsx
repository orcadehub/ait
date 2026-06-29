"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
  id?: string;
  name: string;
  email: string;
  type: "trainer" | "vendor";
  onboardingComplete: boolean;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfileStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  completeOnboarding: () => {},
  updateProfileStatus: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount and sync with DB
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ait_user");
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        // Background sync to ensure profileComplete status is accurate
        const fetchStatus = async () => {
          try {
            const endpoint = parsedUser.type === "vendor" 
              ? `/api/vendor/profile?email=${encodeURIComponent(parsedUser.email)}` 
              : `/api/trainer/profile?email=${encodeURIComponent(parsedUser.email)}`;
            
            const res = await fetch(endpoint);
            if (res.ok) {
              const data = await res.json();
              if (data.profile && data.profile.profileComplete !== parsedUser.profileComplete) {
                const updated = { ...parsedUser, profileComplete: data.profile.profileComplete };
                setUser(updated);
                localStorage.setItem("ait_user", JSON.stringify(updated));
              }
            }
          } catch (e) {
            console.error("Auth context sync error:", e);
          }
        };
        fetchStatus();
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("ait_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ait_user");
  };

  const completeOnboarding = () => {
    if (user) {
      const updated = { ...user, onboardingComplete: true };
      setUser(updated);
      localStorage.setItem("ait_user", JSON.stringify(updated));
    }
  };

  const updateProfileStatus = (status: boolean) => {
    if (user) {
      const updated = { ...user, profileComplete: status };
      setUser(updated);
      localStorage.setItem("ait_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, completeOnboarding, updateProfileStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Route guard component
export function RouteGuard({ children, requireAuth = false, requireOnboarding = false, requireProfileComplete = false }: {
  children: ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requireProfileComplete?: boolean;
}) {
  const { user, isLoading, updateProfileStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      router.replace("/");
      return;
    }

    if (requireAuth && user && !user.onboardingComplete && requireOnboarding) {
      // Redirect to onboarding if not complete
      const onboardingPath = `/onboarding/${user.type}`;
      if (pathname !== onboardingPath) {
        router.replace(onboardingPath);
      }
      return;
    }

    if (requireAuth && user && requireProfileComplete) {
      const dashboardPath = `/dashboard/${user.type}`;
      
      // If they are not on the dashboard or settings, verify their profile is TRULY complete
      if (pathname !== dashboardPath && pathname !== "/settings") {
        
        // Instant local check first
        if (!user.profileComplete) {
          toast.error("Complete your profile first");
          router.replace(dashboardPath);
          return;
        }

        // Deep server check every time they navigate to a protected route
        const endpoint = user.type === "vendor" 
          ? `/api/vendor/profile?email=${encodeURIComponent(user.email)}` 
          : `/api/trainer/profile?email=${encodeURIComponent(user.email)}`;
          
        fetch(endpoint)
          .then(res => res.json())
          .then(data => {
            if (data.profile && !data.profile.profileComplete) {
              updateProfileStatus(false);
              toast.error("Complete your profile first");
              router.replace(dashboardPath);
            }
          })
          .catch(e => console.error("RouteGuard deep check failed", e));
      }
    }
  }, [user, isLoading, requireAuth, requireOnboarding, requireProfileComplete, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-white to-green-600 animate-pulse" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) return null;
  if (requireAuth && requireOnboarding && user && !user.onboardingComplete) {
    const onboardingPath = `/onboarding/${user.type}`;
    if (pathname !== onboardingPath) return null;
  }
  if (requireAuth && requireProfileComplete && user && !user.profileComplete) {
    const dashboardPath = `/dashboard/${user.type}`;
    if (pathname !== dashboardPath && pathname !== "/settings") return null;
  }

  return <>{children}</>;
}
