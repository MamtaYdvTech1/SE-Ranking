'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const emptySubscribe = () => () => {};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
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
        <div className="w-8 h-8 border-3 border-[#0080FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
