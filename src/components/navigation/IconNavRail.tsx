"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface RailItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  phase?: string;
  badge?: string;
  badgeColor?: string;
  hasDot?: boolean;
  testTitle?: string;
}

export function IconNavRail() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isProjectsActive = pathname.startsWith("/projects");

  const railItems: RailItem[] = [
    {
      name: "Projects",
      href: "/projects",
      isActive: isProjectsActive,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: "Research",
      href: "#",
      isDisabled: true,
      phase: "Phase 4",
      testTitle: "Research (Phase 4)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: "Backlinks",
      href: "#",
      isDisabled: true,
      phase: "Phase 5",
      testTitle: "Backlinks (Phase 5)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      name: "Audit",
      href: "#",
      isDisabled: true,
      phase: "Phase 3",
      testTitle: "Audit (Phase 3)",
      hasDot: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: "AI Search",
      href: "#",
      isDisabled: true,
      phase: "Phase 5",
      testTitle: "AI Search (Phase 5)",
      badge: "New",
      badgeColor: "bg-emerald-500 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: "Content",
      href: "#",
      isDisabled: true,
      phase: "Phase 4",
      testTitle: "Content (Phase 4)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      name: "Local Marketing",
      href: "#",
      isDisabled: true,
      phase: "Phase 4",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Reports",
      href: "#",
      isDisabled: true,
      phase: "Phase 4",
      testTitle: "Reports (Phase 4)",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Agency Pack",
      href: "#",
      isDisabled: true,
      phase: "Phase 5",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "API",
      href: "#",
      isDisabled: true,
      phase: "Phase 5",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "SMM",
      href: "#",
      isDisabled: true,
      phase: "Phase 5",
      badge: "-20%",
      badgeColor: "bg-pink-600 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    ...(user?.role === "SuperAdmin"
      ? [
          {
            name: "Admin",
            href: "/admin/users",
            isActive: pathname.startsWith("/admin"),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Application Rail"
      className="w-16 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 select-none z-30"
    >
      {/* Platform Logo */}
      <Link
        href="/projects"
        className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md mb-6 hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        title="Internal SEO Platform"
      >
        SEO
      </Link>

      {/* Primary Rail Items */}
      <nav className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {railItems.map((item) => {
          if (item.isDisabled) {
            return (
              <div
                key={item.name}
                className="group relative w-12 h-12 flex flex-col items-center justify-center rounded-lg text-slate-500 cursor-not-allowed hover:bg-slate-800/50"
                title={item.testTitle || `${item.name} (${item.phase})`}
                aria-disabled="true"
              >
                <div className="relative">
                  {item.icon}
                  {item.hasDot && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
                  )}
                </div>
                {item.badge ? (
                  <span className={`text-[8px] font-bold px-1 rounded mt-0.5 leading-tight ${item.badgeColor || "bg-emerald-500 text-white"}`}>
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-[9px] font-medium tracking-tighter mt-0.5 opacity-60">
                    {item.name}
                  </span>
                )}
                {/* Floating Tooltip */}
                <div className="absolute left-16 hidden group-hover:block z-50 bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none border border-slate-700">
                  {item.name} <span className="text-slate-400">({item.phase})</span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg transition group relative ${
                item.isActive
                  ? "bg-slate-800 text-blue-400 font-semibold shadow-inner"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
              title={item.name}
            >
              {item.icon}
              <span className="text-[9px] font-medium tracking-tighter mt-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Avatar Footer */}
      <div className="pt-4 border-t border-slate-800 w-full flex flex-col items-center relative">
        <Link
          href="/profile"
          className="relative w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center hover:border-blue-500 transition shadow"
          title={`My Profile (${user?.fullName || "User"})`}
        >
          {user ? (user.firstName || user.lastName ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` : user.fullName ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "GV") : "GV"}
          <span className="absolute -bottom-1 -right-1 bg-slate-700 text-slate-200 text-[9px] font-bold px-1 rounded-full border border-slate-900 leading-tight">
            0
          </span>
        </Link>
      </div>
    </aside>
  );
}
