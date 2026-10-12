'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ComingSoonModuleProps {
  title: string;
  category: string;
  description: string;
}

export function ComingSoonModule({ title, category, description }: ComingSoonModuleProps) {
  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] flex flex-col justify-between text-gray-900 select-none">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center mb-4 border border-[#DDD6FE] shadow-2xs">
          <Sparkles className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{category}</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">{description}</p>

        <Link
          href="/research/ai-search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to AI Search Studio</span>
        </Link>
      </div>

    </div>
  );
}
