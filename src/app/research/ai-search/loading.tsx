import React from 'react';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center p-12 bg-[#F7F9FC]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0B69FF]/20 border-t-[#0B69FF] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-600">Loading AI Search data...</span>
      </div>
    </div>
  );
}
