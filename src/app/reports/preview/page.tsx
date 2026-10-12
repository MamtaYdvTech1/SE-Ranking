'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  Check,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  FileCode,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Layers,
  Search,
  Globe,
  Calendar,
  Sparkles,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { SearchVisibilityChart, AvgPositionChart, TrafficForecastChart } from '@/components/reports/ReportTrendCharts';

function ReportPreviewContent() {
  const searchParams = useSearchParams();

  // Query parameters with smart defaults matching SE Ranking reports
  const rawId = searchParams.get('id') || '10075967';
  const rawTitle = searchParams.get('title') || searchParams.get('report') || 'Rankings Overview';
  const rawProject = searchParams.get('project') || searchParams.get('domain') || 'teams.com';
  const rawPeriod = searchParams.get('period') || 'Sep-28 2026 - Oct-04 2026';

  const [reportTitle, setReportTitle] = useState(rawTitle);
  const [domain, setDomain] = useState(rawProject);
  const [companyName, setCompanyName] = useState('');
  const [period, setPeriod] = useState(rawPeriod);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDarkCanvas, setIsDarkCanvas] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter tabs for changed positions and ranking history
  const [changedTab, setChangedTab] = useState<'entered10' | 'left10' | 'in10' | 'entered100'>('entered10');
  const [historyTab, setHistoryTab] = useState<'entered10' | 'left10' | 'in10' | 'entered100'>('entered10');

  // Fetch live report details if available from API
  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/reports?id=${encodeURIComponent(rawId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReportTitle(data.report.title || rawTitle);
            setDomain(data.report.domain || rawProject);
            setPeriod(data.report.period || rawPeriod);
          }
        }
      } catch (e) {
        // Fallback to URL parameters
      }
    }
    if (rawId) {
      loadReport();
    }
  }, [rawId, rawTitle, rawProject, rawPeriod]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Live preview link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    setIsExporting(true);
    showToast('Preparing high-resolution PDF print document...');
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 400);
  };

  const handleDownloadHTML = () => {
    if (typeof window === 'undefined') return;
    const content = document.getElementById('report-document-body')?.innerHTML || '';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${reportTitle} - ${domain} - SE Ranking Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print { .no-print { display: none !important; } }
    body { background-color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-5xl mx-auto bg-white p-10 shadow-lg rounded">
    ${content}
  </div>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${domain}_SEO_Report_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('HTML Report downloaded successfully!');
  };

  const zoomScale = zoomLevel / 100;

  return (
    <div className={`min-h-screen font-sans ${isDarkCanvas ? 'bg-[#0B1120]' : 'bg-[#EBF0F5]'} transition-colors duration-200 select-text`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-400/30">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP FLOATING INTERACTIVE NAVIGATION BAR (Hidden on Print)   */}
      {/* ============================================================== */}
      <nav className="no-print sticky top-0 z-40 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-700 px-5 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Branding & Report Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1976D2] hover:text-[#1565C0] transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800"
            title="Return to Reports Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports</span>
          </Link>

          <div className="h-4 w-px bg-gray-300 dark:bg-slate-600 mx-1" />

          <div className="flex items-center gap-2">
            <img
              src="/files/public/avatar/logo_se_pdf.png"
              alt="SE Ranking"
              className="h-6 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-[#171B24] dark:text-white leading-tight">
                  {reportTitle}
                </h1>
                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                {domain} • {period} • SE Ranking Enterprise Suite
              </p>
            </div>
          </div>
        </div>

        {/* Center: Zoom & Viewport Canvas Controls */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-md border border-[#E2E8F0] dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono font-semibold text-[#1E293B] dark:text-slate-200 text-[11px] min-w-[42px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1976D2] hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
          >
            Reset
          </button>

          <div className="h-3 w-px bg-gray-300 dark:bg-slate-600 mx-1" />

          {/* Canvas Dark/Light Backdrop Switch */}
          <button
            type="button"
            onClick={() => setIsDarkCanvas(!isDarkCanvas)}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 text-[#475569] dark:text-slate-300 rounded transition-colors flex items-center gap-1 px-1.5"
            title="Toggle Backdrop Contrast"
          >
            {isDarkCanvas ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-medium">Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actions (Print / PDF / HTML / Share) */}
        <div className="flex items-center gap-2">
          {/* Share Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#334155] dark:text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Copy shareable preview URL"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1976D2]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Export HTML */}
          <button
            type="button"
            onClick={handleDownloadHTML}
            className="px-3 py-1.5 border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#334155] dark:text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Download Standalone HTML Report"
          >
            <FileCode className="w-3.5 h-3.5 text-[#8C9BA5]" />
            <span className="hidden md:inline">HTML</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 border border-[#1976D2] bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#1976D2] rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Print or Save via Browser PDF Engine"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Primary Save as PDF */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="px-4 py-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="Export Certified PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'Save as PDF'}</span>
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 2. MAIN DOCUMENT VIEWPORT (Scaled & Centered)                 */}
      {/* ============================================================== */}
      <main className="py-8 px-4 sm:px-6 flex justify-center overflow-x-auto print:p-0 print:m-0 print:overflow-visible">
        <div
          id="report-document-body"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top center',
          }}
          className="w-full max-w-[840px] space-y-8 print:space-y-0 print:max-w-none print:w-full transition-transform duration-150"
        >
          {/* ========================================================== */}
          {/* PAGE 1: AUTHENTIC SE RANKING COVER PAGE                    */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs overflow-hidden flex flex-col justify-between print:break-after-page">
            <div
              className="widget-cover__content relative flex-1 p-14 sm:p-20 flex flex-col justify-between bg-cover bg-center"
              style={{
                backgroundImage: 'url("/skin/site/main/images/reports/covers/cover-1.svg")',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Logo Row matching SE Ranking template */}
              <div className="widget-cover__logo flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    className="widget-img__image h-11 w-auto object-contain"
                    src="/files/public/avatar/logo_se_pdf.png"
                    alt="SE Ranking"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="font-extrabold text-sm tracking-wider uppercase text-[#1E293B]">
                    SE Ranking
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white/90 backdrop-blur-xs px-3 py-1 rounded border border-slate-200 shadow-2xs">
                  SEO Report
                </div>
              </div>

              {/* Editable Fields: Company, Title, Domain */}
              <div className="space-y-4 my-auto max-w-xl">
                {/* Company Name */}
                <div className="widget-cover__company">
                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white/70 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#1976D2] rounded px-3 py-1.5 text-sm text-[#232A32] placeholder:text-slate-400 outline-hidden transition-all shadow-2xs font-medium"
                  />
                </div>

                {/* Report Title */}
                <div className="widget-cover__title">
                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-white/70 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#1976D2] rounded px-3 py-2 text-3xl sm:text-4xl font-black text-[#232A32] outline-hidden transition-all shadow-2xs"
                  />
                </div>

                {/* Domain */}
                <div className="widget-cover__domain">
                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-white/70 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#1976D2] rounded px-3 py-1.5 text-xl font-bold text-[#1976D2] outline-hidden transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Bottom Period & Generation Date */}
              <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#232A32]">
                <p className="widget-cover__period font-semibold" style={{ color: 'rgb(35, 42, 50)' }}>
                  <span>{period}</span>
                </p>
                <div className="widget-cover__bottom">
                  <p className="widget-cover__gendate font-medium text-slate-500" style={{ color: 'rgb(35, 42, 50)' }}>
                    <span>Generated on Oct-04 2026</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 2: TABLE OF CONTENTS & EXECUTIVE SCORECARD            */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              {/* Top Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[#1976D2]" />
                    <span>Table of Contents</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Project: {domain} • Period: {period}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 01 / Page 2
                </div>
              </div>

              {/* Exact Table of Contents List requested by user */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-5 rounded-xs space-y-2.5">
                {[
                  { name: 'Search visibility trend', page: '3' },
                  { name: 'Average position trend', page: '4' },
                  { name: 'Traffic forecast trend', page: '5' },
                  { name: 'Keywords in top trend', page: '6' },
                  { name: 'Key ranking metrics', page: '7' },
                  { name: 'Keywords with changed positions', page: '8' },
                  { name: 'History of rankings', page: '9' },
                  { name: 'Distribution of keywords by top positions', page: '10' },
                ].map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between py-1 text-xs text-[#1E293B]">
                    <span className="font-semibold">{item.name}</span>
                    <span className="flex-1 mx-3 border-b border-dotted border-slate-300 relative top-1" />
                    <span className="font-mono text-slate-500 font-bold">{item.page}</span>
                  </div>
                ))}
              </div>

              {/* Executive Overview Highlight */}
              <div className="mt-6 border border-[#E2E8F0] p-5 rounded-xs bg-[#FAFBFD] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#171B24] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1976D2]" />
                  <span>Executive Briefing</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  During this reporting period for <strong className="text-[#171B24]">{domain}</strong>, search visibility reached an average of <strong className="text-[#10B981]">27.6%</strong> (up from 19.5%), average position across active search terms is <strong className="text-[#1976D2]">65</strong>, and projected monthly organic search traffic is estimated at <strong className="text-[#171B24]">2,617 visits</strong> with 4 keywords firmly established in the primary SERP.
                </p>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#171B24]">{domain}</span>
                <span>• SE Ranking Enterprise Suite</span>
              </div>
              <div className="font-mono text-[11px]">
                Page 2 of 10
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 3: SEARCH VISIBILITY TREND                            */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1976D2]" />
                    <span>Search visibility trend</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Search visibility {period}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 02 / Page 3
                </div>
              </div>

              {/* Subheader: Google India / Average for all */}
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xs text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#171B24]">Google India</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Average for all</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className="w-3 h-3 rounded-full bg-[#1976D2]" />
                    <span>Google India: 27.6%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span>Average for all: 19.5%</span>
                  </div>
                </div>
              </div>

              {/* Chart Component */}
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xs shadow-2xs">
                <SearchVisibilityChart domain={domain} periodText={period} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Current Visibility</span>
                  <div className="text-2xl font-black text-[#1976D2]">27.6%</div>
                  <p className="text-slate-600">Share of impressions across target keywords</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Engine Average</span>
                  <div className="text-2xl font-black text-[#10B981]">19.5%</div>
                  <p className="text-slate-600">Baseline composite average for indexed terms</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Search Visibility Trend</span>
              <span className="font-mono text-[11px]">Page 3 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 4: AVERAGE POSITION TREND                             */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#1976D2]" />
                    <span>Average position trend</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Average position {period}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 03 / Page 4
                </div>
              </div>

              {/* Subheader */}
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xs text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#171B24]">Google India</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Average for all</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1976D2]">
                    <span className="w-3 h-3 rounded-full bg-[#1976D2]" />
                    <span>Average Position: 65</span>
                  </div>
                </div>
              </div>

              {/* Chart Component */}
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xs shadow-2xs">
                <AvgPositionChart domain={domain} periodText={period} />
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs text-xs text-[#475569] leading-relaxed">
                <strong className="text-[#171B24]">Metric Definition:</strong> The arithmetic mean of ranking positions of all keywords of a website. Position movement reflects algorithmic rankings across Google India search indices.
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Average Position Trend</span>
              <span className="font-mono text-[11px]">Page 4 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 5: TRAFFIC FORECAST TREND                             */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#1976D2]" />
                    <span>Traffic forecast trend</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Traffic forecast {period}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 04 / Page 5
                </div>
              </div>

              {/* Subheader */}
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xs text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#171B24]">Google India</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Average for all</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span>Forecast Volume: 2,617 visits</span>
                </div>
              </div>

              {/* Chart Component */}
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xs shadow-2xs">
                <TrafficForecastChart domain={domain} periodText={period} />
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs text-xs text-[#475569] leading-relaxed">
                <strong className="text-[#171B24]">Metric Definition:</strong> The potential volume of traffic that keywords can attract to a website based on current position, CTR click curves, and monthly search query volume.
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Traffic Forecast Trend</span>
              <span className="font-mono text-[11px]">Page 5 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 6: KEYWORDS IN TOP TREND                              */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[#1976D2]" />
                    <span>Keywords in top trend</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Google India • Average for all
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 05 / Page 6
                </div>
              </div>

              {/* Top Brackets Grid requested by user */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 1</span>
                  <div className="text-2xl font-black text-[#1E293B]">0%</div>
                  <span className="text-[10px] text-slate-400">Sep-28 2026 - Oct-04 2026</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 3</span>
                  <div className="text-2xl font-black text-[#10B981]">9.1%</div>
                  <span className="text-[10px] text-slate-400">1 keyword (share screen on teams)</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 5</span>
                  <div className="text-2xl font-black text-[#10B981]">18.2%</div>
                  <span className="text-[10px] text-slate-400">2 keywords</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 10</span>
                  <div className="text-2xl font-black text-[#1976D2]">27.3%</div>
                  <span className="text-[10px] text-slate-400">3 keywords</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 20</span>
                  <div className="text-2xl font-black text-[#1976D2]">27.3%</div>
                  <span className="text-[10px] text-slate-400">3 keywords</span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">% in Top 30</span>
                  <div className="text-2xl font-black text-[#1976D2]">27.3%</div>
                  <span className="text-[10px] text-slate-400">3 keywords</span>
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-2 pt-4">
                <span className="text-xs font-bold text-[#171B24] uppercase tracking-wider">Top Brackets Share</span>
                <div className="w-full h-8 bg-gray-100 rounded-sm overflow-hidden flex border border-[#E2E8F0]">
                  <div style={{ width: '9.1%' }} className="bg-[#10B981] h-full flex items-center justify-center text-white text-[10px] font-bold" title="Top 3: 9.1%">
                    Top 3
                  </div>
                  <div style={{ width: '18.2%' }} className="bg-[#1976D2] h-full flex items-center justify-center text-white text-[10px] font-bold" title="Top 4-10: 18.2%">
                    Top 4-10
                  </div>
                  <div style={{ width: '72.7%' }} className="bg-slate-300 h-full flex items-center justify-center text-slate-700 text-[10px] font-bold" title="Out of SERP: 72.7%">
                    Out of SERP
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Keywords in Top Trend</span>
              <span className="font-mono text-[11px]">Page 6 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 7: KEY RANKING METRICS                                */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#1976D2]" />
                    <span>Key ranking metrics</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Project: {domain} • Google India
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 06 / Page 7
                </div>
              </div>

              {/* Exact 4 Metric Cards requested by user */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Average position */}
                <div className="p-6 bg-white border border-[#CBD5E1] rounded-xs shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Average position
                  </div>
                  <div className="text-4xl font-black text-[#1976D2]">
                    65
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed pt-2 border-t border-slate-100">
                    The arithmetic mean of ranking positions of all keywords of a website.
                  </p>
                </div>

                {/* 2. Search visibility */}
                <div className="p-6 bg-white border border-[#CBD5E1] rounded-xs shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Search visibility
                  </div>
                  <div className="text-4xl font-black text-[#10B981] flex items-baseline gap-2">
                    <span>27.6%</span>
                    <span className="text-sm font-semibold text-slate-400">19.5%</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed pt-2 border-t border-slate-100">
                    Share of impressions a website gets in a given search engine for a given search query.
                  </p>
                </div>

                {/* 3. Traffic forecast */}
                <div className="p-6 bg-white border border-[#CBD5E1] rounded-xs shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Traffic forecast
                  </div>
                  <div className="text-4xl font-black text-[#171B24]">
                    2617
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed pt-2 border-t border-slate-100">
                    The potential volume of traffic that keywords can attract to a website.
                  </p>
                </div>

                {/* 4. Keywords in SERP */}
                <div className="p-6 bg-white border border-[#CBD5E1] rounded-xs shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Keywords in SERP
                  </div>
                  <div className="text-4xl font-black text-[#171B24]">
                    4
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed pt-2 border-t border-slate-100">
                    The number of keywords for which a website is ranking at the top (100 or 200) of the search results.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Key Ranking Metrics</span>
              <span className="font-mono text-[11px]">Page 7 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 8: KEYWORDS WITH CHANGED POSITIONS                    */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1976D2]" />
                    <span>Keywords with changed positions</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Sep-28 2026 - Oct-04 2026 • Google India
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 07 / Page 8
                </div>
              </div>

              {/* Exact 4 Tabs requested by user */}
              <div className="flex items-center border-b border-[#CBD5E1] text-xs">
                {(['entered10', 'left10', 'in10', 'entered100'] as const).map((tabKey) => {
                  const labels = {
                    entered10: 'Entered Top 10',
                    left10: 'Left Top 10',
                    in10: 'In Top 10',
                    entered100: 'Entered Top 100',
                  };
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setChangedTab(tabKey)}
                      className={`px-4 py-2 font-bold cursor-pointer transition-colors border-b-2 ${
                        changedTab === tabKey
                          ? 'border-[#1976D2] text-[#1976D2]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {labels[tabKey]}
                    </button>
                  );
                })}
              </div>

              {/* Keywords that jumped */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#171B24] uppercase tracking-wider">
                  Keywords that jumped
                </h3>
                <div className="border border-[#E2E8F0] rounded-xs overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4">Keyword</th>
                        <th className="py-2.5 px-4 text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      <tr>
                        <td className="py-3 px-4 font-medium text-[#171B24]">web skype</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          694 <span className="text-[10px]">▲</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Keywords that dropped */}
              <div className="space-y-2 pt-4">
                <h3 className="text-xs font-bold text-[#171B24] uppercase tracking-wider">
                  Keywords that dropped
                </h3>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xs text-xs text-slate-500 text-center">
                  No data
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • Keywords with Changed Positions</span>
              <span className="font-mono text-[11px]">Page 8 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 9: HISTORY OF RANKINGS                                */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-8 sm:p-10 space-y-6 flex flex-col justify-between print:break-after-page">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#1976D2]" />
                    <span>History of rankings</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {domain} • Google India
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 08 / Page 9
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center border-b border-[#CBD5E1] text-xs">
                {(['entered10', 'left10', 'in10', 'entered100'] as const).map((tabKey) => {
                  const labels = {
                    entered10: 'Entered Top 10',
                    left10: 'Left Top 10',
                    in10: 'In Top 10',
                    entered100: 'Entered Top 100',
                  };
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setHistoryTab(tabKey)}
                      className={`px-3 py-1.5 font-bold cursor-pointer transition-colors border-b-2 ${
                        historyTab === tabKey
                          ? 'border-[#1976D2] text-[#1976D2]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {labels[tabKey]}
                    </button>
                  );
                })}
              </div>

              {/* Exact History of Rankings Table requested by user */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xs">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-bold text-slate-600 whitespace-nowrap">
                    <tr>
                      <th className="py-2 px-3">Keyword</th>
                      <th className="py-2 px-2 text-right">Search Volume</th>
                      <th className="py-2 px-2 text-center">Visibility</th>
                      <th className="py-2 px-2 text-center">Dynamics</th>
                      <th className="py-2 px-3">URL in SERP</th>
                      <th className="py-2 px-2 text-right">Results</th>
                      <th className="py-2 px-2 text-center">Baseline</th>
                      <th className="py-2 px-2 text-center">Month ago</th>
                      <th className="py-2 px-2 text-center text-[#1976D2]">Current</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="bg-slate-50 font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                      <td colSpan={9} className="py-1 px-3">General</td>
                    </tr>
                    {[
                      { kw: 'share screen on teams', vol: 70, vis: '100', dyn: 'N/A', url: 'https://insider.teams.com/blog/give-take-control-when-screen-sharing-on-teams/', res: '107', base: '3', cur: '3' },
                      { kw: 'use skype online', vol: 10, vis: '60', dyn: 'N/A', url: 'https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/', res: '103', base: '5', cur: '5' },
                      { kw: 'online skype', vol: 10, vis: '50', dyn: 'N/A', url: 'https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/', res: '113', base: '6', cur: '6' },
                      { kw: 'web skype', vol: 390, vis: '50', dyn: '+94', url: 'https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/', res: '103', base: '-', cur: '694' },
                      { kw: 'microsoft teams web app', vol: 260, vis: 'N/A', dyn: 'N/A', url: '-', res: '134', base: '-', cur: '-' },
                      { kw: 'creator community', vol: 210, vis: 'N/A', dyn: 'N/A', url: '-', res: '236K', base: '-', cur: '-' },
                      { kw: 'download skype latest version', vol: 10, vis: 'N/A', dyn: 'N/A', url: '-', res: '120', base: '-', cur: '-' },
                      { kw: 'how does ms designer work', vol: 10, vis: 'N/A', dyn: 'N/A', url: '-', res: '175K', base: '-', cur: '-' },
                      { kw: 'how do i install microsoft teams meeting', vol: 0, vis: 'N/A', dyn: 'N/A', url: '-', res: '113', base: '-', cur: '-' },
                    ].map((row) => (
                      <tr key={row.kw} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#171B24] max-w-[150px] truncate">{row.kw}</td>
                        <td className="py-2 px-2 text-right font-mono">{row.vol}</td>
                        <td className="py-2 px-2 text-center font-mono">{row.vis}</td>
                        <td className="py-2 px-2 text-center font-mono text-emerald-600 font-bold">{row.dyn}</td>
                        <td className="py-2 px-3 text-slate-500 max-w-[140px] truncate font-mono text-[10px]" title={row.url}>
                          {row.url}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-500">{row.res}</td>
                        <td className="py-2 px-2 text-center font-mono">{row.base}</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">-</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-[#1976D2]">
                          {row.cur}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>{domain} • History of Rankings</span>
              <span className="font-mono text-[11px]">Page 9 of 10</span>
            </div>
          </section>

          {/* ========================================================== */}
          {/* PAGE 10: DISTRIBUTION OF KEYWORDS BY TOP POSITIONS         */}
          {/* ========================================================== */}
          <section className="report-page bg-white min-h-[1100px] border border-[#CBD5E1] print:border-none shadow-xl print:shadow-none rounded-xs p-10 sm:p-14 space-y-8 flex flex-col justify-between print:break-after-page">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#171B24] flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[#1976D2]" />
                    <span>Distribution of keywords by top positions</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Project: {domain}
                  </p>
                </div>
                <div className="text-right text-xs text-[#64748B] font-mono">
                  Section 09 / Page 10
                </div>
              </div>

              {/* Exact Distribution Table requested by user */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4">Search Engines</th>
                      <th className="py-2.5 px-3 text-center">Total Keywords</th>
                      <th className="py-2.5 px-3 text-center">Top 1</th>
                      <th className="py-2.5 px-3 text-center">Top 3</th>
                      <th className="py-2.5 px-3 text-center">Top 4..10</th>
                      <th className="py-2.5 px-3 text-center">Top 11..30</th>
                      <th className="py-2.5 px-3 text-center">Top 100</th>
                      <th className="py-2.5 px-3 text-center">Out of SERP</th>
                      <th className="py-2.5 px-4 text-right">Avg. Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="hover:bg-slate-50 font-medium">
                      <td className="py-3 px-4 font-bold text-[#171B24]">Google India</td>
                      <td className="py-3 px-3 text-center font-mono">11</td>
                      <td className="py-3 px-3 text-center font-mono">0</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#10B981]">1</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#1976D2]">3</td>
                      <td className="py-3 px-3 text-center font-mono">0</td>
                      <td className="py-3 px-3 text-center font-mono">0</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">7</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1976D2]">65</td>
                    </tr>
                    <tr className="hover:bg-slate-50 font-medium">
                      <td className="py-3 px-4 font-bold text-[#171B24]">General</td>
                      <td className="py-3 px-3 text-center font-mono">11</td>
                      <td className="py-3 px-3 text-center font-mono">0</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#10B981]">1</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#1976D2]">3</td>
                      <td className="py-3 px-3 text-center font-mono">0</td>
                      <td className="py-3 px-3 text-center font-mono">-</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">7</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1976D2]">65</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Informational Callout */}
              <div className="p-4 bg-[#EFF6FF] border border-blue-200 rounded-xs text-xs text-[#1E3A8A] flex items-center justify-between">
                <span>Set up AI Results Tracker to get additional AI visibility features</span>
                <span className="font-bold text-[#1976D2] cursor-pointer hover:underline">Learn more →</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#171B24]">SE Ranking</span>
                <span>• Generated on Oct-04 2026</span>
              </div>
              <div className="font-mono text-[11px]">
                Page 10 of 10
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ReportPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EBF0F5] flex items-center justify-center p-8 text-xs text-slate-600">
          Loading report preview...
        </div>
      }
    >
      <ReportPreviewContent />
    </Suspense>
  );
}
