import { AiEngineConfig, CountryOption, ScopeType } from './types';

export const SUPPORTED_ENGINES: AiEngineConfig[] = [
  { id: 'ai-overview', name: 'AI Overview', color: '#1A73E8', iconType: 'ai-overview' },
  { id: 'ai-mode', name: 'AI Mode', color: '#EA4335', iconType: 'ai-mode' },
  { id: 'chatgpt', name: 'ChatGPT', color: '#10A37F', iconType: 'chatgpt' },
  { id: 'gemini', name: 'Gemini', color: '#4285F4', iconType: 'gemini' },
  { id: 'perplexity', name: 'Perplexity', color: '#20B2AA', iconType: 'perplexity' },
];

export const SCOPE_OPTIONS: { id: ScopeType; label: string; desc: string }[] = [
  {
    id: '*.domain.com/*',
    label: '*.domain.com/*',
    desc: 'Domain (with subdomains)',
  },
  {
    id: 'domain.com/*',
    label: 'domain.com/*',
    desc: 'Domain only',
  },
  {
    id: 'Exact URL',
    label: 'URL',
    desc: 'URL only',
  },
];

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'in', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'us', name: 'United States of America', flag: '🇺🇸', region: 'North America' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'au', name: 'Australia', flag: '🇦🇺', region: 'Asia' },
  { code: 'de', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'fr', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'es', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: 'it', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', region: 'South America' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  { code: 'ww', name: 'Worldwide', flag: '🌐', region: 'Worldwide' },
];

export const REGIONS = [
  'Worldwide',
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
] as const;
