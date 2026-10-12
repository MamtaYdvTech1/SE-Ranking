'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { BusBicycleImageSelector } from '@/components/verification/BusBicycleImageSelector';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export default function VerificationChallengePage() {
  const [activeCategory, setActiveCategory] = useState<'bicycle' | 'bus'>('bicycle');
  const [passed, setPassed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#7C3AED] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <SeRankingLogo />
      </header>

      <main className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center gap-6 my-auto">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Visual Object Verification
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real photograph selection component with genuine bus and bicycle photography from Unsplash.
          </p>

          {/* Toggle between Bus and Bicycle challenge */}
          <div className="inline-flex p-1 bg-gray-200/70 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('bicycle');
                setPassed(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'bicycle'
                  ? 'bg-white text-[#7C3AED] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Target: Bicycles
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('bus');
                setPassed(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'bus'
                  ? 'bg-white text-[#7C3AED] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Target: Buses
            </button>
          </div>
        </div>

        {/* The Real Bus & Bicycle Image Selector */}
        <BusBicycleImageSelector
          key={activeCategory}
          targetCategory={activeCategory}
          onSelectionChange={(selected, isCorrect) => {
            setPassed(isCorrect);
          }}
        />

        {passed && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center max-w-md animate-in fade-in duration-200">
            <strong>Verification Succeeded:</strong> Visual challenge completed with authentic photograph selection state.
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        SE Ranking Security &bull; Real Photograph Selection &bull; Production Ready
      </footer>
    </div>
  );
}
