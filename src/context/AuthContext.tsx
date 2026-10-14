"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { UserDto } from "../lib/types";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isSuperAdmin: boolean;
  isSEOExecutive: boolean;
  isViewer: boolean;
  canManageProjects: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');
      const status = localStorage.getItem('seranking_auth_status');
      if (status === 'logged_in' && email) {
        return {
          id: 'user_active',
          email,
          firstName: name?.split(' ')[0] || email.split('@')[0],
          lastName: name?.split(' ').slice(1).join(' ') || '',
          fullName: name || email,
          role: 'SuperAdmin',
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          assignedProjectIds: [],
        };
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || (localStorage.getItem('seranking_auth_status') === 'logged_in' ? 'authenticated' : null);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const status = localStorage.getItem('seranking_auth_status');
      const email = localStorage.getItem('user_email');
      if (status === 'logged_in' && email) {
        return false;
      }
    }
    return true;
  });

  const refreshInflightRef = useRef<Promise<void> | null>(null);

  const refreshUser = async () => {
    if (typeof window !== 'undefined') {
      const hasCookie =
        document.cookie.includes('seranking_auth_status=logged_in') ||
        document.cookie.includes('seranking_session=') ||
        document.cookie.includes('auth_token=');
      const hasStorage =
        localStorage.getItem('seranking_auth_status') === 'logged_in' ||
        Boolean(localStorage.getItem('auth_token'));

      if (!hasCookie && !hasStorage) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
    }

    if (refreshInflightRef.current) {
      return refreshInflightRef.current;
    }

    const task = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
        const headers: Record<string, string> = {};
        if (token && token !== 'authenticated') {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          cache: "no-store",
          credentials: "include",
          headers,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const u = data.user;
            const userDto: UserDto = {
              id: u.id,
              email: u.email,
              firstName: u.name?.split(" ")[0] || u.firstName || "",
              lastName: u.name?.split(" ").slice(1).join(" ") || u.lastName || "",
              fullName: u.name || u.email,
              role:
                u.role === "OWNER" || u.role === "ADMIN" || u.role === "SUPERADMIN"
                  ? "SuperAdmin"
                  : "SEOExecutive",
              isActive: u.status === "active",
              lastLoginAt: u.lastLoginAt,
              assignedProjectIds: [],
            };
            setUser(userDto);
            setToken(data.session?.id || "authenticated");

            // Keep user profile in sync for client display
            if (typeof window !== "undefined") {
              localStorage.setItem("seranking_auth_status", "logged_in");
              localStorage.setItem("user_email", u.email);
              localStorage.setItem("user_name", u.name || u.email);
            }
            return;
          } else {
            // Server confirmed unauthenticated
            setUser(null);
            setToken(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("seranking_auth_status");
              sessionStorage.removeItem("seranking_auth_status");
              localStorage.removeItem("seranking_user");
              localStorage.removeItem("auth_token");
              localStorage.removeItem("token");
            }
            return;
          }
        }

        // If server returns error, user session has ended
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("seranking_auth_status");
          sessionStorage.removeItem("seranking_auth_status");
          localStorage.removeItem("seranking_user");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          document.cookie = "seranking_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie = "seranking_auth_status=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Network notice in refreshUser:', err);
        }
      } finally {
        setIsLoading(false);
        refreshInflightRef.current = null;
      }
    })();

    refreshInflightRef.current = task;
    return task;
  };

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      refreshUser();
    };
    window.addEventListener("seranking_auth_change", handleAuthChange);

    return () => {
      window.removeEventListener("seranking_auth_change", handleAuthChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.user) {
        const u = data.user;
        const userDto: UserDto = {
          id: u.id,
          email: u.email,
          firstName: u.name?.split(" ")[0] || "",
          lastName: u.name?.split(" ").slice(1).join(" ") || "",
          fullName: u.name || u.email,
          role:
            u.role === "OWNER" || u.role === "ADMIN" ? "SuperAdmin" : "SEOExecutive",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          assignedProjectIds: [],
        };
        setUser(userDto);
        setToken(data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem("seranking_auth_status", "logged_in");
          sessionStorage.setItem("seranking_auth_status", "logged_in");
          if (data.token) {
            localStorage.setItem("auth_token", data.token);
            document.cookie = `auth_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;
          }
          document.cookie = `seranking_auth_status=logged_in; path=/; max-age=604800; SameSite=Lax`;
          localStorage.setItem("user_email", u.email);
          localStorage.setItem("user_name", u.name || u.email);
          window.dispatchEvent(new CustomEvent("seranking_auth_change"));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setIsLoading(true);
    try {
      const cleanEmail = payload.email.trim();
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      if (data.user) {
        const u = data.user;
        const userDto: UserDto = {
          id: u.id,
          email: u.email,
          firstName: u.firstName || u.name?.split(" ")[0] || payload.firstName || "",
          lastName: u.lastName || u.name?.split(" ").slice(1).join(" ") || payload.lastName || "",
          fullName: u.name || payload.name || cleanEmail,
          role: "SuperAdmin",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          assignedProjectIds: [],
        };
        setUser(userDto);
        setToken(data.token || "authenticated");

        if (typeof window !== "undefined") {
          localStorage.removeItem("se_ranking_has_project");
          localStorage.removeItem("se_ranking_active_project_id");
          localStorage.removeItem("se_ranking_paused_projects");
          localStorage.removeItem("se_ranking_starred_projects");
          localStorage.removeItem("se_ranking_project_groups");
          localStorage.removeItem("seranking_tour_completed");

          localStorage.setItem("seranking_auth_status", "logged_in");
          sessionStorage.setItem("seranking_auth_status", "logged_in");
          if (data.token) {
            localStorage.setItem("auth_token", data.token);
            document.cookie = `auth_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;
          }
          document.cookie = `seranking_auth_status=logged_in; path=/; max-age=604800; SameSite=Lax`;
          localStorage.setItem("user_email", cleanEmail);
          localStorage.setItem("user_name", u.name || payload.name || cleanEmail.split("@")[0]);
          window.dispatchEvent(new CustomEvent("seranking_auth_change"));
        }
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);

    if (typeof document !== "undefined") {
      const cookiesToClear = [
        "seranking_session",
        "seranking_auth_status",
        "user_email",
        "user_name",
        "user_domain",
        "seranking_user",
        "se_auth_token",
        "auth_token",
        "token",
      ];
      for (const name of cookiesToClear) {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("seranking_auth_status");
      sessionStorage.removeItem("seranking_auth_status");
      localStorage.removeItem("seranking_user");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_domain");
      localStorage.removeItem("se_ranking_has_project");
      localStorage.removeItem("se_ranking_active_project_id");
      localStorage.removeItem("se_ranking_paused_projects");
      localStorage.removeItem("se_ranking_starred_projects");
      localStorage.removeItem("se_ranking_project_groups");
      localStorage.removeItem("seranking_tour_completed");
      window.dispatchEvent(new CustomEvent("seranking_auth_change"));
      window.location.href = "/";
    }
  };

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isSEOExecutive = user?.role === "SEOExecutive";
  const isViewer = user?.role === "Viewer";
  const canManageProjects = isSuperAdmin || user?.role !== "Viewer";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        isSuperAdmin,
        isSEOExecutive,
        isViewer,
        canManageProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
