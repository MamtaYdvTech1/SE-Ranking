"use client";

import React from "react";
import { Badge, Button } from "@internal-seo/ui";
import { CrawlRunDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";

interface AuditHeaderProps {
  primaryDomain: string;
  protocol: string;
  lastCrawlRun?: CrawlRunDto | null;
  isCrawling: boolean;
  canTriggerCrawl: boolean;
  onTriggerCrawl: () => void;
  onOpenSettings: () => void;
}

export function AuditHeader({
  primaryDomain,
  protocol,
  lastCrawlRun,
  isCrawling,
  canTriggerCrawl,
  onTriggerCrawl,
  onOpenSettings,
}: AuditHeaderProps) {
  const getStatusBadge = () => {
    if (isCrawling) {
      return (
        <Badge variant="info" className="flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          {lastCrawlRun?.status || "Crawling"}...
        </Badge>
      );
    }

    if (!lastCrawlRun) {
      return <Badge variant="outline">No Crawls Yet</Badge>;
    }

    switch (lastCrawlRun.status) {
      case "Completed":
        return <Badge variant="success">Audit Complete</Badge>;
      case "Failed":
        return <Badge variant="danger">Crawl Failed</Badge>;
      case "Cancelled":
        return <Badge variant="warning">Cancelled</Badge>;
      default:
        return <Badge variant="default">{lastCrawlRun.status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technical Site Audit</h1>
            {getStatusBadge()}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
            <span className="font-mono text-slate-700 font-medium">
              {protocol}{primaryDomain}
            </span>
            <span>•</span>
            <span>
              {lastCrawlRun?.completedAt
                ? `Last completed ${formatDate(lastCrawlRun.completedAt)}`
                : lastCrawlRun?.startedAt
                ? `Started ${formatDate(lastCrawlRun.startedAt)}`
                : "No completed audit runs"}
            </span>
            {lastCrawlRun?.triggerSource && (
              <>
                <span>•</span>
                <span className="capitalize">{lastCrawlRun.triggerSource} Trigger</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Crawl Settings</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={isCrawling || !canTriggerCrawl}
            onClick={onTriggerCrawl}
            className="flex items-center gap-1.5 shadow-sm"
          >
            {isCrawling ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Crawling Website...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start New Crawl</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}