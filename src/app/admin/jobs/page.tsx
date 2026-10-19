'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Layers,
  RotateCcw,
  Ban,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

interface JobLog {
  id: string;
  level: string;
  message: string;
  createdAt: string;
}

interface JobItem {
  id: string;
  type: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  durationMs?: number | null;
  logs: JobLog[];
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log drawer state
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch jobs');
      }
      setJobs(json.data.items || []);
      setTotalCount(json.data.totalCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Error loading background jobs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, typeFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRetry = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const res = await fetch('/api/admin/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to retry job');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err?.message || 'Retry failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const res = await fetch('/api/admin/jobs/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to cancel job');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err?.message || 'Cancel failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Background Jobs & Schedules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real asynchronous task monitor for site audits, rank checks, backlink syncs, and report generators.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition self-start sm:self-auto"
          title="Refresh jobs"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Job Types</option>
            <option value="SITE_AUDIT">SITE_AUDIT</option>
            <option value="RANK_CHECK">RANK_CHECK</option>
            <option value="BACKLINK_SYNC">BACKLINK_SYNC</option>
            <option value="AI_PROMPT_CHECK">AI_PROMPT_CHECK</option>
            <option value="REPORT_GENERATION">REPORT_GENERATION</option>
          </select>
        </div>
      </div>

      {/* 4 States */}
      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {error && !isLoading && (
        <ErrorState title="Failed to load background jobs" message={error} onRetry={fetchJobs} />
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No Background Jobs Found"
          description="Asynchronous crawler, audit, and rank check jobs will appear here when triggered."
        />
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-3 px-4 font-medium">Job Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Attempts</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Last Error</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                      {job.type}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {job.attempts}/{job.maxAttempts}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {job.durationMs != null ? `${Math.round(job.durationMs / 1000)}s` : '-'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-rose-400 font-mono text-[11px]" title={job.error || ''}>
                      {job.error || <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(job.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View job logs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            disabled={actionInProgress === job.id}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition disabled:opacity-50"
                            title="Safe retry job"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(job.status === 'queued' || job.status === 'running') && (
                          <button
                            onClick={() => handleCancel(job.id)}
                            disabled={actionInProgress === job.id}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                            title="Cancel job"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {jobs.length} of {totalCount} total jobs
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

      {/* Log Drawer Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1423] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">Job Execution Logs</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <div>
                Type: <span className="font-mono text-slate-200 font-semibold">{selectedJob.type}</span>
              </div>
              <StatusBadge status={selectedJob.status} />
            </div>

            {/* Logs List */}
            <div className="max-h-60 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
              {selectedJob.logs.length === 0 ? (
                <div className="text-slate-500 italic">No log entries recorded for this job.</div>
              ) : (
                selectedJob.logs.map((log) => (
                  <div key={log.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className={log.level === 'error' ? 'text-rose-400' : 'text-blue-400'}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300 break-words">{log.message}</div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
