'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  Building2,
  Search,
  Layers,
  FileSpreadsheet,
  Radio,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

interface OverviewData {
  users: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    byRole: {
      owner: number;
      admin: number;
      member: number;
      client: number;
    };
  };
  workspaces: {
    total: number;
  };
  projects: {
    total: number;
    active: number;
    archived: number;
    paused: number;
    uniqueDomains: number;
  };
  seo: {
    keywords: number;
    rankingSnapshots: number;
    auditPages: number;
    auditIssues: {
      total: number;
      errors: number;
      warnings: number;
      notices: number;
    };
    backlinks: number;
    aiSearchRecords: number;
    reports: number;
  };
  jobs: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  providers: {
    id: string;
    name: string;
    category: string;
    configured: boolean;
    status: string;
    endpoints: string[];
    details: string;
  }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userName?: string;
    createdAt: string;
    details?: string;
    user?: {
      email: string;
      name?: string;
      role: string;
    };
  }[];
  recentErrors: {
    id: string;
    message: string;
    createdAt: string;
    job?: {
      id: string;
      type: string;
      projectId?: string;
    };
  }[];
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/overview?timeRange=${timeRange}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch admin overview');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to admin API');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-8">
      {/* Page Title & Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Super Admin Overview
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live DB
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
            Global operational metrics, database records, background worker status, and provider telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
            {(['7d', '30d', '90d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  timeRange === t
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Time' : t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition shadow-xs cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* State Handling: Loading, Error, Empty, Success */}
      {isLoading && (
        <div className="space-y-6">
          <SkeletonLoader type="stat" />
          <SkeletonLoader type="table" rows={4} />
        </div>
      )}

      {error && !isLoading && (
        <ErrorState
          title="Could not load platform metrics"
          message={error}
          onRetry={fetchOverview}
        />
      )}

      {!isLoading && !error && !data && (
        <EmptyState
          title="No Platform Data Found"
          description="The database currently does not have any active projects or platform telemetry."
        />
      )}

      {!isLoading && !error && data && (
        <>
          {/* Primary KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered Users"
              value={data.users.total}
              subtitle={`${data.users.active} active • ${data.users.suspended} suspended`}
              icon={Users}
              source="Prisma Database"
              country="Global"
              updatedAt="Just now"
            />
            <StatCard
              title="Tracked Projects"
              value={data.projects.total}
              subtitle={`${data.projects.uniqueDomains} unique domains • ${data.projects.active} active`}
              icon={FolderKanban}
              source="Project Registry"
              country="Global"
              updatedAt="Live"
            />
            <StatCard
              title="Project Workspaces"
              value={data.workspaces.total}
              subtitle="Project group containers"
              icon={Building2}
              source="ProjectGroup"
              country="Global"
              updatedAt="Live"
            />
            <StatCard
              title="Audit Pages Crawled"
              value={data.seo.auditPages}
              subtitle={`${data.seo.auditIssues.errors} errors • ${data.seo.auditIssues.warnings} warnings`}
              icon={Search}
              source="Crawler Engine"
              country="Multi-target"
              updatedAt="Real-time"
            />
          </div>

          {/* Secondary SEO Core Metrics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">SEO Intelligence Records</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total persisted rows across all SEO databases</p>
              </div>
              <Link
                href="/admin/seo-explorer"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>Open Data Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Keywords</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.keywords}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">SERP History</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.rankingSnapshots}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Audit Issues</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.auditIssues.total}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Backlinks</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.backlinks}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">AI Search Runs</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.aiSearchRecords}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Reports</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.seo.reports}</div>
              </div>
            </div>
          </div>

          {/* Providers Status & Background Workers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Providers Status */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Third-Party Providers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configured credentials and upstream availability</p>
                </div>
                <Link
                  href="/admin/providers"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {data.providers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.details}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Background Workers & Jobs */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Background Jobs & Schedules</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Asynchronous crawler & ranking check queues</p>
                </div>
                <Link
                  href="/admin/jobs"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
                >
                  <span>View All Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-slate-950/50 border border-amber-500/20 dark:border-slate-800/60 text-center">
                  <div className="text-amber-600 dark:text-amber-400 font-bold text-xl">{data.jobs.queued}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Queued</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-slate-950/50 border border-blue-500/20 dark:border-slate-800/60 text-center">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xl">{data.jobs.running}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Running</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-slate-950/50 border border-emerald-500/20 dark:border-slate-800/60 text-center">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{data.jobs.completed}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-slate-950/50 border border-rose-500/20 dark:border-slate-800/60 text-center">
                  <div className="text-rose-600 dark:text-rose-400 font-bold text-xl">{data.jobs.failed}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Failed</div>
                </div>
              </div>

              {/* Recent Error Logs summary if any */}
              {data.recentErrors && data.recentErrors.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Recent Worker Failures</span>
                  </div>
                  <div className="space-y-1.5">
                    {data.recentErrors.slice(0, 2).map((err) => (
                      <div
                        key={err.id}
                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 truncate"
                        title={err.message}
                      >
                        {err.job ? `[${err.job.type}] ` : ''}
                        {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Administrative Activity Logs */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-xs dark:shadow-none space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Administrative Audit Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Actor, action, target entity, and timestamp</p>
              </div>
              <Link
                href="/admin/activity-logs"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentActivity && data.recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px]">
                      <th className="pb-2.5 font-medium">Actor</th>
                      <th className="pb-2.5 font-medium">Action</th>
                      <th className="pb-2.5 font-medium">Entity</th>
                      <th className="pb-2.5 font-medium">Target ID</th>
                      <th className="pb-2.5 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                    {data.recentActivity.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                        <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-200">
                          {log.userName || log.user?.email || 'System'}
                        </td>
                        <td className="py-2.5">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-400 font-medium">{log.entityType}</td>
                        <td className="py-2.5 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                          {log.entityId}
                        </td>
                        <td className="py-2.5 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No Recent Activity"
                description="Administrative actions and security events will be automatically logged here."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
