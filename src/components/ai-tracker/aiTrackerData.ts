"use client";

import { useEffect, useState } from "react";

/** Stored AI check (GET /api/projects/[id]/ai-search). */
export interface AiCheckRecord {
  id: string;
  query: string;
  engine: string;
  mentioned: boolean;
  citedUrl: string | null;
  citationPosition: number | null;
  checkedAt: string;
}

/** Aggregates from GET /api/projects/[id]/ai-search/insights. */
export interface AiTrackerInsights {
  domain: string;
  totalAnswers: number;
  competitors: Array<{ domain: string; isOwn: boolean; answers: number; prompts: number; engines: string[]; shareOfVoice: number }>;
  sources: Array<{ url: string; domain: string; isOwn: boolean; citations: number; prompts: number; engines: string[]; lastSeen: string }>;
  answers: Array<{ id: string; prompt: string; engine: string; mention: boolean; link: boolean; status: string; answer: string | null; answeredAt: string; sourcesCount?: number; sources?: Array<{ url: string; domain: string }>; competitors?: string[] }>;
}

const EMPTY_INSIGHTS: AiTrackerInsights = { domain: "", totalAnswers: 0, competitors: [], sources: [], answers: [] };

/** Loads stored AI checks and aggregated insights for a project. */
export function useAiTrackerData(projectId?: string) {
  const [records, setRecords] = useState<AiCheckRecord[]>([]);
  const [insights, setInsights] = useState<AiTrackerInsights>(EMPTY_INSIGHTS);
  const [loading, setLoading] = useState<boolean>(Boolean(projectId));

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    const base = `/api/projects/${encodeURIComponent(projectId)}/ai-search`;
    Promise.all([
      fetch(base).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}/insights`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([rec, ins]) => {
        if (!active) return;
        setRecords(Array.isArray(rec?.records) ? rec.records : []);
        if (ins?.success) setInsights({ ...EMPTY_INSIGHTS, ...ins });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  return { records, insights, loading };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-09-21" -> "Sep-21 2026" (the table's column label format). */
export function columnLabel(day: string): string {
  const [y, m, d] = day.split("-");
  return `${MONTHS[Number(m) - 1]}-${d} ${y}`;
}

/**
 * Three most recent check days (oldest first). Pads with preceding calendar days when fewer
 * than three days have checks, so the table always has three columns.
 */
export function latestCheckDays(records: AiCheckRecord[], count = 3): string[] {
  const days = Array.from(new Set(records.map((r) => isoDay(new Date(r.checkedAt))))).sort();
  const picked = days.slice(-count);
  const anchor = picked.length > 0 ? new Date(`${picked[0]}T00:00:00`) : new Date();
  while (picked.length < count) {
    anchor.setDate(anchor.getDate() - 1);
    picked.unshift(isoDay(anchor));
  }
  return picked;
}

/** Records grouped per query and per day, keeping the latest check of each day. */
export function latestByQueryAndDay(records: AiCheckRecord[]): Map<string, Map<string, AiCheckRecord>> {
  const out = new Map<string, Map<string, AiCheckRecord>>();
  const sorted = [...records].sort((a, b) => a.checkedAt.localeCompare(b.checkedAt));
  for (const r of sorted) {
    const day = isoDay(new Date(r.checkedAt));
    if (!out.has(r.query)) out.set(r.query, new Map());
    out.get(r.query)!.set(day, r);
  }
  return out;
}
