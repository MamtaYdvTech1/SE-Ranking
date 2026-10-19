"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/clientAuth";

export interface SerpResult {
  position: number;
  url: string;
  domain: string;
}

export interface SerpDomainRow {
  domain: string;
  isTarget: boolean;
  keywordsInTop10: number;
  keywordsInTop20: number;
  averagePosition: number | null;
  visibility: number;
  shareOfVoice: number;
  estimatedTraffic: number;
  bestPosition: number | null;
  sharedKeywords: number;
}

export interface SerpLandscape {
  targetDomain: string;
  queriesAnalyzed: number;
  lastCheckedAt: string | null;
  domains: SerpDomainRow[];
  keywords: Array<{
    keywordId: string;
    keyword: string;
    searchVolume: number;
    group: string;
    tags: string[];
    checkedAt: string;
    results: SerpResult[];
  }>;
  snapshots: Array<{ date: string; checkedAt: string; keywords: Record<string, SerpResult[]> }>;
}

export interface SerpEntry {
  rank: number;
  domain: string;
  url: string;
  change?: number;
  snippet?: string;
}

const EMPTY: SerpLandscape = {
  targetDomain: "",
  queriesAnalyzed: 0,
  lastCheckedAt: null,
  domains: [],
  keywords: [],
  snapshots: [],
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Parses "OCT-15 2026" (or any Date-parsable string) to YYYY-MM-DD. */
function toIsoDay(label: string): string | null {
  const m = label.trim().toUpperCase().match(/^([A-Z]{3})-(\d{1,2})\s+(\d{4})$/);
  if (m) {
    const month = MONTHS.indexOf(m[1]);
    if (month >= 0) return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  const d = new Date(label);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** SERP snapshots saved by rank checks for a project. */
export function useSerpLandscape(projectId?: string, days = 90) {
  const [data, setData] = useState<SerpLandscape>(EMPTY);
  const [loading, setLoading] = useState<boolean>(Boolean(projectId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    authFetch(`/api/projects/${encodeURIComponent(projectId)}/competitors/serp?days=${days}`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error?.message || json?.error || "Failed to load SERP data");
        if (active) {
          setData({ ...EMPTY, ...json });
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load SERP data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, days]);

  /** Results for a keyword from the latest snapshot on or before the given day, with change vs the prior snapshot. */
  const resultsFor = useCallback(
    (keyword: string, dateLabel: string): SerpEntry[] => {
      const day = toIsoDay(dateLabel);
      if (!day) return [];
      const eligible = data.snapshots.filter((s) => s.date <= day && s.keywords[keyword]);
      const current = eligible[eligible.length - 1];
      if (!current) return [];
      const prior = eligible[eligible.length - 2];
      const priorPos = new Map((prior?.keywords[keyword] || []).map((r) => [r.url, r.position]));
      return current.keywords[keyword].map((r) => {
        const before = priorPos.get(r.url);
        return {
          rank: r.position,
          domain: r.domain,
          url: r.url,
          change: before != null ? before - r.position : 0,
          snippet: "",
        };
      });
    },
    [data.snapshots]
  );

  return { data, loading, error, resultsFor };
}
