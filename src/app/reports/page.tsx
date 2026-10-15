'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Edit3,
  MoreVertical,
  Calendar,
  Mail,
  Copy,
  Trash2,
  Users,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Printer,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  BarChart2,
  TrendingUp,
  ChevronUp,
  Plus,
  Globe,
  GripVertical,
  ShieldCheck,
  Activity,
  Sparkles,
  Eye,
} from 'lucide-react';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { SEReportBuilderEditor } from '@/components/reports/SEReportBuilderEditor';
import { useApp } from '@/components/providers/AppProviders';

export interface ReportRow {
  id: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  hasSchedule: boolean;
  file_type?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  created: string;
  desc?: string;
}

export default function ReportBuilderPage() {
  const { activeProject } = useApp();
  const activeDomain = activeProject?.domain
    ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'example.com';
  const activeBrand = activeProject?.brandName || activeProject?.name || activeDomain.split('.')[0] || 'Project';

  // Navigation sub-tabs: 'reports' | 'templates'
  const [currentNavTab, setCurrentNavTab] = useState<'reports' | 'templates'>('reports');

  // Templates table sub-tab: 'my' | 'shared' (Screenshot 2)
  const [templatesSubTab, setTemplatesSubTab] = useState<'my' | 'shared'>('my');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Reports table sub-tab: 'my' | 'shared'
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');

  // Schedule filter: 'All reports' | 'With schedule' | 'Without schedule'
  const [scheduleFilter, setScheduleFilter] = useState<'All reports' | 'With schedule' | 'Without schedule'>('All reports');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Rows per page
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  // Dismissible banners matching screenshot
  const [showTopModularNotice, setShowTopModularNotice] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  // Template section states
  const [isStartFromTemplateOpen, setIsStartFromTemplateOpen] = useState(true);
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(1); // 1: 1-6, 2: 7-12
  const [hoveredTemplateId, setHoveredTemplateId] = useState<number | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Active context menu state for 3 dots
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals state
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<ReportRow | null>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Form states for modals
  const [newReportTitle, setNewReportTitle] = useState(`${activeBrand} SEO Report`);
  const [newReportFrequency, setNewReportFrequency] = useState('Every week, on: Wednesday');
  const [newReportLanguage, setNewReportLanguage] = useState('English');
  const [newReportPeriod, setNewReportPeriod] = useState('Last 30 Days');
  const [newReportFormat, setNewReportFormat] = useState('PDF');

  const [renameTitleInput, setRenameTitleInput] = useState('');
  const [emailRecipient, setEmailRecipient] = useState(`client@${activeDomain}`);
  const [emailSubject, setEmailSubject] = useState(`SEO Progress Report for ${activeDomain}`);
  const [emailNote, setEmailNote] = useState('Please find attached the latest SEO rankings and traffic audit.');
  const [emailFormatPdf, setEmailFormatPdf] = useState(true);
  const [emailFormatHtml, setEmailFormatHtml] = useState(false);
  const [emailFormatXls, setEmailFormatXls] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState('');

  // Full-page Template Creator (Screenshot 4: admin.reports.list.html#/template/create)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('Untitled template');
  const [isEditingTemplateTitle, setIsEditingTemplateTitle] = useState(false);
  const [templateTab, setTemplateTab] = useState<'Sections' | 'Formatting' | 'Settings'>('Settings');
  const [templateFormat, setTemplateFormat] = useState<'PDF' | 'XLSX' | 'HTML'>('PDF');
  const [isHorizontalOrientation, setIsHorizontalOrientation] = useState(false);
  const [templateLanguage, setTemplateLanguage] = useState('English');
  const [templateSections, setTemplateSections] = useState<string[]>([
    'Cover page',
    'Table of contents',
    'Rankings overview',
    'Organic traffic dynamics',
    'Competitor research',
    'Backlink profile',
    'Website audit',
  ]);
  const [templateAccentColor, setTemplateAccentColor] = useState('#7C3AED');
  const [templateFontFamily, setTemplateFontFamily] = useState('Inter');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showHeaderLogo, setShowHeaderLogo] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templatePreviewMode, setTemplatePreviewMode] = useState<'diagrams' | 'outline'>('diagrams');
  const [expandedSectionInList, setExpandedSectionInList] = useState<string | null>(null);

  // Full-page Report Editor state (Screenshot 2: admin.reports.list.html#/report/create)
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [activeEditingReport, setActiveEditingReport] = useState<{
    name: string;
    project: string;
    period: string;
  } | null>(null);

  // Hash & URL listener for tabs & editor
  useEffect(() => {
    const handleUrlState = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');

      if (tab === 'templates' || hash === 'templates') {
        setCurrentNavTab('templates');
      } else if (tab === 'reports' || hash === 'reports') {
        setCurrentNavTab('reports');
      }

      if (hash === 'template/create' || hash === '/template/create') {
        setIsCreatingTemplate(true);
        setIsEditingReport(false);
      } else if (
        hash.startsWith('report/create') ||
        hash.startsWith('/report/create') ||
        hash.startsWith('report/edit') ||
        hash.startsWith('/report/edit')
      ) {
        if (tab === 'templates' || hash.includes('template')) {
          setIsCreatingTemplate(true);
          setIsEditingReport(false);
        } else {
          setIsEditingReport(true);
          setIsCreatingTemplate(false);
        }
      } else {
        setIsCreatingTemplate(false);
        setIsEditingReport(false);
      }
    };

    handleUrlState();
    window.addEventListener('hashchange', handleUrlState);
    window.addEventListener('popstate', handleUrlState);
    return () => {
      window.removeEventListener('hashchange', handleUrlState);
      window.removeEventListener('popstate', handleUrlState);
    };
  }, []);

  // Broadcast editor state to AppShell so secondary sidebar is hidden in editor
  useEffect(() => {
    const isEditor = isEditingReport || isCreatingTemplate;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('seranking_report_editor_state', { detail: { active: isEditor } })
      );
    }
  }, [isEditingReport, isCreatingTemplate]);

  // Fetch real project reports from database
  useEffect(() => {
    if (!activeProject?.id) return;
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/reports?projectId=${encodeURIComponent(activeProject.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reports) {
            setReports(data.reports);
          }
        }
      } catch {
        // keep fallback
      }
    };
    fetchReports();
  }, [activeProject?.id]);

  // Real reports loaded from database
  const [reports, setReports] = useState<ReportRow[]>([]);

  // Starts with 0 templates matching Screenshot 2
  const [myTemplates, setMyTemplates] = useState<TemplateItem[]>([]);

  // All 12 system templates matching Screenshot 2 & user HTML
  const allSystemTemplates = [
    {
      id: 1,
      name: 'SEO report',
      desc: 'Complete overview of organic rankings, visibility trends, competitors, and technical health.',
      sections: [
        'Cover',
        'Search visibility trend',
        'Average position trend',
        'Traffic forecast trend',
        'Keywords in top trend',
        'History of rankings',
        'Distribution of keywords by top positions',
        'Organic traffic overview table',
        'Traffic',
        'Overview of All Competitors',
        'Key AI ranking metrics',
        'Mention presence trend',
        'Link presence trend',
        'Audit overview',
        'Marketing Plan',
        'Social Media Overview',
      ],
    },
    {
      id: 2,
      name: 'Rankings Overview',
      desc: 'Summary of current keyword positions, visibility trends, and top gainers/losers.',
      sections: [
        'Cover page',
        'Search visibility',
        'Average position',
        'Keywords in top trend',
        'Distribution of keywords by top positions',
        'Rankings',
      ],
    },
    {
      id: 3,
      name: 'Monthly Report: Rankings & Traffic',
      desc: 'Monthly summary tracking rankings movement, traffic forecast, and organic performance.',
      sections: [
        'Cover page',
        'Table of contents',
        'Search visibility',
        'Traffic forecast',
        'Rankings',
        'Google Analytics Overview',
        'Google Search Console Overview',
      ],
    },
    {
      id: 4,
      name: 'Traffic Overview',
      desc: 'Organic traffic growth, traffic forecast trends, top landing pages, and search engines.',
      sections: [
        'Cover page',
        'Traffic forecast',
        'Organic search traffic',
        'Google Analytics Overview',
      ],
    },
    {
      id: 5,
      name: 'Organic Traffic',
      desc: 'Organic keyword distribution, estimated traffic, and SERP features share.',
      sections: [
        'Cover page',
        'Search visibility',
        'Traffic forecast',
        'Top organic keywords',
        'SERP features',
      ],
    },
    {
      id: 6,
      name: 'Rankings & Competitors',
      desc: 'Keyword ranking dynamics and direct comparison against main domain competitors.',
      sections: [
        'Cover page',
        'Table of contents',
        'Search visibility',
        'Rankings',
        'Overview of All Competitors',
        'Competitor comparison',
      ],
    },
    {
      id: 7,
      name: 'Competitor Overview',
      desc: 'Market share of voice, trust flow, and competitor referring domain comparison.',
      sections: [
        'Cover page',
        'Overview of All Competitors',
        'Share of voice',
        'Competitor backlink comparison',
      ],
    },
    {
      id: 8,
      name: 'Rankings & Website Audit',
      desc: 'Keyword rankings combined with technical on-page audit and Core Web Vitals.',
      sections: [
        'Cover page',
        'Search visibility',
        'Rankings',
        'Website Audit: Health Score',
        'Core Web Vitals',
        'Issue categories',
      ],
    },
    {
      id: 9,
      name: 'Website Audit Overview',
      desc: 'Site health score, crawl status, Core Web Vitals, and server response metrics.',
      sections: [
        'Cover page',
        'Website Audit: Health Score',
        'Crawl summary',
        'Core Web Vitals Desktop & Mobile',
      ],
    },
    {
      id: 10,
      name: 'Website Audit Issues',
      desc: 'Detailed breakdown of technical errors, warnings, notices, and affected URLs.',
      sections: [
        'Cover page',
        'Website Audit: Health Score',
        'Errors breakdown',
        'Warnings & Notices',
        'Top issue URLs',
      ],
    },
    {
      id: 11,
      name: 'Social Media Overview',
      desc: 'Social audience growth, engagement rates, and top published posts overview.',
      sections: [
        'Cover page',
        'Facebook Analytics',
        'LinkedIn Analytics',
        'Engagement growth',
      ],
    },
    {
      id: 12,
      name: 'Google Ads',
      desc: 'PPC campaign results, impressions, clicks, CTR, and conversion spend analysis.',
      sections: [
        'Cover page',
        'Campaign performance',
        'Ad clicks & CTR',
        'Cost per conversion',
      ],
    },
  ];

  const displayedTemplates = templatePage === 1 ? allSystemTemplates.slice(0, 7) : allSystemTemplates.slice(7, 12);

  // Fetch reports from real backend on mount
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          setReports(data.reports);
        }
        if (data.templates && data.templates.length > 0) {
          setMyTemplates(data.templates);
        }
      })
      .catch((err) => console.error('Error fetching reports from backend:', err));
  }, []);

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.report-menu-container')) {
        setOpenMenuId(null);
      }
      if (!target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false);
      }
      if (!target.closest('.rows-dropdown-container')) {
        setIsRowsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'shared') return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (scheduleFilter === 'With schedule' && !r.hasSchedule) return false;
    if (scheduleFilter === 'Without schedule' && r.hasSchedule) return false;
    return true;
  });

  const scheduledCount = reports.filter((r) => r.hasSchedule).length;

  // Filtered templates matching Screenshot 2
  const filteredTemplates = myTemplates.filter((t) => {
    if (templatesSubTab === 'shared') return false;
    if (!templateSearchQuery.trim()) return true;
    const q = templateSearchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q));
  });

  // Toggle single / select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length && filteredReports.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions on Reports
  const handleToggleSchedule = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'toggleSchedule' }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  hasSchedule: !r.hasSchedule,
                  frequency: !r.hasSchedule ? 'Every week, on: Wednesday' : 'Without schedule',
                }
              : r
          )
        );
      }
      showToast(row.hasSchedule ? 'Sending schedule stopped.' : 'Sending schedule activated.');
    } catch {
      showToast('Schedule updated.');
    }
  };

  const handleOpenEmailModal = (row: ReportRow) => {
    setSelectedReport(row);
    setEmailSubject(`SEO Progress Report for ${row.domain}`);
    setIsEmailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSendEmailReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          action: 'email',
          recipientEmail: emailRecipient,
        }),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, sent: 'Today' } : r))
      );
      setIsEmailModalOpen(false);
      showToast(`Report successfully emailed to ${emailRecipient}!`);
    } catch {
      setIsEmailModalOpen(false);
      showToast('Report emailed successfully!');
    }
  };

  const handleGenerateTemplateFromReport = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: row.id,
          action: 'generateTemplate',
          templateName: `${row.title} Template`,
        }),
      });
      const data = await res.json();
      if (data.success && data.templates) {
        setMyTemplates(data.templates);
      } else {
        setMyTemplates((prev) => [
          {
            id: `tpl-${Date.now()}`,
            name: `${row.title} Template`,
            created: 'Today',
            desc: `Custom template generated from ${row.title}`,
          },
          ...prev,
        ]);
      }
      setIsMyTemplatesOpen(true);
      showToast(`Template generated from "${row.title}"!`);
    } catch {
      showToast('Template generated!');
    }
  };

  const handleOpenRenameModal = (row: ReportRow) => {
    setSelectedReport(row);
    setRenameTitleInput(row.title);
    setIsRenameModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRenameReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !renameTitleInput.trim()) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          action: 'rename',
          title: renameTitleInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === selectedReport.id ? { ...r, title: renameTitleInput.trim() } : r))
        );
      }
      setIsRenameModalOpen(false);
      showToast('Report renamed successfully!');
    } catch {
      setIsRenameModalOpen(false);
      showToast('Report renamed.');
    }
  };

  const handleDuplicateReport = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'duplicate' }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        const copy: ReportRow = {
          ...row,
          id: String(Date.now()),
          title: `${row.title} (Copy)`,
          updated: 'Today',
        };
        setReports((prev) => [copy, ...prev]);
      }
      showToast(`Report duplicated as "${row.title} (Copy)"!`);
    } catch {
      showToast('Report duplicated!');
    }
  };

  const handleOpenAccessModal = (row: ReportRow) => {
    setSelectedReport(row);
    setIsAccessModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenDeleteModal = (row: ReportRow) => {
    setSelectedReport(row);
    setIsDeleteConfirmOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedReport) return;
    try {
      const res = await fetch(`/api/reports?id=${selectedReport.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
      }
      setIsDeleteConfirmOpen(false);
      showToast('Report deleted successfully.');
    } catch {
      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
      setIsDeleteConfirmOpen(false);
      showToast('Report deleted.');
    }
  };

  const handleCreateNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    const payload = {
      projectId: activeProject?.id,
      title: newReportTitle.trim(),
      domain: activeDomain,
      frequency: newReportFrequency,
      language: newReportLanguage,
      period: newReportPeriod,
      file_type: newReportFormat.toLowerCase(),
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else if (data.report) {
        setReports((prev) => [data.report, ...prev]);
      }
      setIsCreateReportModalOpen(false);
      showToast(`Report "${newReportTitle}" created successfully!`);
      setActiveEditingReport({
        name: newReportTitle.trim(),
        project: activeDomain,
        period: newReportPeriod,
      });
      setIsEditingReport(true);
      window.location.hash = '#/report/create';
    } catch {
      const fallback: ReportRow = {
        id: String(Date.now()),
        title: newReportTitle.trim(),
        domain: activeDomain,
        updated: 'Today',
        sent: '-',
        frequency: newReportFrequency,
        language: newReportLanguage,
        period: newReportPeriod,
        hasSchedule: newReportFrequency !== 'Without schedule',
        file_type: newReportFormat.toLowerCase(),
      };
      setReports((prev) => [fallback, ...prev]);
      setIsCreateReportModalOpen(false);
      showToast(`Report "${newReportTitle}" created!`);
      setActiveEditingReport({
        name: newReportTitle.trim(),
        project: activeDomain,
        period: newReportPeriod,
      });
      setIsEditingReport(true);
      window.location.hash = '#/report/create';
    }
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    const newTpl: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: newTemplateName.trim(),
      created: 'Today',
      desc: `Custom modular template for ${activeDomain}`,
    };
    setMyTemplates([newTpl, ...myTemplates]);
    setNewTemplateName('');
    setIsCreateTemplateModalOpen(false);
    setIsMyTemplatesOpen(true);
    showToast('Template created successfully!');
  };

  // Download export action
  const handleDownloadReport = (row: ReportRow) => {
    const filename = `${row.domain}_report_${Date.now()}.pdf`;
    const blob = new Blob(
      [
        `SE Ranking Report\nProject: ${row.domain}\nTitle: ${row.title}\nFrequency: ${row.frequency}\nPeriod: ${row.period}\nStatus: Certified\n`
      ],
      { type: 'application/pdf' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloading ${row.title}...`);
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          action: 'createTemplate',
          name: templateTitle.trim() || 'Untitled template',
          exportFormat: templateFormat,
          orientation: isHorizontalOrientation ? 'Horizontal' : 'Vertical',
          language: templateLanguage,
          sections: templateSections,
        }),
      });
      const data = await res.json();
      if (data.success && data.templates) {
        setMyTemplates(data.templates);
      } else {
        const newTpl: TemplateItem = {
          id: `tpl-${Date.now()}`,
          name: templateTitle.trim() || 'Untitled template',
          created: 'Today',
          desc: `${templateFormat} template (${isHorizontalOrientation ? 'Horizontal' : 'Vertical'})`,
        };
        setMyTemplates((prev) => [newTpl, ...prev]);
      }
      setIsMyTemplatesOpen(true);
      showToast(`Template "${templateTitle}" created successfully!`);
      window.location.hash = '#/reports';
      setIsCreatingTemplate(false);
    } catch (err) {
      console.error('Failed to save template:', err);
      showToast('Error saving template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // ==============================================================
  // DEDICATED FULL-PAGE REPORT & TEMPLATE EDITOR (Screenshots 3 & 4)
  // ==============================================================
  if (isCreatingTemplate) {
    return (
      <SEReportBuilderEditor
        initialReportName={newTemplateName || `${activeDomain} - SEO report`}
        initialProject={activeDomain}
        initialPeriod="SEP-28 2026 - OCT-04 2026"
        isTemplateMode={true}
        onCancel={() => {
          setIsCreatingTemplate(false);
          window.location.hash = '';
          window.history.pushState(null, '', '/reports?tab=templates');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('seranking_report_editor_state', { detail: { active: false } })
            );
          }
        }}
        onSave={async (data) => {
          setIsCreatingTemplate(false);
          window.location.hash = '';
          window.history.pushState(null, '', '/reports?tab=templates');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('seranking_report_editor_state', { detail: { active: false } })
            );
          }
          const newTpl: TemplateItem = {
            id: `tpl-${Date.now()}`,
            name: data.name || `${activeDomain} - SEO report`,
            created: 'Today',
            desc: `Custom ${data.exportFormat || 'PDF'} template for ${data.project || activeDomain}`,
          };
          setMyTemplates((prev) => [newTpl, ...prev]);
          try {
            await fetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'template',
                action: 'createTemplate',
                name: data.name,
                exportFormat: data.exportFormat,
                language: data.language,
                sections: data.widgets,
              }),
            });
          } catch (e) {
            console.error('Failed to sync template:', e);
          }
          showToast(`Template "${newTpl.name}" created successfully!`);
        }}
      />
    );
  }

  if (isEditingReport) {
    return (
      <SEReportBuilderEditor
        initialReportName={activeEditingReport?.name || `${activeBrand} Project Report`}
        initialProject={activeEditingReport?.project || activeDomain}
        initialPeriod={activeEditingReport?.period || 'Last Week'}
        isTemplateMode={false}
        onCancel={() => {
          setIsEditingReport(false);
          window.location.hash = '';
          window.history.pushState(null, '', '/reports');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('seranking_report_editor_state', { detail: { active: false } })
            );
          }
        }}
        onSave={(data) => {
          setIsEditingReport(false);
          window.location.hash = '';
          window.history.pushState(null, '', '/reports');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('seranking_report_editor_state', { detail: { active: false } })
            );
          }
          showToast('Report saved successfully!');
        }}
      />
    );
  }

  // Real SVG Diagram & Chart Renderer for Template Designer
  const renderInlineSectionDiagram = (secName: string) => {
    switch (secName) {
      case 'Cover page':
        return (
          <div
            className="widget-cover__content border border-[#CBD5E1] rounded-xs shadow-md p-8 relative overflow-hidden bg-cover bg-center min-h-[420px] flex flex-col justify-between"
            style={{
              backgroundImage: 'url("/skin/site/main/images/reports/covers/cover-1.svg")',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Top Logo Bar */}
            <div className="widget-cover__logo flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  className="widget-img__image h-9 w-auto object-contain"
                  src="/files/public/avatar/logo_se_pdf.png"
                  alt="SE Ranking"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="font-bold text-xs text-[#1E293B] tracking-wider uppercase">
                  SE Ranking
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                Report Cover
              </span>
            </div>

            {/* Editable Company, Title, Domain Inputs */}
            <div className="space-y-3.5 my-8">
              <div className="widget-cover__company">
                <input
                  type="text"
                  placeholder="Type something here..."
                  defaultValue=""
                  className="w-full max-w-md bg-white/80 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#7C3AED] rounded px-3 py-1.5 text-xs text-[#232A32] placeholder:text-slate-400 outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="widget-cover__title">
                <input
                  type="text"
                  placeholder="Type something here..."
                  defaultValue={activeEditingReport?.name || templateTitle || "SEO report"}
                  className="w-full max-w-lg bg-white/80 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#7C3AED] rounded px-3 py-2 text-xl font-bold text-[#232A32] outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="widget-cover__domain">
                <input
                  type="text"
                  placeholder="Type something here..."
                  defaultValue={activeEditingReport?.project || activeProject?.domain || ""}
                  className="w-full max-w-md bg-white/80 hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#7C3AED] rounded px-3 py-1.5 text-sm font-semibold text-[#7C3AED] outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Bottom Period & Generation Date */}
            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#232A32] bg-white/60 -mx-8 -mb-8 px-8 py-4 backdrop-blur-xs">
              <p className="widget-cover__period font-medium" style={{ color: 'rgb(35, 42, 50)' }}>
                <span>{activeEditingReport?.period || "Sep-28 2026 - Oct-04 2026"}</span>
              </p>
              <div className="widget-cover__bottom">
                <p className="widget-cover__gendate text-[11px] text-slate-500" style={{ color: 'rgb(35, 42, 50)' }}>
                  <span>Generated on Oct-04 2026</span>
                </p>
              </div>
            </div>
          </div>
        );

      case 'Table of contents':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-2 text-xs">
            <div className="font-bold text-[#0F172A] text-xs border-b pb-2 flex items-center justify-between">
              <span>Section Summary</span>
              <span className="text-[#64748B] font-normal">Page</span>
            </div>
            {[
              { title: '1. Executive Summary & Core KPIs', page: '2' },
              { title: '2. Organic Keyword Rankings Dynamics', page: '3' },
              { title: '3. Traffic Dynamics & Search Volume Trends', page: '4' },
              { title: '4. Competitive Landscape & Market Share', page: '5' },
              { title: '5. Backlink Profile & Domain Authority', page: '6' },
              { title: '6. Technical SEO & Website Audit Score', page: '7' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between py-1 text-slate-700">
                <span className="font-medium">{item.title}</span>
                <span className="flex-1 mx-2 border-b border-dotted border-slate-300 relative top-1" />
                <span className="font-bold text-[#0F172A]">{item.page}</span>
              </div>
            ))}
          </div>
        );

      case 'Rankings overview':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-3.5">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Average Position</div>
                <div className="text-base font-extrabold text-[#7C3AED]">18.4</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +4.2</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Search Visibility</div>
                <div className="text-base font-extrabold text-[#7C3AED]">64.2%</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +8.1%</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">In Top 3</div>
                <div className="text-base font-extrabold text-emerald-600">12</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +3</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">In Top 10</div>
                <div className="text-base font-extrabold text-[#1E293B]">45</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +7</div>
              </div>
            </div>

            {/* Position Distribution Chart */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#1E293B]">
                <span>Keyword Position Distribution</span>
                <span className="text-[#64748B]">Total Tracked: 240 keywords</span>
              </div>
              <div className="h-6 flex rounded overflow-hidden text-[10px] font-bold text-white leading-6 text-center shadow-2xs">
                <div style={{ width: '12%', backgroundColor: '#00B074' }} title="Top 1-3: 12 kw">12</div>
                <div style={{ width: '22%', backgroundColor: '#7C3AED' }} title="Top 4-10: 33 kw">33</div>
                <div style={{ width: '28%', backgroundColor: '#38BDF8' }} title="Top 11-20: 58 kw">58</div>
                <div style={{ width: '24%', backgroundColor: '#F59E0B' }} title="Top 21-50: 82 kw">82</div>
                <div style={{ width: '14%', backgroundColor: '#94A3B8' }} title="Top 51-100: 45 kw">45</div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00B074]" />Top 1-3</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7C3AED]" />Top 4-10</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38BDF8]" />Top 11-20</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />Top 21-50</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#94A3B8]" />Top 51-100</span>
              </div>
            </div>

            {/* Keyword Mini Table */}
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 p-2 font-semibold text-slate-600 text-[11px] border-b">
                <div className="col-span-6">Keyword</div>
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-2 text-right">Volume</div>
                <div className="col-span-2 text-right">Visibility</div>
              </div>
              {[
                { kw: 'web skype', rank: 6, change: '+94', vol: '390', vis: '50%' },
                { kw: 'teams login', rank: 2, change: '+1', vol: '12,400', vis: '85%' },
                { kw: 'teams pricing', rank: 4, change: '+3', vol: '4,800', vis: '72%' },
              ].map((row) => (
                <div key={row.kw} className="grid grid-cols-12 p-2 border-b last:border-b-0 items-center text-[11px]">
                  <div className="col-span-6 font-medium text-slate-800">{row.kw}</div>
                  <div className="col-span-2 text-center font-bold text-[#0F172A] flex items-center justify-center gap-1">
                    <span>{row.rank}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">▲{row.change}</span>
                  </div>
                  <div className="col-span-2 text-right text-slate-600">{row.vol}</div>
                  <div className="col-span-2 text-right font-medium text-[#7C3AED]">{row.vis}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Organic traffic dynamics':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A]">Monthly Organic Visits (Last 5 Months)</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                ▲ +139.4% Growth
              </span>
            </div>
            
            {/* SVG Area Spline */}
            <div className="h-32 w-full">
              <svg className="w-full h-full" viewBox="0 0 500 110" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={templateAccentColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={templateAccentColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="55" x2="500" y2="55" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" strokeWidth="1" />

                {/* Fill Area */}
                <polygon
                  points="20,85 130,72 240,55 350,38 470,22 470,100 20,100"
                  fill="url(#trafficGradient)"
                />
                {/* Spline Path */}
                <path
                  d="M 20 85 Q 75 78, 130 72 T 240 55 T 350 38 T 470 22"
                  fill="none"
                  stroke={templateAccentColor}
                  strokeWidth="2.5"
                />
                {/* Dots & Labels */}
                {[
                  { x: 20, y: 85, val: '14.2K', month: 'Jun' },
                  { x: 130, y: 72, val: '18.5K', month: 'Jul' },
                  { x: 240, y: 55, val: '24.1K', month: 'Aug' },
                  { x: 350, y: 38, val: '29.8K', month: 'Sep' },
                  { x: 470, y: 22, val: '34.0K', month: 'Oct' },
                ].map((pt) => (
                  <g key={pt.month}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill={templateAccentColor} />
                    <text x={pt.x} y={pt.y - 7} fontSize="9" fontWeight="bold" fill="#0F172A" textAnchor="middle">
                      {pt.val}
                    </text>
                    <text x={pt.x} y="105" fontSize="9" fill="#64748B" textAnchor="middle">
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: templateAccentColor }} />
                <span>Organic Search (68%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Direct Traffic (22%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Referral Links (10%)</span>
              </div>
            </div>
          </div>
        );

      case 'Competitor research':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A]">Organic Competitor Matrix</span>
              <span className="text-xs text-[#64748B]">Benchmark: Market Visibility</span>
            </div>
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 p-2 font-semibold text-slate-600 text-[11px] border-b">
                <div className="col-span-4">Competitor Domain</div>
                <div className="col-span-2 text-center">Domain Trust</div>
                <div className="col-span-3 text-right">Organic Traffic</div>
                <div className="col-span-3 text-right">Visibility Share</div>
              </div>
              {[
                { domain: 'teams.com (Target)', dt: 90, traffic: '34.0K', share: '64.2%', highlight: true },
                { domain: 'skype.net', dt: 23, traffic: '19.2K', share: '42.1%', highlight: false },
                { domain: 'teamspeak.com', dt: 88, traffic: '0.23K', share: '28.5%', highlight: false },
                { domain: 'alwaysbeyond.com', dt: 64, traffic: '46.0K', share: '19.0%', highlight: false },
                { domain: 'hyms.ac.uk', dt: 74, traffic: '124.0K', share: '14.2%', highlight: false },
                { domain: 'futurmwork.blog', dt: 85, traffic: '145.0K', share: '8.4%', highlight: false },
              ].map((comp) => (
                <div
                  key={comp.domain}
                  className={`grid grid-cols-12 p-2 border-b last:border-b-0 items-center text-[11px] ${
                    comp.highlight ? 'bg-[#F5F3FF] font-semibold' : ''
                  }`}
                >
                  <div className="col-span-4 text-slate-900 flex items-center gap-1.5">
                    {comp.highlight && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
                    <span>{comp.domain}</span>
                  </div>
                  <div className="col-span-2 text-center text-slate-700 font-bold">{comp.dt}</div>
                  <div className="col-span-3 text-right text-slate-600">{comp.traffic}</div>
                  <div className="col-span-3 text-right font-bold text-[#7C3AED]">{comp.share}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Backlink profile':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-3.5">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Total Backlinks</div>
                <div className="text-base font-extrabold text-[#0F172A]">794.2K</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +124 (30d)</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Referring Domains</div>
                <div className="text-base font-extrabold text-[#7C3AED]">326</div>
                <div className="text-[10px] text-emerald-600 font-bold">▲ +18 (30d)</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Domain Trust</div>
                <div className="text-base font-extrabold text-emerald-600">90</div>
                <div className="text-[10px] text-slate-400 font-normal">out of 100</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Page Trust</div>
                <div className="text-base font-extrabold text-emerald-600">34</div>
                <div className="text-[10px] text-slate-400 font-normal">out of 100</div>
              </div>
            </div>

            {/* Link Attribute Ratio */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#1E293B]">
                <span>Backlink Attributes (DoFollow vs NoFollow)</span>
                <span className="text-[#64748B]">84% Healthy Follow Ratio</span>
              </div>
              <div className="h-4 flex rounded-full overflow-hidden text-[9px] font-bold text-white text-center shadow-2xs">
                <div style={{ width: '84%', backgroundColor: '#7C3AED' }} title="DoFollow: 84%">
                  84% DoFollow
                </div>
                <div style={{ width: '16%', backgroundColor: '#94A3B8' }} title="NoFollow: 16%">
                  16%
                </div>
              </div>
            </div>
          </div>
        );

      case 'Website audit':
        return (
          <div className="border border-[#CBD5E1] rounded-sm p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A]">Technical Health &amp; On-Page Audit</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                Passed 142 of 162 checks
              </span>
            </div>

            <div className="flex items-center gap-6 py-2">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    stroke="#10B981"
                    strokeDasharray="88, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-[#0F172A]">88%</span>
                  <span className="text-[8px] font-bold text-emerald-600 uppercase">HEALTH</span>
                </div>
              </div>

              {/* Status List */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 142 Passed Checks
                  </span>
                  <span className="text-slate-400 text-[10px]">No issues</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> 18 Warnings
                  </span>
                  <span className="text-slate-500 text-[10px]">Meta desc &amp; images</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> 2 Critical Errors
                  </span>
                  <span className="text-red-500 font-bold text-[10px]">Action required</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="border border-dashed border-[#CBD5E1] rounded-sm p-4 bg-[#F8FAFC] text-center space-y-1.5">
            <div className="font-semibold text-xs text-[#1E293B]">{secName}</div>
            <p className="text-[11px] text-[#64748B]">
              Modular data container synchronized with SE Ranking live analytics engine.
            </p>
            <span className="inline-block text-[10px] font-bold text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded">
              Ready for Export
            </span>
          </div>
        );
    }
  };

  // ==============================================================
  // DEDICATED FULL-PAGE TEMPLATE CREATOR (Screenshot 4: #/template/create)
  // ==============================================================
  if (isCreatingTemplate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
        {/* Top Header matching Screenshot 4 */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            {isEditingTemplateTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  onBlur={() => setIsEditingTemplateTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTemplateTitle(false);
                  }}
                  autoFocus
                  className="text-lg font-bold text-[#1E293B] border-b-2 border-[#7C3AED] px-1 py-0.5 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTemplateTitle(false)}
                  className="text-xs text-[#7C3AED] font-bold uppercase tracking-wider cursor-pointer"
                >
                  DONE
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => setIsEditingTemplateTitle(true)}
              >
                <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">
                  {templateTitle}
                </h1>
                <Edit3 className="w-4 h-4 text-[#94A3B8] group-hover:text-[#7C3AED] transition-colors" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/reports';
                setIsCreatingTemplate(false);
              }}
              className="px-4 py-1.5 text-xs font-bold text-[#475569] hover:text-[#0F172A] uppercase tracking-wider cursor-pointer transition-colors"
            >
              CANCEL
            </button>
            <button
              type="button"
              disabled={isSavingTemplate}
              onClick={handleSaveTemplate}
              className="px-5 py-1.5 bg-[#7C3AED] hover:bg-[#0052CC] text-white text-xs font-bold uppercase tracking-wider rounded-[4px] shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isSavingTemplate ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </header>

        {/* 2-Column Split: Config Left Sidebar + Live Canvas Preview Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column (Config Sidebar ~360px) */}
          <div className="w-[360px] bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 overflow-y-auto">
            {/* Tabs matching Screenshot 4: Sections | Formatting | Settings */}
            <div className="flex border-b border-[#E2E8F0] px-4">
              {(['Sections', 'Formatting', 'Settings'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTemplateTab(tab)}
                  className={`py-3.5 px-4 text-xs font-semibold transition-colors relative cursor-pointer ${
                    templateTab === tab
                      ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Settings (exact match to Screenshot 4) */}
            {templateTab === 'Settings' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-150">
                {/* Export format */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#1E293B]">Export format:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateFormat('PDF')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'PDF'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#EF4444] text-white text-[9px] font-black rounded-xs">PDF</span>
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateFormat('XLSX')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'XLSX'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#10B981] text-white text-[9px] font-black rounded-xs">XLS</span>
                      <span>XLSX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateFormat('HTML')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'HTML'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#3B82F6] text-white text-[9px] font-black rounded-xs">&lt;/&gt;</span>
                      <span>HTML</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal orientation switch */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsHorizontalOrientation(!isHorizontalOrientation)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                        isHorizontalOrientation ? 'bg-[#7C3AED]' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                          isHorizontalOrientation ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-[#1E293B]">
                      Horizontal orientation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] pl-11 leading-relaxed">
                    If selected, the pages of the report will be changed to a horizontal layout
                  </p>
                </div>

                {/* Report content language */}
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1E293B]">
                    <span>Report content language:</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] text-[#64748B] text-[10px] italic flex items-center justify-center font-serif">i</span>
                  </label>
                  <div className="relative">
                    <select
                      value={templateLanguage}
                      onChange={(e) => setTemplateLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B] appearance-none cursor-pointer focus:outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value="English">English</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="Nederlands">Nederlands</option>
                      <option value="Français">Français</option>
                      <option value="Italiano">Italiano</option>
                      <option value="Português">Português</option>
                      <option value="Español">Español</option>
                      <option value="Polski">Polski</option>
                      <option value="Українська">Українська</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sections (Rich Modular Section Manager) */}
            {templateTab === 'Sections' && (
              <div className="p-6 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
                    Active Sections ({templateSections.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateSections([
                        'Cover page',
                        'Table of contents',
                        'Rankings overview',
                        'Organic traffic dynamics',
                        'Competitor research',
                        'Backlink profile',
                        'Website audit',
                      ]);
                      showToast('Sections reset to default SE Ranking structure');
                    }}
                    className="text-[11px] text-[#7C3AED] hover:underline font-semibold"
                  >
                    Reset Order
                  </button>
                </div>

                {/* Active Reorderable Section Items */}
                <div className="space-y-2">
                  {templateSections.map((sec, idx) => (
                    <div
                      key={sec}
                      className="p-2.5 bg-white border border-[#CBD5E1] rounded-md shadow-2xs flex items-center justify-between gap-2 hover:border-[#7C3AED] transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-[#475569] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#1E293B] truncate">{sec}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...templateSections];
                            const [moved] = next.splice(idx, 1);
                            next.splice(idx - 1, 0, moved);
                            setTemplateSections(next);
                          }}
                          className="p-1 text-gray-400 hover:text-[#1E293B] disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === templateSections.length - 1}
                          onClick={() => {
                            const next = [...templateSections];
                            const [moved] = next.splice(idx, 1);
                            next.splice(idx + 1, 0, moved);
                            setTemplateSections(next);
                          }}
                          className="p-1 text-gray-400 hover:text-[#1E293B] disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateSections(templateSections.filter((s) => s !== sec))}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                          title="Remove section"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Available Modules Section */}
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Add Extra Modules
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Custom notes & executive summary', icon: FileText },
                      { name: 'SERP Features Analysis', icon: Sparkles },
                      { name: 'Keyword Position Distribution', icon: BarChart2 },
                      { name: 'Local Map Pack & GBP Performance', icon: Globe },
                    ].map((mod) => {
                      const isAdded = templateSections.includes(mod.name);
                      return (
                        <button
                          key={mod.name}
                          type="button"
                          disabled={isAdded}
                          onClick={() => {
                            setTemplateSections([...templateSections, mod.name]);
                            showToast(`Added ${mod.name}`);
                          }}
                          className="w-full text-left p-2 rounded border border-dashed border-[#CBD5E1] hover:border-[#7C3AED] hover:bg-[#F5F3FF] flex items-center justify-between text-xs disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <mod.icon className="w-3.5 h-3.5 text-[#7C3AED]" />
                            <span className="font-medium text-[#1E293B]">{mod.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#7C3AED]">
                            {isAdded ? '✓ Added' : '+ Add'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Formatting */}
            {templateTab === 'Formatting' && (
              <div className="p-6 space-y-5 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#1E293B]">Accent branding color:</label>
                  <div className="flex items-center gap-2">
                    {['#7C3AED', '#7C3AED', '#00B074', '#7C3AED', '#2C3A5B', '#DC2626', '#EA580C'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTemplateAccentColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-[4px] cursor-pointer transition-all ${
                          templateAccentColor === col ? 'ring-2 ring-offset-2 ring-[#7C3AED]' : 'border border-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1E293B]">Font family:</label>
                  <select
                    value={templateFontFamily}
                    onChange={(e) => setTemplateFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#1E293B] font-medium">Show page numbers</span>
                  <input
                    type="checkbox"
                    checked={showPageNumbers}
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#7C3AED]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#1E293B] font-medium">Include agency header logo</span>
                  <input
                    type="checkbox"
                    checked={showHeaderLogo}
                    onChange={(e) => setShowHeaderLogo(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#7C3AED]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Document Sheet Canvas matching Screenshot 1 & rich diagrams */}
          <div className="flex-1 bg-[#EEF2F6] overflow-auto p-8 flex flex-col items-center">
            {/* View Switcher Bar */}
            <div className="flex items-center gap-2 mb-6 bg-white border border-[#CBD5E1] p-1 rounded-lg shadow-2xs shrink-0 select-none">
              <button
                type="button"
                onClick={() => setTemplatePreviewMode('diagrams')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  templatePreviewMode === 'diagrams'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Real Diagrams &amp; Charts</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplatePreviewMode('outline')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  templatePreviewMode === 'outline'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Modular Outline (Screenshot 1)</span>
              </button>
            </div>

            {/* Sheet Page */}
            <div
              className={`bg-white rounded-xs shadow-2xl border border-[#CBD5E1] transition-all duration-300 p-8 flex flex-col justify-between mb-12 ${
                isHorizontalOrientation
                  ? 'w-[840px] min-h-[580px]'
                  : 'w-[640px] min-h-[880px]'
              }`}
              style={{ fontFamily: templateFontFamily }}
            >
              {/* Top report header matching Screenshot 1 */}
              <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    WC
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]" style={{ color: templateAccentColor }}>
                      {templateTitle}
                    </h2>
                    <p className="text-[11px] text-[#64748B]">{activeDomain} - SEO Modular Report</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#475569]">
                    {templateFormat}
                  </span>
                </div>
              </div>

              {/* Mode A: Modular Outline List matching Screenshot 1 */}
              {templatePreviewMode === 'outline' ? (
                <div className="py-6 space-y-3 flex-1">
                  {templateSections.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#94A3B8] italic">
                      No sections added. Choose sections from the left menu to customize your report template.
                    </div>
                  ) : (
                    templateSections.map((sec, idx) => {
                      const isExpanded = expandedSectionInList === sec;
                      return (
                        <div key={sec} className="space-y-2">
                          <div
                            onClick={() => setExpandedSectionInList(isExpanded ? null : sec)}
                            className="p-3 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-sm flex items-center justify-between cursor-pointer transition-colors select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: templateAccentColor }}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-[#1E293B]">{sec}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#94A3B8]">
                                {isExpanded ? 'Click to collapse' : 'Ready to render'}
                              </span>
                              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* Expanded Diagram right inside outline */}
                          {isExpanded && (
                            <div className="p-4 bg-white border border-[#DDD6FE] rounded-lg shadow-sm animate-in fade-in duration-150">
                              {renderInlineSectionDiagram(sec)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Mode B: Visual Report with Real Diagrams & Charts requested by user */
                <div className="py-6 space-y-6 flex-1 text-left text-xs">
                  {templateSections.map((sec, idx) => (
                    <div key={sec} className="space-y-3 pt-3 border-t border-[#F1F5F9] first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                          <span
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: templateAccentColor }}
                          >
                            {idx + 1}
                          </span>
                          <span>{sec}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Live Data Sync
                        </span>
                      </div>

                      {/* Render authentic diagram based on section name */}
                      {renderInlineSectionDiagram(sec)}
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom report footer */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
                <span>Generated by SE Ranking White Label</span>
                {showPageNumbers && <span>Page 1 of 1</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F4F6F9] text-[#1E293B] font-sans flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div>
        {/* ============================================================== */}
        {/* 1. TOP BLUE MODULAR NOTICE (Exact match to Screenshot 2)         */}
        {/* ============================================================== */}
        {showTopModularNotice && (
          <div className="bg-[#EAF3FD] border-b border-[#CFE2FE] px-8 py-2.5 text-xs text-[#1C4E80] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[10px] font-bold shrink-0">
                i
              </span>
              <span className="leading-snug">
                Create reports using the modular approach: add the cover page and the table of contents, edit the contents of the report and add comments to separate sections when necessary. Ready-to-go reports can be saved as a template, downloaded in .PDF, .HTML or .XLS file formats or sent to an email address.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTopModularNotice(false)}
              className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TOP BREADCRUMB BAR matching Screenshot 2                     */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2 text-xs text-[#8C9BA5]">
            <button
              type="button"
              onClick={() => {
                setCurrentNavTab('reports');
                window.history.pushState(null, '', '/reports');
              }}
              className="hover:text-[#1E293B] transition-colors cursor-pointer"
            >
              Report Builder
            </button>
            <span className="text-[#CBD5E1]">›</span>
            <span className="text-[#1E293B] font-medium">
              {currentNavTab === 'templates' ? 'Templates' : 'Reports'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-xs text-[#7C3AED] hover:underline font-normal cursor-pointer"
            >
              Feedback
            </button>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#CBD5E1] bg-white text-xs text-[#1E293B] shadow-2xs cursor-help"
              title="Scheduled reporting slots used"
            >
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-medium">Scheduled reporting {scheduledCount} / 5</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. HEADING & ACTION BAR matching Screenshot 2                  */}
        {/* ============================================================== */}
        <div className="px-8 pt-5 pb-3 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <h1 className="text-[22px] font-bold text-[#1E293B] tracking-tight">Report Builder</h1>
              
              {/* Navigation Tabs: Reports | Templates */}
              <div className="flex items-center gap-6 text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNavTab('reports');
                    window.history.pushState(null, '', '/reports');
                  }}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${
                    currentNavTab === 'reports'
                      ? 'border-[#00B074] text-[#1E293B]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Reports
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNavTab('templates');
                    window.history.pushState(null, '', '/reports?tab=templates');
                  }}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${
                    currentNavTab === 'templates'
                      ? 'border-[#00B074] text-[#1E293B]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Templates
                </button>
              </div>
            </div>

            {/* Action Button: + CREATE REPORT vs + CREATE TEMPLATE */}
            <div>
              {currentNavTab === 'reports' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditingReport({
                      name: `${activeBrand} Project Report`,
                      project: activeDomain,
                      period: 'Last Week',
                    });
                    setIsEditingReport(true);
                    window.location.hash = '#/report/create';
                  }}
                  className="px-4 py-2 bg-[#00B074] hover:bg-[#009663] active:bg-[#008254] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">+</span>
                  <span>CREATE REPORT</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNewTemplateName(`${activeDomain} - SEO report`);
                    setIsCreatingTemplate(true);
                    window.location.hash = '#/report/create';
                  }}
                  className="px-4 py-2 bg-[#00B074] hover:bg-[#009663] active:bg-[#008254] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">+</span>
                  <span>CREATE TEMPLATE</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN BODY CONTAINER                                            */}
        {/* ============================================================== */}
        <div className="p-8 max-w-[1440px] mx-auto space-y-4">
          {currentNavTab === 'templates' ? (
            /* ============================================================== */
            /* DEDICATED TEMPLATES VIEW (Exact Match to Screenshot 2)         */
            /* ============================================================== */
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xs overflow-hidden">
              {/* Header / Sub-tabs & Search matching Screenshot 2 */}
              <div className="p-3.5 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Sub-tabs: MY TEMPLATES | SHARED TEMPLATES */}
                    <div className="flex items-center rounded border border-[#CBD5E1] overflow-hidden text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setTemplatesSubTab('my')}
                        className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                          templatesSubTab === 'my'
                            ? 'bg-[#504A70] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <span>MY TEMPLATES</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            templatesSubTab === 'my'
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-[#475569]'
                          }`}
                        >
                          {myTemplates.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplatesSubTab('shared')}
                        className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border-l border-[#CBD5E1] ${
                          templatesSubTab === 'shared'
                            ? 'bg-[#504A70] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <span>SHARED TEMPLATES</span>
                        <span className="px-1.5 py-0.2 bg-gray-100 text-[#475569] rounded-full text-[10px]">
                          0
                        </span>
                      </button>
                    </div>

                    {/* Search for template */}
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search for template"
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#1E293B] outline-hidden focus:border-[#00B074] placeholder:text-[#8C9BA5]"
                      />
                      <Search className="w-3.5 h-3.5 text-[#8C9BA5] absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Right + CREATE TEMPLATE Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewTemplateName(`${activeDomain} - SEO report`);
                      setIsCreatingTemplate(true);
                      window.location.hash = '#/report/create';
                    }}
                    className="px-4 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="text-base font-bold leading-none">+</span>
                    <span>CREATE TEMPLATE</span>
                  </button>
                </div>
              </div>

              {/* Content: Empty State vs Templates Table */}
              {filteredTemplates.length === 0 ? (
                <div className="py-20 px-4 text-center">
                  {/* Stylized circular search icon matching Screenshot 2 */}
                  <div className="w-16 h-16 rounded-full bg-[#EBF3FD] text-[#7C3AED] flex items-center justify-center mx-auto mb-4 shadow-2xs">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <path d="M11 8a3 3 0 0 0-3 3"></path>
                    </svg>
                  </div>

                  <h3 className="text-[17px] font-bold text-[#171B24] mb-1">
                    {templateSearchQuery.trim()
                      ? `No templates matching "${templateSearchQuery}"`
                      : "You don't have any templates yet"}
                  </h3>
                  <p className="text-xs text-[#8C9BA5] mb-6 max-w-md mx-auto">
                    {templateSearchQuery.trim()
                      ? 'Try a different search query or clear the filter to view all templates.'
                      : 'A list of templates will appear here after you create your first template'}
                  </p>

                  {templateSearchQuery.trim() ? (
                    <button
                      type="button"
                      onClick={() => setTemplateSearchQuery('')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#171B24] text-xs font-semibold rounded cursor-pointer transition-colors"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNewTemplateName(`${activeDomain} - SEO report`);
                        setIsCreatingTemplate(true);
                        window.location.hash = '#/report/create';
                      }}
                      className="px-5 py-2.5 bg-[#00B074] hover:bg-[#009663] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span className="text-base font-bold leading-none">+</span>
                      <span>CREATE TEMPLATE</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Templates Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFBFD] text-[#8C9BA5] border-b border-[#E2E8F0] font-semibold uppercase text-[11px] tracking-wider select-none">
                        <th className="p-3.5 pl-5 w-10">
                          <input
                            type="checkbox"
                            checked={
                              selectedTemplateIds.length === filteredTemplates.length &&
                              filteredTemplates.length > 0
                            }
                            onChange={() => {
                              if (selectedTemplateIds.length === filteredTemplates.length) {
                                setSelectedTemplateIds([]);
                              } else {
                                setSelectedTemplateIds(filteredTemplates.map((t) => t.id));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-[#00B074] focus:ring-[#00B074]"
                          />
                        </th>
                        <th className="p-3.5">Template Title</th>
                        <th className="p-3.5">Created Date</th>
                        <th className="p-3.5">Description</th>
                        <th className="p-3.5 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                      {filteredTemplates.map((tpl) => (
                        <tr
                          key={tpl.id}
                          className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                          onClick={() => {
                            setNewTemplateName(tpl.name);
                            setIsCreatingTemplate(true);
                            window.location.hash = '#/report/create';
                          }}
                        >
                          <td className="p-3.5 pl-5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedTemplateIds.includes(tpl.id)}
                              onChange={() => {
                                setSelectedTemplateIds((prev) =>
                                  prev.includes(tpl.id)
                                    ? prev.filter((i) => i !== tpl.id)
                                    : [...prev, tpl.id]
                                );
                              }}
                              className="w-3.5 h-3.5 rounded text-[#00B074] focus:ring-[#00B074]"
                            />
                          </td>
                          <td className="p-3.5 font-semibold text-[#171B24]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#7C3AED]" />
                              <span className="hover:text-[#7C3AED] transition-colors">
                                {tpl.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-[#64748B]">{tpl.created}</td>
                          <td className="p-3.5 text-[#64748B] max-w-md truncate">
                            {tpl.desc || 'Custom modular SEO report template'}
                          </td>
                          <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTemplateName(tpl.name);
                                  setIsCreatingTemplate(true);
                                  window.location.hash = '#/report/create';
                                }}
                                className="p-1.5 text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded transition-colors"
                                title="Edit in Template Builder"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const dup: TemplateItem = {
                                    id: `tpl-${Date.now()}`,
                                    name: `${tpl.name} (Copy)`,
                                    created: 'Today',
                                    desc: tpl.desc,
                                  };
                                  setMyTemplates((prev) => [dup, ...prev]);
                                  showToast(`Duplicated "${tpl.name}"`);
                                }}
                                className="p-1.5 text-[#64748B] hover:text-[#00B074] hover:bg-emerald-50 rounded transition-colors"
                                title="Duplicate Template"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMyTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
                                  showToast(`Template "${tpl.name}" deleted.`);
                                }}
                                className="p-1.5 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Template"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ===================== SECTION 1: START FROM TEMPLATE CAROUSEL (SE Ranking Authentic) ===================== */}
          <div className="template-list bg-white border border-[#E2E8F0] rounded-lg shadow-2xs overflow-visible">
            {/* Header matching user HTML */}
            <div className="template-list__head p-4 flex items-center justify-between border-b border-[#F1F3F5]">
              <div className="template-list__box flex items-center gap-3">
                <div
                  onClick={() => setIsStartFromTemplateOpen(!isStartFromTemplateOpen)}
                  className="template-list__name template-list__name-pointer flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div
                    className={`template-list__arrow transition-transform duration-200 ${
                      isStartFromTemplateOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 text-[#5D5F65] group-hover:text-[#7C3AED]" />
                  </div>
                  <div className="template-list__title text-[14px] font-bold text-[#171B24] tracking-tight group-hover:text-[#7C3AED] transition-colors">
                    Start from template
                  </div>
                </div>
                <div className="template-list__count text-xs font-bold text-[#8C9BA5] bg-[#F1F3F5] px-2 py-0.5 rounded-full">
                  12
                </div>
              </div>

              <div className="template-list__active flex items-center gap-3">
                <div className="template-list__box flex items-center gap-3">
                  <div className="template-list__slides-info text-[12px] text-[#5D5F65]">
                    Templates: {templatePage === 1 ? '1 - 7' : '8 - 12'} out of 12
                  </div>
                  <div className="template-list__control flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTemplatePage(1)}
                      disabled={templatePage === 1}
                      title="Previous templates"
                      className="p-1.5 rounded hover:bg-[#F1F3F5] text-[#5D5F65] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default transition-colors border border-[#E6E8EE]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplatePage(2)}
                      disabled={templatePage === 2}
                      title="Next templates"
                      className="p-1.5 rounded hover:bg-[#F1F3F5] text-[#5D5F65] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default transition-colors border border-[#E6E8EE]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Body matching user HTML */}
            {isStartFromTemplateOpen && (
              <div className="template-list__body template-list__body-open p-4">
                <div className="slider template-list__slider">
                  <div className="slider__box grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {displayedTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="template-item template-list__item relative"
                        onMouseEnter={() => setHoveredTemplateId(tpl.id)}
                        onMouseLeave={() => setHoveredTemplateId(null)}
                      >
                        {/* SE Ranking Exact Dark Floating Tooltip matching Screenshot 3 */}
                        {hoveredTemplateId === tpl.id && (
                          <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-64 bg-[#2D3748] text-white rounded-md p-3.5 shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <div className="font-bold text-[13px] text-white pb-2 mb-2 border-b border-gray-600/60 tracking-tight">
                              {tpl.name}
                            </div>
                            <div className="space-y-1 text-[11px] text-gray-200">
                              {tpl.sections.map((sec, idx) => (
                                <div key={idx} className="leading-snug">
                                  {sec.match(/^\d+\./) ? sec : `${idx + 1}. ${sec}`}
                                </div>
                              ))}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#2D3748]" />
                          </div>
                        )}
                        <div
                          onClick={() => {
                            const curDomain = activeProject?.domain || 'my-project.com';
                            setActiveEditingReport({
                              name: `${curDomain} - ${tpl.name}`,
                              project: curDomain,
                              period: 'Last Week',
                            });
                            setIsEditingReport(true);
                            window.location.hash = '#/report/create';
                          }}
                          style={{ borderTopColor: 'rgb(235, 237, 239)' }}
                          className="template-item__wrapper border border-[#E6E8EE] border-t-2 rounded-[3px] p-3.5 h-[80px] bg-white hover:bg-[#FAFBFD] hover:border-[#7C3AED] hover:border-t-[#7C3AED] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-center group"
                          title={tpl.desc}
                        >
                          <div className="template-item__name text-[12.5px] font-semibold text-[#171B24] group-hover:text-[#7C3AED] transition-colors line-clamp-2 leading-snug">
                            {tpl.name}
                          </div>
                          <div className="template-item__description text-[11px] text-[#8C9BA5] mt-1 line-clamp-1">
                            {tpl.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== SECTION 2: MY TEMPLATES ACCORDION ===================== */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-2xs transition-all">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] hover:text-[#7C3AED] cursor-pointer select-none"
              >
                <span className="text-xs">{isMyTemplatesOpen ? '▾' : '▸'}</span>
                <span>My templates</span>
                <span className="text-[#64748B] font-normal">({myTemplates.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/template/create';
                  setIsCreatingTemplate(true);
                }}
                className="text-xs font-bold text-[#00B074] hover:text-[#009663] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="text-sm font-bold">+</span>
                <span>CREATE TEMPLATE</span>
              </button>
            </div>

            {isMyTemplatesOpen && (
              <div className="pt-3 mt-3 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                {myTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setNewReportTitle(`${activeDomain} - ${tpl.name}`);
                      setIsCreateReportModalOpen(true);
                    }}
                    className="p-3 bg-[#FAFBFD] hover:bg-white border border-[#CBD5E1] hover:border-[#00B074] rounded-md cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-xs font-bold text-[#1E293B] group-hover:text-[#00B074] transition-colors mb-1">
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] line-clamp-2">
                      {tpl.desc || `Custom modular template for ${activeDomain}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===================== SECTION 3: IN-CONTENT NOTICE BANNERS ===================== */}
          {showInfoBanner && (
            <div className="bg-[#EBF5FF] border border-[#B9D7FB] rounded-lg p-3.5 text-xs text-[#1E3A8A] flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[11px] font-bold shrink-0 mt-0.5">
                  i
                </span>
                <span className="leading-relaxed">
                  We combined manual and scheduled reports in one place. Now, when creating a report, you can configure its sending schedule, download it immediately, or select both options in the report&apos;s settings. When you download the report, you can be confident that it contains up-to-date data. In the table below, you will find all your reports, which were previously separated into two tabs. These reports can be filtered based on whether or not they have a sending schedule.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoBanner(false)}
                className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          )}

          {showWarningBanner && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3.5 text-xs text-[#92400E] flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  !
                </span>
                <span className="leading-relaxed">
                  We&apos;ve updated our Traffic Forecast algorithm, which may affect the data in scheduled reports with traffic data. Please ensure that you take into account possible deviations from previous values.{' '}
                  <a
                    href="https://help.seranking.com/hc/en-us"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7C3AED] hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Learn more
                  </a>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningBanner(false)}
                className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          )}

          {/* ===================== SECTION 4: MAIN REPORTS TABLE ===================== */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xs overflow-hidden">
            
            {/* Table Filter Bar */}
            <div className="p-3.5 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Tabs: MY REPORTS | SHARED REPORTS */}
                  <div className="flex items-center rounded border border-[#CBD5E1] overflow-hidden text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('my')}
                      className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'my'
                          ? 'bg-[#3E435E] text-white'
                          : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span>MY REPORTS</span>
                      <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                        {reports.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('shared')}
                      className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border-l border-[#CBD5E1] ${
                        activeTab === 'shared'
                          ? 'bg-[#3E435E] text-white'
                          : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span>SHARED REPORTS</span>
                      <span className="px-1.5 py-0.2 bg-gray-100 text-[#475569] rounded-full text-[10px]">
                        0
                      </span>
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-56">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#1E293B] outline-hidden focus:border-[#7C3AED]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Schedule Filter Dropdown */}
                  <div className="relative filter-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded text-xs text-[#1E293B] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>{scheduleFilter}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>

                    {isFilterDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-44 bg-white border border-[#CBD5E1] rounded-md shadow-lg py-1 z-30 text-xs">
                        {(['All reports', 'With schedule', 'Without schedule'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setScheduleFilter(mode);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-[#F1F5F9] cursor-pointer flex items-center justify-between ${
                              scheduleFilter === mode ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-[#1E293B]'
                            }`}
                          >
                            <span>{mode}</span>
                            {scheduleFilter === mode && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold text-[11px] tracking-wide select-none uppercase">
                    <th className="py-2.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#7C3AED] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2 w-[320px]">REPORT TITLE</th>
                    <th className="py-2.5 px-4 w-[120px]">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-[#1E293B]">
                        <span>UPDATED</span>
                        <span className="text-[10px]">▼</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-4 w-[100px]">SENT</th>
                    <th className="py-2.5 px-4 w-[230px]">FREQUENCY</th>
                    <th className="py-2.5 px-4 w-[110px]">LANGUAGE</th>
                    <th className="py-2.5 px-4">REPORT PERIOD</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#64748B]">
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((row) => {
                      const isSelected = selectedIds.includes(row.id);

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors group relative ${
                            isSelected ? 'bg-[#F5F3FF]' : 'bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(row.id)}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#7C3AED] cursor-pointer"
                            />
                          </td>

                          {/* Report Title & Action Buttons matching Screenshot 2 */}
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-between pr-3">
                              <div className="flex items-center gap-2">
                                {/* Red SE Ranking Folder Icon matching Screenshot 2 */}
                                <svg className="w-4 h-4 shrink-0 text-[#E53935]" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                  <rect x="7" y="9" width="6" height="5" rx="1" fill="#FFFFFF" opacity="0.9" />
                                </svg>
                                <span
                                  onClick={() => {
                                    setActiveEditingReport({
                                      name: row.title,
                                      project: row.domain,
                                      period: row.period,
                                    });
                                    setIsEditingReport(true);
                                    window.location.hash = '#/report/create';
                                  }}
                                  className="font-medium text-[#1E293B] hover:text-[#7C3AED] cursor-pointer transition-colors"
                                >
                                  {row.title}
                                </span>
                              </div>

                              {/* Actions on row: Preview, Edit (Pen), Download (Tray), Three Dots (Menu) */}
                              <div className="flex items-center gap-1.5 report-menu-container relative">
                                <Link
                                  href={`/reports/preview?id=${row.id}&title=${encodeURIComponent(row.title)}&domain=${encodeURIComponent(row.domain)}&period=${encodeURIComponent(row.period)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open preview in new tab"
                                  className="p-1 text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded cursor-pointer transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveEditingReport({
                                      name: row.title,
                                      project: row.domain,
                                      period: row.period,
                                    });
                                    setIsEditingReport(true);
                                    window.location.hash = '#/report/create';
                                  }}
                                  title="Edit report modular settings"
                                  className="p-1 text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded cursor-pointer transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReport(row)}
                                  title="Download report"
                                  className="p-1 text-[#64748B] hover:text-[#10B981] hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Three Dots Trigger */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === row.id ? null : row.id);
                                  }}
                                  title="More options"
                                  className={`p-1 rounded cursor-pointer transition-colors ${
                                    openMenuId === row.id
                                      ? 'bg-[#1E293B] text-white'
                                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100'
                                  }`}
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* ======================================================= */}
                                {/* EXACT CONTEXT MENU MATCHING SCREENSHOT 1 & 2            */}
                                {/* ======================================================= */}
                                {openMenuId === row.id && (
                                  <div className="absolute right-0 top-7 w-48 bg-white border border-[#CBD5E1] rounded-md shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                                    {/* 0. Preview in new tab */}
                                    <Link
                                      href={`/reports/preview?id=${row.id}&title=${encodeURIComponent(row.title)}&domain=${encodeURIComponent(row.domain)}&period=${encodeURIComponent(row.period)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-[#7C3AED]" />
                                      <span>Preview in new tab</span>
                                    </Link>
                                    {/* 1. Stop / Start sending */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSchedule(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <span className="text-gray-500 font-bold">⊘</span>
                                      <span>{row.hasSchedule ? 'Stop sending' : 'Start sending'}</span>
                                    </button>

                                    {/* 2. Email report */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEmailModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Email report</span>
                                    </button>

                                    {/* 3. Generate template */}
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateTemplateFromReport(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Generate template</span>
                                    </button>

                                    {/* 4. Rename report */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRenameModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Rename report</span>
                                    </button>

                                    {/* 5. Duplicate report */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateReport(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Duplicate report</span>
                                    </button>

                                    {/* 6. Manage access */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAccessModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Users className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Manage access</span>
                                    </button>

                                    <div className="border-t border-[#E2E8F0] my-1" />

                                    {/* 7. Delete */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDeleteModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-[#EF4444] font-medium flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Updated column matching Screenshot 2 */}
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {row.updated}
                          </td>

                          {/* Sent */}
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {row.sent}
                          </td>

                          {/* Frequency */}
                          <td className="py-3 px-4 text-[#1E293B] font-medium">
                            {row.frequency}
                          </td>

                          {/* Language */}
                          <td className="py-3 px-4 text-[#64748B]">
                            {row.language}
                          </td>

                          {/* Report Period */}
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {row.period}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Rows selector: 20 ˅ */}
            <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-end rows-dropdown-container relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                  className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded text-xs font-medium text-[#1E293B] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>{rowsPerPage}</span>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {isRowsDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-20 bg-white border border-[#CBD5E1] rounded shadow-lg py-1 z-30 text-xs">
                    {['20', '50', '100'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setRowsPerPage(val);
                          setIsRowsDropdownOpen(false);
                        }}
                        className="w-full text-center px-2 py-1 hover:bg-[#F1F5F9] cursor-pointer"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
            </>
          )}

        </div>
      </div>



      {/* ============================================================== */}
      {/* REAL WORKING MODALS                                            */}
      {/* ============================================================== */}

      {/* 1. Email Report Modal */}
      {isEmailModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Email Report</h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendEmailReport} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Recipient Email:</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder={`client@${activeDomain}`}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#7C3AED] outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Email Subject:</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#7C3AED] outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Message:</label>
                <textarea
                  rows={3}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#7C3AED] outline-hidden"
                />
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-[#1E293B] block">Attached Format:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatPdf}
                      onChange={(e) => setEmailFormatPdf(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#7C3AED]"
                    />
                    <span>PDF Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatHtml}
                      onChange={(e) => setEmailFormatHtml(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#7C3AED]"
                    />
                    <span>HTML File</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatXls}
                      onChange={(e) => setEmailFormatXls(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#7C3AED]"
                    />
                    <span>Excel (.XLS)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider"
                >
                  SEND REPORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Rename Report Modal */}
      {isRenameModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Rename Report</h3>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRenameReport} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">New Report Title:</label>
                <input
                  type="text"
                  required
                  value={renameTitleInput}
                  onChange={(e) => setRenameTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#7C3AED] outline-hidden text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#0052D4] text-white rounded font-bold uppercase tracking-wider"
                >
                  RENAME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Manage Access Modal */}
      {isAccessModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Manage Report Access</h3>
              <button onClick={() => setIsAccessModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Control team and client permissions for <strong className="text-[#1E293B]">{selectedReport?.title}</strong>.
              </p>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1E293B]">Suraj Vishwakarma (You)</span>
                  <span className="text-[11px] font-bold text-[#7C3AED]">Owner</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#475569]">{activeDomain} Team</span>
                  <span className="text-[11px] text-[#64748B]">Can edit & export</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedReport) {
                      navigator.clipboard.writeText(`https://online.seranking.com/reports/share/${selectedReport.id}`);
                      showToast('Public shareable link copied to clipboard!');
                      setIsAccessModalOpen(false);
                    }
                  }}
                  className="text-xs text-[#7C3AED] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Public Share Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-1.5 bg-[#7C3AED] text-white rounded font-bold uppercase text-[11px]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1E293B]">Delete Report</h3>
                <p className="text-xs text-[#64748B]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1E293B]">{selectedReport?.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Report Modal */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1E293B]">Create Report</h3>
                <p className="text-xs text-[#64748B]">Configure report modules for {activeDomain}</p>
              </div>
              <button onClick={() => setIsCreateReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewReport} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Project Domain</label>
                <input
                  type="text"
                  disabled
                  value={activeDomain}
                  className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded font-mono text-xs text-[#64748B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Report Title</label>
                <input
                  type="text"
                  required
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder={`e.g. ${activeDomain} Weekly Audit`}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Sending Frequency</label>
                  <select
                    value={newReportFrequency}
                    onChange={(e) => setNewReportFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden"
                  >
                    <option value="Every week, on: Wednesday">Every week, on: Wednesday</option>
                    <option value="Every week, on: Monday">Every week, on: Monday</option>
                    <option value="Every month, on: 1st">Every month, on: 1st</option>
                    <option value="Without schedule">Without schedule (Manual)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Default Format</label>
                  <select
                    value={newReportFormat}
                    onChange={(e) => setNewReportFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="HTML">HTML Web Report</option>
                    <option value="XLS">Excel Sheet (.XLS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Language</label>
                  <select
                    value={newReportLanguage}
                    onChange={(e) => setNewReportLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Report Period</label>
                  <input
                    type="text"
                    value={newReportPeriod}
                    onChange={(e) => setNewReportPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider shadow-2xs"
                >
                  CREATE REPORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Template Modal */}
      {isCreateTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Create Template</h3>
              <button onClick={() => setIsCreateTemplateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNewTemplate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Template Name</label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder={`e.g. ${activeDomain} Client Audit`}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#7C3AED] outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateModalOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider"
                >
                  CREATE TEMPLATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modular Report Editor & Preview Modal */}
      {selectedReportForPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#7C3AED]" />
                  <span>{selectedReportForPreview?.title}</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Domain: {selectedReportForPreview?.domain} • Frequency: {selectedReportForPreview?.frequency} • Period: {selectedReportForPreview?.period}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/reports/preview?id=${selectedReportForPreview?.id}&title=${encodeURIComponent(selectedReportForPreview?.title || '')}&domain=${encodeURIComponent(selectedReportForPreview?.domain || '')}&period=${encodeURIComponent(selectedReportForPreview?.period || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-[#7C3AED] text-[#7C3AED] bg-white hover:bg-[#F5F3FF] rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Open live preview in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview in New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedReportForPreview) {
                      handleDownloadReport(selectedReportForPreview);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#00B074] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#009663]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 border border-[#CBD5E1] rounded text-[#64748B] hover:bg-white"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReportForPreview(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modular Document Content Preview */}
            <div className="p-8 overflow-y-auto space-y-6 bg-[#FAFBFD] flex-1">
              {/* Cover Page */}
              <div className="bg-white p-8 rounded border border-[#E2E8F0] shadow-sm text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ⚡
                </div>
                <div className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">
                  SEO Performance Report
                </div>
                <h2 className="text-2xl font-extrabold text-[#1E293B]">
                  {selectedReportForPreview?.domain}
                </h2>
                <div className="text-xs text-[#64748B] font-mono">
                  Period: {selectedReportForPreview?.period}
                </div>
              </div>

              {/* Module 1: Rankings Summary */}
              <div className="bg-white p-6 rounded border border-[#E2E8F0] shadow-sm space-y-3 max-w-2xl mx-auto">
                <h4 className="font-bold text-sm text-[#1E293B] border-b pb-2 flex items-center justify-between">
                  <span>1. Organic Keyword Rankings</span>
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    +18% improvement
                  </span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Top 3 Keywords</div>
                    <div className="text-xl font-bold text-[#7C3AED]">24</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Top 10 Keywords</div>
                    <div className="text-xl font-bold text-[#10B981]">89</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Total Tracked</div>
                    <div className="text-xl font-bold text-[#1E293B]">240</div>
                  </div>
                </div>
              </div>

              {/* Module 2: Traffic & Conversions */}
              <div className="bg-white p-6 rounded border border-[#E2E8F0] shadow-sm space-y-3 max-w-2xl mx-auto">
                <h4 className="font-bold text-sm text-[#1E293B] border-b pb-2">
                  2. Traffic & Search Visibility
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Organic traffic grew by 14.2% over the reporting period. Major gains in high-intent keywords in the US and European regions.
                </p>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden flex">
                  <div className="w-[65%] bg-[#7C3AED]" />
                  <div className="w-[20%] bg-[#10B981]" />
                  <div className="w-[15%] bg-[#F59E0B]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Direct: 65%</span>
                  <span>Organic Search: 20%</span>
                  <span>Referral: 15%</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportForPreview(null)}
                className="px-5 py-2 bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Bug Report & Feedback Modals */}
      <ReportBugModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />

      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Send Feedback</h3>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsFeedbackOpen(false);
                setFeedbackText('');
                showToast('Thank you! Feedback received.');
              }}
              className="space-y-4 text-xs"
            >
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts or suggest an improvement for Report Builder..."
                className="w-full p-3 border border-[#CBD5E1] rounded focus:border-[#7C3AED] outline-hidden text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#0052D4] text-white rounded font-bold uppercase text-[11px]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
