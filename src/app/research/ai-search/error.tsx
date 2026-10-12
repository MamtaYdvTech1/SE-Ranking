'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AI Search route error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F9FC]">
      <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm max-w-md w-full text-center space-y-3">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Analysis Error</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {error.message || 'Unable to retrieve SEO data. Please check your network or API credentials.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B69FF] text-white rounded-lg text-xs font-semibold hover:bg-[#005FE0] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
