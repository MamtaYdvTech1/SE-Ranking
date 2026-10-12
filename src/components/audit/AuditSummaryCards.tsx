"use client";

import React from "react";
import { Card, CardContent } from "@internal-seo/ui";
import { AuditOverviewDto } from "../../lib/types";

interface AuditSummaryCardsProps {
  overview: AuditOverviewDto;
}

export function AuditSummaryCards({ overview }: AuditSummaryCardsProps) {
  const healthScore = overview.healthScore !== null && overview.healthScore !== undefined
    ? Number(overview.healthScore)
    : null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-400";
    if (score >= 85) return "text-emerald-600";
    if (score >= 65) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* Health Score Card */}
      <Card className="col-span-2 md:col-span-1 shadow-xs border-slate-200">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Health Score</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              0-100
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${getScoreColor(healthScore)}`}>
              {healthScore !== null ? Math.round(healthScore) : "—"}
            </span>
            {healthScore !== null && (
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            )}
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                healthScore === null
                  ? "bg-slate-300"
                  : healthScore >= 85
                  ? "bg-emerald-500"
                  : healthScore >= 65
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${healthScore ?? 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages Crawled Card */}
      <Card className="shadow-xs border-slate-200">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pages Crawled</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {overview.urlsCrawled.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Discovered internal pages
          </div>
        </CardContent>
      </Card>

      {/* Errors Count */}
      <Card className="shadow-xs border-red-100 bg-gradient-to-b from-red-50/20 to-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs font-medium text-red-700">
            <span>Errors</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-red-600 tracking-tight">
              {overview.errorsCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-600/80 font-medium">
            High priority fixes required
          </div>
        </CardContent>
      </Card>

      {/* Warnings Count */}
      <Card className="shadow-xs border-amber-100 bg-gradient-to-b from-amber-50/20 to-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700">
            <span>Warnings</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 tracking-tight">
              {overview.warningsCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600/80 font-medium">
            Medium priority optimizations
          </div>
        </CardContent>
      </Card>

      {/* Notices Count */}
      <Card className="shadow-xs border-blue-100 bg-gradient-to-b from-blue-50/20 to-white">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs font-medium text-blue-700">
            <span>Notices</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-600 tracking-tight">
              {overview.noticesCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600/80 font-medium">
            Low priority informational
          </div>
        </CardContent>
      </Card>
    </div>
  );
}