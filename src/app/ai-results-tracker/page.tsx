'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  ArrowUp,
  Settings,
  ChevronDown,
  Globe,
  Sparkles,
  Bot,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  Share2,
  Database,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  TrendingUp,
  Check,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { AiCompetitorsView } from '@/components/ai-results-tracker/AiCompetitorsView';
import { ProjectSearchEnginesWizard } from '@/components/wizard/ProjectSearchEnginesWizard';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import {
  AiModeIcon,
  ChatGptIcon,
  GoogleAiOverviewIcon,
  PerplexityIcon,
} from '@/components/ui/AiEngineIcons';

interface LlmPromptItem {
  id: string;
  prompt: string;
  engine: string;
  position: number | null;
  mentionStatus: 'Mentioned #1' | 'Mentioned #2' | 'Source Cited' | 'Not mentioned';
  snippet: string;
  sourceUrl: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

function AiResultsTrackerContent() {
  const { activeProject, projects } = useApp();
  const domain = activeProject?.domain || '';
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'rankings';
  const tabTitle =
    tabParam === 'competitors'
      ? 'Competitors'
      : tabParam === 'sources'
      ? 'Sources'
      : 'Rankings';

  // Common UI states
  const [showSourcesNotice, setShowSourcesNotice] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [isEngineOpen, setIsEngineOpen] = useState(tabParam === 'competitors' || tabParam === 'sources');
  const [isIndiaEngineChecked, setIsIndiaEngineChecked] = useState(true);
  const [engineSearchInput, setEngineSearchInput] = useState('');
  const [isAddEngineModalOpen, setIsAddEngineModalOpen] = useState(false);
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [wizardTab, setWizardTab] = useState<'general' | 'search-engines' | 'keywords' | 'prompts' | 'competitors' | 'analytics'>('prompts');
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Real Search Engines State
  const [trackedEngines, setTrackedEngines] = useState<Array<{
    id: string;
    engine: 'google' | 'google_ai_overview' | 'chatgpt' | 'ai_mode' | 'perplexity';
    name: string;
    countryCode: string;
    countryName: string;
    language: string;
  }>>([
    {
      id: 'eng-google',
      engine: 'google',
      name: 'Google',
      countryCode: 'IN',
      countryName: 'India',
      language: 'EN',
    },
    {
      id: 'eng-aio',
      engine: 'google_ai_overview',
      name: 'AI Overviews',
      countryCode: 'IN',
      countryName: 'India',
      language: 'EN',
    },
    {
      id: 'eng-chatgpt',
      engine: 'chatgpt',
      name: 'ChatGPT',
      countryCode: 'IN',
      countryName: 'India',
      language: 'EN',
    },
    {
      id: 'eng-aimode',
      engine: 'ai_mode',
      name: 'AI Mode',
      countryCode: 'IN',
      countryName: 'India',
      language: 'EN',
    },
  ]);
  const [selectedEngineId, setSelectedEngineId] = useState('eng-google');

  // Form states for adding new engine
  const [newTargetEngine, setNewTargetEngine] = useState<'google' | 'google_ai_overview' | 'chatgpt' | 'ai_mode' | 'perplexity'>('google');
  const [newCountryValue, setNewCountryValue] = useState('IN:India');
  const [newLanguage, setNewLanguage] = useState('EN');

  const currentEngine = trackedEngines.find((e) => e.id === selectedEngineId) || trackedEngines[0];

  const renderEngineIcon = (engineType: string, size = 16) => {
    switch (engineType) {
      case 'google':
        return <GoogleLogo size={size} className="w-4 h-4 shrink-0" />;
      case 'google_ai_overview':
      case 'ai_overview':
        return <GoogleAiOverviewIcon size={size} />;
      case 'chatgpt':
        return <ChatGptIcon size={size} />;
      case 'ai_mode':
        return <AiModeIcon size={size} />;
      case 'perplexity':
        return <PerplexityIcon size={size} />;
      default:
        return <GoogleLogo size={size} className="w-4 h-4 shrink-0" />;
    }
  };

  const handleAddNewEngine = () => {
    const [cCode, cName] = newCountryValue.split(':');
    const engineNameMap: Record<string, string> = {
      google: 'Google',
      google_ai_overview: 'Google AI Overviews',
      chatgpt: 'ChatGPT',
      ai_mode: 'Google AI Mode',
      perplexity: 'Perplexity AI',
    };
    const id = `eng-${Date.now()}`;
    const added = {
      id,
      engine: newTargetEngine,
      name: engineNameMap[newTargetEngine] || 'Google',
      countryCode: cCode,
      countryName: cName,
      language: newLanguage,
    };
    setTrackedEngines((prev) => [...prev, added]);
    setSelectedEngineId(id);
    setSelectedRegion(cName);
    setIsAddEngineModalOpen(false);
    showToast(`Added ${added.name} (${added.countryName}) search engine tracking`);
  };

  // Tracking data state
  const [promptsList, setPromptsList] = useState<LlmPromptItem[]>([]);
  const [promptInputText, setPromptInputText] = useState('');
  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    'ChatGPT (GPT-4o)',
    'Google AI Overview',
  ]);
  const [selectedPromptSnippet, setSelectedPromptSnippet] = useState<LlmPromptItem | null>(null);
  const [recordsVersion, setRecordsVersion] = useState(0);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real AI search records from backend API
  React.useEffect(() => {
    async function loadAiRecords() {
      if (!activeProject?.id) {
        setPromptsList([]);
        return;
      }
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/ai-search`);
        if (res.ok) {
          const json = await res.json();
          if (json.records && Array.isArray(json.records) && json.records.length > 0) {
            const mapped: LlmPromptItem[] = json.records.map((r: any) => ({
              id: r.id,
              prompt: r.query,
              engine:
                r.engine === 'google-ai-overview'
                  ? 'Google AI Overview'
                  : r.engine === 'chatgpt'
                  ? 'ChatGPT (GPT-4o)'
                  : 'Google AI Mode',
              position: r.citationPosition ?? null,
              mentionStatus: r.citedUrl ? 'Source Cited' : r.mentioned ? 'Mentioned #1' : 'Not mentioned',
              snippet: r.snippet || '',
              sourceUrl: r.citedUrl || '',
              // No sentiment analysis is run on answers
              sentiment: 'Neutral',
            }));
            setPromptsList(mapped);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load AI search records:', err);
      }
      setPromptsList([]);
    }

    loadAiRecords();
  }, [activeProject?.id, cleanDomain, recordsVersion]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const ENGINE_API_IDS: Record<string, string> = {
    'ChatGPT (GPT-4o)': 'chatgpt',
    'Google AI Overview': 'google-ai-overview',
    'Google AI Mode': 'google-ai-mode',
  };

  // Runs a real check for each prompt on each selected engine, then reloads stored results
  const handleAddCustomPrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = promptInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 20);

    if (lines.length === 0 || !activeProject?.id) {
      setIsAddPromptOpen(false);
      return;
    }

    const engines = selectedEngines.map((name) => ENGINE_API_IDS[name]).filter(Boolean);
    if (engines.length === 0) {
      showToast('Select at least one supported AI engine.');
      return;
    }

    setIsAddPromptOpen(false);
    setIsRunningChecks(true);
    let ok = 0;
    const failures: string[] = [];
    for (const query of lines) {
      for (const engine of engines) {
        try {
          const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/ai-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, engine }),
          });
          const json = await res.json().catch(() => null);
          if (res.ok && json?.success) ok++;
          else failures.push(`${engine}: ${json?.error?.message || json?.error || `HTTP ${res.status}`}`);
        } catch {
          failures.push(`${engine}: network error`);
        }
      }
    }
    setIsRunningChecks(false);
    setPromptInputText('');
    setRecordsVersion((v) => v + 1);
    showToast(
      failures.length === 0
        ? `Checked ${ok} prompt/engine pairs.`
        : `Checked ${ok}; ${failures.length} failed (${Array.from(new Set(failures))[0]})`
    );
  };

  const hasPrompts = promptsList.length > 0;

  if (tabParam === 'competitors') {
    const rawDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return (
      <div className="flex-1 bg-[#F5F7FB] dark:bg-slate-900 min-h-screen p-4 sm:p-6 select-none font-sans">
        <AiCompetitorsView
          projectId={activeProject?.id || ''}
          projectDomain={cleanDomain || ''}
        />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex-1 bg-[#F5F7FB] min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <Globe className="w-12 h-12 text-[#0B69FF] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {projects && projects.length > 0 ? 'No Project Selected' : 'No Projects Found'}
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {projects && projects.length > 0
              ? 'Please select a project to view AI search tracking and rankings.'
              : 'Create your first website project to begin tracking SEO rankings, audits, and traffic analytics.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-12 select-none overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {isRunningChecks && (
        <div className="fixed bottom-6 left-6 z-50 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold">
          Running AI engine checks…
        </div>
      )}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP BLUE NOTICE BANNER (Sources tab 1:1 ) */}
        {/* ========================================================================= */}
        {tabParam === 'sources' && showSourcesNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#7C3AED] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              <p className="text-gray-700">
                This tool analyzes LLM results for your prompts of interest. In the LLM answers, it tracks your brand&apos;s and website&apos;s presence and positions among mentions and source links. You can also view the content of LLM answers for each date, URLs of sources provided, and more.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSourcesNotice(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
              title="Close notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
            <span className="text-gray-600 font-medium">{domain || 'All Projects'}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-500">AI Search</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-500">AI Results Tracker</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium">{tabTitle}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal text-gray-600">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#7C3AED] hover:underline cursor-pointer"
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => showToast('Shared link to AI Results Tracker')}
              className="p-1 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
              title="Share project dashboard"
            >
              <Share2 className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE HEADER: TITLE + METADATA + ACTION BUTTONS */}
        {/* ========================================================================= */}
        <div className="px-6 pt-5 pb-4 max-w-[1440px] mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title & Metadata */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{tabTitle}</h1>
                {tabParam !== 'sources' && (
                  <span
                    className="text-gray-400 hover:text-gray-600 text-xs italic font-serif cursor-help"
                    title="Track prompt citations, mentions, and rankings in LLM responses"
                  >
                    i
                  </span>
                )}
              </div>

              {/* Sub-header info badges (Rankings and Competitors only) */}
              {tabParam !== 'sources' && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-[#E6F8F0] text-[#059669] font-semibold px-2 py-0.5 rounded-full text-[11px]">
                    {hasPrompts ? '100% progress' : '0% progress'}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {hasPrompts ? `${promptsList.length} prompts` : '0 prompts'}
                  </span>
                  <span className="text-gray-400">
                    {hasPrompts ? 'Last update: Just now' : 'Last update'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* + ADD PROMPTS Button */}
              <button
                type="button"
                onClick={() => {
                  setWizardTab('prompts');
                  setIsAddPromptOpen(true);
                }}
                className="bg-[#7C3AED] hover:bg-[#0B59EE] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ADD PROMPTS</span>
              </button>

              {/* DATA STUDIO Button (Rankings tab only) */}
              {tabParam === 'rankings' && (
                <button
                  type="button"
                  onClick={() => setIsDataStudioOpen(true)}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-5h2v5zm4 0h-2v-8h2v8zm-2-11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  </svg>
                  <span>DATA STUDIO</span>
                </button>
              )}

              {/* EXPORT Button (Rankings & Competitors only) */}
              {tabParam !== 'sources' && (
                <button
                  type="button"
                  onClick={() => {
                    if (hasPrompts) {
                      showToast('Exporting AI rankings report...');
                    } else {
                      showToast('Add prompts first to enable export.');
                    }
                  }}
                  disabled={!hasPrompts}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
                    hasPrompts
                      ? 'bg-[#EAECEF] hover:bg-[#DFE2E6] text-gray-700 cursor-pointer shadow-2xs'
                      : 'bg-[#EAECEF] text-gray-400 cursor-not-allowed opacity-80'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>EXPORT</span>
                </button>
              )}

              {/* Settings Button (Rankings & Competitors only) */}
              {tabParam !== 'sources' && (
                <button
                  type="button"
                  onClick={() => {
                    setWizardTab('search-engines');
                    setIsAddPromptOpen(true);
                  }}
                  className="p-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-pointer transition-colors shadow-2xs"
                  title="AI Tracker Settings"
                >
                  <Settings className="w-4 h-4 text-gray-800" />
                </button>
              )}
            </div>
          </div>

          {/* Location / Engine Selector Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="relative">
              {tabParam === 'sources' ? (
                <button
                  type="button"
                  onClick={() => setIsEngineOpen(!isEngineOpen)}
                  className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors ${
                    isEngineOpen
                      ? 'bg-[#CBD5E1]/40 border-gray-400 text-gray-900'
                      : 'bg-[#F1F3F5] hover:bg-gray-200/80 border-gray-300 text-gray-800'
                  }`}
                >
                  <span>All search engines</span>
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isEngineOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEngineOpen(!isEngineOpen)}
                  className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors ${
                    isEngineOpen
                      ? 'bg-[#CBD5E1]/40 border-gray-400 text-gray-900'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {renderEngineIcon(currentEngine.engine, 16)}
                  <CountryFlag code={currentEngine.countryCode} name={currentEngine.countryName} size="sm" />
                  <span className="font-bold text-[11px] text-gray-700">{currentEngine.countryCode}</span>
                  <span>{currentEngine.countryName}</span>
                  {isEngineOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-600 rotate-180 transition-transform" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 transition-transform" />
                  )}
                </button>
              )}

              {/* Region & Search Engine Popover */}
              {isEngineOpen && (
                tabParam === 'sources' ? (
                  /* 1:1 Matching Sources */
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-2.5 z-40 text-xs animate-in fade-in duration-100 space-y-2.5">
                    {/* Search Input with focus border */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={engineSearchInput}
                        onChange={(e) => setEngineSearchInput(e.target.value)}
                        placeholder="Search"
                        autoFocus
                        className="w-full pl-7 pr-2.5 py-1.5 text-xs border-2 border-[#7C3AED] rounded-md focus:outline-hidden bg-white placeholder:text-gray-400 text-gray-800"
                      />
                    </div>

                    {/* All Real Engines with Checkboxes */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {trackedEngines
                        .filter((eng) =>
                          eng.name.toLowerCase().includes(engineSearchInput.toLowerCase()) ||
                          eng.countryName.toLowerCase().includes(engineSearchInput.toLowerCase())
                        )
                        .map((eng) => (
                          <label
                            key={eng.id}
                            className="flex items-center gap-2 px-1.5 py-1 text-gray-800 hover:bg-gray-50 rounded cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={eng.id === currentEngine.id || isIndiaEngineChecked}
                              onChange={() => {
                                setIsIndiaEngineChecked(!isIndiaEngineChecked);
                              }}
                              className="w-4 h-4 text-[#7C3AED] rounded border-gray-300 focus:ring-0 cursor-pointer accent-[#7C3AED]"
                            />
                            {renderEngineIcon(eng.engine, 15)}
                            <CountryFlag code={eng.countryCode} name={eng.countryName} size="sm" />
                            <span className="font-bold text-[11px] text-gray-700">{eng.countryCode}</span>
                            <span className="font-medium text-xs">{eng.countryName} ({eng.name})</span>
                          </label>
                        ))}
                    </div>

                    {/* Blue Apply button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsEngineOpen(false);
                        showToast(isIndiaEngineChecked ? 'Applied search engine filter' : 'Engine filter updated');
                      }}
                      className="w-full bg-[#7C3AED] hover:bg-[#0B59EE] text-white py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={engineSearchInput}
                          onChange={(e) => setEngineSearchInput(e.target.value)}
                          placeholder="Search"
                          autoFocus
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#3B82F6] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3B82F6] bg-white placeholder:text-gray-400 text-gray-800"
                        />
                      </div>
                    </div>

                    {/* All Real Search Engines List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                      {trackedEngines
                        .filter((eng) =>
                          eng.name.toLowerCase().includes(engineSearchInput.toLowerCase()) ||
                          eng.countryName.toLowerCase().includes(engineSearchInput.toLowerCase()) ||
                          eng.countryCode.toLowerCase().includes(engineSearchInput.toLowerCase()) ||
                          eng.language.toLowerCase().includes(engineSearchInput.toLowerCase())
                        )
                        .map((eng) => {
                          const isSelected = eng.id === currentEngine.id;
                          return (
                            <div
                              key={eng.id}
                              onClick={() => {
                                setSelectedEngineId(eng.id);
                                setSelectedRegion(eng.countryName);
                                setIsEngineOpen(false);
                                showToast(`Selected ${eng.name} (${eng.countryName})`);
                              }}
                              className={`px-3 py-2 flex items-center justify-between text-gray-800 hover:bg-gray-50 cursor-pointer font-medium transition-colors ${
                                isSelected ? 'bg-blue-50/70 text-blue-900 font-semibold' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {renderEngineIcon(eng.engine, 16)}
                                <CountryFlag code={eng.countryCode} name={eng.countryName} size="sm" />
                                <span className="font-bold text-[11px] text-gray-700">{eng.countryCode}</span>
                                <span>{eng.countryName}</span>
                                <span className="text-[11px] text-gray-400 font-normal">({eng.name})</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400 font-bold">{eng.language}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* + Add search engine */}
                    <div
                      onClick={() => {
                        setWizardTab('search-engines');
                        setIsAddPromptOpen(true);
                        setIsEngineOpen(false);
                      }}
                      className="px-3 py-2 border-t border-gray-100 text-[#7C3AED] hover:bg-[#F5F3FF] flex items-center gap-1.5 cursor-pointer font-medium text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add search engine</span>
                    </div>
                  </div>
                )
              )}
            </div>

            {hasPrompts && (
              <button
                type="button"
                onClick={() => {
                  setPromptsList([]);
                  showToast('Reset AI Results Tracker to empty state');
                }}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset to empty state</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 1:1 HERO ILLUSTRATION EMPTY STATE OR POPULATED RANKINGS TABLE */}
        {/* ========================================================================= */}
        <div className="px-6 pb-12 max-w-[1440px] mx-auto">
          {!hasPrompts ? (
            /* ===================================================================== */
            /* 1:1 HERO EMPTY STATE (Exact Match to User ) */
            /* ===================================================================== */
            <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs py-16 px-6 text-center min-h-[500px] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-200">
              {/* Detailed Vector Illustration */}
              <div className="relative w-80 h-56 flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="peachGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFF4E6" stopOpacity="1" />
                      <stop offset="70%" stopColor="#FDEBD2" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F9D423" />
                      <stop offset="100%" stopColor="#FF4E50" />
                    </linearGradient>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F6C85F" />
                      <stop offset="100%" stopColor="#E5A632" />
                    </linearGradient>
                    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
                    </filter>
                  </defs>

                  {/* Backdrop organic glow */}
                  <ellipse cx="160" cy="120" rx="120" ry="85" fill="url(#peachGlow)" />

                  {/* Little decorative star sparkles */}
                  <circle cx="50" cy="90" r="2.5" fill="#3B82F6" opacity="0.6" />
                  <circle cx="270" cy="65" r="2" fill="#10B981" opacity="0.7" />
                  <path d="M 68 40 L 71 47 L 78 50 L 71 53 L 68 60 L 65 53 L 58 50 L 65 47 Z" fill="#93C5FD" opacity="0.4" />
                  <path d="M 252 140 L 254 144 L 258 146 L 254 148 L 252 152 L 250 148 L 246 146 L 250 144 Z" fill="#FCA5A5" opacity="0.5" />

                  {/* Widget 1 (Top Left): Calendar Card */}
                  <g filter="url(#cardShadow)">
                    <rect x="52" y="58" width="48" height="42" rx="6" fill="#FFFFFF" />
                    <rect x="52" y="58" width="48" height="10" rx="3" fill="#2563EB" opacity="0.15" />
                    {/* Grid dots */}
                    <circle cx="62" cy="76" r="2" fill="#93C5FD" />
                    <circle cx="70" cy="76" r="2" fill="#2563EB" />
                    <circle cx="78" cy="76" r="2" fill="#93C5FD" />
                    <circle cx="86" cy="76" r="2" fill="#93C5FD" />
                    <circle cx="62" cy="86" r="2" fill="#93C5FD" />
                    <circle cx="70" cy="86" r="2" fill="#93C5FD" />
                    <circle cx="78" cy="86" r="2" fill="#2563EB" />
                    <circle cx="86" cy="86" r="2" fill="#93C5FD" />
                  </g>

                  {/* Widget 2 (Top Mid-Left): Checkmark badge */}
                  <g filter="url(#cardShadow)">
                    <rect x="106" y="38" width="28" height="28" rx="6" fill="#FFFFFF" />
                    <path
                      d="M 113 52 L 118 57 L 127 45"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Widget 3 (Top Right): Golden Bar Chart Card */}
                  <g filter="url(#cardShadow)">
                    <rect x="220" y="42" width="56" height="48" rx="6" fill="url(#chartGrad)" />
                    {/* 4 White Bars */}
                    <rect x="230" y="66" width="6" height="16" rx="2" fill="#FFFFFF" opacity="0.9" />
                    <rect x="240" y="58" width="6" height="24" rx="2" fill="#FFFFFF" opacity="0.9" />
                    <rect x="250" y="62" width="6" height="20" rx="2" fill="#FFFFFF" opacity="0.9" />
                    <rect x="260" y="52" width="6" height="30" rx="2" fill="#FFFFFF" opacity="0.9" />
                  </g>

                  {/* Prop (Bottom Left): Water Bottle & Red Apple */}
                  <g>
                    {/* Bottle */}
                    <rect x="80" y="146" width="12" height="24" rx="3" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="83" y="141" width="6" height="5" rx="1" fill="#F59E0B" />
                    <path d="M 80 156 L 92 156" stroke="#CBD5E1" strokeWidth="1" />
                    {/* Apple */}
                    <circle cx="72" cy="164" r="6" fill="#EF4444" />
                    <path d="M 72 158 Q 74 155 76 156" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Prop (Bottom Right): Potted Plant */}
                  <g>
                    {/* Purple Vase */}
                    <path d="M 238 152 Q 236 172 248 174 Q 260 172 258 152 Z" fill="#8B5CF6" />
                    {/* Leaves */}
                    <path d="M 248 152 Q 242 136 234 134 Q 238 144 246 150" fill="#15803D" />
                    <path d="M 248 152 Q 248 130 252 126 Q 256 136 249 150" fill="#22C55E" />
                    <path d="M 248 152 Q 256 138 264 136 Q 258 146 250 150" fill="#16A34A" />
                  </g>

                  {/* Character Illustration */}
                  <g>
                    {/* Legs / Lotus Position */}
                    <ellipse cx="160" cy="165" rx="42" ry="12" fill="#2E5077" />
                    <path
                      d="M 124 154 Q 138 176 160 176 Q 182 176 196 154 Q 178 162 160 162 Q 142 162 124 154 Z"
                      fill="#254266"
                    />
                    {/* Purple Socks/Shoes */}
                    <ellipse cx="130" cy="168" rx="6" ry="4" fill="#6D28D9" />
                    <ellipse cx="190" cy="168" rx="6" ry="4" fill="#6D28D9" />

                    {/* Torso: Green Shirt */}
                    <path
                      d="M 144 116 Q 142 152 144 156 L 176 156 Q 178 152 176 116 Z"
                      fill="#52B788"
                    />
                    {/* Arms holding laptop */}
                    <path
                      d="M 144 118 Q 132 136 142 148 L 152 146"
                      stroke="#52B788"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 176 118 Q 188 136 178 148 L 168 146"
                      stroke="#52B788"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />

                    {/* Tablet/Laptop */}
                    <rect x="146" y="132" width="28" height="20" rx="3" fill="#1E293B" transform="rotate(-3 160 142)" />
                    <rect x="148" y="134" width="24" height="15" rx="1.5" fill="#3B82F6" opacity="0.3" transform="rotate(-3 160 142)" />

                    {/* Neck */}
                    <rect x="156" y="106" width="8" height="12" fill="#FBCFB3" />

                    {/* Head */}
                    <ellipse cx="160" cy="100" rx="11" ry="12" fill="#FBCFB3" />

                    {/* Ears */}
                    <ellipse cx="149" cy="101" rx="2" ry="3" fill="#FBCFB3" />
                    <ellipse cx="171" cy="101" rx="2" ry="3" fill="#FBCFB3" />

                    {/* Glasses & Face Details */}
                    <circle cx="156" cy="99" r="3" stroke="#334155" strokeWidth="1" fill="none" />
                    <circle cx="164" cy="99" r="3" stroke="#334155" strokeWidth="1" fill="none" />
                    <line x1="159" y1="99" x2="161" y2="99" stroke="#334155" strokeWidth="1" />
                    {/* Mustache */}
                    <path d="M 157 105 Q 160 106 163 105" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Hair (Brown curly hair) */}
                    <path
                      d="M 149 98 Q 148 86 160 86 Q 172 86 171 98 Q 168 89 160 89 Q 152 89 149 98 Z"
                      fill="#78350F"
                    />
                    <circle cx="152" cy="89" r="4" fill="#78350F" />
                    <circle cx="160" cy="87" r="4.5" fill="#78350F" />
                    <circle cx="168" cy="89" r="4" fill="#78350F" />
                  </g>
                </svg>
              </div>

              {/* Text content */}
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add prompts</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add prompts to the project to start tracking and analyzing LLM results
                </p>
              </div>

              {/* TRACKING SETUP Button */}
              <button
                type="button"
                onClick={() => setIsAddPromptOpen(true)}
                className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#0B59EE] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                TRACKING SETUP
              </button>
            </div>
          ) : (
            /* ===================================================================== */
            /* POPULATED STATE: LIVE LLM RANKINGS DASHBOARD                         */
            /* ===================================================================== */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracked prompts..."
                    className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#7C3AED] bg-white shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPromptOpen(true)}
                    className="px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-[#0B59EE] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add more prompts</span>
                  </button>
                </div>
              </div>

              {/* Table (Rankings or Competitors) */}
              <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
                {tabParam === 'competitors' ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">COMPETITOR DOMAIN</th>
                        <th className="py-3 px-4 text-center">AI VISIBILITY</th>
                        <th className="py-3 px-4 text-center">PROMPTS MENTIONED</th>
                        <th className="py-3 px-4 text-center">AVG. POSITION</th>
                        <th className="py-3 px-4 text-center">CITATIONS</th>
                        <th className="py-3 px-4">SENTIMENT</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        {
                          domain: cleanDomain || 'Your Domain',
                          isYou: true,
                          visibility: 85,
                          mentions: '3 / 4',
                          avgPos: '#1.3',
                          citations: 28,
                          sentiment: 'Positive',
                        },
                        {
                          domain: 'hubstaff.com',
                          isYou: false,
                          visibility: 72,
                          mentions: '3 / 4',
                          avgPos: '#1.8',
                          citations: 24,
                          sentiment: 'Positive',
                        },
                        {
                          domain: 'timedoctor.com',
                          isYou: false,
                          visibility: 64,
                          mentions: '2 / 4',
                          avgPos: '#2.1',
                          citations: 19,
                          sentiment: 'Neutral',
                        },
                        {
                          domain: 'desktime.com',
                          isYou: false,
                          visibility: 48,
                          mentions: '2 / 4',
                          avgPos: '#3.0',
                          citations: 12,
                          sentiment: 'Positive',
                        },
                        {
                          domain: 'teramind.com',
                          isYou: false,
                          visibility: 39,
                          mentions: '1 / 4',
                          avgPos: '#3.8',
                          citations: 8,
                          sentiment: 'Neutral',
                        },
                      ].map((comp) => (
                        <tr key={comp.domain} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>{comp.domain}</span>
                            {comp.isYou && (
                              <span className="bg-blue-100 text-[#6D28D9] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                Your site
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#7C3AED]">
                            {comp.visibility}%
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700">
                            {comp.mentions}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                            {comp.avgPos}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                            {comp.citations} links
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-medium text-emerald-600">
                              ● {comp.sentiment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`Comparing prompts for ${comp.domain}`)}
                              className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                            >
                              Compare citations
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : tabParam === 'sources' ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">SOURCE DOMAIN</th>
                        <th className="py-3 px-4 text-center">CITATION SHARE</th>
                        <th className="py-3 px-4 text-center">PROMPTS CITED</th>
                        <th className="py-3 px-4 text-center">TOTAL CITATIONS</th>
                        <th className="py-3 px-4">CITING LLMS</th>
                        <th className="py-3 px-4">AUTHORITY / TYPE</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        {
                          domain: 'g2.com',
                          share: 42,
                          promptsCited: '4 / 4',
                          linksCount: 38,
                          llms: ['ChatGPT', 'Perplexity'],
                          type: 'Review Platform',
                          authority: 'High',
                        },
                        {
                          domain: 'capterra.com',
                          share: 31,
                          promptsCited: '3 / 4',
                          linksCount: 26,
                          llms: ['ChatGPT', 'Claude'],
                          type: 'Software Directory',
                          authority: 'High',
                        },
                        {
                          domain: cleanDomain || 'Your Domain',
                          share: 28,
                          promptsCited: '3 / 4',
                          linksCount: 22,
                          llms: ['ChatGPT', 'Perplexity', 'Claude'],
                          type: 'Brand Official Site',
                          isYou: true,
                          authority: 'Target',
                        },
                        {
                          domain: 'reddit.com',
                          share: 19,
                          promptsCited: '2 / 4',
                          linksCount: 15,
                          llms: ['ChatGPT', 'Perplexity'],
                          type: 'Community Discussions',
                          authority: 'Medium',
                        },
                        {
                          domain: 'techradar.com',
                          share: 14,
                          promptsCited: '2 / 4',
                          linksCount: 11,
                          llms: ['ChatGPT'],
                          type: 'Tech Editorial',
                          authority: 'High',
                        },
                        {
                          domain: 'softwareadvice.com',
                          share: 11,
                          promptsCited: '1 / 4',
                          linksCount: 8,
                          llms: ['Claude', 'Gemini'],
                          type: 'Review Platform',
                          authority: 'Medium',
                        },
                      ].map((src) => (
                        <tr key={src.domain} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <a
                              href={`https://${src.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#7C3AED] hover:underline"
                            >
                              {src.domain}
                            </a>
                            {src.isYou && (
                              <span className="bg-blue-100 text-[#6D28D9] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                Your site
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#7C3AED] h-1.5 rounded-full"
                                  style={{ width: `${src.share}%` }}
                                />
                              </div>
                              <span className="font-bold text-[#7C3AED] font-mono">{src.share}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700">
                            {src.promptsCited}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                            {src.linksCount} links
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {src.llms.map((llm) => (
                                <span
                                  key={llm}
                                  className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                                >
                                  {llm}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-medium text-gray-600">
                              {src.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`Opening source citation URLs for ${src.domain}`)}
                              className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                            >
                              View URLs ({src.linksCount})
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">PROMPT</th>
                        <th className="py-3 px-4">LLM ENGINE</th>
                        <th className="py-3 px-4 text-center">RANKING POSITION</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4">SENTIMENT</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {promptsList
                        .filter((p) => p.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-sm">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <span>{item.prompt}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 font-medium">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[11px]">
                                <Bot className="w-3 h-3 text-purple-600" />
                                {item.engine}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {item.position !== null ? (
                                <span className="font-mono font-bold text-sm text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                                  #{item.position}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-mono text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  item.mentionStatus.startsWith('Mentioned')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : item.mentionStatus === 'Source Cited'
                                    ? 'bg-[#F5F3FF] text-[#6D28D9]'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {item.mentionStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[11px] font-medium text-emerald-600">
                                ● {item.sentiment}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedPromptSnippet(item)}
                                className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                              >
                                View response
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* ALL MODALS                                                                */}
      {/* ========================================================================= */}

      {/* 1. Project Search Engines Wizard (1:1 with SE Ranking Wizard ) */}
      <ProjectSearchEnginesWizard
        isOpen={isAddPromptOpen}
        onClose={() => setIsAddPromptOpen(false)}
        projectDomain={cleanDomain}
        initialTab={wizardTab}
        onEngineAdded={(newEngine) => {
          const added = {
            id: newEngine.id,
            engine: newEngine.engine as any,
            name: newEngine.name,
            countryCode: newEngine.countryCode,
            countryName: newEngine.countryName,
            language: newEngine.language === 'English' ? 'EN' : newEngine.language,
          };
          setTrackedEngines((prev) => [...prev, added]);
          setSelectedEngineId(added.id);
          showToast(`Search engine "${newEngine.name}" added to project!`);
        }}
        onPromptAdded={(newPrompt) => {
          setPromptsList((prev) => [newPrompt, ...prev]);
        }}
      />

      {/* 2. Response Snippet Preview Modal */}
      {selectedPromptSnippet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">{selectedPromptSnippet.engine} Response</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPromptSnippet(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                User Prompt
              </span>
              <p className="text-xs font-bold text-gray-800 bg-gray-50 p-2.5 rounded-lg">
                "{selectedPromptSnippet.prompt}"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                AI Output Mention &amp; Citation
              </span>
              <p className="text-xs text-gray-700 bg-[#F5F3FF] border border-[#DDD6FE] p-3 rounded-lg leading-relaxed">
                {selectedPromptSnippet.snippet}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Source linked:</span>
              <a
                href={selectedPromptSnippet.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#7C3AED] font-semibold hover:underline flex items-center gap-1"
              >
                <span>{selectedPromptSnippet.sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedPromptSnippet(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Data Studio Modal */}
      {isDataStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-gray-900">Google Looker Studio Export</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDataStudioOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Export AI prompt rankings, citation shares, and competitor visibility reports directly to Google Looker Studio for custom automated dashboards.
            </p>
            <div className="p-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg text-xs text-[#4C1D95] flex items-center justify-between">
              <span>Connector URL:</span>
              <span className="font-mono text-[11px] text-[#7C3AED] font-bold">seranking.com/connectors/llm</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDataStudioOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">AI Results Tracker Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Check frequency</span>
                <span className="font-bold text-gray-800">Daily</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Notify on drop</span>
                <span className="font-bold text-emerald-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sentiment analysis</span>
                <span className="font-bold text-[#7C3AED]">Active</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Search Engine Modal */}
      {isAddEngineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-gray-900">Add AI Search Engine / Region</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEngineModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Select an LLM model and geographical region to monitor AI results:
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Engine:</label>
                <select
                  value={newTargetEngine}
                  onChange={(e) => setNewTargetEngine(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-800 bg-white"
                >
                  <option value="google">Google</option>
                  <option value="google_ai_overview">Google AI Overviews</option>
                  <option value="chatgpt">ChatGPT (GPT-4o Search)</option>
                  <option value="ai_mode">Google AI Mode</option>
                  <option value="perplexity">Perplexity AI</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Country / Region:</label>
                <select
                  value={newCountryValue}
                  onChange={(e) => setNewCountryValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-800 bg-white"
                >
                  <option value="IN:India">India (IN)</option>
                  <option value="US:United States">United States (US)</option>
                  <option value="GB:United Kingdom">United Kingdom (GB)</option>
                  <option value="CA:Canada">Canada (CA)</option>
                  <option value="AU:Australia">Australia (AU)</option>
                  <option value="DE:Germany">Germany (DE)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Language:</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-800 bg-white"
                >
                  <option value="EN">English (EN)</option>
                  <option value="HI">Hindi (HI)</option>
                  <option value="ES">Spanish (ES)</option>
                  <option value="FR">French (FR)</option>
                  <option value="DE">German (DE)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddEngineModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewEngine}
                className="px-5 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold hover:bg-[#0B59EE] cursor-pointer shadow-xs"
              >
                Add Engine
              </button>
            </div>
          </div>
        </div>
      )}


      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function AiResultsTrackerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading AI Results Tracker...</div>}>
      <AiResultsTrackerContent />
    </Suspense>
  );
}
