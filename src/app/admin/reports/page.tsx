'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  FileCheck,
  X,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

interface ReportItem {
  id: string;
  name: string;
  type: string;
  format: string;
  status: string;
  lastGeneratedAt?: string | null;
  createdAt: string;
  recipients?: string | null;
  project?: {
    id: string;
    name: string;
    domain: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [formatFilter, setFormatFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate Report Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState('Overview');
  const [reportFormat, setReportFormat] = useState('CSV');
  const [customName, setCustomName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (formatFilter !== 'all') params.append('format', formatFilter);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch reports');
      }
      setReports(json.data.items || []);
      setTotalCount(json.data.totalCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Error loading reports');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, formatFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPreview(null);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName.trim() || undefined,
          type: reportType,
          format: reportFormat,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate report');
      }
      if (json.data?.csvPreview) {
        setGeneratedPreview(json.data.csvPreview);
      }
      fetchReports();
    } catch (err: any) {
      alert(err?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Reports & Export Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export genuine platform audit, rankings, and executive summary reports with formula injection protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setGeneratedPreview(null);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Real Report</span>
          </button>
        </div>
      </div>

      {/* 4 States */}
      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {error && !isLoading && (
        <ErrorState title="Failed to load reports" message={error} onRetry={fetchReports} />
      )}

      {!isLoading && !error && reports.length === 0 && (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Reports Generated Yet"
          description="Click 'Generate Real Report' to create an instant database-backed CSV or PDF export."
          actionLabel="Generate Report"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {!isLoading && !error && reports.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-3 px-4 font-medium">Report Name</th>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Format</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{r.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.project?.domain || 'Platform Wide'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{r.type}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {r.format}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {reports.length} of {totalCount} total reports
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

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1423] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Generate Real-Data Report</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Report Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SEO Audit & SERP Report"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Dataset Focus</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Overview">Executive Platform Overview</option>
                  <option value="Rankings">Rankings & SERP Positions</option>
                  <option value="Audit">Site Technical Audit Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Export Format</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="CSV"
                      checked={reportFormat === 'CSV'}
                      onChange={() => setReportFormat('CSV')}
                      className="accent-blue-600"
                    />
                    <span>CSV (Sanitized with BOM)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="PDF"
                      checked={reportFormat === 'PDF'}
                      onChange={() => setReportFormat('PDF')}
                      className="accent-blue-600"
                    />
                    <span>PDF Document</span>
                  </label>
                </div>
              </div>

              {generatedPreview && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    <span>Report compiled successfully!</span>
                  </div>
                  <pre className="max-h-32 overflow-y-auto p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                    {generatedPreview}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv(generatedPreview, customName || 'seo-report')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV File</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isGenerating ? 'Compiling Database...' : 'Compile & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
