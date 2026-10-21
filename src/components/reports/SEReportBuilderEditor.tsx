'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Edit3,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Info,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  HelpCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Folder,
  X,
} from 'lucide-react';
import { SearchVisibilityChart, AvgPositionChart, TrafficForecastChart } from './ReportTrendCharts';

export interface ReportSubItem {
  id: string;
  name: string;
}

export interface ReportSectionCategory {
  id: string;
  name: string;
  count?: number;
  hasSubItems: boolean;
  items?: ReportSubItem[];
}

export const REPORT_SECTION_CATEGORIES: ReportSectionCategory[] = [
  {
    id: 'link-presence',
    name: 'Link presence trend',
    hasSubItems: false,
  },
  {
    id: 'rankings',
    name: 'Rankings',
    count: 6,
    hasSubItems: true,
    items: [
      { id: 'project-summary', name: 'Project Summary' },
      { id: 'daily-result', name: 'Daily Result' },
      { id: 'rankings-first-last', name: 'Rankings for the First and Last Period Dates' },
      { id: 'history-rankings', name: 'Brief Rankings History' },
      { id: 'all-keywords', name: 'Rankings Overview Table' },
      { id: 'search-visibility', name: 'Rankings Charts' },
    ],
  },
  {
    id: 'analytics-traffic',
    name: 'Analytics & Traffic',
    count: 8,
    hasSubItems: true,
    items: [
      { id: 'traffic-overview', name: 'Overview' },
      { id: 'traffic-forecast', name: 'Traffic' },
      { id: 'traffic-pages', name: 'Pages' },
      { id: 'traffic-conversions', name: 'Conversions' },
      { id: 'traffic-audience', name: 'Audience' },
      { id: 'gsc-data', name: 'Google Search Console Data' },
      { id: 'traffic-goals', name: 'Goals' },
      { id: 'organic-traffic-table', name: 'Organic traffic overview table' },
    ],
  },
  {
    id: 'my-competitors',
    name: 'My Competitors',
    count: 3,
    hasSubItems: true,
    items: [
      { id: 'competitors-overview', name: 'Competitors Overview' },
      { id: 'competitors-all', name: 'Overview of All Competitors' },
      { id: 'competitor-rankings-details', name: 'Competitor Rankings in Details' },
    ],
  },
  {
    id: 'website-audit',
    name: 'Website Audit',
    count: 5,
    hasSubItems: true,
    items: [
      { id: 'audit-overview', name: 'Audit overview' },
      { id: 'audit-history', name: 'Audit history' },
      { id: 'audit-issues', name: 'Audit issues' },
      { id: 'page-indexation', name: 'Page indexation' },
      { id: 'domain-parameters', name: 'Domain parameters' },
    ],
  },
  {
    id: 'local-marketing',
    name: 'Local Marketing',
    count: 8,
    hasSubItems: true,
    items: [
      { id: 'local-locations', name: 'Locations' },
      { id: 'local-overview', name: 'Overview' },
      { id: 'local-audit', name: 'Local Marketing Audit' },
      { id: 'local-gbp', name: 'Google Business Profile' },
      { id: 'local-listings', name: 'Business Listings' },
      { id: 'local-reviews', name: 'Review List' },
      { id: 'local-analytics', name: 'Analytics' },
      { id: 'local-insights', name: 'Insights' },
    ],
  },
  {
    id: 'backlink-checker',
    name: 'Backlink Checker',
    count: 1,
    hasSubItems: true,
    items: [
      { id: 'backlink-checker-overview', name: 'Backlink Checker Overview' },
    ],
  },
  {
    id: 'backlink-monitor',
    name: 'Backlink Monitor',
    count: 5,
    hasSubItems: true,
    items: [
      { id: 'backlink-summary', name: 'Backlinks Summary' },
      { id: 'new-lost-backlinks', name: 'New & Lost Backlinks' },
      { id: 'disavowed-backlinks', name: 'Disavowed Backlinks' },
      { id: 'backlink-anchors', name: 'Anchors' },
      { id: 'backlink-ips', name: 'IPs & Subnets' },
    ],
  },
  {
    id: 'financial-report',
    name: 'Financial Report',
    hasSubItems: false,
  },
  {
    id: 'marketing-plan',
    name: 'Marketing Plan',
    hasSubItems: false,
  },
  {
    id: 'account-report',
    name: 'Account Report',
    hasSubItems: false,
  },
  {
    id: 'competitive-research',
    name: 'Competitive Research',
    count: 1,
    hasSubItems: true,
    items: [
      { id: 'competitive-research-overview', name: 'Organic & Paid Competitors' },
    ],
  },
  {
    id: 'keyword-research',
    name: 'Keyword Research',
    count: 1,
    hasSubItems: true,
    items: [
      { id: 'keyword-research-overview', name: 'Keyword Suggestions & Volume' },
    ],
  },
];

export interface SEReportBuilderEditorProps {
  initialReportName?: string;
  initialProject?: string;
  initialPeriod?: string;
  isTemplateMode?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function SEReportBuilderEditor({
  initialReportName = 'SEO report_Nike',
  initialProject = 'Nike',
  initialPeriod = 'Last Week',
  isTemplateMode = false,
  onSave,
  onCancel,
}: SEReportBuilderEditorProps) {
  // Report Meta
  const [reportName, setReportName] = useState(initialReportName);
  const [isEditingReportName, setIsEditingReportName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Suggest New Sections Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  // Left Sidebar Tab: 'Sections' | 'Formatting' | 'Settings'
  const [sidebarTab, setSidebarTab] = useState<'Sections' | 'Formatting' | 'Settings'>('Sections');

  // Settings Tab States
  const [bulkParamsOpen, setBulkParamsOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState(initialProject);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'XLSX' | 'HTML'>('PDF');
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [reportLanguage, setReportLanguage] = useState('English');
  const [scheduleReport, setScheduleReport] = useState(false);

  // Formatting Tab States
  const [showGenDate, setShowGenDate] = useState(true);
  const [showPageHeader, setShowPageHeader] = useState(true);
  const [showPageFooter, setShowPageFooter] = useState(true);

  // Sections Tab State: Filter & Accordion toggles
  const [sectionSearch, setSectionSearch] = useState('');
  const [formattingSearch, setFormattingSearch] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Rankings 2.0': true,
    'Google Analytics': false,
    'Google Search Console': false,
    'Google Ads': false,
    'Competitors': false,
    'AI Results Tracker': false,
    'Rankings': false,
    'Analytics & Traffic': false,
    'My Competitors': false,
    'Website Audit': false,
    'Local Marketing': false,
    'Backlink Checker': false,
    'Backlink Monitor': false,
    'Competitive Research': false,
    'Keyword Research': false,
  });

  // Active Report Widgets
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'cover',
    'toc',
    'search-visibility',
    'avg-position',
    'traffic-forecast',
    'keywords-top',
    'history-rankings',
    'all-keywords',
    'distribution-keywords',
    'competitors-overview',
    'ai-metrics',
    'mention-presence',
    'link-presence',
    'audit-overview',
    'marketing-plan',
  ]);

  // Document Content States
  const isNike = selectedProject.toLowerCase().includes('nike');
  const currentDomain = isNike ? 'www.nike.com' : 'teams.com';
  const [companyName, setCompanyName] = useState('');
  const [reportTitle, setReportTitle] = useState('SEO report');
  const [periodText, setPeriodText] = useState('SEP-28 2026 - OCT-04 2026');
  const [genDateText, setGenDateText] = useState('Generated on Oct-04 2026');
  const [footerCenterText, setFooterCenterText] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isLogoEditOpen, setIsLogoEditOpen] = useState(false);
  const [isCoverEditOpen, setIsCoverEditOpen] = useState(false);
  const [coverBgImage, setCoverBgImage] = useState('/skin/site/main/images/reports/covers/cover-1.svg');

  // Editable Rich Comments per section
  const [comments, setComments] = useState<Record<string, string>>({
    'search-visibility': '',
    'avg-position': '',
    'traffic-forecast': '',
    'keywords-top': '',
    'distribution-keywords': '',
    'competitors-overview': '',
    'ai-metrics': '',
    'mention-presence': '',
    'link-presence': '',
    'audit-overview': '',
    'marketing-plan': '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        onSave({
          name: reportName,
          project: selectedProject,
          domain: currentDomain,
          period: selectedPeriod,
          exportFormat,
          language: reportLanguage,
          widgets: activeWidgets,
        });
      }
      showToast(isTemplateMode ? 'Template saved successfully!' : 'Report saved successfully!');
    } catch (e) {
      showToast(isTemplateMode ? 'Error saving template' : 'Error saving report');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccordion = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const removeWidget = (id: string) => {
    setActiveWidgets((prev) => prev.filter((w) => w !== id));
    showToast('Section removed from report');
  };

  const addWidget = (id: string) => {
    if (!activeWidgets.includes(id)) {
      setActiveWidgets((prev) => [...prev, id]);
      showToast('Section added to report');
    }
  };

  const handleToggleWidget = (id: string) => {
    if (activeWidgets.includes(id)) {
      removeWidget(id);
    } else {
      addWidget(id);
    }
  };

  // Switch project handler
  const handleSelectProject = (proj: string) => {
    setSelectedProject(proj);
    if (proj.toLowerCase().includes('nike')) {
      setReportName(isTemplateMode ? 'Nike SEO Report Template' : 'SEO report_Nike');
    } else if (proj.toLowerCase().includes('teams')) {
      setReportName(isTemplateMode ? 'teams.com - SEO report' : 'SEO report_teams.com');
    } else {
      setReportName(isTemplateMode ? `${proj} SEO Template` : `SEO report_${proj}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F0F2F5] font-sans text-[#171B24] select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2 rounded shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 0. TOP CONTROL PANEL (Matching User HTML 1:1)                  */}
      {/* ============================================================== */}
      <div className="section-wrapper__top-control bg-white border-b border-[#E6E8EE] px-5 py-2 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="top-control-panel__cell top-control-panel__cell_grow flex items-center gap-2">
          <div className="se-breadcrumbs">
            <ul className="se-breadcrumbs__list flex items-center gap-2">
              <li className="se-breadcrumbs__item">
                <button
                  type="button"
                  onClick={onCancel}
                  className="se-breadcrumbs__link text-[#1976D2] hover:underline font-medium cursor-pointer"
                >
                  Report Builder
                </button>
              </li>
              {isTemplateMode && (
                <>
                  <li className="text-[#CBD5E1]">›</li>
                  <li className="text-[#8C9BA5] font-medium">Templates</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="top-control-panel__cell flex items-center gap-5">
          <div className="top-control-panel__feedback">
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-[#1976D2] hover:underline cursor-pointer font-medium"
            >
              Feedback
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-1 rounded-[3px] text-[11px]">
            <span className="text-[#8C9BA5] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1976D2]" />
              <span className="text-[#171B24] font-medium">Scheduled reporting</span>
            </span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-[#1976D2] h-full" style={{ width: '60%' }} />
            </div>
            <div className="font-bold text-[#171B24]">
              <span>3</span>
              <span className="text-[#8C9BA5] mx-0.5">/</span>
              <span>5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR matching SE Ranking live                     */}
      {/* ============================================================== */}
      <header className="h-[48px] bg-white border-b border-[#E6E8EE] px-5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          {isEditingReportName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                onBlur={() => setIsEditingReportName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingReportName(false);
                }}
                autoFocus
                className="text-[15px] font-semibold text-[#171B24] border-b-2 border-[#1976D2] px-1 py-0.5 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setIsEditingReportName(false)}
                className="text-[11px] text-[#1976D2] font-bold uppercase tracking-wider cursor-pointer"
              >
                DONE
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => setIsEditingReportName(true)}
              title="Click to rename report"
            >
              <span className="text-[15px] font-semibold text-[#171B24] tracking-tight">
                {reportName}
              </span>
              <Edit3 className="w-3.5 h-3.5 text-[#8C9BA5] group-hover:text-[#1976D2] transition-colors" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-bold text-[#5D5F65] hover:text-[#171B24] uppercase tracking-wider cursor-pointer transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-1.5 bg-[#1976D2] hover:bg-[#1565C0] active:bg-[#0D47A1] text-white text-xs font-bold uppercase tracking-wider rounded-[3px] shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isSaving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN 2-COLUMN LAYOUT: SIDEBAR (LEFT) & CANVAS (RIGHT)       */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR (~290px to 320px)                               */}
        {/* ============================================================ */}
        <aside className="w-[305px] bg-white border-r border-[#E6E8EE] flex flex-col shrink-0 overflow-y-auto">
          {/* Tabs: Sections | Formatting | Settings */}
          <div className="flex border-b border-[#E6E8EE] px-4 pt-1 bg-white sticky top-0 z-10">
            {(['Sections', 'Formatting', 'Settings'] as const).map((tab) => {
              const isActive = sidebarTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSidebarTab(tab)}
                  className={`pb-2.5 px-3 text-[12px] font-semibold transition-colors cursor-pointer relative ${
                    isActive
                      ? 'text-[#1976D2]'
                      : 'text-[#5D5F65] hover:text-[#171B24]'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1976D2]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: SETTINGS */}
          {sidebarTab === 'Settings' && (
            <div className="p-4 space-y-5 text-xs">
              {/* Bulk Parameters Section */}
              <div className="border border-[#E6E8EE] rounded-[4px] overflow-hidden bg-white">
                <div
                  onClick={() => setBulkParamsOpen(!bulkParamsOpen)}
                  className="p-3 bg-[#F8FAFC] flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#171B24] text-[12px] flex items-center gap-1.5">
                      <span>Bulk parameters</span>
                    </div>
                    <div className="text-[10px] text-[#8C9BA5] leading-tight">
                      The selected settings will be applied automatically in all added sections
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8C9BA5] transition-transform duration-200 shrink-0 ${
                      bulkParamsOpen ? '' : '-rotate-90'
                    }`}
                  />
                </div>

                {bulkParamsOpen && (
                  <div className="p-3.5 space-y-3.5 border-t border-[#E6E8EE] bg-white">
                    {/* Project dropdown */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#5D5F65]">
                        <span className="font-medium text-[#171B24]">Project:</span>
                        <span className="text-[10px] text-[#8C9BA5]">No sections</span>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedProject}
                          onChange={(e) => handleSelectProject(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[3px] text-[12px] text-[#171B24] appearance-none outline-hidden focus:border-[#1976D2] cursor-pointer"
                        >
                          <option value="Nike">✓ Nike</option>
                          <option value="teams.com">✓ teams.com</option>
                          <option value="workcomposer.com">✓ workcomposer.com</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8C9BA5] absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Bulk report period dropdown */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#5D5F65]">
                        <span className="font-medium text-[#171B24]">Bulk report period:</span>
                        <span className="text-[10px] text-[#8C9BA5]">No sections</span>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[3px] text-[12px] text-[#171B24] appearance-none outline-hidden focus:border-[#1976D2] cursor-pointer"
                        >
                          <option value="Last Week">Last Week</option>
                          <option value="Today">Today</option>
                          <option value="Yesterday">Yesterday</option>
                          <option value="Last 2 days">Last 2 days</option>
                          <option value="Last 7 days">Last 7 days</option>
                          <option value="Last 14 days">Last 14 days</option>
                          <option value="Last 30 days">Last 30 days</option>
                          <option value="Last 60 days">Last 60 days</option>
                          <option value="Last 90 days">Last 90 days</option>
                          <option value="Last 6 months">Last 6 months</option>
                          <option value="Last 12 months">Last 12 months</option>
                          <option value="Custom">Custom</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8C9BA5] absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export format buttons */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#171B24]">
                  Export format:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#F1F3F5] p-0.5 rounded-[4px]">
                  <button
                    type="button"
                    onClick={() => setExportFormat('PDF')}
                    className={`py-1.5 px-2 rounded-[3px] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      exportFormat === 'PDF'
                        ? 'bg-white text-[#7C3AED] shadow-2xs border border-[#CBD5E1]'
                        : 'text-[#64748B] hover:text-[#171B24]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] inline-block" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('XLSX')}
                    className={`py-1.5 px-2 rounded-[3px] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      exportFormat === 'XLSX'
                        ? 'bg-white text-[#059669] shadow-2xs border border-[#CBD5E1]'
                        : 'text-[#64748B] hover:text-[#171B24]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981] inline-block" />
                    <span>XLSX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('HTML')}
                    className={`py-1.5 px-2 rounded-[3px] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      exportFormat === 'HTML'
                        ? 'bg-white text-[#EA580C] shadow-2xs border border-[#CBD5E1]'
                        : 'text-[#64748B] hover:text-[#171B24]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] inline-block" />
                    <span>HTML</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Orientation Switch */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setHorizontalOrientation(!horizontalOrientation)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors mt-0.5 ${
                    horizontalOrientation ? 'bg-[#1976D2]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                      horizontalOrientation ? 'translate-x-3.5 ml-0.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <div>
                  <div className="text-[12px] font-medium text-[#171B24]">
                    Horizontal orientation
                  </div>
                  <div className="text-[10px] text-[#8C9BA5] leading-tight mt-0.5">
                    If selected, the pages of the report will be changed to a horizontal layout
                  </div>
                </div>
              </div>

              {/* Report content language */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#171B24]">
                  <span>Report content language:</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-[#64748B] flex items-center justify-center text-[9px] font-serif cursor-help">
                    i
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={reportLanguage}
                    onChange={(e) => setReportLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[3px] text-[12px] text-[#171B24] appearance-none outline-hidden focus:border-[#1976D2] cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Nederlands">Nederlands</option>
                    <option value="Français">Français</option>
                    <option value="Italiano">Italiano</option>
                    <option value="Português">Português</option>
                    <option value="Русский">Русский</option>
                    <option value="Español">Español</option>
                    <option value="日本">日本</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C9BA5] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Schedule report switch */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-[#E6E8EE]">
                <button
                  type="button"
                  onClick={() => setScheduleReport(!scheduleReport)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                    scheduleReport ? 'bg-[#1976D2]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                      scheduleReport ? 'translate-x-3.5 ml-0.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[12px] font-medium text-[#171B24]">
                  Schedule report
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: FORMATTING */}
          {sidebarTab === 'Formatting' && (
            <div className="p-4 space-y-4 text-xs">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C9BA5] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={formattingSearch}
                  onChange={(e) => setFormattingSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[3px] text-xs outline-hidden focus:border-[#1976D2]"
                />
              </div>

              {/* Formatting Items List */}
              <div className="space-y-1">
                {[
                  { id: 'cover', name: 'Cover Page', icon: 'wysiwyg', single: true },
                  { id: 'toc', name: 'Table of Contents', icon: 'anchor', single: true },
                  { id: 'title', name: 'Title', icon: 'title', single: false },
                  { id: 'text', name: 'Text', icon: 'format_align_left', single: false },
                  { id: 'image', name: 'Image', icon: 'insert_photo', single: false },
                  { id: 'break', name: 'Page break', icon: 'content_cut', single: false },
                ]
                  .filter((item) =>
                    item.name.toLowerCase().includes(formattingSearch.toLowerCase())
                  )
                  .map((item) => {
                    const isAdded = item.single && activeWidgets.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-[3px] border transition-colors ${
                          isAdded
                            ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-[#E6E8EE] hover:border-[#1976D2] text-[#171B24] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">⋮⋮</span>
                          <span className="text-[12px]">{item.name}</span>
                        </div>
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() => addWidget(item.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                            isAdded
                              ? 'text-gray-300'
                              : 'text-[#1976D2] hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Switches */}
              <div className="pt-3 border-t border-[#E6E8EE] space-y-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowGenDate(!showGenDate)}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                      showGenDate ? 'bg-[#1976D2]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        showGenDate ? 'translate-x-3.5 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[12px] text-[#171B24]">
                    Show report generation date
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPageHeader(!showPageHeader)}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                      showPageHeader ? 'bg-[#1976D2]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        showPageHeader ? 'translate-x-3.5 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[12px] text-[#171B24]">Page header</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPageFooter(!showPageFooter)}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                      showPageFooter ? 'bg-[#1976D2]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        showPageFooter ? 'translate-x-3.5 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[12px] text-[#171B24]">Page footer</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS */}
          {sidebarTab === 'Sections' && (
            <div className="p-3 space-y-3 text-xs">
              {/* Search input with live filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C9BA5] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[3px] text-xs outline-hidden focus:border-[#1976D2] placeholder:text-[#8C9BA5]"
                />
                {sectionSearch && (
                  <button
                    type="button"
                    onClick={() => setSectionSearch('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Accordion Categories List */}
              <div className="space-y-1">
                {(() => {
                  const query = sectionSearch.toLowerCase().trim();
                  const filtered = REPORT_SECTION_CATEGORIES.map((cat) => {
                    if (!query) {
                      return { ...cat, isVisible: true, filteredItems: cat.items || [] };
                    }
                    const catMatches = cat.name.toLowerCase().includes(query);
                    const matchedItems = (cat.items || []).filter((item) =>
                      item.name.toLowerCase().includes(query)
                    );
                    const isVisible = catMatches || matchedItems.length > 0;
                    return {
                      ...cat,
                      isVisible,
                      filteredItems: catMatches ? (cat.items || []) : matchedItems,
                    };
                  }).filter((cat) => cat.isVisible);

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-[#8C9BA5] space-y-2">
                        <p>No sections matching &quot;{sectionSearch}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setSectionSearch('')}
                          className="text-[#1976D2] hover:underline text-[11px] font-semibold cursor-pointer"
                        >
                          Clear search
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((cat) => {
                    const isOpen = query ? true : !!openSections[cat.name];
                    const isCatSelected = cat.hasSubItems
                      ? (cat.items || []).some((item) => activeWidgets.includes(item.id))
                      : activeWidgets.includes(cat.id);

                    if (!cat.hasSubItems) {
                      // Standalone single-level section
                      const isAdded = activeWidgets.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleToggleWidget(cat.id)}
                          className={`p-2 rounded-[3px] border transition-colors flex items-center justify-between cursor-pointer select-none ${
                            isAdded
                              ? 'bg-blue-50/50 border-[#1976D2] text-[#1976D2]'
                              : 'bg-white border-[#E6E8EE] hover:border-[#CBD5E1] text-[#171B24]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs">⋮⋮</span>
                            <span className="font-medium text-[12px]">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isAdded}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-[#1976D2] pointer-events-none"
                            />
                          </div>
                        </div>
                      );
                    }

                    // Accordion folder category with sub-items
                    return (
                      <div key={cat.id} className="border border-[#E6E8EE] rounded-[3px] overflow-hidden bg-white">
                        <div
                          onClick={() => toggleAccordion(cat.name)}
                          className="p-2 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isCatSelected}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cat.items) {
                                  const allAdded = cat.items.every((it) => activeWidgets.includes(it.id));
                                  if (allAdded) {
                                    cat.items.forEach((it) => removeWidget(it.id));
                                  } else {
                                    cat.items.forEach((it) => addWidget(it.id));
                                  }
                                }
                              }}
                              className="w-3.5 h-3.5 rounded text-[#1976D2] cursor-pointer"
                            />
                            <span className="font-medium text-[#171B24] text-[12px]">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#8C9BA5]">
                            <span className="text-[11px] font-mono">{cat.count || (cat.items ? cat.items.length : 1)}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                isOpen ? '' : '-rotate-90'
                              }`}
                            />
                          </div>
                        </div>

                        {isOpen && cat.filteredItems && cat.filteredItems.length > 0 && (
                          <div className="p-1 bg-[#F8FAFC] border-t border-[#E6E8EE] space-y-0.5 text-[11.5px]">
                            {cat.filteredItems.map((sub) => {
                              const isAdded = activeWidgets.includes(sub.id);
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => handleToggleWidget(sub.id)}
                                  className={`px-2 py-1.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                                    isAdded
                                      ? 'bg-blue-50 text-[#1976D2] font-semibold'
                                      : 'hover:bg-white text-[#4A5568] hover:text-[#171B24]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="text-gray-300 text-[10px]">⋮⋮</span>
                                    <span className="truncate">{sub.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={isAdded}
                                      onChange={() => {}}
                                      className="w-3.5 h-3.5 rounded text-[#1976D2] pointer-events-none"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Bottom Suggest Box */}
              <div className="pt-3 border-t border-[#E6E8EE] space-y-2">
                <div className="text-[10px] text-[#8C9BA5] leading-tight">
                  What data and integrations would you like to see in the new sections?
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuggestModalOpen(true)}
                  className="w-full py-1.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-[11px] font-bold text-[#171B24] uppercase tracking-wider rounded-[3px] transition-colors cursor-pointer"
                >
                  SUGGEST NEW SECTIONS
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ============================================================ */}
        {/* RIGHT CANVAS (THE REPORT DOCUMENT PAPER)                      */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col items-center">
          {/* A4 Document Container (~794px max-width) */}
          <div className={`w-full bg-white shadow-md border border-[#E2E8F0] text-[#171B24] flex flex-col transition-all ${horizontalOrientation ? 'max-w-[1080px]' : 'max-w-[780px]'}`}>
            {/* ======================================================== */}
            {/* WIDGET 1: COVER PAGE (User HTML 1:1)                     */}
            {/* ======================================================== */}
            {activeWidgets.includes('cover') && (
              <div className="content-reports__start border-b border-[#E2E8F0]">
                <div className="widget-cover widget">
                  <div className="widget-cover__wrapper widget-wrapper">
                    {/* Settings bar with Cover title and action buttons */}
                    <div className="widget-cover__settings-bar widget-text__bar widget-wrapper-bar">
                      <div className="widget-bar">
                        <div className="widget-bar__wrapper flex items-center justify-between bg-[#232A32] text-white px-3 py-1 text-xs select-none">
                          <div className="widget-bar__row flex items-center justify-between w-full">
                            <div className="widget-bar__title font-semibold">Cover</div>
                            <div className="widget-bar__actions flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setIsCoverEditOpen(true)}
                                className="widget-bar__btn widget-bar__btn_edit p-1 hover:bg-white/10 rounded cursor-pointer"
                                title="Edit Cover"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeWidget('cover')}
                                className="widget-bar__btn widget-bar__btn_remove p-1 hover:bg-white/10 rounded cursor-pointer"
                                title="Remove Cover"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path fill="none" d="M0 0h24v24H0V0z" />
                                  <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cover Content with background SVG */}
                    <div
                      className="widget-cover__content relative min-h-[780px] p-12 flex flex-col justify-between overflow-hidden bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${coverBgImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {/* Logo Section */}
                      <div className="widget-cover__logo flex flex-col items-center justify-center pt-8">
                        <div className="se-hint-element-2">
                          <div className="se-hint-element-2__wrapper">
                            <div className="widget-img__wrapper widget-wrapper group relative inline-block">
                              <div className="widget-img__bar widget-wrapper-bar absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-[#232A32] text-white px-2 py-0.5 rounded text-[11px] z-30 shadow-xs">
                                <div className="widget-bar">
                                  <div className="widget-bar__wrapper">
                                    <div className="widget-bar__row flex items-center gap-1.5">
                                      <div className="widget-bar__title">Logo</div>
                                      <div className="widget-bar__actions">
                                        <button
                                          type="button"
                                          onClick={() => setIsLogoEditOpen(true)}
                                          className="widget-bar__btn widget-bar__btn_edit p-0.5 hover:text-blue-300 cursor-pointer"
                                          title="Change Logo"
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <img
                                className="widget-img__image max-h-16 w-auto object-contain mx-auto"
                                src={customLogo || '/files/public/avatar/logo_se_pdf.png'}
                                alt="Logo"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/seranking/se-ranking-logo.svg';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Title / Domain / Period Center Block */}
                      <div className="space-y-4 my-auto text-center py-12">
                        <div className="widget-cover__company">
                          <div className="se-hint-element-2">
                            <div className="se-hint-element-2__wrapper">
                              <div className="widget-text">
                                <div className="widget-text__wrapper widget-wrapper">
                                  <textarea
                                    rows={1}
                                    maxLength={50}
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Type something here..."
                                    className="widget-text__input widget-text__input_view text-center text-[13px] bg-transparent outline-hidden w-full max-w-md mx-auto hover:bg-black/5 py-1 rounded transition-colors resize-none overflow-hidden"
                                    style={{ color: 'rgb(35, 42, 50)' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="widget-cover__title">
                          <div className="widget-text">
                            <div className="widget-text__wrapper widget-wrapper">
                              <textarea
                                rows={1}
                                maxLength={150}
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                placeholder="Type something here..."
                                className="widget-text__input widget-text__input_view text-center text-[22px] font-normal bg-transparent outline-hidden w-full max-w-lg mx-auto hover:bg-black/5 py-1 rounded transition-colors resize-none overflow-hidden"
                                style={{ color: 'rgb(35, 42, 50)' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="widget-cover__domain">
                          <div className="widget-text">
                            <div className="widget-text__wrapper widget-wrapper">
                              <textarea
                                rows={1}
                                maxLength={60}
                                value={currentDomain}
                                readOnly
                                placeholder="Type something here..."
                                className="widget-text__input widget-text__input_view text-center text-[42px] font-bold bg-transparent outline-hidden w-full max-w-xl mx-auto tracking-tight resize-none overflow-hidden"
                                style={{ color: 'rgb(35, 42, 50)' }}
                              />
                            </div>
                          </div>
                        </div>

                        <p className="widget-cover__period text-[13px] font-semibold tracking-wider font-mono pt-2" style={{ color: 'rgb(35, 42, 50)' }}>
                          <span>{periodText}</span>
                        </p>
                      </div>

                      {/* Bottom Generated Date */}
                      <div className="widget-cover__bottom text-center pb-4">
                        <p className="widget-cover__gendate text-[12px] font-medium" style={{ color: 'rgb(35, 42, 50)' }}>
                          <span>{genDateText}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* RUNNING HEADER (Matching User HTML 1:1)                  */}
            {/* ======================================================== */}
            {showPageHeader && (
              <table className="content-reports__table w-full">
                <thead>
                  <tr>
                    <th>
                      <div className="widget-running-header widget">
                        <div
                          className="widget-running-header__wrapper widget-wrapper px-6 py-2 flex items-center justify-between text-white text-xs select-none relative group"
                          style={{ backgroundColor: 'rgb(25, 118, 210)' }}
                        >
                          <div className="widget-common__bar widget-wrapper-bar absolute -top-6 left-0 hidden group-hover:flex items-center gap-1.5 bg-[#232A32] text-white px-2 py-0.5 rounded-t text-[11px] z-20">
                            <div className="widget-bar">
                              <div className="widget-bar__wrapper">
                                <div className="widget-bar__row flex items-center gap-1">
                                  <div className="widget-bar__title font-semibold">Page header</div>
                                  <div className="widget-bar__actions">
                                    <button
                                      type="button"
                                      className="widget-bar__btn widget-bar__btn_edit p-0.5 hover:text-blue-300 cursor-pointer"
                                      title="Edit page header"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="widget-running-header__item flex items-center gap-2.5">
                            <div className="widget-running-header__image">
                              <img
                                src="/files/public/avatar/logo_se_pdf.png"
                                className="widget-img__image h-4 w-auto brightness-0 invert object-contain"
                                alt="SE"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/seranking/se-ranking-logo.svg';
                                }}
                              />
                            </div>
                            <div className="widget-running-header__text font-bold text-[13px] tracking-tight">
                              SE Ranking
                            </div>
                          </div>

                          <div className="widget-running-header__item text-[12px] text-white/90">
                            {selectedProject}
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            )}

            {/* Document Body Padding */}
            <div className="p-8 space-y-10">
              {/* ====================================================== */}
              {/* WIDGET 2: TABLE OF CONTENTS (User HTML 1:1)             */}
              {/* ====================================================== */}
              {activeWidgets.includes('toc') && (
                <div id="widget-1" className="report-widget widget-contents widget bg-white border border-[#E6E8EE] rounded-sm p-6 group relative">
                  <div className="widget-contents__bar widget-wrapper-bar absolute -top-6 left-0 hidden group-hover:flex items-center justify-between bg-[#232A32] text-white px-2 py-0.5 rounded-t text-[11px] z-20">
                    <div className="widget-bar">
                      <div className="widget-bar__wrapper">
                        <div className="widget-bar__row flex items-center gap-2">
                          <div className="widget-bar__title font-semibold">Table of Contents</div>
                          <div className="widget-bar__actions">
                            <button
                              type="button"
                              onClick={() => removeWidget('toc')}
                              className="widget-bar__btn widget-bar__btn_remove p-0.5 hover:text-red-400 cursor-pointer"
                              title="Remove Table of Contents"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="widget-contents__title text-[16px] font-bold text-[#171B24] mb-4">
                    <span>Table of Contents</span>
                  </h3>
                  <div className="widget-contents__list space-y-2 text-[12px] text-[#171B24]">
                    {[
                      { name: 'Search visibility trend', href: '#widget-2' },
                      { name: 'Average position trend', href: '#widget-3' },
                      { name: 'Traffic forecast trend', href: '#widget-4' },
                      { name: 'Keywords in top trend', href: '#widget-5' },
                      { name: 'History of rankings', href: '#widget-6' },
                      { name: 'Distribution of keywords by top positions', href: '#widget-7' },
                      { name: 'Overview of All Competitors', href: '#widget-10' },
                    ].map((item) => (
                      <div key={item.name} className="widget-contents__item">
                        <a
                          href={item.href}
                          className="widget-contents__row flex items-baseline justify-between gap-2 hover:text-[#1976D2] group/item transition-colors"
                        >
                          <span className="widget-contents__text widget-contents__text_name font-medium">
                            {item.name}
                          </span>
                          <div className="widget-contents__separator flex-1 border-b border-dotted border-gray-400 mb-1" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 2: SEARCH VISIBILITY TREND                      */}
              {/* ====================================================== */}
              {activeWidgets.includes('search-visibility') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-2" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__wrapper widget-common-chart__wrapper_positions-chart widget-wrapper">
                      {/* Top Bar with Title, Drag Handle & Actions */}
                      <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                        <div className="widget-bar w-full">
                          <div className="widget-bar__wrapper">
                            <div className="widget-bar__row flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                                <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Search visibility trend</div>
                              </div>
                              <div className="widget-bar__actions flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => showToast('Editing Search visibility settings...')}
                                  className="widget-bar__btn widget-bar__btn_edit p-1 text-[#64748B] hover:text-[#1976D2] hover:bg-white rounded transition-colors"
                                  title="Edit widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleWidget('search-visibility')}
                                  className="widget-bar__btn widget-bar__btn_remove p-1 text-[#64748B] hover:text-red-500 hover:bg-white rounded transition-colors"
                                  title="Remove widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="widget-common-collapsible p-4">
                        <table className="widget-common__full w-full">
                          <tbody>
                            <tr>
                              <td>
                                <div className="c-section rb-cc space-y-3">
                                  {/* Header with Title and Domain */}
                                  <div className="c-section__header flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                                    <span className="rb-a-text rb-a-text_st-header text-[15px] font-bold text-[#171B24]">Search visibility trend</span>
                                    <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                      <span className="rb-a-text rb-a-text_st-domain text-gray-700">{currentDomain}</span>
                                    </div>
                                  </div>

                                  {/* Comment Box */}
                                  <div className="c-section__comment">
                                    <div className="part-comment">
                                      <div className="part-comment__wrapper">
                                        <textarea
                                          rows={1}
                                          value={comments['search-visibility'] || ''}
                                          onChange={(e) => setComments({ ...comments, 'search-visibility': e.target.value })}
                                          placeholder="Type something here..."
                                          className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Main Chart Card */}
                                  <div className="c-section__content space-y-2">
                                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                      <span className="font-semibold text-[#171B24]">Search visibility</span>
                                      <span>Sep 28 2026 - Oct 04 2026</span>
                                    </div>

                                    {/* High-fidelity interactive animated SVG chart */}
                                    <SearchVisibilityChart domain={currentDomain} periodText={periodText} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 3: AVERAGE POSITION TREND                       */}
              {/* ====================================================== */}
              {activeWidgets.includes('avg-position') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-3" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__wrapper widget-common-chart__wrapper_positions-chart widget-wrapper">
                      {/* Top Bar with Title, Drag Handle & Actions */}
                      <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                        <div className="widget-bar w-full">
                          <div className="widget-bar__wrapper">
                            <div className="widget-bar__row flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                                <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Average position trend</div>
                              </div>
                              <div className="widget-bar__actions flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => showToast('Editing Average position settings...')}
                                  className="widget-bar__btn widget-bar__btn_edit p-1 text-[#64748B] hover:text-[#1976D2] hover:bg-white rounded transition-colors"
                                  title="Edit widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleWidget('avg-position')}
                                  className="widget-bar__btn widget-bar__btn_remove p-1 text-[#64748B] hover:text-red-500 hover:bg-white rounded transition-colors"
                                  title="Remove widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="widget-common-collapsible p-4">
                        <table className="widget-common__full w-full">
                          <tbody>
                            <tr>
                              <td>
                                <div className="c-section rb-cc space-y-3">
                                  {/* Header with Title and Domain */}
                                  <div className="c-section__header flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                                    <span className="rb-a-text rb-a-text_st-header text-[15px] font-bold text-[#171B24]">Average position trend</span>
                                    <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                      <span className="rb-a-text rb-a-text_st-domain text-gray-700">{currentDomain}</span>
                                    </div>
                                  </div>

                                  {/* Comment Box */}
                                  <div className="c-section__comment">
                                    <div className="part-comment">
                                      <div className="part-comment__wrapper">
                                        <textarea
                                          rows={1}
                                          value={comments['avg-position'] || ''}
                                          onChange={(e) => setComments({ ...comments, 'avg-position': e.target.value })}
                                          placeholder="Type something here..."
                                          className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Main Chart Card */}
                                  <div className="c-section__content space-y-2">
                                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                      <span className="font-semibold text-[#171B24]">Average position</span>
                                      <span>Sep 28 2026 - Oct 04 2026</span>
                                    </div>

                                    {/* Inverted Y-axis Interactive Animated SVG Chart */}
                                    <AvgPositionChart domain={currentDomain} periodText={periodText} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 4: TRAFFIC FORECAST TREND                       */}
              {/* ====================================================== */}
              {activeWidgets.includes('traffic-forecast') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-4" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__wrapper widget-common-chart__wrapper_positions-chart widget-wrapper">
                      {/* Top Bar with Title, Drag Handle & Actions */}
                      <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                        <div className="widget-bar w-full">
                          <div className="widget-bar__wrapper">
                            <div className="widget-bar__row flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                                <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Traffic forecast trend</div>
                              </div>
                              <div className="widget-bar__actions flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => showToast('Editing Traffic forecast settings...')}
                                  className="widget-bar__btn widget-bar__btn_edit p-1 text-[#64748B] hover:text-[#1976D2] hover:bg-white rounded transition-colors"
                                  title="Edit widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleWidget('traffic-forecast')}
                                  className="widget-bar__btn widget-bar__btn_remove p-1 text-[#64748B] hover:text-red-500 hover:bg-white rounded transition-colors"
                                  title="Remove widget"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="widget-common-collapsible p-4">
                        <table className="widget-common__full w-full">
                          <tbody>
                            <tr>
                              <td>
                                <div className="c-section rb-cc space-y-3">
                                  {/* Header with Title and Domain */}
                                  <div className="c-section__header flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                                    <span className="rb-a-text rb-a-text_st-header text-[15px] font-bold text-[#171B24]">Traffic forecast trend</span>
                                    <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                      <span className="rb-a-text rb-a-text_st-domain text-gray-700">{currentDomain}</span>
                                    </div>
                                  </div>

                                  {/* Comment Box */}
                                  <div className="c-section__comment">
                                    <div className="part-comment">
                                      <div className="part-comment__wrapper">
                                        <textarea
                                          rows={1}
                                          value={comments['traffic-forecast'] || ''}
                                          onChange={(e) => setComments({ ...comments, 'traffic-forecast': e.target.value })}
                                          placeholder="Type something here..."
                                          className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Main Chart Card */}
                                  <div className="c-section__content space-y-2">
                                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                      <span className="font-semibold text-[#171B24]">Traffic forecast</span>
                                      <span>Sep 28 2026 - Oct 04 2026</span>
                                    </div>

                                    {/* High-fidelity interactive animated SVG chart with spikes & labels */}
                                    <TrafficForecastChart domain={currentDomain} periodText={periodText} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 5: KEYWORDS IN TOP TREND                        */}
              {/* ====================================================== */}
              {activeWidgets.includes('keywords-top') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-5" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                        <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Keywords in top trend</div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleWidget('keywords-top')}
                          className="p-1 text-[#64748B] hover:text-red-500 rounded transition-colors"
                          title="Remove widget"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                        <span className="text-[15px] font-bold text-[#171B24]">Keywords in top trend</span>
                        <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                          <img className="rounded-full" width={16} height={16} src={`https://www.google.com/s2/favicons?domain=${currentDomain}`} alt={currentDomain} />
                          <span>{currentDomain}</span>
                        </div>
                      </div>

                      <textarea
                        rows={1}
                        placeholder="Type something here..."
                        value={comments['keywords-top'] || ''}
                        onChange={(e) => setComments({ ...comments, 'keywords-top': e.target.value })}
                        className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                      />

                      <div className="space-y-4 pt-1">
                        {/* Grid of 6 Trend Cards matching user specification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            { title: '% in Top 1', val: '0%', stroke: '#B45309' },
                            { title: '% in Top 3', val: '9%', stroke: '#7C3AED' },
                            { title: '% in Top 5', val: '27%', stroke: '#E11D48' },
                            { title: '% in Top 10', val: '36%', stroke: '#059669' },
                            { title: '% in Top 20', val: '36%', stroke: '#1976D2' },
                            { title: '% in Top 30', val: '36%', stroke: '#D97706' },
                          ].map((card) => (
                            <div key={card.title} className="border border-[#E6E8EE] rounded p-3 bg-white space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                <span className="font-semibold text-[#171B24]">{card.title}</span>
                                <span className="font-bold text-[#171B24]">{card.val}</span>
                              </div>
                              <div className="text-[10px] text-[#8C9BA5]">
                                Sep-28 2026 - Oct-04 2026 • Google India • Average for all
                              </div>
                              <div className="h-16 w-full relative">
                                <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                                  <path d="M 5 35 Q 70 30, 130 38 T 195 25" fill="none" stroke={card.stroke} strokeWidth="2" />
                                  <circle cx="195" cy="25" r="3" fill={card.stroke} />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            className="px-4 py-1.5 border border-[#CBD5E1] bg-white hover:bg-gray-50 text-[11px] font-bold text-[#171B24] uppercase tracking-wider rounded-[3px] transition-colors"
                          >
                            SHOW MORE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 6: HISTORY OF RANKINGS (MATCHING REAL SE RANKING)*/}
              {/* ====================================================== */}
              {activeWidgets.includes('history-rankings') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-6" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                        <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">History of rankings</div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleWidget('history-rankings')}
                          className="p-1 text-[#64748B] hover:text-red-500 rounded transition-colors"
                          title="Remove widget"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                        <span className="text-[15px] font-bold text-[#171B24]">History of rankings</span>
                        <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                          <img className="rounded-full" width={16} height={16} src={`https://www.google.com/s2/favicons?domain=${currentDomain}`} alt={currentDomain} />
                          <span>{currentDomain}</span>
                        </div>
                      </div>

                      <textarea
                        rows={1}
                        placeholder="Type something here..."
                        value={comments['history-rankings'] || ''}
                        onChange={(e) => setComments({ ...comments, 'history-rankings': e.target.value })}
                        className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                      />

                      <div className="border border-[#E6E8EE] rounded p-4 bg-white space-y-4">
                        {/* Tabs / Filters matching SE Ranking */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1 border border-[#E6E8EE] rounded p-0.5 bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]">
                            <button type="button" className="px-2.5 py-1 bg-white text-[#1976D2] font-semibold rounded shadow-2xs">
                              Entered Top 10
                            </button>
                            <button type="button" className="px-2.5 py-1 hover:text-[#171B24]">
                              Left Top 10
                            </button>
                            <button type="button" className="px-2.5 py-1 hover:text-[#171B24]">
                              In Top 10
                            </button>
                            <button type="button" className="px-2.5 py-1 hover:text-[#171B24]">
                              Entered Top 100
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                            <span className="font-semibold text-[#171B24]">Google India</span>
                          </div>
                        </div>

                    {/* Table 1: SERP Dynamics */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E6E8EE] text-[#5D5F65]">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Keyword</th>
                            <th className="py-2.5 px-2 font-semibold">Search Volume</th>
                            <th className="py-2.5 px-2 font-semibold">Visibility</th>
                            <th className="py-2.5 px-2 font-semibold">Dynamics</th>
                            <th className="py-2.5 px-2 font-semibold">URL in SERP</th>
                            <th className="py-2.5 px-2 font-semibold">Results</th>
                            <th className="py-2.5 px-2 font-semibold">Baseline</th>
                            <th className="py-2.5 px-2 font-semibold">3 years ago</th>
                            <th className="py-2.5 px-2 font-semibold">2 years ago</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F3F5] text-[#171B24]">
                          {[
                            { kw: 'share screen on teams', vol: '70', vis: '100', dyn: 'N/A', url: 'https://insider.teams.com/blog/give-take-control-when-screen-sharing-on-teams/', res: '107', base: '3', y3: '-', y2: '-' },
                            { kw: 'use skype online', vol: '10', vis: '60', dyn: 'N/A', url: 'https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/', res: '103', base: '5', y3: '-', y2: '-' },
                            { kw: 'online skype', vol: '10', vis: '50', dyn: 'N/A', url: 'https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/', res: '113', base: '6', y3: '-', y2: '-' },
                            { kw: 'web skype', vol: '390', vis: 'N/A', dyn: 'N/A', url: '-', res: '103', base: '-', y3: '-', y2: '-' },
                            { kw: 'microsoft teams web app', vol: '260', vis: 'N/A', dyn: 'N/A', url: '-', res: '134', base: '-', y3: '-', y2: '-' },
                            { kw: 'creator community', vol: '210', vis: 'N/A', dyn: 'N/A', url: '-', res: '236K', base: '-', y3: '-', y2: '-' },
                            { kw: 'download skype latest version', vol: '10', vis: 'N/A', dyn: 'N/A', url: '-', res: '120', base: '-', y3: '-', y2: '-' },
                            { kw: 'how does ms designer work', vol: '10', vis: 'N/A', dyn: 'N/A', url: '-', res: '175K', base: '-', y3: '-', y2: '-' },
                            { kw: 'how do i install microsoft teams meeting', vol: '0', vis: 'N/A', dyn: 'N/A', url: '-', res: '113', base: '-', y3: '-', y2: '-' },
                          ].map((r, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80">
                              <td className="py-2 px-3 font-medium text-[#171B24]">{r.kw}</td>
                              <td className="py-2 px-2 text-[#5D5F65] font-mono">{r.vol}</td>
                              <td className="py-2 px-2 text-[#10B981] font-bold">{r.vis}</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">{r.dyn}</td>
                              <td className="py-2 px-2 text-[#1976D2] truncate max-w-[160px]" title={r.url}>{r.url}</td>
                              <td className="py-2 px-2 text-[#5D5F65]">{r.res}</td>
                              <td className="py-2 px-2 font-bold text-[#059669]">{r.base}</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">{r.y3}</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">{r.y2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2: Monthly / Historical Track */}
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E6E8EE] text-[#5D5F65]">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Keyword</th>
                            <th className="py-2 px-2 font-semibold">18 month ago</th>
                            <th className="py-2 px-2 font-semibold">1 year ago</th>
                            <th className="py-2 px-2 font-semibold">9 month ago</th>
                            <th className="py-2 px-2 font-semibold">6 month ago</th>
                            <th className="py-2 px-2 font-semibold">3 month ago</th>
                            <th className="py-2 px-2 font-semibold">Month ago</th>
                            <th className="py-2 px-2 font-semibold text-center bg-[#ECFDF5] text-[#059669]">Current rankings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F3F5] text-[#171B24]">
                          {[
                            'share screen on teams',
                            'use skype online',
                            'online skype',
                            'web skype',
                            'microsoft teams web app',
                            'creator community',
                            'download skype latest version',
                            'how does ms designer work',
                            'how do i install microsoft teams meeting',
                          ].map((kw, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80">
                              <td className="py-2 px-3 font-medium text-[#171B24]">{kw}</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-[#8C9BA5]">-</td>
                              <td className="py-2 px-2 text-center text-[#8C9BA5] bg-[#ECFDF5]/30">-</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* ====================================================== */}
              {/* WIDGET 7: ALL KEYWORDS RANKINGS TABLE                  */}
              {/* ====================================================== */}
              {activeWidgets.includes('all-keywords') && (
                <div className="space-y-2 group border border-transparent hover:border-[#E2E8F0] p-3 rounded transition-all relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#171B24]">All keywords rankings</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>{currentDomain}</span>
                    </div>
                  </div>

                  <div className="border border-[#E6E8EE] rounded overflow-x-auto bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#E6E8EE] text-[#5D5F65]">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Keyword</th>
                          <th className="py-2.5 px-2 font-semibold">Volume</th>
                          <th className="py-2.5 px-2 font-semibold">Visibility</th>
                          <th className="py-2.5 px-2 font-semibold">URL in SERP</th>
                          <th className="py-2.5 px-2 font-semibold text-center bg-[#ECFDF5] text-[#059669]">
                            Current rankings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F3F5]">
                        {[
                          { kw: 'share screen on teams', vol: '70', vis: '100%', url: `https://insider.teams.com/blog/give-take-control-when-screen-sharing-on-teams/`, rank: '3' },
                          { kw: 'use skype online', vol: '10', vis: '60%', url: `https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/`, rank: '5' },
                          { kw: 'online skype', vol: '10', vis: '50%', url: `https://insider.teams.com/blog/skype-dial-pad-now-available-in-teams-free/`, rank: '6' },
                          { kw: 'web skype', vol: '390', vis: '-', url: `-`, rank: '-' },
                          { kw: 'microsoft teams web app', vol: '260', vis: '-', url: `-`, rank: '-' },
                          { kw: 'creator community', vol: '210', vis: '-', url: `-`, rank: '-' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2 px-3 font-medium text-[#171B24] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              <span>{row.kw}</span>
                            </td>
                            <td className="py-2 px-2 text-[#5D5F65] font-mono">{row.vol}</td>
                            <td className="py-2 px-2 text-[#10B981] font-bold">{row.vis}</td>
                            <td className="py-2 px-2 text-[#1976D2] truncate max-w-[180px]">{row.url}</td>
                            <td className="py-2 px-2 text-center font-bold text-[#059669] bg-[#ECFDF5]/50">
                              {row.rank}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 7: DISTRIBUTION OF KEYWORDS BY TOP POSITIONS    */}
              {/* ====================================================== */}
              {activeWidgets.includes('distribution-keywords') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-7" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                        <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Distribution of keywords by top positions</div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleWidget('distribution-keywords')}
                          className="p-1 text-[#64748B] hover:text-red-500 rounded transition-colors"
                          title="Remove widget"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                        <span className="text-[15px] font-bold text-[#171B24]">
                          Distribution of keywords by top positions
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                          <img className="rounded-full" width={16} height={16} src={`https://www.google.com/s2/favicons?domain=${currentDomain}`} alt={currentDomain} />
                          <span>{currentDomain}</span>
                        </div>
                      </div>

                      <textarea
                        rows={1}
                        placeholder="Type something here..."
                        value={comments['distribution-keywords'] || ''}
                        onChange={(e) => setComments({ ...comments, 'distribution-keywords': e.target.value })}
                        className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                      />

                      <div className="border border-[#E6E8EE] rounded overflow-x-auto bg-white">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-[#F8FAFC] border-b border-[#E6E8EE] text-[#5D5F65]">
                            <tr>
                              <th className="py-2 px-3 font-semibold">Search Engines</th>
                              <th className="py-2 px-2 font-semibold">Total Keywords</th>
                              <th className="py-2 px-2 font-semibold">Top 1</th>
                              <th className="py-2 px-2 font-semibold">Top 3</th>
                              <th className="py-2 px-2 font-semibold">Top 4..10</th>
                              <th className="py-2 px-2 font-semibold">Top 11..30</th>
                              <th className="py-2 px-2 font-semibold">Top 100</th>
                              <th className="py-2 px-2 font-semibold">Out of SERP</th>
                              <th className="py-2 px-2 font-semibold">Avg. Position</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1F3F5] text-[#171B24]">
                            <tr>
                              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#1976D2]" />
                                <span>Google India</span>
                              </td>
                              <td className="py-2 px-2 font-bold">11</td>
                              <td className="py-2 px-2 text-[#059669] font-bold">0</td>
                              <td className="py-2 px-2 text-[#059669]">1</td>
                              <td className="py-2 px-2">3</td>
                              <td className="py-2 px-2">0</td>
                              <td className="py-2 px-2">0</td>
                              <td className="py-2 px-2 text-red-500">7</td>
                              <td className="py-2 px-2 font-bold">65</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                                <span>General</span>
                              </td>
                              <td className="py-2 px-2 font-bold">11</td>
                              <td className="py-2 px-2 text-[#059669] font-bold">0</td>
                              <td className="py-2 px-2 text-[#059669]">1</td>
                              <td className="py-2 px-2">3</td>
                              <td className="py-2 px-2">0</td>
                              <td className="py-2 px-2">-</td>
                              <td className="py-2 px-2 text-red-500">7</td>
                              <td className="py-2 px-2 font-bold">65</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Yellow Alert Box matching user text */}
                      <div className="p-3 bg-[#FEF9C3] border border-[#FDE047] rounded-[3px] text-[11px] text-[#854D0E] flex items-center gap-2">
                        <span className="text-sm font-bold">⚠️</span>
                        <span>Connect Google Analytics to get more information on organic traffic</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 10: OVERVIEW OF ALL COMPETITORS                  */}
              {/* ====================================================== */}
              {activeWidgets.includes('competitors-overview') && (
                <div className="report-widget-wrapper mb-6">
                  <div id="widget-10" className="widget-common report-widget widget wizard-mode widget-audit-site border border-[#E6E8EE] rounded-sm bg-white shadow-2xs group relative">
                    <div className="widget-common-chart__bar widget-wrapper-bar bg-[#F8FAFC] border-b border-[#E6E8EE] px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-[#94A3B8] text-sm cursor-grab">drag_indicator</span>
                        <div className="widget-bar__title text-[13px] font-bold text-[#171B24]">Overview of All Competitors</div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleToggleWidget('competitors-overview')}
                          className="p-1 text-[#64748B] hover:text-red-500 rounded transition-colors"
                          title="Remove widget"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 21h12V7H6v14zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                        <span className="text-[15px] font-bold text-[#171B24]">Overview of All Competitors</span>
                        <div className="flex items-center gap-1.5 text-xs text-[#171B24] font-medium">
                          <img className="rounded-full" width={16} height={16} src={`https://www.google.com/s2/favicons?domain=${currentDomain}`} alt={currentDomain} />
                          <span>{currentDomain}</span>
                        </div>
                      </div>

                      <textarea
                        rows={1}
                        placeholder="Type something here..."
                        value={comments['competitors-overview'] || ''}
                        onChange={(e) => setComments({ ...comments, 'competitors-overview': e.target.value })}
                        className="w-full text-xs text-[#232A32] placeholder:text-[#94A3B8] p-1.5 bg-[#FAFBFD] border border-transparent hover:border-[#E2E8F0] focus:border-[#1976D2] rounded transition-all resize-none outline-hidden"
                      />

                  <div className="border border-[#E6E8EE] rounded p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#171B24]">Competitor Visibility Dynamics</span>
                      <span>Sep-28 2026 - Oct-04 2026</span>
                    </div>

                    {/* Competitor Chips matching user specification */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {['www.microsoft.com', 'teams.live.com', 'play.google.com', 'calling.web.skype.com', 'skype.en.softonic.com'].map((chip) => (
                        <span key={chip} className="px-2.5 py-1 rounded bg-[#F1F3F5] text-[#1E293B] font-mono text-[10px] border border-[#CBD5E1]">
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Detailed Competitors Table matching user text dump */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E6E8EE] text-[#5D5F65]">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Name</th>
                            <th className="py-2 px-2 font-semibold">Visibility</th>
                            <th className="py-2 px-2 font-semibold">DT</th>
                            <th className="py-2 px-2 font-semibold">Backlinks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F3F5] text-[#171B24]">
                          {[
                            { name: 'www.microsoft.com', vis: '76.6', dt: '100', bl: 'BL: 2.7B', rd: 'RD: 28M' },
                            { name: 'teams.live.com', vis: '68.7', dt: '97', bl: 'BL: 31M', rd: 'RD: 26K' },
                            { name: 'play.google.com', vis: '47.7', dt: '100', bl: 'BL: 3.6B', rd: 'RD: 2.8M' },
                            { name: 'calling.web.skype.com', vis: '41', dt: '96', bl: 'BL: 464', rd: 'RD: 113' },
                            { name: 'skype.en.softonic.com', vis: '35.85', dt: '90', bl: 'BL: 4.1K', rd: 'RD: 427' },
                            { name: 'insider.teams.com', vis: '27.6', dt: '90', bl: 'BL: 246', rd: 'RD: 64' },
                            { name: 'skype.nicepage.io', vis: '24.5', dt: '87', bl: 'BL: 0', rd: 'RD: 0' },
                            { name: 'in.linkedin.com', vis: '21', dt: '100', bl: 'BL: 184M', rd: 'RD: 104K' },
                            { name: 'www.adgully.com', vis: '21', dt: '88', bl: 'BL: 575K', rd: 'RD: 11K' },
                            { name: 'learn.calzol.com', vis: '21', dt: '34', bl: 'BL: 0', rd: 'RD: 0' },
                          ].map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50/80">
                              <td className="py-2 px-3 font-medium text-[#1976D2]">{c.name}</td>
                              <td className="py-2 px-2 font-bold">{c.vis}</td>
                              <td className="py-2 px-2 text-[#5D5F65]">{c.dt}</td>
                              <td className="py-2 px-2 text-[10px] text-[#64748B] font-mono">
                                <div>{c.bl}</div>
                                <div className="text-gray-400">{c.rd}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Extra Integration and Upgrade CTA banners matching user text */}
                    <div className="space-y-2 pt-2 border-t border-[#E6E8EE]">
                      <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-xs text-[#1D4ED8] flex items-center justify-between">
                        <span>Set up AI Results Tracker to get this feature</span>
                        <button type="button" className="px-2.5 py-1 bg-[#1D4ED8] text-white rounded text-[10px] font-bold uppercase">
                          Setup Tracker
                        </button>
                      </div>
                      <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#B91C1C] flex items-center justify-between">
                        <span>This section is available only to subscribers</span>
                        <a href="/pricing" className="px-2.5 py-1 bg-[#B91C1C] text-white rounded text-[10px] font-bold uppercase">
                          Buy subscription
                        </a>
                      </div>
                      <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded text-xs text-[#15803D] flex items-center gap-2">
                        <span>📱</span>
                        <span>Connect your social media accounts to be in control of your social communications</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* ====================================================== */}
              {/* WIDGET 10: KEY AI RANKING METRICS                      */}
              {/* ====================================================== */}
              {activeWidgets.includes('ai-metrics') && (
                <div className="space-y-2 group border border-transparent hover:border-[#E2E8F0] p-3 rounded transition-all relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#171B24]">Key AI ranking metrics</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>{currentDomain}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={comments['ai-metrics']}
                    onChange={(e) => setComments({ ...comments, 'ai-metrics': e.target.value })}
                    className="w-full text-xs text-[#64748B] placeholder:text-gray-300 outline-hidden py-1"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-[#E6E8EE] rounded p-3.5 bg-white space-y-1">
                      <div className="text-[11px] font-semibold text-[#5D5F65]">
                        AI Overview presence
                      </div>
                      <div className="text-[26px] font-bold text-[#171B24]">0%</div>
                      <p className="text-[10px] text-[#8C9BA5] leading-tight">
                        Share of tracked prompts for which an AI Overview is shown, as of the last day of the selected period.
                      </p>
                    </div>

                    <div className="border border-[#E6E8EE] rounded p-3.5 bg-white space-y-1">
                      <div className="text-[11px] font-semibold text-[#5D5F65]">
                        Mention presence
                      </div>
                      <div className="text-[26px] font-bold text-[#171B24]">0%</div>
                      <p className="text-[10px] text-[#8C9BA5] leading-tight">
                        Share of tracked prompts for which AI results contain a mention of your brand, as of the last day of the selected period.
                      </p>
                    </div>

                    <div className="border border-[#E6E8EE] rounded p-3.5 bg-white space-y-1">
                      <div className="text-[11px] font-semibold text-[#5D5F65]">
                        Link presence
                      </div>
                      <div className="text-[26px] font-bold text-[#171B24]">0%</div>
                      <p className="text-[10px] text-[#8C9BA5] leading-tight">
                        Share of tracked prompts for which AI results contain a link to your website, as of the last day of the selected period.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 11: AUDIT OVERVIEW                              */}
              {/* ====================================================== */}
              {activeWidgets.includes('audit-overview') && (
                <div className="space-y-2 group border border-transparent hover:border-[#E2E8F0] p-3 rounded transition-all relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#171B24]">Audit overview</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>{currentDomain}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={comments['audit-overview']}
                    onChange={(e) => setComments({ ...comments, 'audit-overview': e.target.value })}
                    className="w-full text-xs text-[#64748B] placeholder:text-gray-300 outline-hidden py-1"
                  />

                  <div className="border border-[#E6E8EE] rounded p-5 bg-white space-y-6">
                    {/* Top Gauges: Health Score & Issue Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Health Score Gauge */}
                      <div className="flex flex-col items-center justify-center p-4 border border-[#F1F3F5] rounded text-center">
                        <span className="text-[11px] font-bold text-[#5D5F65] uppercase tracking-wider mb-2">
                          HEALTH SCORE
                        </span>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#F1F3F5" strokeWidth="8" fill="none" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#F59E0B"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 * (1 - 0.76)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-[#171B24]">76</span>
                            <span className="text-[9px] text-[#8C9BA5] uppercase">OUT OF 100</span>
                          </div>
                        </div>
                        <span className="mt-2 text-[10px] bg-[#E3FAEC] text-[#00B074] font-bold px-2 py-0.5 rounded">
                          DECENT
                        </span>
                      </div>

                      {/* Issue Distribution Donut */}
                      <div className="flex flex-col items-center justify-center p-4 border border-[#F1F3F5] rounded text-center">
                        <span className="text-[11px] font-bold text-[#5D5F65] uppercase tracking-wider mb-2">
                          ISSUE DISTRIBUTION
                        </span>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#1976D2" strokeWidth="8" fill="none" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#F59E0B"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 * 0.4}
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#E11D48"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 * 0.85}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-[#171B24]">54</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#1976D2]" /> Notices (35)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Warnings (15)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#E11D48]" /> Errors (4)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Core Web Vitals Bars */}
                    <div className="space-y-3 pt-2 border-t border-[#F1F3F5]">
                      <div className="text-[11px] font-bold text-[#5D5F65] uppercase tracking-wider">
                        CORE WEB VITALS
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Desktop */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#171B24]">Desktop</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                              Needs improvement
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>LCP:</span>
                                <span>86% / 9% / 5%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '86%' }} className="bg-[#10B981]" />
                                <div style={{ width: '9%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '5%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>INP:</span>
                                <span>92% / 6% / 2%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '92%' }} className="bg-[#10B981]" />
                                <div style={{ width: '6%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '2%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>CLS:</span>
                                <span>63% / 26% / 11%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '63%' }} className="bg-[#10B981]" />
                                <div style={{ width: '26%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '11%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#171B24]">Mobile</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                              Good
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>LCP:</span>
                                <span>78% / 13% / 9%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '78%' }} className="bg-[#10B981]" />
                                <div style={{ width: '13%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '9%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>INP:</span>
                                <span>78% / 18% / 4%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '78%' }} className="bg-[#10B981]" />
                                <div style={{ width: '18%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '4%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[#64748B] text-[10px]">
                                <span>CLS:</span>
                                <span>84% / 11% / 5%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                                <div style={{ width: '84%' }} className="bg-[#10B981]" />
                                <div style={{ width: '11%' }} className="bg-[#F59E0B]" />
                                <div style={{ width: '5%' }} className="bg-[#E11D48]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        className="px-4 py-1.5 border border-[#CBD5E1] bg-white hover:bg-gray-50 text-[11px] font-bold text-[#171B24] uppercase tracking-wider rounded-[3px] transition-colors"
                      >
                        SHOW MORE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* WIDGET 12: MARKETING PLAN                              */}
              {/* ====================================================== */}
              {activeWidgets.includes('marketing-plan') && (
                <div className="space-y-2 group border border-transparent hover:border-[#E2E8F0] p-3 rounded transition-all relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#171B24]">Marketing Plan</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>{currentDomain}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Type something here..."
                    value={comments['marketing-plan']}
                    onChange={(e) => setComments({ ...comments, 'marketing-plan': e.target.value })}
                    className="w-full text-xs text-[#64748B] placeholder:text-gray-300 outline-hidden py-1"
                  />

                  <div className="border border-[#E6E8EE] rounded p-5 bg-white space-y-5">
                    {/* 3 Metric Headers */}
                    <div className="grid grid-cols-3 gap-2 text-center items-center py-2">
                      <div>
                        <div className="text-3xl font-bold text-[#171B24]">65</div>
                        <div className="text-[10px] text-[#8C9BA5] uppercase font-bold mt-0.5">
                          TOTAL TASKS
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#F1F3F5" strokeWidth="6" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="6" fill="none" strokeDasharray="251.2" strokeDashoffset="251.2" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-[#171B24]">0</span>
                            <span className="text-[8px] text-[#8C9BA5]">OF 65</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-[#10B981] font-bold mt-1">COMPLETE 0%</div>
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-[#171B24]">65</div>
                        <div className="text-[10px] text-[#E11D48] uppercase font-bold mt-0.5">
                          TO DO 100%
                        </div>
                      </div>
                    </div>

                    {/* Step Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] pt-2 border-t border-[#F1F3F5]">
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 1: Introduction & Setup</span>
                        <span className="text-[#059669] font-mono font-bold">0/5</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 2: Technical SEO improvements</span>
                        <span className="text-[#059669] font-mono font-bold">0/21</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 3: Keyword and Competitor Research</span>
                        <span className="text-[#059669] font-mono font-bold">0/10</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 4: Content Audit & Creation</span>
                        <span className="text-[#059669] font-mono font-bold">0/7</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 5: On-page SEO</span>
                        <span className="text-[#059669] font-mono font-bold">0/9</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 6: Link building strategy</span>
                        <span className="text-[#059669] font-mono font-bold">0/8</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
                        <span className="text-[#171B24]">Step 7: Local SEO management</span>
                        <span className="text-[#059669] font-mono font-bold">0/5</span>
                      </div>
                    </div>

                    {/* Checkbox item */}
                    <div className="pt-2 border-t border-[#F1F3F5] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#171B24]">
                        <span>Step 1: Introduction & Setup</span>
                        <span className="text-[#059669] font-mono">0/5</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5D5F65]">
                        <input type="checkbox" className="rounded text-[#1976D2]" />
                        <span>Learn about SEO</span>
                      </div>
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          className="px-4 py-1 border border-[#CBD5E1] bg-white hover:bg-gray-50 text-[10px] font-bold text-[#171B24] uppercase tracking-wider rounded-[3px] transition-colors"
                        >
                          SHOW MORE
                        </button>
                      </div>
                    </div>

                    {/* Yellow Social Media Notice */}
                    <div className="p-3 bg-[#FEF9C3] border border-[#FDE047] rounded-[3px] text-[11px] text-[#854D0E] flex items-center gap-2">
                      <span className="text-sm font-bold">⚠️</span>
                      <span>Connect your social media accounts to be in control of your social communications</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* RUNNING FOOTER (if enabled)                              */}
            {/* ======================================================== */}
            {showPageFooter && (
              <div className="border-t border-[#E6E8EE] px-8 py-3.5 flex items-center justify-between text-[11px] text-[#8C9BA5] bg-white mt-auto">
                <span>04 Oct, 2026</span>
                <input
                  type="text"
                  placeholder="Type something here..."
                  value={footerCenterText}
                  onChange={(e) => setFooterCenterText(e.target.value)}
                  className="text-center text-[11px] text-[#64748B] placeholder:text-gray-300 bg-transparent outline-hidden hover:bg-gray-50 py-0.5 px-2 rounded"
                />
                <span>Page number</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Suggest New Sections Modal */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Suggest new sections</h3>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              What data and integrations would you like to see in the new sections? Let us know what metrics or platforms would help your reporting.
            </p>
            <textarea
              rows={4}
              value={suggestInput}
              onChange={(e) => setSuggestInput(e.target.value)}
              placeholder="e.g. TikTok Analytics, Semrush sync, Google Search Console regex filters, custom CRM ROI tracking..."
              className="w-full text-xs p-3 border border-gray-200 rounded-lg outline-hidden focus:border-[#1976D2] resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!suggestInput.trim() || isSubmittingSuggestion}
                onClick={async () => {
                  setIsSubmittingSuggestion(true);
                  try {
                    await fetch('/api/reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'suggest_sections',
                        suggestion: suggestInput.trim(),
                        project: selectedProject,
                      }),
                    });
                    showToast('Thank you! Your section suggestion was submitted.');
                    setSuggestInput('');
                    setIsSuggestModalOpen(false);
                  } catch {
                    showToast('Suggestion recorded. Thank you!');
                    setIsSuggestModalOpen(false);
                  } finally {
                    setIsSubmittingSuggestion(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  suggestInput.trim() && !isSubmittingSuggestion
                    ? 'bg-[#1976D2] hover:bg-[#1557C0] text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmittingSuggestion ? 'Submitting...' : 'Submit suggestion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SEReportBuilderEditor;
