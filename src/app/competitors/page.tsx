'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Plus,
  BarChart2,
  TrendingUp,
  Link2,
  Globe,
  Trash2,
  ExternalLink,
  Copy,
  Users,
  Activity,
  ArrowUp,
  ArrowUpRight,
  Layers,
  SlidersHorizontal,
  Folder,
  Calendar,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { ProjectNotesModal } from '@/components/modals/ProjectNotesModal';
import { SeRankingSerpCompetitors } from '@/components/competitors/SeRankingSerpCompetitors';
import { SeRankingShareOfVoice } from '@/components/competitors/SeRankingShareOfVoice';
import { SeRankingVisibilityRating } from '@/components/competitors/SeRankingVisibilityRating';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface CompetitorData {
  id: string;
  domain: string;
  visibility: number;
  avgPosition: number;
  commonKeywords: number;
  totalKeywords: number;
  organicTraffic: string;
  backlinks: string;
  tag: string;
}

interface CandidateCompetitor {
  id: string;
  domain: string;
  displayName: string;
  iconType: 'google' | 'zoom' | 'webex' | 'slack' | 'ringcentral' | 'custom';
  commonKeywords: number;
  keywords: string;
  traffic: string;
  visibility: number;
  avgPosition: number;
  backlinks: string;
}

const DEFAULT_CANDIDATES: CandidateCompetitor[] = [];
const DEFAULT_SUGGESTIONS: CompetitorData[] = [];


function CompetitorsPageContent() {
  const { activeProject, projects } = useApp();
  const domain =
    activeProject?.domain || (projects[0]?.domain ?? 'in.pinterest.com');
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'added';
  const tabTitle =
    tabParam === 'serp'
      ? 'SERP Competitors'
      : tabParam === 'sov'
      ? 'Share of Voice'
      : tabParam === 'visibility'
      ? 'Visibility Rating'
      : 'Added Competitors';

  // Common State
  const [showNotice, setShowNotice] = useState(true);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [addedCompetitors, setAddedCompetitors] = useState<CompetitorData[]>([]);
  const [hasLoadedCompetitorsStorage, setHasLoadedCompetitorsStorage] = useState(false);
  const [notesCount, setNotesCount] = useState(50);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isLimitsInfoOpen, setIsLimitsInfoOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load competitors from backend API
  React.useEffect(() => {
    async function loadCompetitors() {
      if (!activeProject?.id) {
        setAddedCompetitors([]);
        setHasLoadedCompetitorsStorage(true);
        return;
      }
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/competitors`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const mapped: CompetitorData[] = json.data.map((c: any) => ({
              id: c.id,
              domain: c.domain,
              visibility: c.visibilityScore || 0,
              avgPosition: c.avgPosition || 0,
              commonKeywords: c.commonKeywordsCount || 0,
              totalKeywords: c.totalKeywords || 0,
              organicTraffic: c.organicTraffic || '—',
              backlinks: '—',
              tag: 'Direct Competitor',
            }));
            setAddedCompetitors(mapped);
            setHasLoadedCompetitorsStorage(true);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load competitors from API:', err);
      }

      setAddedCompetitors([]);
      setHasLoadedCompetitorsStorage(true);
    }

    loadCompetitors();
  }, [activeProject?.id, domain]);

  // Persist addedCompetitors to localStorage as offline cache
  React.useEffect(() => {
    if (!hasLoadedCompetitorsStorage) return;
    try {
      localStorage.setItem(`se_ranking_competitors_${domain}`, JSON.stringify(addedCompetitors));
    } catch (e) {
      console.error('Failed to save competitors to localStorage', e);
    }
  }, [addedCompetitors, domain, hasLoadedCompetitorsStorage]);

  // Dynamic Competitor Discovery Selection State (matching user screenshots)
  const [isSelectionViewOpen, setIsSelectionViewOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [candidateList, setCandidateList] = useState<CandidateCompetitor[]>(DEFAULT_CANDIDATES);
  const [isAddingManually, setIsAddingManually] = useState(false);
  const [manualDomain, setManualDomain] = useState('');


  // SERP Competitors Specific States matching Screenshot
  const [serpGroup, setSerpGroup] = useState('All groups');
  const [isSerpGroupOpen, setIsSerpGroupOpen] = useState(false);
  const [serpKeyword, setSerpKeyword] = useState('');
  const [highlightCompetitors, setHighlightCompetitors] = useState(false);
  const [displayMode, setDisplayMode] = useState<'URL' | 'DOMAIN'>('DOMAIN');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTag, setFilterTag] = useState('All tags');
  const [isFilterTagOpen, setIsFilterTagOpen] = useState(false);
  const [serpTopRange, setSerpTopRange] = useState<'100' | '50' | '30' | '20' | '10'>('100');
  const [serpEngine, setSerpEngine] = useState('India');
  const [isSerpEngineOpen, setIsSerpEngineOpen] = useState(false);
  const [isAdvancedSerpOpen, setIsAdvancedSerpOpen] = useState(false);
  const [hasSerpData, setHasSerpData] = useState(false);

  // Share of Voice Specific States matching User Screenshot
  const [sovSearchEngine, setSovSearchEngine] = useState('All search engines');
  const [isSovEngineOpen, setIsSovEngineOpen] = useState(false);
  const [sovKeywordSelection, setSovKeywordSelection] = useState('ALL KEYWORDS');
  const [isSovKeywordSelectionOpen, setIsSovKeywordSelectionOpen] = useState(false);
  const [sovDomainSearch, setSovDomainSearch] = useState('');
  const [hasSovData, setHasSovData] = useState(false);

  // Visibility Rating Specific States matching User Screenshots 1 & 2
  const [visSearchEngine, setVisSearchEngine] = useState('All search engines');
  const [isVisEngineOpen, setIsVisEngineOpen] = useState(false);
  const [activeVisMetric, setActiveVisMetric] = useState<'visibility' | 'forecast' | 'top10' | 'distribution'>('visibility');
  const [visDomainSearch, setVisDomainSearch] = useState('');
  const [hasVisData, setHasVisData] = useState(false);
  const [isVisFiltersOpen, setIsVisFiltersOpen] = useState(false);
  const [isVisColumnsOpen, setIsVisColumnsOpen] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddCompetitor = async (comp: CompetitorData) => {
    if (addedCompetitors.length >= 5) {
      showToast('Maximum 5 competitors allowed for this project.');
      return;
    }
    if (addedCompetitors.some((c) => c.domain.toLowerCase() === comp.domain.toLowerCase())) {
      showToast(`${comp.domain} is already added.`);
      return;
    }
    if (!activeProject?.id) {
      showToast('Please select a project first.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: comp.domain }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddedCompetitors((prev) => [...prev, {
          id: data.data?.id || `comp-${Date.now()}`,
          domain: data.data?.domain || comp.domain,
          visibility: data.data?.visibilityScore || 0,
          avgPosition: data.data?.avgPosition || 0,
          commonKeywords: data.data?.commonKeywordsCount || 0,
          totalKeywords: data.data?.totalKeywords || 0,
          organicTraffic: data.data?.organicTraffic || '—',
          backlinks: '—',
          tag: 'Direct Competitor',
        }]);
        showToast(`Added ${comp.domain} to competitor tracking!`);
      } else {
        showToast(data.error || 'Failed to add competitor.');
      }
    } catch {
      showToast('Network error adding competitor.');
    }
  };

  const handleAddCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDomainInput.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!clean) return;
    if (addedCompetitors.length >= 5) {
      showToast('Maximum 5 competitors allowed for this project.');
      return;
    }
    if (!activeProject?.id) {
      showToast('Please select a project first.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newComp: CompetitorData = {
          id: data.data?.id || `comp-custom-${Date.now()}`,
          domain: data.data?.domain || clean,
          visibility: data.data?.visibilityScore || 0,
          avgPosition: data.data?.avgPosition || 0,
          commonKeywords: data.data?.commonKeywordsCount || 0,
          totalKeywords: data.data?.totalKeywords || 0,
          organicTraffic: data.data?.organicTraffic || '—',
          backlinks: '—',
          tag: 'Custom Competitor',
        };
        setAddedCompetitors((prev) => [...prev, newComp]);
        setCustomDomainInput('');
        setIsAddModalOpen(false);
        showToast(`Added ${clean} to competitor tracking!`);
      } else {
        showToast(data.error || 'Failed to add competitor.');
      }
    } catch {
      showToast('Network error adding competitor.');
    }
  };

  const handleRemoveCompetitor = async (id: string, compDomain: string) => {
    if (activeProject?.id) {
      try {
        await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/competitors/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete competitor from DB:', err);
      }
    }
    setAddedCompetitors((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed ${compDomain} from competitors.`);
  };

  const toggleCandidate = (candId: string) => {
    if (selectedCandidateIds.includes(candId)) {
      setSelectedCandidateIds((prev) => prev.filter((id) => id !== candId));
    } else {
      if (selectedCandidateIds.length + addedCompetitors.length >= 5) {
        showToast('Maximum 5 competitors allowed for this project.');
        return;
      }
      setSelectedCandidateIds((prev) => [...prev, candId]);
    }
  };

  const handleAddSelectedCompetitors = async () => {
    if (selectedCandidateIds.length === 0) return;
    const toAdd = candidateList.filter((c) => selectedCandidateIds.includes(c.id));
    if (!activeProject?.id) {
      showToast('Please select a project first.');
      return;
    }

    let addedCount = 0;
    const newItems: CompetitorData[] = [];
    for (const cand of toAdd) {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/competitors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: cand.domain }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addedCount++;
          newItems.push({
            id: data.data?.id || `comp-${cand.id}-${Date.now()}`,
            domain: data.data?.domain || cand.domain,
            visibility: data.data?.visibilityScore || 0,
            avgPosition: data.data?.avgPosition || 0,
            commonKeywords: data.data?.commonKeywordsCount || 0,
            totalKeywords: data.data?.totalKeywords || 0,
            organicTraffic: data.data?.organicTraffic || '—',
            backlinks: '—',
            tag: 'Direct Competitor',
          });
        }
      } catch {
        // continue
      }
    }

    if (newItems.length > 0) {
      setAddedCompetitors((prev) => {
        const existingDomains = new Set(prev.map((p) => p.domain.toLowerCase()));
        const filtered = newItems.filter((m) => !existingDomains.has(m.domain.toLowerCase()));
        return [...prev, ...filtered].slice(0, 5);
      });
      showToast(`Successfully added ${addedCount} competitor(s) to tracking!`);
    }

    setSelectedCandidateIds([]);
    setIsSelectionViewOpen(false);
  };

  const handleAddManualCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!clean) return;

    if (candidateList.some((c) => c.domain.toLowerCase() === clean.toLowerCase())) {
      showToast(`${clean} is already in the candidate list.`);
      return;
    }

    const newCand: CandidateCompetitor = {
      id: `cand-${Date.now()}`,
      domain: clean,
      displayName: clean.length > 18 ? `${clean.substring(0, 16)}...` : clean,
      iconType: 'custom',
      commonKeywords: 0,
      keywords: '—',
      traffic: '—',
      visibility: 0,
      avgPosition: 0,
      backlinks: '—',
    };

    setCandidateList((prev) => [...prev, newCand]);

    if (selectedCandidateIds.length + addedCompetitors.length < 5) {
      setSelectedCandidateIds((prev) => [...prev, newCand.id]);
    }

    setManualDomain('');
    setIsAddingManually(false);
    showToast(`Added ${clean} to candidates!`);
  };

  const renderCandIcon = (iconType: string) => {
    switch (iconType) {
      case 'google':
        return (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.09C3.3 21.43 7.37 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.41l4-3.09z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.57 1.28 6.59l4 3.09c.95-2.83 3.6-4.93 6.72-4.93z" />
          </svg>
        );
      case 'zoom':
        return (
          <div className="w-4 h-4 rounded-full bg-[#2D8CFF] flex items-center justify-center text-white shrink-0 shadow-2xs">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-2.2l4 2.67A1 1 0 0021 17.6V6.4a1 1 0 00-1.55-.83L16 8.2V8a2 2 0 00-2-2H4z" />
            </svg>
          </div>
        );
      case 'webex':
        return (
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00D4AA] to-[#0070F3] flex items-center justify-center text-white shrink-0 shadow-2xs">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'slack':
        return (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 127 127">
            <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
            <path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.6c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33z" fill="#36C5F0"/>
            <path d="M99.8 47c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V47zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33z" fill="#2EB67D"/>
            <path d="M80 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8H80zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z" fill="#ECB22E"/>
          </svg>
        );
      case 'ringcentral':
        return (
          <div className="w-4 h-4 rounded bg-[#FF7043] flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-2xs">
            R
          </div>
        );
      default:
        return <Globe className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-12 select-none overflow-x-hidden font-sans flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================================= */}
        {/* TOP BLUE NOTICE BANNER & BREADCRUMB (Only on Added Competitors tab) */}
        {/* ========================================================================= */}
        {tabParam === 'added' && (
          <>
            {showNotice && (
              <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#7C3AED] leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 pr-4">
                  <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                    i
                  </span>
                  <p className="text-gray-700">
                    You can add up to 5 competitors to your projects. You don&apos;t know who your competitors are? Check out the tabs{' '}
                    <Link
                      href="/competitors?tab=serp"
                      className="text-[#7C3AED] hover:underline font-semibold cursor-pointer"
                    >
                      SERP Competitors
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/competitors?tab=visibility"
                      className="text-[#7C3AED] hover:underline font-semibold cursor-pointer"
                    >
                      Visibility Rating
                    </Link>
                    .
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotice(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                  title="Close notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white shrink-0"
                  title="Back to projects"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
                  <span className="text-gray-600 font-medium">{domain}</span>
                  <span className="text-gray-300">&gt;</span>
                  <span className="text-gray-500">My Competitors</span>
                  <span className="text-gray-300">&gt;</span>
                  <span className="text-gray-700 font-medium">{tabTitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-normal text-gray-600">
                <button
                  type="button"
                  onClick={() => setIsGuestLinkOpen(true)}
                  className="text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Guest link
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(true)}
                  className="text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Notes ({notesCount})
                </button>

                <button
                  type="button"
                  onClick={() => setIsLimitsInfoOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200/80 rounded-full text-xs font-medium text-gray-700 cursor-pointer transition-colors"
                  title="View competitor limits"
                >
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    Competitor limits:{' '}
                    <strong className="text-gray-900 font-bold">{addedCompetitors.length} / 5</strong>
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[9px] font-serif italic">
                    i
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: ADDED COMPETITORS */}
        {/* ========================================================================= */}
        {tabParam === 'added' && (
          <div>
            {isSelectionViewOpen ? (
              /* =================================================================== */
              /* DYNAMIC CANDIDATE SELECTION VIEW (1:1 Matching Screenshot 4) */
              /* =================================================================== */
              <div className="max-w-[700px] mx-auto px-4 pt-10 pb-20 space-y-3 animate-in fade-in zoom-in-98 duration-200">
                {/* Header row with Selected count and column titles */}
                <div className="flex items-center justify-between text-xs text-gray-500 px-4 pb-1">
                  <div className="font-semibold text-gray-700">
                    Selected: <span className="font-bold text-gray-900">{selectedCandidateIds.length}/5</span>
                  </div>
                  <div className="flex items-center gap-8 font-medium text-gray-500 text-[11px]">
                    <span className="flex items-center gap-0.5 cursor-pointer hover:text-gray-800">
                      Com. keywords <span className="text-[10px]">⇅</span>
                    </span>
                    <span className="flex items-center gap-0.5 cursor-pointer hover:text-gray-800 w-14 text-right justify-end">
                      Keywords <span className="text-[10px]">⇅</span>
                    </span>
                    <span className="flex items-center gap-0.5 cursor-pointer hover:text-gray-800 w-14 text-right justify-end">
                      Traffic <span className="text-[10px]">⇅</span>
                    </span>
                  </div>
                </div>

                {/* Candidate list cards matching Screenshot 4 */}
                <div className="space-y-2">
                  {candidateList.length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-500 bg-white border border-dashed border-gray-200 rounded-md">
                      No candidate competitors discovered yet. Click <strong className="text-[#7C3AED]">ADD MANUALLY</strong> below to track your competitors.
                    </div>
                  )}
                  {candidateList.map((cand) => {
                    const isSelected = selectedCandidateIds.includes(cand.id);
                    return (
                      <div
                        key={cand.id}
                        onClick={() => toggleCandidate(cand.id)}
                        className={`flex items-center justify-between px-4 py-3 bg-white border rounded-md transition-all cursor-pointer select-none shadow-2xs ${
                          isSelected
                            ? 'border-[#A78BFA] bg-[#F5F3FF]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        {/* Checkbox + Icon + Domain */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          {renderCandIcon(cand.iconType)}
                          <span className="text-xs font-medium text-gray-800 truncate" title={cand.domain}>
                            {cand.displayName}
                          </span>
                        </div>

                        {/* Right metrics aligned with columns */}
                        <div className="flex items-center gap-8 text-xs font-medium text-gray-700 shrink-0">
                          <span className="text-right font-mono text-gray-700 w-16">
                            {cand.commonKeywords ?? '—'}
                          </span>
                          <span className="text-right font-mono text-gray-700 w-14">
                            {cand.keywords || ''}
                          </span>
                          <span className="text-right font-mono text-gray-700 w-14">
                            {cand.traffic || ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* + ADD MANUALLY Row / Inline Form */}
                  {isAddingManually ? (
                    <form
                      onSubmit={handleAddManualCompetitor}
                      className="flex items-center gap-2 p-2 bg-white border border-[#A78BFA] rounded-md shadow-2xs animate-in fade-in duration-150"
                    >
                      <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
                      <input
                        type="text"
                        value={manualDomain}
                        onChange={(e) => setManualDomain(e.target.value)}
                        placeholder="Enter competitor domain (e.g. microsoft.com)"
                        className="flex-1 text-xs outline-none bg-transparent text-gray-800 placeholder-gray-400"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!manualDomain.trim()}
                        className="bg-[#7C3AED] hover:bg-[#0B59EE] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingManually(false);
                          setManualDomain('');
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingManually(true)}
                      className="w-full py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-md text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:bg-gray-50 tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD MANUALLY</span>
                    </button>
                  )}
                </div>

                {/* Centered Add Competitors Button */}
                <div className="pt-24 flex flex-col items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddSelectedCompetitors}
                    disabled={selectedCandidateIds.length === 0}
                    className={`px-8 py-2 rounded text-xs font-bold transition-all shadow-2xs uppercase tracking-wider ${
                      selectedCandidateIds.length > 0
                        ? 'bg-[#7C3AED] hover:bg-[#0B59EE] text-white cursor-pointer hover:shadow-md active:scale-98'
                        : 'bg-[#C5D7FE] text-white cursor-not-allowed'
                    }`}
                  >
                    Add competitors
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSelectionViewOpen(false)}
                    className="text-xs text-gray-400 hover:text-gray-700 hover:underline cursor-pointer"
                  >
                    Cancel &amp; return
                  </button>
                </div>
              </div>
            ) : addedCompetitors.length === 0 ? (
              /* =================================================================== */
              /* EMPTY HERO STATE (1:1 Matching Screenshot 3) */
              /* =================================================================== */
              <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 space-y-10 animate-in fade-in duration-200">
                <div className="text-center space-y-5">
                  {/* SE Ranking 3 Circle Icons Group */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs">
                      <span className="material-icons notranslate" style={{ fontSize: '28px', color: 'rgb(251, 174, 199)' }}>
                        data_usage
                      </span>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs">
                      <span className="material-icons notranslate" style={{ fontSize: '38px', color: 'rgb(55, 106, 253)' }}>
                        people_outline
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs">
                      <span className="material-icons notranslate" style={{ fontSize: '28px', color: 'rgb(253, 179, 127)' }}>
                        show_chart
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                      Stay ahead by tracking your competitors
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Find your competitors and get insights to outrank them
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSelectionViewOpen(true)}
                      className="bg-[#7C3AED] hover:bg-[#0B59EE] text-white text-xs font-bold px-7 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider hover:shadow-md active:scale-98"
                    >
                      FIND MY COMPETITORS
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#7C3AED] flex items-center justify-center">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Track competitor rankings
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Monitor competitor performance in search results and spot ranking trends over time.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Evaluate traffic of your competitors
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Analyze traffic and keyword performance to know where you stand in your field.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        See competitors&apos; backlinks
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Explore top competitors&apos; backlink profiles to find new link-building opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Get insights on competition
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Discover what drives competitors&apos; rankings, performance, and visibility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* =================================================================== */
              /* CONNECTED ADDED COMPETITORS TABLE */
              /* =================================================================== */
              <div className="px-6 py-6 max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Added Competitors</h1>
                    <p className="text-xs text-gray-500">
                      Tracking {addedCompetitors.length} of 5 competitor domains for {domain}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {addedCompetitors.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setIsSelectionViewOpen(true)}
                        className="bg-[#7C3AED] hover:bg-[#0B59EE] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD COMPETITOR</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => showToast('Exporting competitors report to CSV...')}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>EXPORT</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">COMPETITOR DOMAIN</th>
                          <th className="py-3 px-4 text-center">TAG</th>
                          <th className="py-3 px-4 text-right">VISIBILITY SCORE</th>
                          <th className="py-3 px-4 text-right">AVG POSITION</th>
                          <th className="py-3 px-4 text-right">COMMON KEYWORDS</th>
                          <th className="py-3 px-4 text-right">ORGANIC TRAFFIC</th>
                          <th className="py-3 px-4 text-right">BACKLINKS</th>
                          <th className="py-3 px-4 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                        <tr className="bg-[#F5F3FF]">
                          <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                            <span>workcomposer.com (Your website)</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-blue-100 text-[#5B21B6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#7C3AED]">32.4%</td>
                          <td className="py-3.5 px-4 text-right font-mono">14.2</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">48</td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-900">18.4K</td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-900">4.2K</td>
                          <td className="py-3.5 px-4 text-center text-gray-400 text-xs">—</td>
                        </tr>

                        {addedCompetitors.map((comp) => (
                          <tr key={comp.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              <a
                                href={`https://${comp.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 hover:text-[#7C3AED] hover:underline flex items-center gap-1"
                              >
                                {comp.domain}
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </a>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                {comp.tag}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-purple-600">
                              {comp.visibility}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">{comp.avgPosition}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-[#7C3AED] font-bold">
                              {comp.commonKeywords}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                              {comp.organicTraffic}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                              {comp.backlinks}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCompetitor(comp.id, comp.domain)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove competitor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SERP COMPETITORS (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'serp' && (
          <SeRankingSerpCompetitors
            projectDomain={domain}
            projectId={activeProject?.id}
            addedCompetitors={addedCompetitors}
            onAddCompetitor={handleAddCompetitor}
            showToast={showToast}
            onOpenGuestLink={() => setIsGuestLinkOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenNotes={() => setIsNotesModalOpen(true)}
            notesCount={notesCount}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SHARE OF VOICE (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'sov' && (
          <SeRankingShareOfVoice
            projectDomain={domain}
            projectId={activeProject?.id}
            showToast={showToast}
            onOpenGuestLink={() => setIsGuestLinkOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenNotes={() => setIsNotesModalOpen(true)}
            notesCount={notesCount}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VISIBILITY RATING (1:1 Matching User Screenshots & Highcharts Spline) */}
        {/* ========================================================================= */}
        {tabParam === 'visibility' && (
          <SeRankingVisibilityRating
            projectDomain={domain}
            projectId={activeProject?.id}
            showToast={showToast}
            onOpenGuestLink={() => setIsGuestLinkOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenNotes={() => setIsNotesModalOpen(true)}
            notesCount={notesCount}
          />
        )}



      {/* ========================================================================= */}
      {/* ALL MODALS */}
      {/* ========================================================================= */}

      {/* Advanced SERP Analysis Modal */}
      {isAdvancedSerpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-gray-900">Advanced SERP Analysis</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedSerpOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Analyze SERP landscape dynamics and feature presence for all tracked keywords on Google India:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Featured Snippets</span>
                <span className="font-mono font-bold text-[#7C3AED]">32% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">People Also Ask (PAA)</span>
                <span className="font-mono font-bold text-emerald-600">86% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Knowledge Panels</span>
                <span className="font-mono font-bold text-purple-600">14% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Sitelinks</span>
                <span className="font-mono font-bold text-amber-600">54% presence</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAdvancedSerpOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitors Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-gray-900">Add Competitors to Track</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Select recommended competitors or add any custom website URL to track keyword rankings side by side:
            </p>

            <form onSubmit={handleAddCustomDomain} className="flex gap-2">
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="e.g. competitor.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#7C3AED]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Competitor Candidates for {domain}
              </span>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl max-h-52 overflow-y-auto">
                {candidateList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No competitor suggestions available. Enter a custom domain above to track.
                  </div>
                ) : (
                  candidateList.map((item) => {
                    const isAdded = addedCompetitors.some((c) => c.domain.toLowerCase() === item.domain.toLowerCase());
                    return (
                      <div
                        key={item.id}
                        className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{item.domain}</div>
                          <div className="text-[11px] text-gray-500">
                            {item.commonKeywords ? `${item.commonKeywords} common keywords` : 'Candidate'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddCompetitor({
                            id: item.id,
                            domain: item.domain,
                            visibility: 0,
                            avgPosition: 0,
                            commonKeywords: item.commonKeywords || 0,
                            totalKeywords: 0,
                            organicTraffic: '—',
                            backlinks: '—',
                            tag: 'Direct Competitor',
                          })}
                          disabled={isAdded || addedCompetitors.length >= 5}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isAdded
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#F5F3FF] text-[#7C3AED] hover:bg-purple-100'
                          }`}
                        >
                          {isAdded ? 'Added' : '+ Track'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Limits Modal */}
      {isLimitsInfoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Competitor Limits</h3>
              <button
                type="button"
                onClick={() => setIsLimitsInfoOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your current subscription plan allows up to <strong>5 competitor domains</strong> per project.
              Upgrading allows up to 20 competitors for enterprise benchmarking.
            </p>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsLimitsInfoOpen(false)}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      {isGuestLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Get access to guest links</h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view competitor benchmarks without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;section=competitors
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641&section=competitors');
                  showToast('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#7C3AED] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Project Notes Modal */}
      <ProjectNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        projectDomain={domain}
        siteName={domain}
        onNotesCountChange={(count) => setNotesCount(count)}
      />
    </div>
  );
}

export default function CompetitorsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading competitors...</div>}>
        <CompetitorsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
