'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Link2,
  Users2,
  ListOrdered,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SourceBadge } from '@/components/admin/ui/SourceBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

type ModuleType = 'audits' | 'rankings' | 'keywords' | 'competitors' | 'backlinks' | 'ai-search';

function sanitizeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function AdminSeoExplorerPage() {
  const [activeModule, setActiveModule] = useState<ModuleType>('audits');
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: { id: ModuleType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'audits', label: 'Site Audits', icon: Globe },
    { id: 'rankings', label: 'Rankings & SERP', icon: ListOrdered },
    { id: 'keywords', label: 'Keywords Library', icon: Layers },
    { id: 'competitors', label: 'Competitors', icon: Users2 },
    { id: 'backlinks', label: 'Backlinks', icon: Link2 },
    { id: 'ai-search', label: 'AI Search Visibility', icon: Sparkles },
  ];

  const fetchExplorerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        module: activeModule,
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/seo-explorer?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to query data explorer');
      }
      setItems(json.data.items || []);
      setTotalCount(json.data.totalCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Error querying data explorer');
    } finally {
      setIsLoading(false);
    }
  }, [activeModule, page, pageSize, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExplorerData();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchExplorerData]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Export to CSV with Formula Injection Sanitization
  const handleExportCsv = () => {
    if (!items.length) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeModule === 'audits') {
      headers = ['Page URL', 'Project', 'Domain', 'HTTP Status', 'Load Time (ms)', 'Crawled At'];
      rows = items.map((r) => [
        r.url || '',
        r.project?.name || '',
        r.project?.domain || '',
        String(r.statusCode || 200),
        String(r.loadTimeMs || 0),
        r.crawledAt ? new Date(r.crawledAt).toISOString() : '',
      ]);
    } else if (activeModule === 'rankings') {
      headers = ['Keyword', 'Project', 'Rank', 'Previous Rank', 'Search Engine', 'Checked At'];
      rows = items.map((r) => [
        r.keyword?.keywordText || '',
        r.project?.name || '',
        String(r.position || '—'),
        String(r.previousPosition || '—'),
        r.searchEngine || 'Google',
        r.checkedAt ? new Date(r.checkedAt).toISOString() : '',
      ]);
    } else if (activeModule === 'keywords') {
      headers = ['Keyword', 'Project', 'Search Volume', 'Difficulty', 'Search Engine', 'Created At'];
      rows = items.map((r) => [
        r.keywordText || '',
        r.project?.name || '',
        String(r.monthlySearchVolume || 0),
        String(r.difficulty || '—'),
        r.searchEngine || 'Google',
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
      ]);
    } else if (activeModule === 'competitors') {
      headers = ['Competitor Domain', 'Project', 'Visibility Score', 'Created At'];
      rows = items.map((r) => [
        r.domain || '',
        r.project?.name || '',
        String(r.visibilityScore || 0),
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
      ]);
    } else if (activeModule === 'backlinks') {
      headers = ['Source URL', 'Target URL', 'Anchor Text', 'DoFollow', 'Created At'];
      rows = items.map((r) => [
        r.sourceUrl || '',
        r.targetUrl || '',
        r.anchorText || '',
        r.isDoFollow ? 'DoFollow' : 'NoFollow',
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
      ]);
    } else if (activeModule === 'ai-search') {
      headers = ['Query', 'Engine', 'Domain', 'Mentioned', 'Cited URL', 'Checked At'];
      rows = items.map((r) => [
        r.query || '',
        r.engine || '',
        r.domain || '',
        r.mentioned ? 'Yes' : 'No',
        r.citedUrl || '',
        r.checkedAt ? new Date(r.checkedAt).toISOString() : '',
      ]);
    }

    const csvContent = [
      headers.map(sanitizeCsv).join(','),
      ...rows.map((row) => row.map(sanitizeCsv).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `se-ranking-${activeModule}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJson = () => {
    if (!items.length) return;
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `se-ranking-${activeModule}-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            SEO Data Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal leading-relaxed">
            Central real-data inspection suite across site audits, SERP positions, keyword pools, backlinks, and AI visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Buttons */}
          <button
            onClick={handleExportCsv}
            disabled={!items.length || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 transition shadow-xs cursor-pointer"
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={!items.length || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-40 transition shadow-xs cursor-pointer"
            title="Export filtered records to JSON"
          >
            <FileText className="w-4 h-4 text-violet-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={fetchExplorerData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Refresh dataset"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveModule(tab.id);
                setPage(1);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-white/20'
                  : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder={`Search within ${tabs.find((t) => t.id === activeModule)?.label}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition shadow-xs"
          />
        </div>

        {/* Page size dropdown */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-violet-500 shadow-xs cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* 4 Mandatory States: Loading, Error, Empty, Success */}
      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {error && !isLoading && (
        <ErrorState title="Data query failed" message={error} onRetry={fetchExplorerData} />
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Persisted Records Found"
          description={`No database records found in the ${tabs.find((t) => t.id === activeModule)?.label} dataset.`}
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d19] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  {activeModule === 'audits' && (
                    <>
                      <th className="py-3 px-4 font-bold">Page URL (Preview)</th>
                      <th className="py-3 px-4 font-bold">Project</th>
                      <th className="py-3 px-4 font-bold">HTTP Status</th>
                      <th className="py-3 px-4 font-bold">Load Time</th>
                      <th className="py-3 px-4 font-bold">Issues</th>
                      <th className="py-3 px-4 font-bold text-right">Crawled At</th>
                    </>
                  )}
                  {activeModule === 'rankings' && (
                    <>
                      <th className="py-3 px-4 font-bold">Keyword</th>
                      <th className="py-3 px-4 font-bold">Project</th>
                      <th className="py-3 px-4 font-bold">Rank</th>
                      <th className="py-3 px-4 font-bold">Change</th>
                      <th className="py-3 px-4 font-bold">Search Engine</th>
                      <th className="py-3 px-4 font-bold text-right">Checked At</th>
                    </>
                  )}
                  {activeModule === 'keywords' && (
                    <>
                      <th className="py-3 px-4 font-bold">Keyword</th>
                      <th className="py-3 px-4 font-bold">Project</th>
                      <th className="py-3 px-4 font-bold">Volume</th>
                      <th className="py-3 px-4 font-bold">Difficulty</th>
                      <th className="py-3 px-4 font-bold">Search Engine</th>
                      <th className="py-3 px-4 font-bold text-right">Created At</th>
                    </>
                  )}
                  {activeModule === 'competitors' && (
                    <>
                      <th className="py-3 px-4 font-bold">Competitor Domain (Open)</th>
                      <th className="py-3 px-4 font-bold">Attached Project</th>
                      <th className="py-3 px-4 font-bold">Visibility Score</th>
                      <th className="py-3 px-4 font-bold text-right">Created At</th>
                    </>
                  )}
                  {activeModule === 'backlinks' && (
                    <>
                      <th className="py-3 px-4 font-bold">Source URL (Open)</th>
                      <th className="py-3 px-4 font-bold">Target URL (Open)</th>
                      <th className="py-3 px-4 font-bold">Anchor Text</th>
                      <th className="py-3 px-4 font-bold">Type</th>
                      <th className="py-3 px-4 font-bold text-right">Created At</th>
                    </>
                  )}
                  {activeModule === 'ai-search' && (
                    <>
                      <th className="py-3 px-4 font-bold">Search Query</th>
                      <th className="py-3 px-4 font-bold">Engine</th>
                      <th className="py-3 px-4 font-bold">Domain</th>
                      <th className="py-3 px-4 font-bold">AI Mention Status</th>
                      <th className="py-3 px-4 font-bold text-right">Cited Source</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {items.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {activeModule === 'audits' && (
                      <>
                        <td className="py-3 px-4 max-w-sm truncate">
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline font-semibold max-w-sm truncate group"
                            title={`Open & preview ${row.url} in new tab`}
                          >
                            <span className="truncate">{row.url}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {row.project?.name || row.project?.domain || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              row.statusCode === 200
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {row.statusCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {row.loadTimeMs || 0}ms
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {row.issuesCount ?? (row.title ? 'OK' : '1 Warning')}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.crawledAt ? new Date(row.crawledAt).toLocaleDateString() : '—'}
                        </td>
                      </>
                    )}
                    {activeModule === 'rankings' && (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(row.keyword?.keywordText || row.keywordText || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 hover:underline group"
                            title={`Inspect SERP on Google for "${row.keyword?.keywordText || row.keywordText}"`}
                          >
                            <span>{row.keyword?.keywordText || row.keywordText || '—'}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {row.project?.name || row.project?.domain || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-violet-600 dark:text-violet-400 text-xs">
                            #{row.position || row.rank || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {row.change ? (
                            <span className={`font-semibold ${row.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {row.change > 0 ? `+${row.change}` : row.change}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {row.searchEngine || 'Google'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.checkedAt ? new Date(row.checkedAt).toLocaleDateString() : '—'}
                        </td>
                      </>
                    )}
                    {activeModule === 'keywords' && (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(row.keywordText || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 hover:underline group"
                            title={`Inspect keyword search on Google`}
                          >
                            <span>{row.keywordText}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {row.project?.name || row.project?.domain || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono font-semibold">
                          {row.monthlySearchVolume?.toLocaleString() || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {row.difficulty ? `${row.difficulty}%` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {row.searchEngine || 'Google'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </>
                    )}
                    {activeModule === 'competitors' && (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <a
                            href={row.domain?.startsWith('http') ? row.domain : `https://${row.domain || row.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline group"
                            title={`Inspect and open ${row.domain || row.name} in new tab`}
                          >
                            <span>{row.domain || row.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {row.project?.name || row.project?.domain || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {row.visibilityScore || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </>
                    )}
                    {activeModule === 'backlinks' && (
                      <>
                        <td className="py-3 px-4 max-w-xs truncate">
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline font-semibold max-w-xs truncate group"
                            title={`Open source: ${row.sourceUrl}`}
                          >
                            <span className="truncate">{row.sourceUrl}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          <a
                            href={row.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:underline truncate group"
                            title={`Open target: ${row.targetUrl}`}
                          >
                            <span className="truncate">{row.targetUrl}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {row.anchorText || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.isDoFollow
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {row.isDoFollow ? 'DoFollow' : 'NoFollow'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </>
                    )}
                    {activeModule === 'ai-search' && (
                      <>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{row.query}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">{row.engine}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{row.domain}</td>
                        <td className="py-3 px-4">
                          <StatusBadge
                            status={row.mentioned ? 'active' : 'cancelled'}
                            label={row.mentionStatus || (row.mentioned ? 'Mentioned' : 'Not Mentioned')}
                          />
                        </td>
                        <td className="py-3 px-4 text-right max-w-xs truncate">
                          {row.citedUrl ? (
                            <a
                              href={row.citedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline truncate ml-auto group"
                              title={`Open cited source in new tab: ${row.citedUrl}`}
                            >
                              <span className="truncate max-w-[200px]">{row.citedUrl}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">Direct Answer</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#080d19] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{items.length}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalCount}</span> records in{' '}
              <span className="font-bold text-violet-600 dark:text-violet-400">{tabs.find((t) => t.id === activeModule)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition cursor-pointer font-medium shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition cursor-pointer font-medium shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
