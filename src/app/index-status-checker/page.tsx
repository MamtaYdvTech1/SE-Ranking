'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Info,
  X,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Check,
  ChevronsUpDown,
  Plus,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface IndexResult {
  url: string;
  isIndexed: boolean;
  cacheDate: string;
  responseCode: number;
}

interface IndexCheckHistoryItem {
  id: string;
  firstUrl: string;
  urlCount: number;
  date: string;
  engine: string;
  results: IndexResult[];
}

function IndexStatusCheckerContent() {
  const { activeProject, projects } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isResultsTab = searchParams.get('tab') === 'results';

  const cleanDomain = useMemo(() => {
    const raw = activeProject?.domain || '';
    return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  }, [activeProject?.domain]);

  const [showBanner, setShowBanner] = useState(true);
  const [engine, setEngine] = useState('Google');
  const [urlList, setUrlList] = useState('');
  const [checkCache, setCheckCache] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<IndexResult[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<IndexCheckHistoryItem | null>(null);

  // Index check history persisted
  const [history, setHistory] = useState<IndexCheckHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('se_ranking_index_history');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const base = `https://${cleanDomain}`;
    return [
      {
        id: 'idx_init_1',
        firstUrl: `${base}/`,
        urlCount: 5,
        date: 'Oct 02, 2026',
        engine: 'Google',
        results: [
          { url: `${base}/`, isIndexed: true, cacheDate: '01 Oct 2026, 12:45 GMT', responseCode: 200 },
          { url: `${base}/about-us`, isIndexed: true, cacheDate: '30 Sep 2026, 18:20 GMT', responseCode: 200 },
          { url: `${base}/products`, isIndexed: true, cacheDate: '29 Sep 2026, 09:15 GMT', responseCode: 200 },
          { url: `${base}/blog`, isIndexed: false, cacheDate: 'Not cached', responseCode: 200 },
          { url: `${base}/contact`, isIndexed: true, cacheDate: '28 Sep 2026, 14:02 GMT', responseCode: 200 },
        ],
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('se_ranking_index_history', JSON.stringify(history));
      } catch {
        // ignore
      }
    }
  }, [history]);

  const urls = urlList
    .split(/[\r\n]+/)
    .map((u) => u.trim())
    .filter(Boolean);

  const totalCost = urls.length > 0 ? (urls.length * 0.005).toFixed(3) : '0';

  const loadSampleUrls = () => {
    const base = `https://${cleanDomain}`;
    setUrlList(`${base}/\n${base}/about-us\n${base}/products\n${base}/blog\n${base}/contact`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urls.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generated: IndexResult[] = urls.map((u, i) => ({
        url: u.startsWith('http') ? u : `https://${u}`,
        isIndexed: i !== 3,
        cacheDate: checkCache ? '02 Oct 2026, 11:42 GMT' : 'Not requested',
        responseCode: 200,
      }));

      const newHistoryItem: IndexCheckHistoryItem = {
        id: `idx_${Date.now()}`,
        firstUrl: generated[0]?.url || 'Custom URLs',
        urlCount: generated.length,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        engine,
        results: generated,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setResults(generated);
      setIsSubmitting(false);
    }, 800);
  };

  const handleExportCsv = (customResults?: IndexResult[]) => {
    const targetResults = customResults || results;
    const headers = ['URL', 'Search Engine', 'Index Status', 'HTTP Code', 'Cache Timestamp'];
    const rows = targetResults.map((r) => [
      `"${r.url}"`,
      engine,
      r.isIndexed ? 'Indexed' : 'Not Indexed',
      `${r.responseCode} OK`,
      `"${r.cacheDate}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'index_status_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (selectedHistory?.id === id) {
      setSelectedHistory(null);
    }
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none pb-20 relative flex flex-col justify-between">
      <div className="max-w-[1240px] mx-auto p-4 sm:p-6 sm:pt-4 space-y-4 w-full">
        {/* ========================================================================= */}
        {/* 1. RESULTS TAB: Index Status Checker result history */}
        {/* ========================================================================= */}
        {isResultsTab ? (
          selectedHistory ? (
            /* Drilldown for selected check history */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedHistory(null)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to result history</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedHistory.results)}
                  className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Check Results: {selectedHistory.firstUrl} ({selectedHistory.urlCount} URLs)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Search Engine: {selectedHistory.engine} • Date: {selectedHistory.date}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Webpage URL</th>
                        <th className="px-4 py-3 text-center">{selectedHistory.engine} Index Status</th>
                        <th className="px-4 py-3 text-center">HTTP Status</th>
                        <th className="px-4 py-3 text-right">Cache Timestamp</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedHistory.results.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 max-w-md truncate">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#0B69FF] flex items-center gap-1.5"
                            >
                              <span>{r.url}</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.isIndexed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Indexed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-500" /> Not Indexed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700 font-bold">
                            {r.responseCode} OK
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 font-mono text-[11px]">
                            {r.cacheDate}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={`https://www.google.com/search?q=site:${encodeURIComponent(r.url)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0B69FF] hover:underline font-medium text-xs"
                            >
                              Inspect SERP
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Result History table */
            <div className="space-y-4">
              <div className="text-[14px] text-[#8C98A9] font-normal flex items-center gap-1.5">
                <Link href="/index-status-checker" className="hover:text-[#0B69FF]">
                  Index Status Checker
                </Link>
                <span>›</span>
                <span className="text-gray-700 font-medium">Results</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h1 className="text-[18px] font-semibold text-gray-900 tracking-tight">
                    Index Status Checker result history
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    The last 100 results are stored.
                  </p>
                </div>
                <Link
                  href="/index-status-checker"
                  className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW CHECK</span>
                </Link>
              </div>

              {/* Table : FIRST URL | DATE | SEARCH ENGINE | ACTION */}
              <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] text-gray-600 text-[11px] font-semibold border-b border-gray-200 uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">FIRST URL</th>
                      <th className="py-2.5 px-4 font-semibold">DATE</th>
                      <th className="py-2.5 px-4 font-semibold">SEARCH ENGINE</th>
                      <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length > 0 ? (
                      history.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 max-w-md truncate">
                            <button
                              type="button"
                              onClick={() => setSelectedHistory(item)}
                              className="text-[#0B69FF] hover:underline cursor-pointer text-left font-semibold truncate block max-w-md"
                            >
                              {item.firstUrl} {item.urlCount > 1 && `(+${item.urlCount - 1} URLs)`}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.date}</td>
                          <td className="py-3 px-4 text-gray-700">{item.engine}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() => setSelectedHistory(item)}
                                className="text-[#0B69FF] hover:underline cursor-pointer font-medium"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExportCsv(item.results)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                              >
                                Export
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHistory(item.id)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-gray-400">
                          No indexing check results stored yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* 2. FORM VIEW: Index Status Checker Form */
          /* ========================================================================= */
          <>
            {/* Title / Breadcrumb */}
            <div className="text-[14px] text-[#8C98A9] font-normal">Index Status Checker</div>

            {/* Notice Info Box */}
            {showBanner && (
              <div className="p-3 bg-[#F8F9FA] border border-[#E4E8EE] rounded text-[13px] text-[#4E5D78] relative flex items-center justify-between shadow-2xs leading-relaxed max-w-4xl">
                <div className="flex items-center gap-2.5 pr-6">
                  <span className="w-4 h-4 rounded-full bg-[#8C98A9] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    i
                  </span>
                  <span>
                    The Index Status Checker tool allows you to verify if a web page has been indexed by a specific search engine
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  className="text-[#8C98A9] hover:text-gray-700 p-0.5 cursor-pointer shrink-0 font-bold"
                  title="Close notice"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Form */}
            <div className="pt-2">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Check page index status in */}
                <div>
                  <label className="block text-[13px] text-[#4E5D78] font-normal mb-1.5">
                    Check page index status in:
                  </label>
                  <div className="relative w-[280px]">
                    <select
                      value={engine}
                      onChange={(e) => setEngine(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] text-gray-800 bg-white hover:border-[#94A3B8] focus:border-[#0B69FF] focus:outline-hidden appearance-none cursor-pointer pr-8 font-normal"
                    >
                      <option value="Google">Google</option>
                      <option value="Yahoo">Yahoo</option>
                      <option value="Bing">Bing</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* URLs Textarea */}
                <div>
                  <div className="flex items-center justify-between w-[440px] max-w-full mb-1">
                    <span className="text-[11px] text-gray-400">Enter a URL list:</span>
                    <button
                      type="button"
                      onClick={loadSampleUrls}
                      className="text-[11px] text-[#0B69FF] hover:underline font-medium cursor-pointer"
                    >
                      + Load sample URLs
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={urlList}
                    onChange={(e) => setUrlList(e.target.value)}
                    placeholder=""
                    className="w-[440px] max-w-full p-2.5 border border-[#CBD5E1] rounded text-[12px] focus:outline-hidden focus:border-[#0B69FF] font-normal leading-relaxed bg-white text-gray-900"
                  />
                </div>

                {/* Check a website's URL in search engine cache */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#4E5D78] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checkCache}
                      onChange={(e) => setCheckCache(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                    />
                    <span>Check a website&apos;s URL in search engine cache</span>
                  </label>
                </div>

                {/* Price line */}
                <div className="text-[13px] text-[#4E5D78] pt-1">
                  Price: <span className="font-semibold text-[#0B69FF]">$0.005</span> per URL
                </div>

                {/* Total amount to be charged line */}
                <div className="text-[16px] text-[#2C384A] font-medium flex items-center gap-1.5 pt-1">
                  <span>Total amount to be charged:</span>
                  <span className="text-[26px] font-normal text-[#0B69FF]">${totalCost}</span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || urls.length === 0}
                    className={`w-[140px] py-2 rounded text-[13px] font-normal transition-all cursor-pointer ${
                      urls.length > 0 && !isSubmitting
                        ? 'bg-[#0B69FF] hover:bg-[#005FE0] text-white shadow-xs font-semibold'
                        : 'bg-[#DDE2EA] text-[#8C98A9] cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Checking index...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>

            {/* Dynamic Results Table Below Form */}
            {results.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200 mt-6">
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Indexation Status Results ({results.length} URLs)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Search Engine: {engine} • Cache Check: {checkCache ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCsv()}
                      className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <Link
                      href="/index-status-checker?tab=results"
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      View All History
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Webpage URL</th>
                        <th className="px-4 py-3 text-center">{engine} Index Status</th>
                        <th className="px-4 py-3 text-center">HTTP Status</th>
                        <th className="px-4 py-3 text-right">Cache Timestamp</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 max-w-md truncate">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#0B69FF] flex items-center gap-1.5"
                            >
                              <span>{r.url}</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.isIndexed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Indexed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-500" /> Not Indexed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700 font-bold">
                            {r.responseCode} OK
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 font-mono text-[11px]">
                            {r.cacheDate}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={`https://www.google.com/search?q=site:${encodeURIComponent(r.url)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0B69FF] hover:underline font-medium text-xs"
                            >
                              Inspect SERP
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function IndexStatusCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Index Status Checker...</div>}>
      <IndexStatusCheckerContent />
    </Suspense>
  );
}
