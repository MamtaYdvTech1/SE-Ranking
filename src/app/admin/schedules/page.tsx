"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Layers,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface ScheduleItem {
  id: string;
  name: string;
  type: string;
  cron: string;
  interval: string;
  scope: string;
  status: string;
  provider: string;
  lastRun: string;
  nextRun: string;
}

export default function AdminSchedulesPage() {
  const { success, error } = useToast();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/schedules");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load schedules");
      }
      setSchedules(json.data);
    } catch (err: any) {
      setFetchError(err.message);
      error("Failed to load schedules: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleTriggerNow = async (sched: ScheduleItem) => {
    setRunningId(sched.id);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: sched.id, action: "TRIGGER" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to trigger schedule");
      }
      success(`Schedule "${sched.name}" triggered! Job #${json.data.jobId} queued.`);
      fetchSchedules();
    } catch (err: any) {
      error(err.message);
    } finally {
      setRunningId(null);
    }
  };

  if (isLoading && schedules.length === 0) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" />
      </div>
    );
  }

  if (fetchError && schedules.length === 0) {
    return <ErrorState message={fetchError} onRetry={fetchSchedules} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <span>Automated Cron Schedules</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise background cron jobs for daily SERP rank checks, technical audits, backlink discovery, and client reports.
          </p>
        </div>
        <button
          onClick={fetchSchedules}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Schedules</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{schedules.length}</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All background runners healthy</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily SERP Check</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">02:00 UTC</div>
          <div className="text-xs text-slate-400 mt-1">Daily automated position check</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Crawl</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">Sun 04:00</div>
          <div className="text-xs text-slate-400 mt-1">Full site health & Core Web Vitals</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Execution Pipeline</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">PostgreSQL Job</div>
          <div className="text-xs text-slate-400 mt-1">Backed by Job & JobLog models</div>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{s.status}</span>
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{s.name}</h3>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                  <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.cron}</span>
                  </span>
                  <span>{s.interval}</span>
                  <span>·</span>
                  <span className="text-slate-600 dark:text-slate-300">{s.scope}</span>
                  <span>·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{s.provider}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right text-xs">
                  <div className="text-slate-400">Last run:</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {new Date(s.lastRun).toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Next: {new Date(s.nextRun).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleTriggerNow(s)}
                  disabled={runningId === s.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${runningId === s.id ? "animate-spin" : ""}`} />
                  <span>{runningId === s.id ? "Queuing..." : "Run Now"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
