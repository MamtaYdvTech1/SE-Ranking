'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        const dest = window.location.pathname + window.location.search;
        const hasAccount = Boolean(
          localStorage.getItem('user_email') ||
          localStorage.getItem('seranking_auth_status')
        );
        const targetRoute = hasAccount ? '/login' : '/signup';
        router.replace(`${targetRoute}?redirect=${encodeURIComponent(dest)}`);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="w-8 h-8 border-3 border-[#0080FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
