'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <>
      <footer
        className={`border-t border-gray-200 bg-white py-3.5 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto w-full select-none shrink-0 z-20 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Link href="/admin.dashboard.html" className="hover:opacity-90 flex items-center">
            <SeRankingLogo variant="brand" width={110} height={25} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-xs text-gray-500">
          <button
            type="button"
            onClick={() => setIsBugModalOpen(true)}
            className="hover:text-[#7C3AED] transition-colors cursor-pointer text-gray-600 font-semibold"
          >
            Report a bug
          </button>
          <a
            href="https://seranking.com/affiliate.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            Affiliates
          </a>
          <a
            href="https://seranking.com/api.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            API
          </a>
          <a
            href="https://seranking.com/whats-new.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            What&apos;s new
          </a>
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            Help
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span>&copy; {new Date().getFullYear()} SE Ranking</span>
        </div>
      </footer>

      {/* Interactive Report a Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </>
  );
}
