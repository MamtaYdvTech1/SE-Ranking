'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Settings,
  Key,
  Sparkles,
  Users,
  BarChart2,
  ChevronDown,
  Globe,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  ExternalLink,
  Bot,
  AlertCircle,
  Copy,
} from 'lucide-react';
import {
  GoogleIcon,
  AiOverviewsIcon,
  AiModeIcon,
  ChatGptIcon,
} from '@/components/ui/SearchEngineIcons';
import { PerplexityIcon } from '@/components/ui/AiEngineIcons';
import { CountryFlag } from '@/components/ui/CountryFlag';

export type WizardTabType =
  | 'general'
  | 'search-engines'
  | 'keywords'
  | 'prompts'
  | 'competitors'
  | 'analytics';

export interface ProjectSearchEnginesWizardProps {
  isOpen: boolean;
  onClose: () => void;
  projectDomain?: string;
  initialTab?: WizardTabType;
  onEngineAdded?: (engine: any) => void;
  onPromptAdded?: (prompt: any) => void;
}

export function ProjectSearchEnginesWizard({
  isOpen,
  onClose,
  projectDomain = '',
  initialTab = 'search-engines',
  onEngineAdded,
  onPromptAdded,
}: ProjectSearchEnginesWizardProps) {
  const cleanDomain = projectDomain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<WizardTabType>(initialTab);

  // Sync initialTab when modal opens or prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Keyboard ESC listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // 1. SEARCH ENGINES TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [activeEngineType, setActiveEngineType] = useState<
    'google' | 'ai_overview' | 'ai_mode' | 'chatgpt'
  >('ai_overview');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [locationInput, setLocationInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [brandName, setBrandName] = useState(
    cleanDomain.includes('pinterest') ? 'Pinterest' : cleanDomain.split('.')[0] || 'brand'
  );

  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
  ];

  const currentCountry =
    countries.find((c) => c.code === selectedCountryCode) || countries[0];

  const [addedEngines, setAddedEngines] = useState([
    {
      id: 'se-1',
      name: 'Google India',
      engine: 'google',
      countryCode: 'IN',
      countryName: 'India',
      language: 'English',
      location: 'India',
    },
    {
      id: 'se-2',
      name: 'Google AI Overviews India',
      engine: 'ai_overview',
      countryCode: 'IN',
      countryName: 'India',
      language: 'English',
      location: 'India',
    },
  ]);

  const handleAddSearchEngine = (e: React.FormEvent) => {
    e.preventDefault();
    const engineLabel =
      activeEngineType === 'ai_overview'
        ? 'Google AI Overviews'
        : activeEngineType === 'ai_mode'
        ? 'Google AI Mode'
        : activeEngineType === 'chatgpt'
        ? 'ChatGPT'
        : `Google`;

    const newEngine = {
      id: `se-${Date.now()}`,
      name: `${engineLabel} ${currentCountry.name}`,
      engine: activeEngineType,
      countryCode: currentCountry.code,
      countryName: currentCountry.name,
      language: selectedLanguage,
      location: locationInput || currentCountry.name,
    };

    setAddedEngines((prev) => [...prev, newEngine]);
    if (onEngineAdded) onEngineAdded(newEngine);
    showToast(`Added ${newEngine.name} search engine`);
  };

  const handleRemoveEngine = (id: string) => {
    setAddedEngines((prev) => prev.filter((eng) => eng.id !== id));
    showToast('Search engine removed');
  };

  // ----------------------------------------------------
  // 2. PROMPTS TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [promptTextarea, setPromptTextarea] = useState('');
  const [promptSelectedEngines, setPromptSelectedEngines] = useState<string[]>([
    'ChatGPT (GPT-4o)',
    'Google AI Overviews',
  ]);
  const [promptCountryCode, setPromptCountryCode] = useState('IN');
  const [promptsList, setPromptsList] = useState<Array<{
    id: string;
    prompt: string;
    engine: string;
    country: string;
    sentiment: string;
    date: string;
  }>>([
    {
      id: 'p-1',
      prompt: `Cost and subscription pricing for ${cleanDomain}`,
      engine: 'Google AI Overviews',
      country: 'India',
      sentiment: 'Positive',
      date: 'Just now',
    },
    {
      id: 'p-2',
      prompt: `Best alternatives to ${cleanDomain}`,
      engine: 'ChatGPT (GPT-4o)',
      country: 'India',
      sentiment: 'Neutral',
      date: 'Just now',
    },
    {
      id: 'p-3',
      prompt: `Features and benefits of using ${cleanDomain}`,
      engine: 'Google AI Mode',
      country: 'India',
      sentiment: 'Positive',
      date: 'Just now',
    },
  ]);

  const togglePromptEngine = (engineName: string) => {
    setPromptSelectedEngines((prev) =>
      prev.includes(engineName)
        ? prev.filter((e) => e !== engineName)
        : [...prev, engineName]
    );
  };

  const handleAddPrompts = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const lines = promptTextarea
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showToast('Please enter at least one prompt query');
      return;
    }

    const currentCountryObj =
      countries.find((c) => c.code === promptCountryCode) || countries[0];

    const added: Array<{
      id: string;
      prompt: string;
      engine: string;
      country: string;
      sentiment: string;
      date: string;
    }> = [];

    lines.forEach((line, idx) => {
      const selectedEng = promptSelectedEngines[0] || 'ChatGPT (GPT-4o)';
      const newItem = {
        id: `prompt-${Date.now()}-${idx}`,
        prompt: line,
        engine: selectedEng,
        country: currentCountryObj.name,
        sentiment: 'Positive',
        date: 'Just now',
      };
      added.push(newItem);

      if (onPromptAdded) {
        onPromptAdded({
          id: newItem.id,
          prompt: line,
          engine: selectedEng,
          position: null,
          mentionStatus: 'Mentioned',
          snippet: `AI search result summary mentioning ${cleanDomain} for query "${line}"...`,
          sourceUrl: `https://${cleanDomain}`,
          sentiment: 'Positive',
        });
      }
    });

    setPromptsList((prev) => [...added, ...prev]);
    setPromptTextarea('');
    showToast(`Added ${added.length} target prompt(s) for AI tracking`);
  };

  const handleRemovePrompt = (id: string) => {
    setPromptsList((prev) => prev.filter((p) => p.id !== id));
    showToast('Prompt removed');
  };

  // ----------------------------------------------------
  // 3. KEYWORDS TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [keywordTextarea, setKeywordTextarea] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([
    'work time tracker',
    'employee monitoring software',
    'productivity analytics',
    'idle time detection',
  ]);

  const handleAddKeywords = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const lines = keywordTextarea
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    setKeywordsList((prev) => [...prev, ...lines]);
    setKeywordTextarea('');
    showToast(`Added ${lines.length} keyword(s)`);
  };

  // ----------------------------------------------------
  // 4. GENERAL TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [generalProjectName, setGeneralProjectName] = useState(cleanDomain);
  const [generalWebsiteUrl, setGeneralWebsiteUrl] = useState(`https://${cleanDomain}/`);
  const [generalWeeklyReport, setGeneralWeeklyReport] = useState(true);
  const [generalAudit, setGeneralAudit] = useState(true);
  const [generalBacklinks, setGeneralBacklinks] = useState(true);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('General project information saved successfully');
  };

  // ----------------------------------------------------
  // 5. COMPETITORS TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [competitorText, setCompetitorText] = useState('');
  const [competitorsList, setCompetitorsList] = useState<string[]>([
    'workcomposer.com',
    'rescuetime.com',
    'hubstaff.com',
  ]);

  const handleAddCompetitors = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const lines = competitorText
      .split('\n')
      .map((l) => l.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, ''))
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    setCompetitorsList((prev) => Array.from(new Set([...prev, ...lines])));
    setCompetitorText('');
    showToast(`Added ${lines.length} competitor(s)`);
  };

  // ----------------------------------------------------
  // 6. ANALYTICS TAB STATE
  // ----------------------------------------------------
  const [isGscConnected, setIsGscConnected] = useState(false);
  const [isGa4Connected, setIsGa4Connected] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F6FB] flex overflow-hidden animate-in fade-in duration-150 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-6 z-60 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (Matching SE Ranking :1) */}
      {/* ========================================================================= */}
      <div className="w-64 bg-[#0A58CA] text-white flex flex-col justify-between shrink-0 shadow-xl select-none">
        <div>
          {/* Logo & Domain Header */}
          <div className="p-6 border-b border-white/10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-black text-[#0A58CA] text-xs shadow-xs">
                SE
              </div>
              <span className="font-bold text-lg tracking-tight">SE Ranking</span>
            </div>

            <div className="pt-2">
              <h2 className="text-xl font-bold break-all leading-tight text-white tracking-tight">
                https://{cleanDomain}/
              </h2>
              <span className="text-xs text-white/70 block mt-1 font-medium">Settings</span>
            </div>
          </div>

          {/* Navigation Links with Interactive Active States */}
          <nav className="p-4 space-y-1 text-xs">
            {/* General information */}
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'general' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>General information</span>
            </button>

            {/* Search engines */}
            <button
              type="button"
              onClick={() => setActiveTab('search-engines')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'search-engines'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Search className={`w-4 h-4 ${activeTab === 'search-engines' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>Search engines</span>
            </button>

            {/* Keywords */}
            <button
              type="button"
              onClick={() => setActiveTab('keywords')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'keywords'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Key className={`w-4 h-4 ${activeTab === 'keywords' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>Keywords</span>
            </button>

            {/* Prompts */}
            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === 'prompts' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>Prompts</span>
            </button>

            {/* Competitors */}
            <button
              type="button"
              onClick={() => setActiveTab('competitors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'competitors'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'competitors' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>Competitors</span>
            </button>

            {/* Statistics and Analytics services */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#0A58CA]' : 'text-white/70'}`} />
              <span>Statistics and Analytics services</span>
            </button>
          </nav>
        </div>

        {/* Bottom indicator */}
        <div className="p-6 text-[11px] text-white/60 border-t border-white/10 flex items-center justify-between">
          <span>Project Settings</span>
          <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[10px]">Active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN RIGHT CONTENT AREA                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar with ESC button */}
        <div className="bg-white border-b border-[#E3E6EE] px-10 py-5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <h1 className="text-2xl font-bold text-[#171B24]">
            {activeTab === 'search-engines'
              ? 'Search engines'
              : activeTab === 'prompts'
              ? 'Prompts'
              : activeTab === 'keywords'
              ? 'Keywords'
              : activeTab === 'general'
              ? 'General information'
              : activeTab === 'competitors'
              ? 'Competitors'
              : 'Statistics and Analytics services'}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-[#525B6C] hover:text-[#171B24] cursor-pointer bg-[#F3F4F8] hover:bg-[#EAECEF] px-3.5 py-1.5 rounded-lg transition-colors border border-gray-200"
            title="Press Escape to return"
          >
            <X className="w-4 h-4" />
            <span>ESC</span>
          </button>
        </div>

        {/* ======================================================================= */}
        {/* TAB 1: SEARCH ENGINES (Exact 1:1 Match with User Uploaded ) */}
        {/* ======================================================================= */}
        {activeTab === 'search-engines' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            {/* Card 1: Set up search engines */}
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#171B24]">Set up search engines</h2>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1 max-w-3xl">
                  Track website and brand rankings for the queries you&apos;re interested in on classic
                  and AI search engines in any region and on any device. Google Maps results are
                  available as well.
                </p>
              </div>

              {/* Engine Type Tabs with Official Real Icons */}
              <div className="inline-flex rounded-xl border border-[#D5DAE5] bg-[#F8F9FC] p-1 gap-1 text-xs font-semibold select-none">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => setActiveEngineType('google')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeEngineType === 'google'
                      ? 'bg-white text-[#171B24] shadow-xs'
                      : 'text-[#525B6C] hover:text-[#171B24]'
                  }`}
                >
                  <GoogleIcon size={16} />
                  <span>Google</span>
                </button>

                {/* AI Overviews */}
                <button
                  type="button"
                  onClick={() => setActiveEngineType('ai_overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeEngineType === 'ai_overview'
                      ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                      : 'text-[#525B6C] hover:text-[#171B24]'
                  }`}
                >
                  <AiOverviewsIcon size={16} />
                  <span>AI Overviews</span>
                </button>

                {/* AI Mode */}
                <button
                  type="button"
                  onClick={() => setActiveEngineType('ai_mode')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeEngineType === 'ai_mode'
                      ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                      : 'text-[#525B6C] hover:text-[#171B24]'
                  }`}
                >
                  <AiModeIcon size={16} />
                  <span>AI Mode</span>
                </button>

                {/* ChatGPT */}
                <button
                  type="button"
                  onClick={() => setActiveEngineType('chatgpt')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeEngineType === 'chatgpt'
                      ? 'bg-white text-[#0A58CA] font-bold shadow-xs'
                      : 'text-[#525B6C] hover:text-[#171B24]'
                  }`}
                >
                  <ChatGptIcon size={16} />
                  <span>ChatGPT</span>
                </button>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleAddSearchEngine} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Country with real Flag and Code */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 font-semibold text-[#171B24]">
                      <span>Country</span>
                      <span className="text-[#8F97A8] italic font-serif cursor-help" title="Select target search country">i</span>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="w-full bg-white border border-[#D5DAE5] rounded-lg px-3 py-2.5 text-xs text-[#171B24] font-medium appearance-none focus:outline-hidden focus:border-[#0A58CA] cursor-pointer"
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8F97A8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-semibold text-[#171B24]">
                        <span>Location</span>
                        <span className="text-[#8F97A8] italic font-serif cursor-help" title="City or regional postal code">i</span>
                      </div>
                      <span className="text-[11px] text-[#8F97A8]">Optional</span>
                    </div>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Choose location"
                      className="w-full bg-white border border-[#D5DAE5] rounded-lg px-3 py-2.5 text-xs text-[#171B24] focus:outline-hidden focus:border-[#0A58CA]"
                    />
                  </div>

                  {/* Google Interface Language */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 font-semibold text-[#171B24]">
                      <span>Google interface language</span>
                      <span className="text-[#8F97A8] italic font-serif cursor-help" title="Target interface language">i</span>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-white border border-[#D5DAE5] rounded-lg px-3 py-2.5 text-xs text-[#171B24] font-medium appearance-none focus:outline-hidden focus:border-[#0A58CA] cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8F97A8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Brand Name */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 font-semibold text-[#171B24]">
                      <span>Brand name</span>
                      <span className="text-[#8F97A8] italic font-serif cursor-help" title="Brand mentions identifier">i</span>
                    </div>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Enter brand name"
                      className="w-full bg-white border border-[#D5DAE5] rounded-lg px-3 py-2.5 text-xs text-[#171B24] focus:outline-hidden focus:border-[#0A58CA]"
                    />
                    <span className="text-[11px] text-[#8F97A8] block">
                      Shared across all search engines — changes apply to all.
                    </span>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EEF0F5]">
                  <span className="text-xs text-[#525B6C]">
                    99 more search engines available to add
                  </span>
                  <button
                    type="submit"
                    className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add search engine</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Search engines added to the project */}
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">
                Search engines added to the project
              </h3>

              <div className="border border-[#EEF0F5] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FC] border-b border-[#EEF0F5] text-[11px] font-bold text-[#525B6C] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Search engine ({addedEngines.length})</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F5] text-xs font-medium text-[#171B24]">
                    {addedEngines.map((engine) => (
                      <tr key={engine.id} className="hover:bg-[#F8F9FC] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5 font-bold">
                          {engine.engine === 'google' ? (
                            <GoogleIcon size={16} />
                          ) : engine.engine === 'ai_overview' ? (
                            <AiOverviewsIcon size={16} />
                          ) : engine.engine === 'ai_mode' ? (
                            <AiModeIcon size={16} />
                          ) : (
                            <ChatGptIcon size={16} />
                          )}
                          <span>{engine.name}</span>
                        </td>
                        <td className="py-3 px-4 text-[#525B6C]">
                          <div className="flex items-center gap-1.5">
                            <CountryFlag code={engine.countryCode} name={engine.countryName} size="xs" />
                            <span>{engine.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#525B6C]">{engine.language}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveEngine(engine.id)}
                            className="p-1 text-[#8F97A8] hover:text-[#DC3545] cursor-pointer"
                            title="Remove engine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Back Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#D5DAE5] hover:bg-[#F3F4F8] text-[#171B24] font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
              >
                BACK TO PROJECT
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: PROMPTS (Full Real Working AI Prompts Tracker Setup)             */}
        {/* ======================================================================= */}
        {activeTab === 'prompts' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            {/* Card 1: Add AI Target Prompts */}
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-base font-bold text-[#171B24]">Track AI Prompts &amp; Citations</h2>
                </div>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1 max-w-3xl">
                  Monitor when LLM responses cite or mention <strong className="text-gray-900">{cleanDomain}</strong>.
                  Add target queries to track visibility on ChatGPT, Google AI Overviews, Google AI Mode, and Perplexity.
                </p>
              </div>

              {/* Target LLM Engine Toggle Pills with Real Logos */}
              <div>
                <label className="text-xs font-semibold text-[#171B24] block mb-2">
                  Select target LLM models:
                </label>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { id: 'ChatGPT (GPT-4o)', label: 'ChatGPT (GPT-4o)', icon: ChatGptIcon, color: '#10A37F' },
                    { id: 'Google AI Overviews', label: 'Google AI Overviews', icon: AiOverviewsIcon, color: '#7C3AED' },
                    { id: 'Google AI Mode', label: 'Google AI Mode', icon: AiModeIcon, color: '#2563EB' },
                    { id: 'Perplexity AI', label: 'Perplexity AI', icon: PerplexityIcon, color: '#20808D' },
                  ].map((llm) => {
                    const isSelected = promptSelectedEngines.includes(llm.id);
                    const IconComp = llm.icon;
                    return (
                      <button
                        key={llm.id}
                        type="button"
                        onClick={() => togglePromptEngine(llm.id)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-[#0A58CA] text-[#0A58CA] shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComp size={15} />
                        <span>{llm.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#171B24]">Tracking region:</label>
                  <select
                    value={promptCountryCode}
                    onChange={(e) => setPromptCountryCode(e.target.value)}
                    className="w-full bg-white border border-[#D5DAE5] rounded-lg px-3 py-2.5 text-xs text-[#171B24] font-medium"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompts Input Textarea */}
              <form onSubmit={handleAddPrompts} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171B24] block">
                    Enter prompt queries (one per line):
                  </label>
                  <textarea
                    rows={5}
                    value={promptTextarea}
                    onChange={(e) => setPromptTextarea(e.target.value)}
                    placeholder={`e.g. Cost and subscription pricing for ${cleanDomain}&#10;e.g. Best alternatives to ${cleanDomain}&#10;e.g. How does ${cleanDomain} compare to competitors?`}
                    className="w-full bg-white border border-[#D5DAE5] rounded-xl p-3.5 text-xs text-[#171B24] placeholder-gray-400 focus:outline-hidden focus:border-[#0A58CA] leading-relaxed font-sans"
                  />
                </div>

                {/* Quick 1-Click Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    1-Click Prompt Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `Cost and subscription pricing for ${cleanDomain}`,
                      `Best alternatives to ${cleanDomain}`,
                      `Customer reviews and pricing for ${cleanDomain}`,
                      `Top productivity tools like ${cleanDomain}`,
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setPromptTextarea((prev) => (prev ? `${prev}\n${sug}` : sug));
                        }}
                        className="bg-[#F4F6FB] hover:bg-[#EEF3FF] border border-[#E3E6EE] hover:border-[#0A58CA]/40 text-[#525B6C] hover:text-[#0A58CA] text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer text-left"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EEF0F5]">
                  <span className="text-xs text-[#525B6C]">
                    Tracks citations, sentiment, and rank across selected LLMs
                  </span>
                  <button
                    type="submit"
                    className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add &amp; Track Prompts</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Tracked Prompts List */}
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#171B24]">
                  Active Target Prompts ({promptsList.length})
                </h3>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Real-time Monitoring Active
                </span>
              </div>

              <div className="border border-[#EEF0F5] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FC] border-b border-[#EEF0F5] text-[11px] font-bold text-[#525B6C] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Prompt Query</th>
                      <th className="py-3 px-4">LLM Engine</th>
                      <th className="py-3 px-4">Region</th>
                      <th className="py-3 px-4">Sentiment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F5] text-xs font-medium text-[#171B24]">
                    {promptsList.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8F9FC] transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {p.prompt}
                        </td>
                        <td className="py-3 px-4 text-[#525B6C]">
                          <span className="bg-blue-50 text-[#0A58CA] px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            {p.engine}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#525B6C]">{p.country}</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {p.sentiment}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemovePrompt(p.id)}
                            className="p-1 text-[#8F97A8] hover:text-[#DC3545] cursor-pointer"
                            title="Remove prompt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Back Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#D5DAE5] hover:bg-[#F3F4F8] text-[#171B24] font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
              >
                BACK TO PROJECT
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: KEYWORDS                                                         */}
        {/* ======================================================================= */}
        {activeTab === 'keywords' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#171B24]">Set up keywords</h2>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1">
                  Add keywords to track rankings in search engines. Enter them manually or import from CSV.
                </p>
              </div>

              <form onSubmit={handleAddKeywords} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#171B24] block mb-1">
                    Enter keywords (one per line):
                  </label>
                  <textarea
                    rows={6}
                    value={keywordTextarea}
                    onChange={(e) => setKeywordTextarea(e.target.value)}
                    placeholder="Enter keywords..."
                    className="w-full bg-white border border-[#D5DAE5] rounded-xl p-3.5 text-xs text-[#171B24]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add keywords</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">
                Configured Keywords ({keywordsList.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywordsList.map((kw, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: GENERAL INFORMATION                                              */}
        {/* ======================================================================= */}
        {activeTab === 'general' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#171B24]">General information</h2>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1">
                  Manage core website domain and alert preferences.
                </p>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Project Name:</label>
                  <input
                    type="text"
                    value={generalProjectName}
                    onChange={(e) => setGeneralProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Website URL:</label>
                  <input
                    type="text"
                    value={generalWebsiteUrl}
                    onChange={(e) => setGeneralWebsiteUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalWeeklyReport}
                      onChange={(e) => setGeneralWeeklyReport(e.target.checked)}
                      className="rounded text-[#0A58CA]"
                    />
                    <span>Receive weekly automated rankings report via email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalAudit}
                      onChange={(e) => setGeneralAudit(e.target.checked)}
                      className="rounded text-[#0A58CA]"
                    />
                    <span>Enable scheduled weekly website audit crawling</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalBacklinks}
                      onChange={(e) => setGeneralBacklinks(e.target.checked)}
                      className="rounded text-[#0A58CA]"
                    />
                    <span>Monitor new and lost backlink notifications</span>
                  </label>
                </div>
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="bg-[#0A58CA] hover:bg-[#084298] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 5: COMPETITORS                                                      */}
        {/* ======================================================================= */}
        {activeTab === 'competitors' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#171B24]">Competitors</h2>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1">
                  Add up to 5 competitors to compare rankings, visibility, and keyword overlap.
                </p>
              </div>

              <form onSubmit={handleAddCompetitors} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#171B24] block mb-1">
                    Enter competitor domains (one per line):
                  </label>
                  <textarea
                    rows={4}
                    value={competitorText}
                    onChange={(e) => setCompetitorText(e.target.value)}
                    placeholder="e.g. semrush.com&#10;e.g. ahrefs.com"
                    className="w-full bg-white border border-[#D5DAE5] rounded-xl p-3.5 text-xs text-[#171B24]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add competitors</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">
                Tracked Competitors ({competitorsList.length}/5)
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {competitorsList.map((comp, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50">
                    <span className="font-semibold text-gray-800">{comp}</span>
                    <button
                      type="button"
                      onClick={() => setCompetitorsList((prev) => prev.filter((c) => c !== comp))}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 6: STATISTICS & ANALYTICS                                           */}
        {/* ======================================================================= */}
        {activeTab === 'analytics' && (
          <div className="p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-100">
            <div className="bg-white border border-[#E3E6EE] rounded-2xl p-8 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#171B24]">
                  Statistics and Analytics services
                </h2>
                <p className="text-xs text-[#525B6C] leading-relaxed mt-1">
                  Connect Google Search Console and Google Analytics 4 to enrich your rankings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* GSC Card */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-[#F8F9FC]">
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon size={18} />
                    <h4 className="font-bold text-gray-900 text-sm">Google Search Console</h4>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Sync clicks, impressions, and real CTR data directly into your ranking tables.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGscConnected(!isGscConnected);
                      showToast(isGscConnected ? 'Disconnected GSC' : 'Connected to Google Search Console');
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer ${
                      isGscConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#0A58CA] text-white hover:bg-[#084298]'
                    }`}
                  >
                    {isGscConnected ? 'Connected ✓' : 'Connect GSC'}
                  </button>
                </div>

                {/* GA4 Card */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-[#F8F9FC]">
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-gray-900 text-sm">Google Analytics 4</h4>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Analyze user sessions, conversions, and landing page bounce rates.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGa4Connected(!isGa4Connected);
                      showToast(isGa4Connected ? 'Disconnected GA4' : 'Connected to Google Analytics 4');
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer ${
                      isGa4Connected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#0A58CA] text-white hover:bg-[#084298]'
                    }`}
                  >
                    {isGa4Connected ? 'Connected ✓' : 'Connect GA4'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSearchEnginesWizard;
