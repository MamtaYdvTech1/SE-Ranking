'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  Search,
  Globe,
  Sparkles,
  BarChart3,
  Users,
  ShieldAlert,
  Monitor,
  Smartphone,
  MoreVertical,
  KeyRound,
  Loader2,
  CheckCircle2,
  Trash2,
  GripVertical,
  AlertTriangle,
  Folder,
  Layers,
  ArrowRight,
  ExternalLink,
  Gauge,
  Upload,
  ArrowUp,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { validateRealDomainFormat } from '@/lib/validation/schemas';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import {
  GoogleIcon,
  ChatGptIcon,
  AiOverviewsIcon,
  AiModeIcon,
  GeminiIcon,
  PerplexityIcon,
  BingIcon,
  YahooIcon,
  YandexIcon,
  DuckDuckGoIcon,
  YouTubeIcon,
} from '@/components/ui/SearchEngineIcons';

export function GoogleAnalyticsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="13" width="4" height="8" rx="1.5" fill="#F9AB00" />
      <rect x="10" y="8" width="4" height="13" rx="1.5" fill="#E37400" />
      <rect x="17" y="3" width="4" height="18" rx="1.5" fill="#EA4335" />
    </svg>
  );
}

export function GoogleGIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export function MatomoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#3152A0" />
      <path d="M6 17V10.5C6 9.5 6.7 8.7 7.7 8.7C8.7 8.7 9.5 9.5 9.5 10.5V17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 13C9.5 11.5 10.5 10.5 11.8 10.5C13 10.5 14 11.5 14 13V17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 13C14 11.5 15 10.5 16.2 10.5C17.5 10.5 18.5 11.5 18.5 13V17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7.7" cy="6.2" r="1.3" fill="#E45844" />
      <circle cx="12.2" cy="8" r="1.1" fill="#E45844" />
      <circle cx="16.7" cy="8" r="1.1" fill="#E45844" />
    </svg>
  );
}

export interface AddedEngine {
  id: string;
  engine: string;
  label: string;
  country: string;
  countryCode: string;
  location: string;
  language: string;
  languageCode: string;
  device: 'desktop' | 'mobile';
  trackGoogleAds: boolean;
  includeLocalPack: boolean;
  brandName?: string;
}

const ADDITIONAL_ENGINES = [
  { id: 'gemini', label: 'Gemini', icon: GeminiIcon },
  { id: 'perplexity', label: 'Perplexity', icon: PerplexityIcon },
  { id: 'yahoo', label: 'Yahoo', icon: YahooIcon },
  { id: 'bing', label: 'Bing', icon: BingIcon },
  { id: 'duckduckgo', label: 'DuckDuckGo', icon: DuckDuckGoIcon },
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { id: 'yandex', label: 'Yandex', icon: YandexIcon },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newProject?: any) => void;
}

import { getAllCountries, getCountryInfo } from '@/lib/countryUtils';
import { getAllLanguages } from '@/lib/languageUtils';

const POPULAR_COUNTRIES = (() => {
  const primaryCodes = ['us', 'gb', 'in', 'ca', 'au', 'de', 'fr', 'es', 'it', 'nl', 'br', 'jp'];
  const all = getAllCountries();
  const popular = primaryCodes
    .map((code) => all.find((c) => c.flagCode.toLowerCase() === code))
    .filter(Boolean)
    .map((c: any) => ({ name: c.name, code: c.flagCode }));
  const others = all
    .filter((c) => !primaryCodes.includes(c.flagCode.toLowerCase()))
    .map((c) => ({ name: c.name, code: c.flagCode }));
  return [...popular, ...others];
})();

const LANGUAGES = getAllLanguages().map((l) => l.name);

function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100;
  v = v / 100;
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) return { h: 344, s: 100, v: 100 };
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

interface AuthenticColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

function AuthenticColorPicker({ color, onChange, onClose }: AuthenticColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const initialHsv = useMemo(() => hexToHsv(color), [color]);
  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(color.replace('#', '').toUpperCase());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Sync hex input when color prop changes
  useEffect(() => {
    setHexInput(color.replace('#', '').toUpperCase());
    const hsv = hexToHsv(color);
    setH(hsv.h);
    setS(hsv.s);
    setV(hsv.v);
  }, [color]);

  // 2D Canvas Drag Interaction
  const handleCanvasDrag = (e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round((1 - y / rect.height) * 100);
    setS(newS);
    setV(newV);
    const newHex = hsvToHex(h, newS, newV);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleCanvasDrag(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleCanvasDrag(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Hue Slider Drag Interaction
  const handleHueDrag = (e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newH = Math.round((y / rect.height) * 360) % 360;
    setH(newH);
    const newHex = hsvToHex(newH, s, v);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const onHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleHueDrag(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleHueDrag(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHexInputChange = (val: string) => {
    const clean = val.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
    setHexInput(clean);
    if (clean.length === 6) {
      const fullHex = '#' + clean;
      const hsv = hexToHsv(fullHex);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
      onChange(fullHex);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl p-2.5 z-50 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ width: '224px' }}
    >
      {/* 2D Canvas + Vertical Rainbow Hue Slider */}
      <div className="flex gap-2 mb-2.5">
        {/* 2D Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown}
          className="relative w-[172px] h-[132px] rounded-xs cursor-crosshair overflow-hidden shadow-inner"
          style={{
            backgroundColor: `hsl(${h}, 100%, 50%)`,
            backgroundImage: `
              linear-gradient(to top, #000 0%, transparent 100%),
              linear-gradient(to right, #fff 0%, transparent 100%)
            `,
          }}
        >
          {/* Pointer Dot */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${s}%`,
              top: `${100 - v}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Rainbow Hue Bar */}
        <div
          ref={hueRef}
          onMouseDown={onHueMouseDown}
          className="relative w-3.5 h-[132px] rounded-xs cursor-pointer shadow-inner"
          style={{
            background:
              'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
        >
          {/* Slider Thumb Handle */}
          <div
            className="absolute left-0 right-0 h-1.5 bg-white border border-gray-500 rounded-xs shadow pointer-events-none -translate-y-1/2"
            style={{ top: `${(h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Bar: Swatch Preview Box + Hex Code Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <div
          className="w-12 h-6.5 rounded-xs border border-gray-300 shadow-inner shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center flex-1 border border-gray-300 rounded px-2 py-1 bg-white focus-within:border-[#2870ED] focus-within:ring-1 focus-within:ring-[#2870ED]">
          <span className="text-gray-400 font-mono text-xs font-semibold mr-1 select-none">#</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInputChange(e.target.value)}
            maxLength={6}
            placeholder="FF0044"
            className="w-full text-xs font-mono font-bold text-gray-800 uppercase focus:outline-hidden tracking-wider"
          />
        </div>
      </div>
    </div>
  );
}

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blue 6-step project wizard (Enabled when Advanced settings toggle is ON)
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // Active Wizard Step: 1 to 6 (for advanced mode)
  const [currentStep, setCurrentStep] = useState(1);

  // Shared Form State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [domainType, setDomainType] = useState('*.domain/* (Recommended)');
  const [isDomainTypeOpen, setIsDomainTypeOpen] = useState(false);
  const [group, setGroup] = useState('No group selected');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupsList, setGroupsList] = useState<string[]>(['No group selected']);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [projectColor, setProjectColor] = useState('#FF008A');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorHue, setColorHue] = useState(90);
  const [access, setAccess] = useState('Only me');
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  // Real Domain validation state (Rejects fake inputs)
  const [domainValidationState, setDomainValidationState] = useState<{
    isValid: boolean | null;
    message?: string;
    isChecking?: boolean;
  }>({ isValid: null });

  // Search Engine & Tracking Options (Mode 2 / Simple)
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['google']);
  const [isMoreEnginesOpen, setIsMoreEnginesOpen] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [country, setCountry] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Keywords (Simple Mode)
  const [keywordsText, setKeywordsText] = useState('');

  // Additional settings toggles (Step 1 advanced)
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [websiteAudit, setWebsiteAudit] = useState(true);
  const [backlinkReport, setBacklinkReport] = useState(true);

  // Left sidebar status
  const [projectActive, setProjectActive] = useState(true);

  // =========================================================================
  // ADVANCED WIZARD DYNAMIC STATES (Steps 2 to 6)
  // =========================================================================

  // Step 2: Added Search Engines State
  const [addedEngines, setAddedEngines] = useState<AddedEngine[]>([
    {
      id: 'engine-1',
      engine: 'google',
      label: 'Google',
      country: '',
      countryCode: '',
      location: '',
      language: '',
      languageCode: '',
      device: 'desktop',
      trackGoogleAds: false,
      includeLocalPack: false,
      brandName: '',
    },
  ]);

  // Step 2 Setup Form
  const [formEngine, setFormEngine] = useState('google');
  const [formDevice, setFormDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [formCountry, setFormCountry] = useState('');
  const [isFormCountryOpen, setIsFormCountryOpen] = useState(false);
  const [formCountrySearch, setFormCountrySearch] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formLanguage, setFormLanguage] = useState('');
  const [isFormLanguageOpen, setIsFormLanguageOpen] = useState(false);
  const [formBrandName, setFormBrandName] = useState('');
  const [formTrackAds, setFormTrackAds] = useState(false);
  const [formLocalPack, setFormLocalPack] = useState(false);
  const [editingEngineId, setEditingEngineId] = useState<string | null>(null);
  const [deletingEngine, setDeletingEngine] = useState<AddedEngine | null>(null);
  const [engineMenuOpenId, setEngineMenuOpenId] = useState<string | null>(null);
  const [isEngineSelectorOpen, setIsEngineSelectorOpen] = useState(false);

  // Step 3: Keywords State
  const [selectedKeywordEngineIds, setSelectedKeywordEngineIds] = useState<string[]>(['engine-1']);
  const [activeKeywordGroup, setActiveKeywordGroup] = useState('General');
  const [keywordGroups, setKeywordGroups] = useState<string[]>(['General']);
  const [isKeywordGroupDropdownOpen, setIsKeywordGroupDropdownOpen] = useState(false);
  const [groupSearchInStep3, setGroupSearchInStep3] = useState('');
  const [isCreatingStep3Group, setIsCreatingStep3Group] = useState(false);
  const [newStep3GroupName, setNewStep3GroupName] = useState('');
  const [suggestKeywordsToggle, setSuggestKeywordsToggle] = useState(true);
  const [keywordInputText, setKeywordInputText] = useState('');
  const [addedKeywords, setAddedKeywords] = useState<
    Array<{ id: string; keyword: string; group: string; volume: number; engineIds: string[] }>
  >([
    { id: 'kw-1', keyword: 'time tracking software', group: 'General', volume: 14800, engineIds: ['engine-1'] },
    { id: 'kw-2', keyword: 'employee attendance monitoring', group: 'General', volume: 8100, engineIds: ['engine-1'] },
    { id: 'kw-3', keyword: 'work hours tracker app', group: 'General', volume: 5400, engineIds: ['engine-1'] },
  ]);
  const [keywordSearchFilter, setKeywordSearchFilter] = useState('');
  const [keywordEngineFilter, setKeywordEngineFilter] = useState('all');
  const [isKeywordEngineFilterOpen, setIsKeywordEngineFilterOpen] = useState(false);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [isGeneralGroupExpanded, setIsGeneralGroupExpanded] = useState(true);

  // Step 4: Prompts State
  const [promptInputText, setPromptInputText] = useState('');
  const [addedPrompts, setAddedPrompts] = useState<Array<{ id: string; prompt: string }>>([
    { id: 'pr-1', prompt: 'What are the best time tracking software tools for remote teams in 2026?' },
    { id: 'pr-2', prompt: 'Which platform offers automatic screenshot and employee activity tracking?' },
  ]);

  // Step 5: Competitors State
  const [competitorInputText, setCompetitorInputText] = useState('');
  const [competitorDomainType, setCompetitorDomainType] = useState('*.domain/* (Recommended)');
  const [isCompetitorDomainTypeOpen, setIsCompetitorDomainTypeOpen] = useState(false);
  const [suggestCompetitorsToggle, setSuggestCompetitorsToggle] = useState(true);
  const [addedCompetitors, setAddedCompetitors] = useState<
    Array<{ id: string; domain: string; name: string; keywordsCount: number }>
  >([
    { id: 'comp-1', domain: 'insidehomepage.com', name: 'insidehomepage.com', keywordsCount: 3410 },
    { id: 'comp-2', domain: 'skype.net', name: 'skype.net', keywordsCount: 2890 },
  ]);
  const [competitorSearchFilter, setCompetitorSearchFilter] = useState('');

  // Step 6: Analytics Services State
  const [gaConnection, setGaConnection] = useState<{ connected: boolean; email?: string; property?: string }>({
    connected: false,
  });
  const [gscConnection, setGscConnection] = useState<{ connected: boolean; email?: string; site?: string }>({
    connected: false,
  });
  const [matomoConnection, setMatomoConnection] = useState<{ connected: boolean; url?: string; siteId?: string }>({
    connected: false,
  });
  const [activeAnalyticsModal, setActiveAnalyticsModal] = useState<'ga' | 'gsc' | 'matomo' | null>(null);

  const [gaAccountInput, setGaAccountInput] = useState('analytics@gmail.com');
  const [gaPropertyInput, setGaPropertyInput] = useState('');
  const [gscSiteInput, setGscSiteInput] = useState('');
  const [matomoUrlInput, setMatomoUrlInput] = useState('');
  const [matomoSiteIdInput, setMatomoSiteIdInput] = useState('1');
  const [matomoTokenInput, setMatomoTokenInput] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initPhase, setInitPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File input ref for keyword import
  const keywordFileInputRef = useRef<HTMLInputElement>(null);

  const handleKeywordFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const lines = content
          .split(/[\r\n]+/)
          .map((l) => l.trim().replace(/^"|"$/g, '').split(/[,;\t]/)[0]?.trim())
          .filter(Boolean);
        if (lines.length > 0) {
          setKeywordInputText((prev) => (prev.trim() ? `${prev.trim()}\n${lines.join('\n')}` : lines.join('\n')));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic Real Keyword Suggestions based on Website URL
  const [suggestedKeywords, setSuggestedKeywords] = useState<{ keyword: string; vol: string | number }[]>([]);
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const clean = websiteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .trim();

    if (!clean || clean.length < 3) {
      setSuggestedKeywords([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/keywords/suggestions?domain=${encodeURIComponent(clean)}&country=${encodeURIComponent(
            country
          )}&lang=${encodeURIComponent(language)}`
        );
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          const mapped = data.suggestions.map((s: { keyword: string; volume: number }) => ({
            keyword: s.keyword,
            vol: s.volume,
          }));
          setSuggestedKeywords(mapped);

          // If textarea is currently empty, prefill top 5 seeds matching SE Ranking screenshot
          setKeywordsText((prev) => {
            if (!prev.trim() && mapped.length >= 3) {
              return mapped.slice(0, 5).map((m: { keyword: string }) => m.keyword).join('\n');
            }
            return prev;
          });
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [websiteUrl, country, language]);

  // Live real domain verification hook (rejects fake inputs, verifies syntax & DNS)
  useEffect(() => {
    const raw = websiteUrl.trim();
    if (!raw) {
      setDomainValidationState({ isValid: null });
      return;
    }

    const check = validateRealDomainFormat(raw);
    if (!check.valid) {
      setDomainValidationState({
        isValid: false,
        message: check.error || 'Please enter a real domain name (e.g. example.com).',
      });
      return;
    }

    setDomainValidationState({
      isValid: true,
      message: 'Valid domain format',
      isChecking: true,
    });

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/validate-domain?domain=${encodeURIComponent(check.normalizedDomain)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setDomainValidationState({
            isValid: true,
            message: 'Real registered domain verified',
            isChecking: false,
          });
        } else if (data.isDuplicate) {
          setDomainValidationState({
            isValid: false,
            message: data.error,
            isChecking: false,
          });
        } else if (res.status === 400 && data.valid === false && data.error) {
          setDomainValidationState({
            isValid: false,
            message: data.error,
            isChecking: false,
          });
        } else {
          // If server response is non-400 or unexpected, fallback to syntax validity
          setDomainValidationState({
            isValid: true,
            message: 'Valid domain format',
            isChecking: false,
          });
        }
      } catch {
        setDomainValidationState({
          isValid: true,
          message: 'Valid domain format',
          isChecking: false,
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [websiteUrl]);

  const filteredSuggestions = useMemo(() => {
    if (!suggestionSearch.trim()) return suggestedKeywords;
    const query = suggestionSearch.toLowerCase().trim();
    return suggestedKeywords.filter((s) => s.keyword.toLowerCase().includes(query));
  }, [suggestedKeywords, suggestionSearch]);

  // Keyword counts and lines
  const keywordLines = useMemo(() => {
    const list = keywordsText.split('\n');
    return list.length > 0 ? list : [''];
  }, [keywordsText]);

  const keywordCount = useMemo(() => {
    return keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0).length;
  }, [keywordsText]);

  const handleToggleKeyword = (kw: string) => {
    const lines = keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);
    const exists = lines.some((k) => k.toLowerCase() === kw.trim().toLowerCase());
    if (exists) {
      setKeywordsText(lines.filter((k) => k.toLowerCase() !== kw.trim().toLowerCase()).join('\n'));
    } else {
      setKeywordsText(lines.length > 0 ? `${keywordsText.trim()}\n${kw.trim()}` : kw.trim());
    }
  };

  const isKeywordSelected = (kw: string) => {
    return keywordsText
      .split('\n')
      .some((k) => k.trim().toLowerCase() === kw.trim().toLowerCase());
  };

  const handleAddAllSuggestions = () => {
    const existing = keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);
    const toAdd = suggestedKeywords
      .map((s) => s.keyword)
      .filter((k) => !existing.some((e) => e.toLowerCase() === k.toLowerCase()));
    if (toAdd.length > 0) {
      const merged = [...existing, ...toAdd].join('\n');
      setKeywordsText(merged);
    }
  };

  const toggleEngine = (id: string) => {
    if (selectedEngines.includes(id)) {
      if (selectedEngines.length > 1) {
        setSelectedEngines(selectedEngines.filter((e) => e !== id));
      }
    } else {
      setSelectedEngines([...selectedEngines, id]);
    }
  };

  const getEngineLabel = (id: string) => {
    switch (id) {
      case 'google': return 'Google';
      case 'ai-overviews': return 'AI Overviews';
      case 'ai-mode': return 'AI Mode';
      case 'chatgpt': return 'ChatGPT';
      case 'gemini': return 'Gemini';
      case 'perplexity': return 'Perplexity';
      case 'bing': return 'Bing';
      case 'yahoo': return 'Yahoo';
      case 'yandex': return 'Yandex';
      case 'youtube': return 'YouTube';
      case 'duckduckgo': return 'DuckDuckGo';
      default: return id;
    }
  };

  const renderEngineIcon = (id: string, size = 16) => {
    switch (id) {
      case 'google': return <GoogleIcon size={size} />;
      case 'ai-overviews': return <AiOverviewsIcon size={size} />;
      case 'ai-mode': return <AiModeIcon size={size} />;
      case 'chatgpt': return <ChatGptIcon size={size} />;
      case 'gemini': return <GeminiIcon size={size} />;
      case 'perplexity': return <PerplexityIcon size={size} />;
      case 'bing': return <BingIcon size={size} />;
      case 'yahoo': return <YahooIcon size={size} />;
      case 'yandex': return <YandexIcon size={size} />;
      case 'youtube': return <YouTubeIcon size={size} />;
      case 'duckduckgo': return <DuckDuckGoIcon size={size} />;
      default: return <Globe className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleAddOrUpdateEngine = () => {
    const chosenCountry = formCountry || 'India';
    const cInfo = getCountryInfo(chosenCountry);
    const chosenLanguage = formLanguage || 'English';
    const engineObj: AddedEngine = {
      id: editingEngineId || `engine-${Date.now()}`,
      engine: formEngine,
      label: getEngineLabel(formEngine),
      country: chosenCountry,
      countryCode: cInfo?.flagCode || 'in',
      location: formLocation.trim(),
      language: chosenLanguage,
      languageCode: 'en',
      device: formDevice,
      trackGoogleAds: formTrackAds,
      includeLocalPack: formLocalPack,
      brandName: formBrandName.trim(),
    };

    if (editingEngineId) {
      setAddedEngines((prev) => prev.map((e) => (e.id === editingEngineId ? engineObj : e)));
      setEditingEngineId(null);
    } else {
      setAddedEngines((prev) => [...prev, engineObj]);
      setSelectedKeywordEngineIds((prev) => (prev.includes(engineObj.id) ? prev : [...prev, engineObj.id]));
    }

    setFormLocation('');
    setFormBrandName('');
    setFormTrackAds(false);
    setFormLocalPack(false);
  };

  const handleStartEditEngine = (e: AddedEngine) => {
    setEditingEngineId(e.id);
    setFormEngine(e.engine);
    setFormDevice(e.device);
    setFormCountry(e.country);
    setFormLocation(e.location || '');
    setFormLanguage(e.language);
    setFormBrandName(e.brandName || '');
    setFormTrackAds(e.trackGoogleAds);
    setFormLocalPack(e.includeLocalPack);
    setEngineMenuOpenId(null);
  };

  const handleConfirmDeleteEngine = () => {
    if (deletingEngine) {
      setAddedEngines((prev) => prev.filter((e) => e.id !== deletingEngine.id));
      if (editingEngineId === deletingEngine.id) {
        setEditingEngineId(null);
      }
      setDeletingEngine(null);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!websiteUrl.trim()) {
        setError('Please specify the Website URL.');
        return;
      }
      const check = validateRealDomainFormat(websiteUrl);
      if (!check.valid) {
        setError(check.error || 'Please enter a real, valid domain name (e.g. example.com). Fake inputs are not permitted.');
        return;
      }
      if (domainValidationState.isValid === false) {
        setError(domainValidationState.message || 'Please enter a real, registered domain name.');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleFinishProject();
    }
  };

  const handleFinishProject = async () => {
    if (!websiteUrl.trim()) {
      setError('Please specify the Website URL.');
      return;
    }

    const check = validateRealDomainFormat(websiteUrl);
    if (!check.valid) {
      setError(check.error || 'Please enter a real, valid domain name (e.g. example.com). Fake inputs are not permitted.');
      return;
    }

    if (domainValidationState.isValid === false) {
      setError(domainValidationState.message || 'Please enter a real, registered domain name.');
      return;
    }

    const selectedCountryName = (formCountry || country || '').trim();
    if (!selectedCountryName || selectedCountryName === 'Enter country, city or postal code') {
      setError('Location / Country is required. Please select a country.');
      return;
    }

    const selectedLanguageName = (formLanguage || language || '').trim();
    if (!selectedLanguageName || selectedLanguageName === 'Select interface language') {
      setError('Google interface language is required. Please select a language.');
      return;
    }

    setIsSubmitting(true);
    setInitPhase('CREATING PROJECT');
    setError(null);
    const cleanDomain = check.normalizedDomain;

    try {
      const selectedCountryName = formCountry || country || 'United States';
      const selectedLanguageName = formLanguage || language || 'English';
      const cInfo = getCountryInfo(selectedCountryName);
      let payload: any = {};

      if (advancedSettings) {
        payload = {
          general: {
            websiteUrl: websiteUrl.trim(),
            projectName: projectName.trim() || cleanDomain,
            projectColor,
            domainType,
            access,
            weeklyReport,
            websiteAudit,
            backlinkReport,
          },
          searchEngines: addedEngines.map((e) => ({
            engine: e.engine,
            country: e.country,
            countryCode: e.countryCode,
            location: e.location,
            language: e.language,
            languageCode: e.languageCode,
            device: e.device,
            trackGoogleAds: e.trackGoogleAds,
            includeLocalPack: e.includeLocalPack,
            brandName: e.brandName,
          })),
          keywords: addedKeywords.map((k) => ({
            keyword: k.keyword,
            group: k.group,
            volume: k.volume,
          })),
          competitors: addedCompetitors.map((c) => ({
            domain: c.domain,
            name: c.name,
          })),
          prompts: addedPrompts.map((p) => p.prompt),
          analytics: {
            googleAnalytics: gaConnection.connected,
            googleSearchConsole: gscConnection.connected,
            matomo: matomoConnection.connected,
          },
        };
      } else {
        payload = {
          name: projectName.trim() || cleanDomain,
          websiteUrl: websiteUrl.trim(),
          domain: cleanDomain,
          brandName: projectName.trim() || cleanDomain,
          color: projectColor,
          country: cInfo?.name || selectedCountryName,
          countryCode: cInfo?.flagCode || 'us',
          searchEngine: selectedEngines[0] || 'google',
          searchEngines: selectedEngines.map((eng) => ({
            engine: eng,
            country: cInfo?.name || selectedCountryName,
            countryCode: cInfo?.flagCode || 'us',
            language: selectedLanguageName,
            device,
          })),
          language: selectedLanguageName,
          device,
          weeklyReport,
          websiteAudit,
          backlinkReport,
          keywords: keywordsText
            .split('\n')
            .map((k) => k.trim())
            .filter(Boolean),
        };
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create project.');
        setIsSubmitting(false);
        setInitPhase(null);
        return;
      }

      const createdProject = data.project;
      if (createdProject) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('se_ranking_active_project_id', createdProject.id);
          localStorage.setItem('se_ranking_has_project', 'true');
        }
        setActiveProject(createdProject);
      }

      if (createdProject?.id) {
        // Trigger initialization in the background so the user is immediately taken to their project overview
        fetch(`/api/projects/${createdProject.id}/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch((e) => console.warn('Background project init:', e));
      }

      if (onCreated && createdProject) {
        onCreated(createdProject);
      }
      onClose();
      try {
        const refreshPromise = refreshProjects?.();
        if (refreshPromise && typeof refreshPromise.catch === 'function') {
          refreshPromise.catch(() => {});
        }
      } catch {}
      router.push('/project-overview');
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while creating project.');
    } finally {
      setIsSubmitting(false);
      setInitPhase(null);
    }
  };

  const stepsList = [
    { num: 1, title: 'General information' },
    { num: 2, title: 'Search engines' },
    { num: 3, title: 'Keywords' },
    { num: 4, title: 'Prompts' },
    { num: 5, title: 'Competitors' },
    { num: 6, title: 'Statistics and Analytics services' },
  ];

  const colorPalette = [
    '#2870ED', // SE Ranking Blue
    '#10B981', // Emerald Green
    '#F59E0B', // Amber Gold
    '#EF4444', // Coral Red
    '#8B5CF6', // Royal Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#64748B', // Slate
    '#1E293B', // Dark Navy
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex bg-white text-gray-900 font-sans overflow-hidden animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* MODE 1: ADVANCED SETTINGS (6-Step Wizard matching Image 2 & raw DOM)     */}
      {/* ========================================================================= */}
      {advancedSettings ? (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT BLUE SIDEBAR */}
          <div className="w-[32%] sm:w-[260px] md:w-[280px] lg:w-[320px] min-w-[140px] bg-[#1976d2] text-white flex flex-col justify-between p-3.5 sm:p-6 md:p-8 shrink-0 select-none overflow-y-auto">
            <div>
              {/* White SE Ranking Logo & Title / URL */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-4">
                  <SeRankingLogo variant="white" width={115} height={28} />
                </div>
                {websiteUrl ? (
                  <div className="text-white mb-6">
                    <div className="text-sm sm:text-base font-bold truncate">
                      {websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}/`}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">Settings</div>
                  </div>
                ) : (
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white mb-6 sm:mb-8">
                    Create project
                  </h1>
                )}
              </div>

              {/* Numbered Stepper */}
              <div className="space-y-4 sm:space-y-6 relative">
                {stepsList.map((step, idx) => {
                  const isActive = currentStep === step.num;
                  const isPast = currentStep > step.num;

                  return (
                    <div key={step.num} className="relative flex items-center gap-2.5 sm:gap-3.5">
                      {idx < stepsList.length - 1 && (
                        <div
                          className={`absolute left-[11px] sm:left-[13px] top-[24px] sm:top-[26px] w-[2px] h-[26px] sm:h-[34px] ${
                            isPast ? 'bg-[#FFC107]' : 'bg-white/30'
                          }`}
                        />
                      )}

                      <div
                        onClick={() => {
                          if (websiteUrl.trim() || step.num === 1) {
                            setCurrentStep(step.num);
                          }
                        }}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer z-10 ${
                          isActive
                            ? 'bg-[#FFC107] text-gray-900 shadow-md ring-4 ring-white/20'
                            : isPast
                            ? 'bg-[#FFC107] text-gray-900'
                            : 'border border-white text-white'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                      </div>

                      <span
                        onClick={() => {
                          if (websiteUrl.trim() || step.num === 1) {
                            setCurrentStep(step.num);
                          }
                        }}
                        className={`text-xs sm:text-sm cursor-pointer transition-colors leading-tight ${
                          isActive
                            ? 'font-bold text-[#FFC107]'
                            : isPast
                            ? 'text-white font-medium'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Card */}
            <div className="hidden md:flex bg-white rounded-lg p-3 shadow-md items-center justify-between text-gray-900 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                <span>Project status:</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProjectActive(!projectActive)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    projectActive ? 'bg-[#1976d2]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      projectActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-gray-800">
                  {projectActive ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN WIZARD AREA */}
          <div className="flex-1 flex flex-col bg-white overflow-y-auto min-w-0">
            {/* Top Header Bar */}
            <div className="h-14 sm:h-16 border-b border-gray-100 px-4 sm:px-8 md:px-10 flex items-center justify-between select-none shrink-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-2">
                {stepsList.find((s) => s.num === currentStep)?.title}
              </h2>

              <div className="flex items-center gap-6 sm:gap-8">
                {/* Step 1: Advanced settings toggle */}
                {currentStep === 1 && (
                  <div className="relative group">
                    <div
                      className="flex items-center gap-2 cursor-pointer select-none"
                      onClick={() => setAdvancedSettings(!advancedSettings)}
                    >
                      <button
                        type="button"
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                          advancedSettings ? 'bg-[#1976d2]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className="bg-white w-4 h-4 rounded-full shadow-md pointer-events-none"
                          style={{
                            transform: advancedSettings ? 'translateX(16px)' : 'translateX(0px)',
                            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                        <span>Advanced settings</span>
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-500 font-serif">i</div>
                      </div>
                    </div>

                    <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-72 p-3 bg-[#42464D] text-white text-[11px] leading-relaxed rounded-lg shadow-2xl z-50 pointer-events-none">
                      You can enable advanced settings in the Project Wizard. They will allow you to customize the project more precisely according to your needs. The system will save the state of this switch and apply it by default when you create a project next time. NOTE: upon enabling/disabling advanced settings, all the data you previously entered in the form will be reset.
                    </div>
                  </div>
                )}

                {/* Step 3: Keywords limit meter matching Screenshot 3 & HTML */}
                {currentStep === 3 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-xs font-semibold text-[#B45309]">
                    <div className="relative w-16 h-1.5 bg-[#FDE68A] rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#D97706] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (addedKeywords.length / 750) * 100)}%` }}
                      />
                    </div>
                    <Gauge className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Keyword limits {addedKeywords.length} / 750</span>
                    <div className="w-3 h-3 rounded-full border border-[#D97706] flex items-center justify-center text-[8px] text-[#D97706] font-serif">i</div>
                  </div>
                )}

                {/* Step 4: Prompts limit meter matching Screenshot 5 & HTML */}
                {currentStep === 4 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-xs font-semibold text-[#B45309]">
                    <div className="relative w-16 h-1.5 bg-[#FDE68A] rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#D97706] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (addedPrompts.length / 20) * 100)}%` }}
                      />
                    </div>
                    <Gauge className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Prompt limits {addedPrompts.length} / 20</span>
                    <div className="w-3 h-3 rounded-full border border-[#D97706] flex items-center justify-center text-[8px] text-[#D97706] font-serif">i</div>
                  </div>
                )}

                {/* Step 5: Competitor limit meter */}
                {currentStep === 5 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-xs font-semibold text-[#B45309]">
                    <div className="relative w-16 h-1.5 bg-[#FDE68A] rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#D97706] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (addedCompetitors.length / 5) * 100)}%` }}
                      />
                    </div>
                    <Gauge className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Competitors {addedCompetitors.length} / 5</span>
                  </div>
                )}

                {/* ESC Close button */}
                <button
                  onClick={onClose}
                  className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
                  title="Close wizard (Esc)"
                >
                  <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    ESC
                  </span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 max-w-4xl px-4 sm:px-8 md:px-10 py-6 sm:py-8">
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* STEP 1: General information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Set up website</h3>
                    <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                      Track the ranking positions of your site in real time in all major search engines. You are free to customize the project parameter and position tracking settings according to your requirements
                    </p>
                  </div>

                  {/* Row 1: Website URL & Domain type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Website URL</label>
                        <span className="text-red-500 text-xs">*</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={websiteUrl}
                          onChange={(e) => {
                            setWebsiteUrl(e.target.value);
                            if (!projectName) {
                              const clean = e.target.value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
                              setProjectName(clean);
                            }
                          }}
                          placeholder="e.g. workcomposer.com or domain.com"
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden transition-colors ${
                            domainValidationState.isValid === false
                              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                              : domainValidationState.isValid === true
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : 'border-gray-300 focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]'
                          }`}
                          required
                        />
                        {domainValidationState.isChecking && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 className="w-4 h-4 text-[#2870ED] animate-spin" />
                          </div>
                        )}
                        {!domainValidationState.isChecking && domainValidationState.isValid === true && (
                          <div className="absolute right-3 top-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                        {!domainValidationState.isChecking && domainValidationState.isValid === false && (
                          <div className="absolute right-3 top-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                      {websiteUrl.trim() && domainValidationState.message && (
                        <p
                          className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${
                            domainValidationState.isValid === false
                              ? 'text-red-600'
                              : domainValidationState.isValid === true
                              ? 'text-emerald-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {domainValidationState.isValid === false && '⚠️ '}
                          {domainValidationState.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Domain type</label>
                        <span className="text-red-500 text-xs">*</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDomainTypeOpen(!isDomainTypeOpen)}
                        className="w-full px-3.5 py-2.5 bg-[#E9ECF0] hover:bg-[#DFE3E8] border border-gray-300 rounded-lg text-xs font-medium text-gray-900 flex items-center justify-between cursor-pointer focus:outline-hidden"
                      >
                        <span>{domainType}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDomainTypeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDomainTypeOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#E9ECF0] border border-gray-300 rounded-lg shadow-xl z-30 py-1 text-xs divide-y divide-gray-200/60 overflow-hidden">
                          {[
                            { label: '*.domain/* (Recommended)', value: '*.domain/* (Recommended)' },
                            { label: 'domain/*', value: 'domain/*' },
                            { label: 'domain/path/*', value: 'domain/path/*' },
                            { label: 'url', value: 'url' },
                          ].map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                setDomainType(item.value);
                                setIsDomainTypeOpen(false);
                              }}
                              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                                domainType === item.value
                                  ? 'bg-[#DDE2E8] font-bold text-gray-900'
                                  : 'hover:bg-[#DFE3E8] text-gray-800'
                              }`}
                            >
                              <span className="font-mono text-[12px]">{item.label}</span>
                              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-600 font-serif">
                                i
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Project name, Group, Project color */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Project name</label>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Project name"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]"
                      />
                    </div>

                    <div className="md:col-span-5 relative">
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Group</label>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGroupOpen(!isGroupOpen)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                      >
                        <span className="truncate">{group}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isGroupOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 text-xs">
                          <input
                            type="text"
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            placeholder="Search"
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg mb-2 text-xs focus:outline-hidden focus:border-[#1976d2]"
                            autoFocus
                          />
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {groupsList
                              .filter((g) => g.toLowerCase().includes(groupSearch.toLowerCase()))
                              .map((g) => (
                                <div
                                  key={g}
                                  onClick={() => {
                                    setGroup(g);
                                    setIsGroupOpen(false);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer font-medium ${
                                    group === g ? 'bg-blue-50 text-[#1976d2] font-semibold' : 'text-gray-800'
                                  }`}
                                >
                                  {g}
                                </div>
                              ))}
                          </div>
                          <div className="pt-2 border-t border-gray-100 mt-1">
                            {isCreatingGroup ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="New group name"
                                  className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded focus:border-[#1976d2] focus:outline-hidden"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                      const val = e.currentTarget.value.trim();
                                      if (!groupsList.includes(val)) {
                                        setGroupsList((prev) => [...prev, val]);
                                      }
                                      setGroup(val);
                                      setIsCreatingGroup(false);
                                      setIsGroupOpen(false);
                                    }
                                  }}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsCreatingGroup(true)}
                                className="w-full flex items-center gap-1.5 text-xs font-semibold text-[#1976d2] hover:bg-blue-50/60 p-1.5 rounded cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create new...</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 relative">
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Project color</label>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center p-1 cursor-pointer shadow-2xs hover:border-gray-400 transition-colors bg-white"
                        title="Choose project color"
                      >
                        <div
                          className="w-full h-full rounded-xs shadow-inner transition-colors"
                          style={{ backgroundColor: projectColor }}
                        />
                      </button>

                      {isColorPickerOpen && (
                        <AuthenticColorPicker
                          color={projectColor}
                          onChange={(newCol) => setProjectColor(newCol)}
                          onClose={() => setIsColorPickerOpen(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Access to the project */}
                  <div className="max-w-md relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Access to the project</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAccessOpen(!isAccessOpen)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                    >
                      <span>{access}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAccessOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAccessOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-xs divide-y divide-gray-100">
                        {['Only me', 'Manager account', 'Client account'].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setAccess(opt);
                              setIsAccessOpen(false);
                            }}
                            className={`px-3.5 py-2 hover:bg-gray-50 cursor-pointer font-medium ${
                              access === opt ? 'bg-blue-50 text-[#1976d2] font-semibold' : 'text-gray-800'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <a
                      href="/admin.users.html"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-xs font-semibold text-[#1976d2] hover:underline flex items-center gap-1 cursor-pointer w-fit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add account</span>
                    </a>
                  </div>

                  {/* Additional settings */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Additional settings</h4>
                      <p className="text-[11px] text-gray-500">Select additional options to enable for the project</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setWeeklyReport(!weeklyReport)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                            weeklyReport ? 'bg-[#1976d2]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              weeklyReport ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Weekly report:</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setWebsiteAudit(!websiteAudit)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                            websiteAudit ? 'bg-[#1976d2]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              websiteAudit ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Website Audit</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setBacklinkReport(!backlinkReport)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                            backlinkReport ? 'bg-[#1976d2]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              backlinkReport ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Backlink report</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Search engines (Authentic SE Ranking 2-card layout matching Screenshot 1) */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Card 1: Set up search engines */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          {editingEngineId ? 'Edit search engine' : 'Set up search engines'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-2xl leading-relaxed">
                          Track website and brand rankings for the queries you&apos;re interested in on classic and AI search engines in any region and on any device. Google Maps results are available as well
                        </p>
                      </div>
                      {editingEngineId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEngineId(null);
                            setFormLocation('');
                            setFormBrandName('');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer font-medium"
                        >
                          Cancel editing
                        </button>
                      )}
                    </div>

                    {/* 4 Engine selection pills matching Screenshot 1 */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'google', label: 'Google', icon: GoogleIcon, activeClass: 'border-[#4285F4] bg-[#EEF4FE] text-[#1A73E8] ring-1 ring-[#4285F4]/30', hoverIcon: 'group-hover:scale-110' },
                        { id: 'ai-overviews', label: 'AI Overviews', icon: AiOverviewsIcon, activeClass: 'border-[#7C3AED] bg-[#F5F3FF] text-[#6D28D9] ring-1 ring-[#7C3AED]/30', hoverIcon: 'group-hover:scale-110 group-hover:rotate-6' },
                        { id: 'ai-mode', label: 'AI Mode', icon: AiModeIcon, activeClass: 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#2563EB]/30', hoverIcon: 'group-hover:scale-110 group-hover:-rotate-6' },
                        { id: 'chatgpt', label: 'ChatGPT', icon: ChatGptIcon, activeClass: 'border-[#10A37F] bg-[#ECFDF5] text-[#047857] ring-1 ring-[#10A37F]/30', hoverIcon: 'group-hover:scale-110 group-hover:rotate-12' },
                      ].map((eng) => {
                        const Icon = eng.icon;
                        const isSelected = formEngine === eng.id;
                        return (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() => setFormEngine(eng.id)}
                            className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${
                              isSelected
                                ? `${eng.activeClass} shadow-xs`
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={16} className={`transition-transform duration-200 ${eng.hoverIcon} shrink-0`} />
                            <span>{eng.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </button>
                        );
                      })}

                      {/* Dropdown for additional engines */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsEngineSelectorOpen(!isEngineSelectorOpen)}
                          className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-500 cursor-pointer flex items-center justify-center shadow-xs"
                          title="More search engines"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {isEngineSelectorOpen && (
                          <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs">
                            {[
                              { id: 'gemini', label: 'Gemini', icon: GeminiIcon },
                              { id: 'perplexity', label: 'Perplexity', icon: PerplexityIcon },
                              { id: 'bing', label: 'Bing', icon: BingIcon },
                              { id: 'yahoo', label: 'Yahoo', icon: YahooIcon },
                              { id: 'yandex', label: 'Yandex', icon: YandexIcon },
                              { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
                            ].map((eng) => {
                              const Icon = eng.icon;
                              return (
                                <button
                                  key={eng.id}
                                  type="button"
                                  onClick={() => {
                                    setFormEngine(eng.id);
                                    setIsEngineSelectorOpen(false);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-blue-50/60 text-gray-700 hover:text-[#0B69FF] font-medium"
                                >
                                  <Icon size={14} />
                                  <span>{eng.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2-Column Form Layout Matching Screenshot 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Column 1: Country & Language */}
                      <div className="space-y-4">
                        {/* Country Selector */}
                        <div className="relative">
                          <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-xs font-semibold text-gray-700">Country</label>
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-500 font-serif">i</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFormCountryOpen(!isFormCountryOpen)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                          >
                            <div className="flex items-center gap-2">
                              {formCountry ? (
                                <>
                                  <CountryFlag countryName={formCountry} size="sm" />
                                  <span className="font-semibold text-gray-900">{formCountry}</span>
                                </>
                              ) : (
                                <>
                                  <CountryFlag countryName="India" size="sm" />
                                  <span className="font-semibold text-gray-900">India</span>
                                </>
                              )}
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                          {isFormCountryOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 text-xs">
                              <div className="relative mb-2">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                                <input
                                  type="text"
                                  value={formCountrySearch}
                                  onChange={(e) => setFormCountrySearch(e.target.value)}
                                  placeholder="Search country..."
                                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-hidden"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                                {POPULAR_COUNTRIES.filter((c: any) =>
                                  !formCountrySearch.trim() ||
                                  c.name.toLowerCase().includes(formCountrySearch.toLowerCase()) ||
                                  c.code.toLowerCase().includes(formCountrySearch.toLowerCase())
                                ).map((c: any) => (
                                  <div
                                    key={c.code}
                                    onClick={() => {
                                      setFormCountry(c.name);
                                      setIsFormCountryOpen(false);
                                      setFormCountrySearch('');
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50/60 cursor-pointer text-gray-800 font-medium"
                                  >
                                    <CountryFlag countryName={c.name} size="sm" />
                                    <span className="font-semibold text-gray-900">{c.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-mono ml-auto">{c.code}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interface Language */}
                        <div className="relative">
                          <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-xs font-semibold text-gray-700">
                              {getEngineLabel(formEngine)} interface language
                            </label>
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-500 font-serif">i</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFormLanguageOpen(!isFormLanguageOpen)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                          >
                            <span className="text-gray-900 font-medium">
                              {formLanguage || 'English'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                          {isFormLanguageOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs max-h-48 overflow-y-auto">
                              {LANGUAGES.map((lang) => (
                                <div
                                  key={lang}
                                  onClick={() => {
                                    setFormLanguage(lang);
                                    setIsFormLanguageOpen(false);
                                  }}
                                  className={`px-3 py-2 hover:bg-blue-50/60 cursor-pointer font-medium ${
                                    (formLanguage || 'English') === lang ? 'bg-blue-50 text-[#0B69FF]' : 'text-gray-800'
                                  }`}
                                >
                                  {lang}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Location & Brand Name */}
                      <div className="space-y-4">
                        {/* Location Optional */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1">
                              <label className="text-xs font-semibold text-gray-700">Location</label>
                              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-500 font-serif">i</div>
                            </div>
                            <span className="text-[11px] text-gray-400">Optional</span>
                          </div>
                          <input
                            type="text"
                            value={formLocation}
                            onChange={(e) => setFormLocation(e.target.value)}
                            placeholder="Choose location"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
                          />
                        </div>

                        {/* Brand Name */}
                        <div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-xs font-semibold text-gray-700">Brand name</label>
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-500 font-serif">i</div>
                          </div>
                          <input
                            type="text"
                            value={formBrandName}
                            onChange={(e) => setFormBrandName(e.target.value)}
                            placeholder={projectName || "e.g. MyBrand"}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
                          />
                          <p className="text-[11px] text-gray-400 mt-1">
                            Shared across all search engines — changes apply to all.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes: Google Ads & Local Pack */}
                    <div className="flex flex-wrap items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formTrackAds}
                          onChange={(e) => setFormTrackAds(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#2870ED] focus:ring-0"
                        />
                        <span className="text-xs text-gray-700 font-medium">Track Google Ads rankings</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formLocalPack}
                          onChange={(e) => setFormLocalPack(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#2870ED] focus:ring-0"
                        />
                        <span className="text-xs text-gray-700 font-medium">Include Google Local Pack results</span>
                      </label>
                    </div>

                    {/* Bottom Bar: Search Engines Available counter & + Add Search Engine button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">
                        {Math.max(0, 100 - addedEngines.length)} more search engines available to add
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateEngine}
                        className="px-5 py-2.5 bg-[#0EA15F] hover:bg-[#05874d] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{editingEngineId ? 'Update search engine' : 'Add search engine'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Search engines added to the project */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">
                        Search engines added to the project
                      </h3>
                      {addedEngines.length > 0 && (
                        <span className="text-xs text-gray-500 font-medium">
                          {addedEngines.length} / 5 search engines used
                        </span>
                      )}
                    </div>

                    {addedEngines.length === 0 ? (
                      <div className="py-8 text-center max-w-sm mx-auto">
                        <div className="text-sm font-bold text-gray-800 mb-1">No search engines</div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Set up and add your search engines using the settings above. You can add classic search engines and AI-powered ones
                        </p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs divide-y divide-gray-200">
                          <thead className="bg-[#FAFBFD] font-bold text-gray-600">
                            <tr>
                              <th className="p-3 w-8">#</th>
                              <th className="p-3">Search engine</th>
                              <th className="p-3">Location</th>
                              <th className="p-3">Language</th>
                              <th className="p-3 text-center">Device</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {addedEngines.map((eng, idx) => (
                              <tr key={eng.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {renderEngineIcon(eng.engine, 16)}
                                    <span className="font-semibold text-gray-900">{eng.label}</span>
                                    {eng.brandName && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 font-medium border border-purple-200">
                                        {eng.brandName}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <CountryFlag countryName={eng.country || 'India'} size="xs" />
                                    <span>{eng.location ? `${eng.location}, ` : ''}{eng.country || 'India'}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-gray-600 font-mono">{eng.language || 'English'}</td>
                                <td className="p-3 text-center font-medium text-gray-700">{eng.device}</td>
                                <td className="p-3 text-right">
                                  <div className="relative inline-block">
                                    <button
                                      type="button"
                                      onClick={() => setEngineMenuOpenId(engineMenuOpenId === eng.id ? null : eng.id)}
                                      className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {engineMenuOpenId === eng.id && (
                                      <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs text-left">
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditEngine(eng)}
                                          className="w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDeletingEngine(eng);
                                            setEngineMenuOpenId(null);
                                          }}
                                          className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Keywords (Authentic SE Ranking 3-card layout) */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Limits summary badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Keywords</h3>
                      <p className="text-xs text-gray-500">
                        Add target keywords to track ranking positions and visibility across your chosen search engines.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-[#B45309] font-medium text-[11px]">
                      <KeyRound className="w-3 h-3 text-[#D97706]" />
                      <span>Keyword limits {addedKeywords.length} / 750</span>
                      <Info className="w-3 h-3 text-[#D97706]" />
                    </div>
                  </div>

                  {/* Card 1: Select search engines (Authentic SE Ranking Table) */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900">Select search engines</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose the search engines for which you'll add keywords for tracking
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600 font-semibold">
                          <tr>
                            <th className="py-2.5 px-4 w-10">
                              <input
                                type="checkbox"
                                checked={
                                  addedEngines.length > 0 &&
                                  selectedKeywordEngineIds.length === addedEngines.length
                                }
                                onChange={() => {
                                  if (selectedKeywordEngineIds.length === addedEngines.length) {
                                    if (addedEngines.length > 0) {
                                      setSelectedKeywordEngineIds([addedEngines[0].id]);
                                    }
                                  } else {
                                    setSelectedKeywordEngineIds(addedEngines.map((e) => e.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#2870ED] accent-[#2870ED] cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-4 font-semibold text-gray-700">
                              Search engine ({selectedKeywordEngineIds.length} out of {addedEngines.length})
                            </th>
                            <th className="py-2.5 px-4 font-semibold text-gray-700">Location</th>
                            <th className="py-2.5 px-4 font-semibold text-gray-700">Language</th>
                            <th className="py-2.5 px-4 font-semibold text-gray-700 text-right">Keywords</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {addedEngines.map((eng) => {
                            const isChecked = selectedKeywordEngineIds.includes(eng.id);
                            const assignedCount = addedKeywords.filter((k) =>
                              k.engineIds?.includes(eng.id)
                            ).length;
                            return (
                              <tr key={eng.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedKeywordEngineIds((prev) =>
                                        prev.includes(eng.id)
                                          ? prev.length > 1
                                            ? prev.filter((id) => id !== eng.id)
                                            : prev
                                          : [...prev, eng.id]
                                      );
                                    }}
                                    className="w-4 h-4 rounded text-[#2870ED] accent-[#2870ED] cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                                  {renderEngineIcon(eng.engine, 16)}
                                  <span>{eng.label}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  <span className="inline-flex items-center gap-1.5">
                                    {eng.countryCode && (
                                      <CountryFlag
                                        countryCode={eng.countryCode}
                                        className="w-4 h-3 rounded-xs shrink-0"
                                      />
                                    )}
                                    <span>{eng.country || 'Worldwide'}</span>
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-700 uppercase font-mono text-[11px]">
                                  {eng.language ? eng.language.substring(0, 2).toUpperCase() : 'EN'}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-gray-800">
                                  {assignedCount}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Enter keywords to add & Suggestions */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Enter keywords to add</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Type keywords manually, paste them, select from suggestions, or import from a file
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => keywordFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import keywords</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </button>
                        <input
                          ref={keywordFileInputRef}
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleKeywordFileImport}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Numbered lines keywords textarea */}
                      <div>
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#1976d2] focus-within:ring-1 focus-within:ring-[#1976d2] bg-white min-h-[220px]">
                          <div className="bg-gray-50 border-r border-gray-200 py-3 px-2 text-right select-none text-[11px] font-mono text-gray-400 w-9 shrink-0 space-y-1">
                            {Array.from({
                              length: Math.max(10, (keywordInputText || '').split('\n').length),
                            }).map((_, i) => (
                              <div key={i} className="leading-[18px]">
                                {i + 1}.
                              </div>
                            ))}
                          </div>
                          <textarea
                            id="keyword-input-textarea"
                            value={keywordInputText}
                            onChange={(e) => setKeywordInputText(e.target.value)}
                            placeholder="Enter keywords (one per line)..."
                            className="flex-1 p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden resize-none font-sans leading-[18px] min-h-[220px]"
                          />
                        </div>
                      </div>

                      {/* Right: Keyword suggestions box */}
                      <div className="border border-gray-200 rounded-lg bg-[#FAFBFD] p-4 flex flex-col min-h-[220px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <span>Keyword suggestions</span>
                            <Info className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          {suggestedKeywords.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = suggestedKeywords.map((s) => s.keyword).join('\n');
                                setKeywordInputText((prev) => (prev.trim() ? `${prev.trim()}\n${list}` : list));
                              }}
                              className="text-[11px] font-bold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              + Add all
                            </button>
                          )}
                        </div>

                        {/* Search in suggestions */}
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            value={suggestionSearch}
                            onChange={(e) => setSuggestionSearch(e.target.value)}
                            placeholder="Search suggestions"
                            className="w-full pl-8 pr-3 py-1 border border-gray-200 rounded text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        {/* Suggestion list */}
                        <div className="flex-1 overflow-y-auto max-h-[140px] border border-gray-200 rounded bg-white divide-y divide-gray-100">
                          {(filteredSuggestions.length > 0
                            ? filteredSuggestions
                            : [
                                { keyword: 'time tracking software', vol: '14,800' },
                                { keyword: 'employee attendance monitoring', vol: '8,100' },
                                { keyword: 'work hours tracker app', vol: '5,400' },
                                { keyword: 'automated activity screenshot tool', vol: '3,200' },
                                { keyword: 'remote staff productivity', vol: '2,900' },
                              ]
                          ).map((sug, i) => {
                            const isAdded = (keywordInputText || '')
                              .split('\n')
                              .some((k) => k.trim().toLowerCase() === sug.keyword.toLowerCase());
                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  if (isAdded) {
                                    setKeywordInputText((prev) =>
                                      prev
                                        .split('\n')
                                        .filter((k) => k.trim().toLowerCase() !== sug.keyword.toLowerCase())
                                        .join('\n')
                                    );
                                  } else {
                                    setKeywordInputText((prev) =>
                                      prev.trim() ? `${prev.trim()}\n${sug.keyword}` : sug.keyword
                                    );
                                  }
                                }}
                                className="flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer text-xs select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isAdded}
                                    onChange={() => {}}
                                    className="w-3.5 h-3.5 rounded text-[#2870ED]"
                                  />
                                  <span className={isAdded ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                                    {sug.keyword}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{sug.vol}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Group selection, Suggest switch & Add Button */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Keyword group dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-gray-700 inline-flex items-center gap-1">
                            <span>Keyword group</span>
                            <Info className="w-3 h-3 text-gray-400" />
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsKeywordGroupDropdownOpen(!isKeywordGroupDropdownOpen)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{activeKeywordGroup}</span>
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </button>
                            {isKeywordGroupDropdownOpen && (
                              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-40 py-1 text-xs">
                                {keywordGroups.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => {
                                      setActiveKeywordGroup(g);
                                      setIsKeywordGroupDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-1.5 text-left font-medium flex items-center gap-2 ${
                                      activeKeywordGroup === g
                                        ? 'bg-blue-50 text-[#0B69FF]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{g}</span>
                                  </button>
                                ))}
                                <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                                  {isCreatingStep3Group ? (
                                    <div className="space-y-1 py-1">
                                      <input
                                        type="text"
                                        value={newStep3GroupName}
                                        onChange={(e) => setNewStep3GroupName(e.target.value)}
                                        placeholder="New group name"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      />
                                      <div className="flex gap-1 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setIsCreatingStep3Group(false)}
                                          className="text-[10px] text-gray-500 px-1.5 py-0.5"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (newStep3GroupName.trim()) {
                                              setKeywordGroups((prev) => [...prev, newStep3GroupName.trim()]);
                                              setActiveKeywordGroup(newStep3GroupName.trim());
                                              setNewStep3GroupName('');
                                              setIsCreatingStep3Group(false);
                                              setIsKeywordGroupDropdownOpen(false);
                                            }
                                          }}
                                          className="text-[10px] bg-[#2870ED] text-white px-2 py-0.5 rounded font-bold"
                                        >
                                          Add
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setIsCreatingStep3Group(true)}
                                      className="w-full text-left py-1 text-[#2870ED] font-semibold hover:underline"
                                    >
                                      + New group
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Suggest keywords toggle switch */}
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={suggestKeywordsToggle}
                            onChange={(e) => setSuggestKeywordsToggle(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-[#2870ED] accent-[#2870ED]"
                          />
                          <span>Suggest keywords</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </label>
                      </div>

                      {/* Limit text & Add keywords button */}
                      <div className="flex items-center justify-between pt-1">
                        {(() => {
                          const pendingLines = (keywordInputText || '')
                            .split('\n')
                            .map((k) => k.trim())
                            .filter(Boolean);
                          const remainingLimit = Math.max(0, 750 - addedKeywords.length);
                          return (
                            <>
                              <div className="text-xs text-gray-500">
                                {pendingLines.length} of {remainingLimit} remaining keyword limits will be used
                              </div>
                              {pendingLines.length === 0 ? (
                                <button
                                  type="button"
                                  disabled
                                  className="px-5 py-2 bg-[#A3D9C9] text-white font-bold text-xs rounded-lg cursor-not-allowed select-none"
                                >
                                  No keywords to add
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (pendingLines.length === 0) return;
                                    const newItems = pendingLines.map((k, idx) => ({
                                      id: `kw-${Date.now()}-${idx}`,
                                      keyword: k,
                                      group: activeKeywordGroup,
                                      volume: 0,
                                      engineIds: selectedKeywordEngineIds,
                                    }));
                                    setAddedKeywords((prev) => [...prev, ...newItems]);
                                    setKeywordInputText('');
                                  }}
                                  className="px-5 py-2 bg-[#0EA15F] hover:bg-[#0C8B52] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Add keywords</span>
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: X keywords added to the project table */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        {addedKeywords.length} keywords added to the project
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('keyword-input-textarea');
                          el?.focus();
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex flex-col items-center group cursor-pointer text-gray-500 hover:text-[#0B69FF] transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#0B69FF] bg-white shadow-xs">
                          <ArrowUp className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#0B69FF]" />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#0B69FF] mt-0.5">
                          Add more keywords?
                        </span>
                      </button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={keywordSearchFilter}
                          onChange={(e) => setKeywordSearchFilter(e.target.value)}
                          placeholder="Search"
                          className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-[#2870ED]"
                        />
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsKeywordEngineFilterOpen(!isKeywordEngineFilterOpen)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span>
                            {keywordEngineFilter === 'all'
                              ? 'Search engine'
                              : addedEngines.find((e) => e.id === keywordEngineFilter)?.label || 'Search engine'}
                          </span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                        {isKeywordEngineFilterOpen && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-40 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setKeywordEngineFilter('all');
                                setIsKeywordEngineFilterOpen(false);
                              }}
                              className={`w-full px-3 py-1.5 text-left ${
                                keywordEngineFilter === 'all' ? 'bg-blue-50 text-[#0B69FF] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              All search engines
                            </button>
                            {addedEngines.map((e) => (
                              <button
                                key={e.id}
                                type="button"
                                onClick={() => {
                                  setKeywordEngineFilter(e.id);
                                  setIsKeywordEngineFilterOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 ${
                                  keywordEngineFilter === e.id ? 'bg-blue-50 text-[#0B69FF] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {renderEngineIcon(e.engine, 14)}
                                <span>{e.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Draggable Grouped Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3 w-8">
                              <input
                                type="checkbox"
                                checked={
                                  addedKeywords.length > 0 &&
                                  selectedKeywordIds.length === addedKeywords.length
                                }
                                onChange={() => {
                                  if (selectedKeywordIds.length === addedKeywords.length) {
                                    setSelectedKeywordIds([]);
                                  } else {
                                    setSelectedKeywordIds(addedKeywords.map((k) => k.id));
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded text-[#2870ED] accent-[#2870ED] cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-700">Keywords</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-700">Search engine</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-700 text-right">Search volume</th>
                            <th className="py-2.5 px-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {/* Folder Group Header Row (Matching Screenshot 3) */}
                          <tr className="bg-gray-50/70 select-none">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <GripVertical className="w-3 h-3 cursor-grab" />
                                <input
                                  type="checkbox"
                                  checked={
                                    addedKeywords.length > 0 &&
                                    selectedKeywordIds.length === addedKeywords.length
                                  }
                                  onChange={() => {
                                    if (selectedKeywordIds.length === addedKeywords.length) {
                                      setSelectedKeywordIds([]);
                                    } else {
                                      setSelectedKeywordIds(addedKeywords.map((k) => k.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded text-[#2870ED] accent-[#2870ED] cursor-pointer"
                                />
                              </div>
                            </td>
                            <td colSpan={4} className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => setIsGeneralGroupExpanded(!isGeneralGroupExpanded)}
                                className="inline-flex items-center gap-2 font-semibold text-gray-900 cursor-pointer"
                              >
                                {isGeneralGroupExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                )}
                                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>General</span>
                                <span className="px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded text-[10px] font-mono">
                                  {addedKeywords.length}
                                </span>
                                <span className="px-1.5 py-0.2 bg-blue-50 text-[#0B69FF] border border-blue-200 rounded text-[10px] font-medium">
                                  Main
                                </span>
                              </button>
                            </td>
                          </tr>

                          {/* Individual Keyword Rows */}
                          {isGeneralGroupExpanded &&
                            addedKeywords
                              .filter((k) => {
                                const matchesText = keywordSearchFilter.trim()
                                  ? k.keyword.toLowerCase().includes(keywordSearchFilter.toLowerCase().trim())
                                  : true;
                                const matchesEngine =
                                  keywordEngineFilter === 'all'
                                    ? true
                                    : k.engineIds?.includes(keywordEngineFilter);
                                return matchesText && matchesEngine;
                              })
                              .map((kw) => {
                                const isRowSelected = selectedKeywordIds.includes(kw.id);
                                return (
                                  <tr key={kw.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-1.5 text-gray-400">
                                        <GripVertical className="w-3 h-3 cursor-grab" />
                                        <input
                                          type="checkbox"
                                          checked={isRowSelected}
                                          onChange={() => {
                                            setSelectedKeywordIds((prev) =>
                                              prev.includes(kw.id)
                                                ? prev.filter((id) => id !== kw.id)
                                                : [...prev, kw.id]
                                            );
                                          }}
                                          className="w-3.5 h-3.5 rounded text-[#2870ED] accent-[#2870ED] cursor-pointer"
                                        />
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-gray-900">
                                      {kw.keyword}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-1.5">
                                        {addedEngines
                                          .filter((e) => kw.engineIds?.includes(e.id))
                                          .map((e) => (
                                            <span
                                              key={e.id}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-700"
                                            >
                                              {renderEngineIcon(e.engine, 12)}
                                              <span>{e.label}</span>
                                            </span>
                                          ))}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-gray-600 text-[11px]">
                                      {kw.volume ? kw.volume.toLocaleString() : '-'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAddedKeywords((prev) => prev.filter((item) => item.id !== kw.id))
                                        }
                                        className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                                        title="Remove keyword"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Prompts (Dynamic AI Check Matching Exact User HTML & Screenshot 4) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Check if project has an AI engine configured */}
                  {!addedEngines.some((e) =>
                    ['ai-overviews', 'ai-mode', 'chatgpt', 'gemini', 'perplexity'].includes(e.engine)
                  ) ? (
                    /* Exact User HTML Empty State Card matching Screenshot 4 */
                    <div
                      data-testid="prompts-no-data"
                      className="ui-status-message wizard-prompts__no-data p-12 sm:p-16 border border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center shadow-xs"
                    >
                      <div className="ui-status-message-icon w-14 h-14 rounded-2xl bg-[#5F31EC]/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-[#5F31EC]" />
                      </div>
                      <h3 className="ui-status-message-title text-lg font-bold text-gray-900 mb-2">
                        Add an AI search engine
                      </h3>
                      <p className="ui-status-message-description text-xs text-gray-500 max-w-md leading-relaxed mb-6">
                        Add AI search engines (ChatGPT, AI Overviews, Gemini etc.) to start tracking and analyzing their results for your target prompts
                      </p>
                      <div className="ui-status-message-actions">
                        <button
                          type="button"
                          data-testid="no-data-button"
                          onClick={() => {
                            setFormEngine('ai-overviews');
                            setCurrentStep(2);
                          }}
                          className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#2060D0] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Set up search engines
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Prompts Configured View */
                    <div className="space-y-6">
                      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">Add prompts to project</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Track your brand mentions and AI search answers across ChatGPT, AI Overviews, and Gemini.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Textarea */}
                          <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#1976d2] focus-within:ring-1 focus-within:ring-[#1976d2] bg-white min-h-[180px]">
                            <div className="bg-gray-50 border-r border-gray-200 py-3 px-2 text-right select-none text-[11px] font-mono text-gray-400 w-9 shrink-0 space-y-1">
                              {Array.from({
                                length: Math.max(6, (promptInputText || '').split('\n').length),
                              }).map((_, i) => (
                                <div key={i} className="leading-[18px]">
                                  {i + 1}.
                                </div>
                              ))}
                            </div>
                            <textarea
                              value={promptInputText}
                              onChange={(e) => setPromptInputText(e.target.value)}
                              placeholder="e.g. What are the best tools for time tracking?&#10;Which software provides automated employee attendance?"
                              className="flex-1 p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden resize-none font-sans leading-[18px] min-h-[180px]"
                            />
                          </div>

                          {/* Prompt suggestions */}
                          <div className="border border-gray-200 rounded-lg bg-[#FAFBFD] p-4 flex flex-col justify-between">
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-2">Prompt suggestions</div>
                              <div className="space-y-1.5 text-xs text-gray-600">
                                {[
                                  'Top time tracking platforms for remote teams in 2026',
                                  'Best alternatives to Hubstaff and Time Doctor',
                                  'Automated employee productivity monitoring software reviews',
                                ].map((p, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setPromptInputText((prev) => (prev.trim() ? `${prev.trim()}\n${p}` : p));
                                    }}
                                    className="p-2 bg-white rounded border border-gray-200 hover:border-blue-400 cursor-pointer text-[11px] text-gray-800 transition-colors"
                                  >
                                    + {p}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="pt-2 flex items-center justify-between">
                              {(() => {
                                const pendingPromptLines = (promptInputText || '')
                                  .split('\n')
                                  .map((p) => p.trim())
                                  .filter(Boolean);
                                const remainingPrompts = Math.max(0, 20 - addedPrompts.length);
                                return (
                                  <>
                                    <span className="text-[11px] text-gray-500">
                                      {pendingPromptLines.length} of {remainingPrompts} limits will be used
                                    </span>
                                    <button
                                      type="button"
                                      disabled={pendingPromptLines.length === 0}
                                      onClick={() => {
                                        if (pendingPromptLines.length === 0) return;
                                        const items = pendingPromptLines.map((p, idx) => ({
                                          id: `pr-${Date.now()}-${idx}`,
                                          prompt: p,
                                        }));
                                        setAddedPrompts((prev) => [...prev, ...items]);
                                        setPromptInputText('');
                                      }}
                                      className="px-4 py-2 bg-[#0EA15F] hover:bg-[#0C8B52] disabled:bg-[#A3D9C9] text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:cursor-not-allowed"
                                    >
                                      + Add prompts
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prompts table */}
                      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
                        <h4 className="text-sm font-bold text-gray-900">
                          {addedPrompts.length} prompts added to project
                        </h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                          {addedPrompts.map((pr, i) => (
                            <div key={pr.id} className="flex items-center justify-between p-3 text-xs hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-gray-400 w-5">{i + 1}</span>
                                <span className="font-semibold text-gray-900">{pr.prompt}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAddedPrompts((prev) => prev.filter((p) => p.id !== pr.id))}
                                className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Competitors (Authentic SE Ranking Layout) */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Competitors</h3>
                      <p className="text-xs text-gray-500">
                        Add competitor websites to compare SERP rankings, visibility, and keywords side-by-side.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-[#B45309] font-medium text-[11px]">
                      <Gauge className="w-3 h-3 text-[#D97706]" />
                      <span>Competitors {addedCompetitors.length} / 5</span>
                    </div>
                  </div>

                  {/* Card 1: Add competitors */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Textarea */}
                      <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] bg-white min-h-[200px]">
                        <div className="bg-gray-50 border-r border-gray-200 py-3 px-2 text-right select-none text-[11px] font-mono text-gray-400 w-8 shrink-0 space-y-1">
                          {Array.from({
                            length: Math.max(6, (competitorInputText || '').split('\n').length),
                          }).map((_, i) => (
                            <div key={i} className="leading-[18px]">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                        <textarea
                          value={competitorInputText}
                          onChange={(e) => setCompetitorInputText(e.target.value)}
                          placeholder="e.g. semrush.com&#10;ahrefs.com&#10;moz.com"
                          className="flex-1 p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden resize-none font-sans leading-[18px] min-h-[200px]"
                        />
                      </div>

                      {/* Suggestions box */}
                      <div className="border border-gray-200 rounded-lg bg-[#FAFBFD] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">Competitors to track</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Enter competitor domains on the left, one per line. They will be tracked and benchmarked against your project domain.
                          </p>
                        </div>

                        <div className="pt-3 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={suggestCompetitorsToggle}
                              onChange={(e) => setSuggestCompetitorsToggle(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-[#7C3AED] accent-[#7C3AED]"
                            />
                            <span>Auto-discover competitors</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const lines = (competitorInputText || '')
                                .split('\n')
                                .map((c) => c.trim())
                                .filter(Boolean);
                              if (lines.length === 0) return;

                              const validLines: string[] = [];
                              for (const line of lines) {
                                const check = validateRealDomainFormat(line);
                                if (check.valid) {
                                  validLines.push(check.normalizedDomain);
                                }
                              }

                              if (validLines.length === 0) {
                                setError('Please enter real competitor domains (e.g. semrush.com, ahrefs.com). Fake inputs are not permitted.');
                                return;
                              }
                              setError(null);

                              const items = validLines.map((c, idx) => ({
                                id: `comp-${Date.now()}-${idx}`,
                                domain: c,
                                name: c,
                                keywordsCount: 0,
                              }));
                              setAddedCompetitors((prev) => [...prev, ...items]);
                              setCompetitorInputText('');
                            }}
                            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                          >
                            + Add competitors to project
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Competitors added table */}
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-gray-900">
                      {addedCompetitors.length} competitors added to the project
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                      {addedCompetitors.map((comp, i) => (
                        <div key={comp.id} className="flex items-center justify-between p-3 text-xs hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-gray-400 w-5">{i + 1}</span>
                            <img
                              src={comp.domain ? `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64` : ''}
                              alt=""
                              className="w-4 h-4 rounded-xs shrink-0 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="font-semibold text-gray-900">{comp.domain}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-mono text-[11px]">{comp.keywordsCount} kw</span>
                            <button
                              type="button"
                              onClick={() => setAddedCompetitors((prev) => prev.filter((c) => c.id !== comp.id))}
                              className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Connect statistics and analytics services (Exact User HTML & Screenshot Match) */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="text-description-block wizard-step__description">
                    <div className="text-base font-bold text-gray-900 mb-1">
                      Connect statistics and analytics services
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      Here you can connect popular statistics and analytics services to your account. This process might take several minutes to complete.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Google Analytics Button Card */}
                    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between min-h-[140px]">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <GoogleAnalyticsIcon className="w-6 h-6" />
                            <span className="text-sm font-bold text-gray-900">Google Analytics</span>
                          </div>
                          {gaConnection.connected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {gaConnection.connected
                            ? `Connected property: ${gaConnection.property || 'GA4-1049281'}`
                            : 'Import organic traffic, sessions, conversions, and user engagement metrics directly.'}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                        {gaConnection.connected ? (
                          <button
                            type="button"
                            onClick={() => setGaConnection({ connected: false })}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveAnalyticsModal('ga')}
                            className="px-4 py-2 bg-[#0073ea] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Connect Google Analytics
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Google Search Console Button Card */}
                    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between min-h-[140px]">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <GoogleGIcon className="w-6 h-6" />
                            <span className="text-sm font-bold text-gray-900">Google Search Console</span>
                          </div>
                          {gscConnection.connected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {gscConnection.connected
                            ? `Connected site: ${gscConnection.site || websiteUrl}`
                            : 'Sync search queries, actual impressions, clicks, and CTR directly from Google.'}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                        {gscConnection.connected ? (
                          <button
                            type="button"
                            onClick={() => setGscConnection({ connected: false })}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveAnalyticsModal('gsc')}
                            className="px-4 py-2 bg-[#0073ea] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Connect Google Search Console
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. Matomo Analytics Button Card */}
                    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between min-h-[140px]">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <MatomoIcon className="w-6 h-6" />
                            <span className="text-sm font-bold text-gray-900">Matomo Analytics</span>
                          </div>
                          {matomoConnection.connected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {matomoConnection.connected
                            ? `Connected to: ${matomoConnection.url || 'matomo.myanalytics.com'}`
                            : 'Connect your self-hosted or cloud Matomo open-source privacy analytics instance.'}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                        {matomoConnection.connected ? (
                          <button
                            type="button"
                            onClick={() => setMatomoConnection({ connected: false })}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveAnalyticsModal('matomo')}
                            className="px-4 py-2 bg-[#0073ea] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Connect Matomo Analytics
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Controls (Matching Exact User Screenshot 6 / 6 FINISH) */}
            <div className="h-16 sm:h-18 border-t border-gray-100 px-4 sm:px-8 md:px-10 flex items-center justify-between bg-white select-none shrink-0">
              <div className="w-24">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer uppercase tracking-wider"
                  >
                    GO BACK
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-gray-400 tracking-widest">
                {currentStep} / 6
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting || (currentStep === 1 && (!websiteUrl.trim() || domainValidationState.isValid === false))}
                className="px-7 py-2.5 bg-[#0073ea] hover:bg-[#005bb5] text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSubmitting
                    ? 'Creating...'
                    : currentStep === 6
                    ? 'FINISH'
                    : 'NEXT STEP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: SIMPLE 1-PAGE CREATE PROJECT (Exact 1:1 Match to Image 1)         */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Top Header Bar */}
          <div className="h-16 border-b border-gray-100 px-8 sm:px-12 flex items-center justify-between select-none shrink-0 bg-white">
            <h2 className="text-base font-bold text-gray-900">
              Create project
            </h2>

            <div className="flex items-center gap-8">
              {/* Advanced settings toggle with tooltip */}
              <div className="relative group">
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => setAdvancedSettings(!advancedSettings)}
                >
                  <button
                    type="button"
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      advancedSettings ? 'bg-[#1976d2]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className="bg-white w-4 h-4 rounded-full shadow-md pointer-events-none"
                      style={{
                        transform: advancedSettings ? 'translateX(16px)' : 'translateX(0px)',
                        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                    <span>Advanced settings</span>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Tooltip matching Screenshot 2 */}
                <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-72 p-3 bg-[#42464D] text-white text-[11px] leading-relaxed rounded-lg shadow-2xl z-50 pointer-events-none">
                  You can enable advanced settings in the Project Wizard. They will allow you to customize the project more precisely according to your needs. The system will save the state of this switch and apply it by default when you create a project next time. NOTE: upon enabling/disabling advanced settings, all the data you previously entered in the form will be reset.
                </div>
              </div>

              {/* ESC Close button */}
              <button
                onClick={onClose}
                className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  ESC
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* SECTION 1: Website URL */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Website URL</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Either enter a website address or the URL of the video or a YouTube channel
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Domain/URL</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWebsiteUrl(val);
                          const clean = val
                            .replace(/^https?:\/\//i, '')
                            .replace(/^www\./i, '')
                            .replace(/\/.*$/, '')
                            .trim();
                          setProjectName(clean);
                        }}
                        placeholder="Enter domain (e.g. workcomposer.com)"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden transition-colors ${
                          domainValidationState.isValid === false
                            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : domainValidationState.isValid === true
                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'border-gray-300 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]'
                        }`}
                      />
                      {domainValidationState.isChecking && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin" />
                        </div>
                      )}
                      {!domainValidationState.isChecking && domainValidationState.isValid === true && (
                        <div className="absolute right-3 top-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                      {!domainValidationState.isChecking && domainValidationState.isValid === false && (
                        <div className="absolute right-3 top-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {websiteUrl.trim() && domainValidationState.message && (
                      <p
                        className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${
                          domainValidationState.isValid === false
                            ? 'text-red-600'
                            : domainValidationState.isValid === true
                            ? 'text-emerald-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {domainValidationState.isValid === false && '⚠️ '}
                        {domainValidationState.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Project name (optional)</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Search engine */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Search engine</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Track website and brand rankings on classic and AI search engines in any region. Add more search engines, enable Google Maps results, and customize keyword lists in Advanced settings (toggle at the top)
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Search engine</label>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>

                  {/* Search Engine Pills matching Screenshot 1 */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('google')}
                      title="Google: Classic organic web, featured snippets & local pack"
                      className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${
                        selectedEngines.includes('google')
                          ? 'border-[#4285F4] bg-[#EEF4FE] text-[#1A73E8] ring-1 ring-[#4285F4]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#4285F4]/50 hover:bg-[#F8FAFF] hover:text-[#1A73E8]'
                      }`}
                    >
                      <GoogleIcon size={16} className="transition-transform duration-200 group-hover:scale-110 shrink-0" />
                      <span>Google</span>
                      {selectedEngines.includes('google') && (
                        <Check className="w-3.5 h-3.5 text-[#1A73E8] stroke-[2.5] ml-0.5" />
                      )}
                    </button>

                    {/* AI Overviews */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('ai-overviews')}
                      title="Google AI Overviews: SGE generative summaries & cited source links"
                      className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${
                        selectedEngines.includes('ai-overviews')
                          ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#6D28D9] ring-1 ring-[#7C3AED]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#7C3AED]/50 hover:bg-[#FAF8FF] hover:text-[#6D28D9]'
                      }`}
                    >
                      <AiOverviewsIcon size={16} className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 shrink-0" />
                      <span>AI Overviews</span>
                      {selectedEngines.includes('ai-overviews') && (
                        <Check className="w-3.5 h-3.5 text-[#6D28D9] stroke-[2.5] ml-0.5" />
                      )}
                    </button>

                    {/* AI Mode */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('ai-mode')}
                      title="Google AI Mode: Generative conversational search SERP rankings"
                      className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${
                        selectedEngines.includes('ai-mode')
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#2563EB]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#2563EB]/50 hover:bg-[#F0F7FF] hover:text-[#1D4ED8]'
                      }`}
                    >
                      <AiModeIcon size={16} className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 shrink-0" />
                      <span>AI Mode</span>
                      {selectedEngines.includes('ai-mode') && (
                        <Check className="w-3.5 h-3.5 text-[#1D4ED8] stroke-[2.5] ml-0.5" />
                      )}
                    </button>

                    {/* ChatGPT */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('chatgpt')}
                      title="ChatGPT: OpenAI web citations, search rankings & brand visibility"
                      className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${
                        selectedEngines.includes('chatgpt')
                          ? 'border-[#10A37F] bg-[#ECFDF5] text-[#047857] ring-1 ring-[#10A37F]/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#10A37F]/50 hover:bg-[#F0FDF8] hover:text-[#047857]'
                      }`}
                    >
                      <ChatGptIcon size={16} className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12 shrink-0" />
                      <span>ChatGPT</span>
                      {selectedEngines.includes('chatgpt') && (
                        <Check className="w-3.5 h-3.5 text-[#047857] stroke-[2.5] ml-0.5" />
                      )}
                    </button>

                    {/* Additional selected engines */}
                    {ADDITIONAL_ENGINES.filter((eng) => selectedEngines.includes(eng.id)).map((eng) => {
                      const IconComp = eng.icon;
                      return (
                        <button
                          key={eng.id}
                          type="button"
                          onClick={() => toggleEngine(eng.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2870ED] bg-blue-50/50 text-[#2870ED] text-xs font-medium cursor-pointer transition-colors"
                        >
                          <IconComp size={16} />
                          <span>{eng.label}</span>
                          <X className="w-3 h-3 ml-0.5 text-gray-400 hover:text-red-500" />
                        </button>
                      );
                    })}

                    {/* More icon dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMoreEnginesOpen(!isMoreEnginesOpen)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 cursor-pointer flex items-center justify-center transition-colors"
                        title="More search engines"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {isMoreEnginesOpen && (
                        <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in duration-100">
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            More Search Engines
                          </div>
                          {ADDITIONAL_ENGINES.map((eng) => {
                            const IconComp = eng.icon;
                            const isSelected = selectedEngines.includes(eng.id);
                            return (
                              <button
                                key={eng.id}
                                type="button"
                                onClick={() => {
                                  toggleEngine(eng.id);
                                  setIsMoreEnginesOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 text-left cursor-pointer transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <IconComp size={15} />
                                  <span>{eng.label}</span>
                                </span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                                  <Info className="w-3 h-3 text-gray-400" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-[1px] bg-gray-200 mx-1" />

                    {/* Device toggles: Desktop / Mobile */}
                    <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50/60">
                      <button
                        type="button"
                        onClick={() => setDevice('desktop')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          device === 'desktop'
                            ? 'bg-white shadow-2xs text-[#2870ED]'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title="Desktop"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevice('mobile')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          device === 'mobile'
                            ? 'bg-white shadow-2xs text-[#2870ED]'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title="Mobile"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location & Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Selector */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Location <span className="text-red-500 font-bold">*</span></label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                      className={`w-full px-3.5 py-2.5 bg-white border ${!country ? 'border-amber-300' : 'border-gray-300'} rounded-lg text-xs text-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden`}
                    >
                      <div className="flex items-center gap-2">
                        {country && country !== 'Enter country, city or postal code' ? (
                          <>
                            <CountryFlag countryName={country} size="sm" />
                            <span className="font-medium text-gray-900">{country}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 font-normal">Enter country, city or postal code (Required)</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLocationOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 text-xs">
                        <div className="relative mb-2">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            placeholder="Enter country, city or postal code"
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-[#2870ED]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-0.5">
                          {POPULAR_COUNTRIES.filter((c: any) =>
                            c.name.toLowerCase().includes(locationSearch.toLowerCase())
                          ).map((c: any, i: number) => (
                            <div
                              key={`${c.code}-${i}`}
                              onClick={() => {
                                setCountry(c.name);
                                setIsLocationOpen(false);
                                setLocationSearch('');
                              }}
                              className="px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-800 text-xs"
                            >
                              <CountryFlag countryName={c.name} size="sm" />
                              <span className="font-medium truncate">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Language Selector */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Google interface language <span className="text-red-500 font-bold">*</span></label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                      className={`w-full px-3.5 py-2.5 bg-white border ${!language ? 'border-amber-300' : 'border-gray-300'} rounded-lg text-xs text-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden`}
                    >
                      {language ? (
                        <span className="font-medium text-gray-900">{language}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">Select interface language (Required)</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLanguageOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-xs divide-y divide-gray-100 max-h-48 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                          <div
                            key={lang}
                            onClick={() => {
                              setLanguage(lang);
                              setIsLanguageOpen(false);
                            }}
                            className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer text-gray-800 font-medium"
                          >
                            {lang}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Keywords (Matching Screenshot 1) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Keywords</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Add keywords manually or copy and paste them below from a text editor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Numbered lines keywords textarea */}
                  <div>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#2870ED] focus-within:ring-1 focus-within:ring-[#2870ED] bg-white min-h-[220px]">
                      {/* Line numbers gutter */}
                      <div className="bg-gray-50 border-r border-gray-200 py-3 px-2 text-right select-none text-[11px] font-mono text-gray-400 w-8 shrink-0 space-y-1">
                        {keywordLines.map((_, i) => (
                          <div key={i} className="leading-[18px]">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {/* Textarea */}
                      <textarea
                        value={keywordsText}
                        onChange={(e) => setKeywordsText(e.target.value)}
                        placeholder="Enter keywords"
                        className="flex-1 p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden resize-none font-sans leading-[18px] min-h-[220px]"
                      />
                    </div>
                  </div>

                  {/* Right: Keyword suggestions box */}
                  <div className="border border-gray-200 rounded-lg bg-[#FAFBFD] p-4 flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>Keyword suggestions</span>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {websiteUrl.trim() && suggestedKeywords.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddAllSuggestions}
                          className="text-[11px] font-bold text-[#1976d2] hover:underline cursor-pointer"
                        >
                          + Add all
                        </button>
                      )}
                    </div>

                    {/* Domain + Engines + Country Pill */}
                    {websiteUrl.trim() && (
                      <div className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs flex items-center justify-between shadow-2xs mb-2">
                        <span className="font-semibold text-gray-800 truncate">
                          {websiteUrl.trim()}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {selectedEngines.map((engId) => (
                            <span key={engId} title={getEngineLabel(engId)} className="inline-flex items-center">
                              {renderEngineIcon(engId, 15)}
                            </span>
                          ))}
                          <CountryFlag countryName={country || 'India'} size="xs" />
                        </div>
                      </div>
                    )}

                    {/* Suggestions list or empty state */}
                    {!websiteUrl.trim() && suggestedKeywords.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                          Suggested keywords will appear after you enter website URL
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto max-h-[160px] border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
                        {isLoadingSuggestions && suggestedKeywords.length === 0 ? (
                          <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1976d2]" />
                            <span>Loading suggestions...</span>
                          </div>
                        ) : filteredSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            No suggestions found
                          </div>
                        ) : (
                          filteredSuggestions.map((sug, idx) => {
                            const checked = isKeywordSelected(sug.keyword);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleKeyword(sug.keyword)}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs transition-colors select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {}}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#7C3AED] focus:ring-0 cursor-pointer accent-[#7C3AED]"
                                  />
                                  <span
                                    className={`truncate ${
                                      checked ? 'font-medium text-gray-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {sug.keyword}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-400 font-mono shrink-0">
                                  {sug.vol}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyword limits summary footer matching Screenshot 1 */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 pt-2 select-none">
                  <div>
                    <span>{keywordCount} of 739 remaining keywords limits will be used</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-[#B45309] font-medium text-[11px]">
                    <KeyRound className="w-3 h-3 text-[#D97706]" />
                    <span>Keyword limits 11 / 750</span>
                    <Info className="w-3 h-3 text-[#D97706]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action Bar (Matching Screenshot 2 & SE Ranking specifications) */}
          <div className="border-t border-gray-100 px-8 sm:px-12 py-4 flex items-center justify-between bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded text-xs font-bold text-gray-700 uppercase tracking-wider transition-colors cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleFinishProject}
              disabled={isSubmitting || !websiteUrl.trim() || domainValidationState.isValid === false}
              className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initPhase ? `${initPhase}...` : 'START TRACKING'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
