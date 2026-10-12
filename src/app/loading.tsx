'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#F4F6F9] select-none p-6">
      {/* Exact SE Ranking Circular Loader matching screenshot 3 and inspect code */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg
          className="w-16 h-16 animate-spin"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="35"
            stroke="#AAB1B9"
            strokeWidth="8"
            strokeDasharray="164.93 56.97"
            strokeLinecap="round"
          />
        </svg>

        <span className="text-xs font-semibold text-gray-400 tracking-wide">
          Data loading...
        </span>
      </div>
    </div>
  );
}
