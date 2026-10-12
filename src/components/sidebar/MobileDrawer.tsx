'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { LeftRail } from './LeftRail';
import { SecondarySidebar } from './SecondarySidebar';

export function MobileDrawer() {
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useApp();

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setIsMobileDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative flex z-50 h-full shadow-2xl">
        <LeftRail />
        <React.Suspense fallback={null}>
          <SecondarySidebar />
        </React.Suspense>

        <button
          onClick={() => setIsMobileDrawerOpen(false)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
