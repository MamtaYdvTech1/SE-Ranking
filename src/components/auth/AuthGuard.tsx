'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { Clock, ShieldAlert, LogOut } from 'lucide-react';

const emptySubscribe = () => () => {};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      if (typeof window !== 'undefined') {
        const dest = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
      }
    }
  }, [isMounted, user, isLoading, router]);

  if (!isMounted || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Strict Status Verification: Only active or approved accounts can view the dashboard
  const userStatus = (user.status || '').toLowerCase();
  const isApproved = userStatus === 'active' || userStatus === 'approved';

  if (!isApproved) {
    const isPending = userStatus === 'pending';
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a12] p-6 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            isPending ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {isPending ? <Clock className="w-8 h-8 animate-pulse" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isPending ? 'Account Pending Admin Approval' : 'Account Access Restricted'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isPending
                ? 'Your registration has been submitted. Platform access is strictly restricted until a Platform Administrator reviews your account and assigns projects to your workspace. Direct dashboard access is not permitted.'
                : `Your account is currently ${userStatus}. Please contact your platform administrator.`}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-950/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
