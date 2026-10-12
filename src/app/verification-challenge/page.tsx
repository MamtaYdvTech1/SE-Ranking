'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Bike, Car, Bus } from 'lucide-react';
import { BusBicycleImageSelector, VehicleCategoryTarget } from '@/components/verification/BusBicycleImageSelector';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export default function VerificationChallengePage() {
  const [activeCategory, setActiveCategory] = useState<VehicleCategoryTarget>('bicycle');
  const [passed, setPassed] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const categories: { key: VehicleCategoryTarget; label: string; icon: React.ReactNode }[] = [
    { key: 'bicycle', label: 'Cycles / Bicycles', icon: <Bike className="w-4 h-4" /> },
    { key: 'bike', label: 'Bikes / Motorcycles', icon: <Bike className="w-4 h-4" /> },
    { key: 'car', label: 'Cars', icon: <Car className="w-4 h-4" /> },
    { key: 'bus', label: 'Buses', icon: <Bus className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/signup" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#7C3AED] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign Up</span>
        </Link>
        <SeRankingLogo />
      </header>

      <main className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center gap-6 my-auto">
        <div className="text-center max-w-xl">
          <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Visual Vehicle Challenge
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Human security verification using authentic photography of cycles, bikes, cars, and buses from Unsplash.
          </p>

          {/* Toggle between Cycle, Bike, Car, and Bus challenge */}
          <div className="inline-flex flex-wrap items-center justify-center p-1 bg-gray-200/70 rounded-xl mt-4 gap-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key);
                  setPassed(false);
                  setToken(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-white text-[#7C3AED] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The Real Bus, Bicycle, Car & Bike Image Selector */}
        <BusBicycleImageSelector
          key={activeCategory}
          targetCategory={activeCategory}
          onSelectionChange={(selected, isCorrect, generatedToken) => {
            setPassed(isCorrect);
            if (isCorrect && generatedToken) {
              setToken(generatedToken);
            }
          }}
        />

        {passed && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center max-w-md animate-in fade-in duration-200 space-y-1">
            <div className="font-bold text-emerald-900">
              Security Verification Passed!
            </div>
            <p className="text-[11px] text-emerald-700">
              All {activeCategory} photographs accurately identified.
            </p>
            {token && (
              <div className="text-[10px] text-emerald-600 font-mono break-all pt-1">
                Token: {token}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        SE Ranking Security &bull; Visual Object Verification &bull; Production Ready
      </footer>
    </div>
  );
}
