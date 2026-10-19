'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CommandPalette } from '@/components/admin/ui/CommandPalette';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ToastProvider } from '@/components/admin/ui/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dedicated admin auth pages render in full-screen standalone layout
  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/signup' ||
    pathname === '/admin/invite';

  if (isAuthPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
          {children}
        </div>
      </ToastProvider>
    );
  }

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  // Check role: Only OWNER, ADMIN, SUPERADMIN are allowed in /admin
  const role = (user?.role || '').toUpperCase();
  const isAuthorized = role === 'OWNER' || role === 'ADMIN' || role === 'SUPERADMIN';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Super Admin Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Super Admin Panel is strictly reserved for Platform Administrators and Owners. Your current account ({user?.email || 'Guest'}) has the <span className="font-semibold text-amber-400 uppercase">{user?.role || 'CLIENT'}</span> role.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/admin/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Client Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-150">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Mobile Drawer Backdrop */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-200 ease-in-out ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            onOpenCommandPalette={() => setIsPaletteOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      </div>
    </ToastProvider>
  );
}
