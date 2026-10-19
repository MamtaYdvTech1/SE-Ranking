'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, Activity, RefreshCw } from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

interface ApiUsageItem {
  id: string;
  endpoint: string;
  creditsUsed: number;
  status: string;
  createdAt: string;
}

export default function AdminApiUsagePage() {
  const [items, setItems] = useState<ApiUsageItem[]>([]);
  const [stats, setStats] = useState<{ totalRequests: number; totalCreditsUsed: number } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/api-usage?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch API usage ledger');
      }
      setItems(json.data.items || []);
      setStats(json.data.stats || { totalRequests: 0, totalCreditsUsed: 0 });
      setTotalCount(json.data.totalCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Error loading usage data');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            API Usage, Quotas & Costs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ledger of inbound and outbound API consumption, credits deducted, and endpoint telemetry.
          </p>
        </div>

        <button
          onClick={fetchUsage}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition self-start sm:self-auto"
          title="Refresh ledger"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total API Requests"
          value={stats?.totalRequests ?? 0}
          subtitle="All recorded API hits"
          icon={Activity}
          source="ApiUsage Model"
          country="Global"
          updatedAt="Live"
        />
        <StatCard
          title="Total Credits Deducted"
          value={stats?.totalCreditsUsed ?? 0}
          subtitle="Cumulative platform credit usage"
          icon={CreditCard}
          source="Ledger Aggregate"
          country="Global"
          updatedAt="Live"
        />
      </div>

      {/* 4 States */}
      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {error && !isLoading && (
        <ErrorState title="Failed to load API usage" message={error} onRetry={fetchUsage} />
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No API Usage Logged"
          description="Requests made through public API keys and outbound provider proxies will be logged here."
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-3 px-4 font-medium">Endpoint</th>
                  <th className="py-3 px-4 font-medium">Credits Used</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((row) => (
                  <tr key={row.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-200">{row.endpoint}</td>
                    <td className="py-3 px-4 font-semibold text-amber-400">{row.creditsUsed}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {items.length} of {totalCount} ledger entries
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
