"use client";

import React from "react";
import { CrawlRunDto } from "../../lib/types";

interface CrawlProgressBannerProps {
  activeRun: CrawlRunDto;
}

export function CrawlProgressBanner({ activeRun }: CrawlProgressBannerProps) {
  const isQueued = activeRun.status === "Queued";
  const isEvaluating = activeRun.status === "Evaluating";

  const percent = activeRun.urlsDiscovered > 0
    ? Math.min(100, Math.round((activeRun.urlsCrawled / activeRun.urlsDiscovered) * 100))
    : 10;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">
              {isQueued
                ? "Crawl Job Queued in Background Worker..."
                : isEvaluating
                ? "Evaluating SEO Audit Rules & Compiling Evidence..."
                : "Crawl in Progress: Fetching and Analyzing Internal Pages..."}
            </h4>
            <p className="text-xs text-blue-700 mt-0.5">
              {isQueued
                ? "Hangfire worker host has picked up the job and is preparing HTTP client."
                : `Crawled ${activeRun.urlsCrawled} of ${Math.max(activeRun.urlsDiscovered, activeRun.urlsCrawled)} discovered URLs.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono font-bold text-blue-800">
            {isQueued ? "Queued" : `${percent}%`}
          </span>
        </div>
      </div>

      <div className="mt-3.5 w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${isQueued ? 5 : percent}%` }}
        />
      </div>
    </div>
  );
}