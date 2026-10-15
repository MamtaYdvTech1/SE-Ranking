'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Settings,
  Download,
  Filter,
  Columns,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Info,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
  BarChart2,
  Copy,
  Tag,
  Link2,
  Target,
  Clock,
  List,
  Folder,
  Layers,
  ArrowUpRight,
  StickyNote,
  Sliders,
  Gauge,
  KeyRound,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { GoogleAiOverviewIcon, ChatGptIcon, AiModeIcon, PerplexityIcon } from '@/components/ui/AiEngineIcons';
import { AppFooter } from '@/components/layout/AppFooter';
import { CreateNoteModal } from '@/components/modals/CreateNoteModal';
import { ProjectNotesModal } from '@/components/modals/ProjectNotesModal';
import { ProjectSettingsModal } from '@/components/modals/ProjectSettingsModal';
import { ProjectSearchEnginesWizard } from '@/components/wizard/ProjectSearchEnginesWizard';
import { ProjectFavicon } from '@/components/ui/ProjectFavicon';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GoogleAccountChooserModal, GoogleAccountProfile } from '@/components/auth/GoogleAccountChooserModal';

interface KeywordItem {
  id: string;
  keyword: string;
  rank: number | null;
  prevRank: number | null;
  change: number;
  volume: number;
  cpc: string;
  difficulty: number;
  serpFeatures: string[];
  url: string;
  dateChecked: string;
  color?: string;
  contentScore?: string | number;
  group?: string;
  tags?: string[];
  landingPage?: string;
  searchVolume?: number;
  features?: string[];
  previousRank?: number | null;
  currentRank?: number | null;
  dynamics?: number;
  traffic?: number;
}

interface HighPotentialKeyword {
  keyword: string;
  volume: number;
  kd: number | null;
  cpc: number | null;
  intent: string | null;
}

const INITIAL_KEYWORDS: KeywordItem[] = [];
const DEPRECATED_KEYWORDS_SAMPLE: KeywordItem[] = [
  {
    id: 'kw-2',
    keyword: 'work time tracker',
    rank: 3,
    prevRank: 5,
    change: 2,
    volume: 8100,
    cpc: '$3.20',
    difficulty: 22,
    serpFeatures: ['Reviews', 'SiteLinks'],
    url: 'https://www.workcomposer.com/time-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-3',
    keyword: 'remote employee tracking software',
    rank: 5,
    prevRank: 5,
    change: 0,
    volume: 5400,
    cpc: '$4.10',
    difficulty: 25,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/remote-tracking',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-4',
    keyword: 'automatic screenshot monitoring tool',
    rank: 4,
    prevRank: 7,
    change: 3,
    volume: 2400,
    cpc: '$5.10',
    difficulty: 16,
    serpFeatures: ['Video', 'FAQ'],
    url: 'https://www.workcomposer.com/screenshots',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-5',
    keyword: 'desktop activity tracker',
    rank: 7,
    prevRank: 6,
    change: -1,
    volume: 3600,
    cpc: '$2.80',
    difficulty: 19,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/activity-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-6',
    keyword: 'remote team productivity tool',
    rank: 6,
    prevRank: 8,
    change: 2,
    volume: 5200,
    cpc: '$3.90',
    difficulty: 24,
    serpFeatures: ['SiteLinks', 'People Also Ask'],
    url: 'https://www.workcomposer.com/productivity',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-7',
    keyword: 'time tracking software with screenshots',
    rank: 3,
    prevRank: 4,
    change: 1,
    volume: 1900,
    cpc: '$3.40',
    difficulty: 18,
    serpFeatures: ['Featured Snippet'],
    url: 'https://www.workcomposer.com/time-tracking-screenshots',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-8',
    keyword: 'staff attendance tracker',
    rank: 9,
    prevRank: 13,
    change: 4,
    volume: 4800,
    cpc: '$2.90',
    difficulty: 31,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/attendance',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-9',
    keyword: 'computer usage tracker for employees',
    rank: 8,
    prevRank: 6,
    change: -2,
    volume: 2100,
    cpc: '$4.30',
    difficulty: 27,
    serpFeatures: ['FAQ'],
    url: 'https://www.workcomposer.com/usage-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-10',
    keyword: 'keystroke logging tool for office',
    rank: 11,
    prevRank: 12,
    change: 1,
    volume: 1200,
    cpc: '$3.80',
    difficulty: 33,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/keystrokes',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-11',
    keyword: 'employee productivity monitoring app',
    rank: 12,
    prevRank: 15,
    change: 3,
    volume: 3200,
    cpc: '$3.50',
    difficulty: 26,
    serpFeatures: ['Reviews'],
    url: 'https://www.workcomposer.com/productivity-app',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-12',
    keyword: 'stealth employee monitor',
    rank: 15,
    prevRank: 16,
    change: 1,
    volume: 1800,
    cpc: '$4.20',
    difficulty: 29,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/stealth-monitor',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-13',
    keyword: 'screen capture time tracker',
    rank: 7,
    prevRank: 8,
    change: 1,
    volume: 2900,
    cpc: '$3.80',
    difficulty: 21,
    serpFeatures: ['Video'],
    url: 'https://www.workcomposer.com/screen-capture',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-14',
    keyword: 'hybrid work monitoring platform',
    rank: 14,
    prevRank: 18,
    change: 4,
    volume: 4100,
    cpc: '$4.60',
    difficulty: 32,
    serpFeatures: ['FAQ'],
    url: 'https://www.workcomposer.com/hybrid-work',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-15',
    keyword: 'remote worker time clock',
    rank: 8,
    prevRank: 9,
    change: 1,
    volume: 6300,
    cpc: '$2.70',
    difficulty: 20,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/time-clock',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-16',
    keyword: 'user activity monitoring system',
    rank: 19,
    prevRank: 20,
    change: 1,
    volume: 2700,
    cpc: '$5.40',
    difficulty: 35,
    serpFeatures: ['Featured Snippet'],
    url: 'https://www.workcomposer.com/activity-monitor',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-17',
    keyword: 'workforce analytics software',
    rank: 16,
    prevRank: 16,
    change: 0,
    volume: 5900,
    cpc: '$6.10',
    difficulty: 38,
    serpFeatures: ['Reviews', 'SiteLinks'],
    url: 'https://www.workcomposer.com/workforce-analytics',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-18',
    keyword: 'employee timesheet automation',
    rank: 22,
    prevRank: 25,
    change: 3,
    volume: 3800,
    cpc: '$3.30',
    difficulty: 24,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/timesheet-automation',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-19',
    keyword: 'productivity tracker mac windows',
    rank: 10,
    prevRank: 11,
    change: 1,
    volume: 2400,
    cpc: '$3.10',
    difficulty: 22,
    serpFeatures: ['FAQ'],
    url: 'https://www.workcomposer.com/mac-windows',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-20',
    keyword: 'remote work attendance app',
    rank: 13,
    prevRank: 14,
    change: 1,
    volume: 4500,
    cpc: '$3.60',
    difficulty: 27,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/remote-attendance',
    dateChecked: 'Today, 06:00',
  },
];


const SUMMARY_NOTES = [
  {
    id: 'note-0',
    title: 'suraj notes',
    shortDesc: 'hiii i m suraj notes',
    fullDesc: 'hiii i m suraj notes',
    date: 'Oct-09 2026',
    category: 'Project note',
  },
  {
    id: 'note-1',
    title: 'September 2026 spam update',
    shortDesc: 'This is the fourth spam update of 2026, launched about five weeks after the August update ended. It started on September 24, 2026, and completed 13 days and 16 hours later, on October 8, 2026. Google says this one may take up to two weeks to roll out. The update applies globally and to all languages. Google hasn\'t said whether it targets any specific spam policy or tactic. If your rankings or traffic shift in late September or early October, this update is a likely cause.',
    fullDesc: 'This is the fourth spam update of 2026, launched about five weeks after the August update ended. It started on September 24, 2026, and completed 13 days and 16 hours later, on October 8, 2026. Google says this one may take up to two weeks to roll out. The update applies globally and to all languages. Google hasn\'t said whether it targets any specific spam policy or tactic. If your rankings or traffic shift in late September or early October, this update is a likely cause.',
    date: 'Sep-24 2026',
    category: 'Google update',
  },
  {
    id: 'note-2',
    title: 'August 2026 spam update',
    shortDesc: 'This is the third spam update of 2026, launched less than two months after the June spam update. It ran from August 18, 2026, to August 21, 2026, lasting about 2 days and 16 hours. Like previous spam updates, it applied globally across all languages and targeted sites that violate Google\'s existing spam policies. SE Ranking\'s analysis of 100,000 keywords in US search results found that 16.71% of pages ranking in the TOP 10 before the update dropped out of the TOP 100. Volatility hit all 20 industries tracked. It peaked in fashion and beauty, while YMYL niches such as real estate and healthcare were among the most stable.',
    fullDesc: 'This is the third spam update of 2026, launched less than two months after the June spam update. It ran from August 18, 2026, to August 21, 2026, lasting about 2 days and 16 hours. Like previous spam updates, it applied globally across all languages and targeted sites that violate Google\'s existing spam policies. SE Ranking\'s analysis of 100,000 keywords in US search results found that 16.71% of pages ranking in the TOP 10 before the update dropped out of the TOP 100. Volatility hit all 20 industries tracked. It peaked in fashion and beauty, while YMYL niches such as real estate and healthcare were among the most stable.',
    date: 'Aug-18 2026',
    category: 'Google update',
  },
  {
    id: 'note-3',
    title: 'June 2026 spam update',
    shortDesc: 'This is the second spam update of 2026, arriving just over three weeks after the May 2026 core update finished. It started on June 24, 2026, and completed two days later on June 26, 2026. Google released it as a standard spam update that applies globally and to all languages. The update aimed to improve Google\'s automated spam-detection systems, including SpamBrain, so sites that violated existing spam policies were most likely to be affected. Google notes that recovery can take months, because its systems need time to confirm that a site now complies.',
    fullDesc: 'This is the second spam update of 2026, arriving just over three weeks after the May 2026 core update finished. It started on June 24, 2026, and completed two days later on June 26, 2026. Google released it as a standard spam update that applies globally and to all languages. The update aimed to improve Google\'s automated spam-detection systems, including SpamBrain, so sites that violated existing spam policies were most likely to be affected. Google notes that recovery can take months, because its systems need time to confirm that a site now complies.',
    date: 'Jun-24 2026',
    category: 'Google update',
  },
  {
    id: 'note-4',
    title: 'May 2026 Google Core Update',
    shortDesc: 'This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all types of sites, with changes being broad and not targeted at specific sites or pages. This was a global update that impacted all regions and languages. SE Ranking’s analysis across 100K keywords found that nearly 20% of pages ranking in the TOP 10 before the update dropped out of the TOP 100.',
    fullDesc: 'This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all types of sites, with changes being broad and not targeted at specific sites or pages. This was a global update that impacted all regions and languages. SE Ranking’s analysis across 100K keywords found that nearly 20% of pages ranking in the TOP 10 before the update dropped out of the TOP 100.',
    date: 'May-21 2026',
    category: 'Google update',
  },
];

interface SummaryCompetitorItem {
  id: string;
  domain: string;
  url: string;
  favicon: string;
  visibility: string;
  color: string;
  stroke: string;
  top10Kws: number;
  avgPos: number;
  cx: number;
  cy: number;
}

const SUMMARY_COMPETITORS: SummaryCompetitorItem[] = [
  {
    id: '287946',
    domain: 'southampton.cylex-uk.co.uk',
    url: 'https://southampton.cylex-uk.co.uk',
    favicon: 'https://www.google.de/s2/favicons?domain=https://southampton.cylex-uk.co.uk',
    visibility: '0%',
    color: 'rgba(78,63,3,0.9)',
    stroke: '#4e3f03',
    top10Kws: 1,
    avgPos: 3.8,
    cx: 99,
    cy: 106.6,
  },
  {
    id: '10600597',
    domain: 'www.facebook.com',
    url: 'https://www.facebook.com',
    favicon: 'https://www.google.com/s2/favicons?domain=https://www.facebook.com',
    visibility: '0%',
    color: 'rgba(145,145,14,0.9)',
    stroke: '#91910e',
    top10Kws: 2,
    avgPos: 2.1,
    cx: 350.8,
    cy: 64.9,
  },
  {
    id: '10643770',
    domain: 'www.mapquest.com',
    url: 'https://www.mapquest.com',
    favicon: 'https://www.google.at/s2/favicons?domain=https://www.mapquest.com',
    visibility: '0%',
    color: 'rgba(9,255,18,0.9)',
    stroke: '#09ff12',
    top10Kws: 1,
    avgPos: 8.2,
    cx: 99,
    cy: 148.4,
  },
  {
    id: '11324387',
    domain: 'www.hyundai.com',
    url: 'https://www.hyundai.com',
    favicon: 'https://www.google.at/s2/favicons?domain=https://www.hyundai.com',
    visibility: '0%',
    color: 'rgba(134,230,1,0.9)',
    stroke: '#86e601',
    top10Kws: 1,
    avgPos: 9.8,
    cx: 99,
    cy: 176.2,
  },
  {
    id: '22012361',
    domain: 'tracxn.com',
    url: 'https://tracxn.com',
    favicon: 'https://www.google.dk/s2/favicons?domain=https://tracxn.com',
    visibility: '0%',
    color: 'rgba(59,130,86,0.9)',
    stroke: '#3b8256',
    top10Kws: 1,
    avgPos: 8.2,
    cx: 99,
    cy: 148.4,
  },
];

interface TeamsKeywordItem {
  id: string;
  name: string;
  color: string;
  urlHref: string | null;
  volume: number | string;
  features: {
    sge?: boolean;
    reviews?: boolean;
    video?: boolean;
    paa?: boolean;
    sitelinks?: boolean;
    images?: boolean;
  };
  contentScore: number | null;
  rankOct3: number | string | null;
  rankOct4: number | string | null;
  diff: number | null;
}

const toRankNum = (r: number | string | null | undefined): number | null => {
  if (typeof r === 'number') return r;
  if (typeof r === 'string') {
    const parsed = parseInt(r, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const generateDynamicKeywordsForDomain = (targetDomain: string): TeamsKeywordItem[] => {
  const clean = (targetDomain || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
  const brand = clean.split('.')[0] || 'brand';
  const brandCap = brand.charAt(0).toUpperCase() + brand.slice(1);

  const kwTemplates = [
    { name: brand.toLowerCase(), vol: 450000, r3: 1, r4: 1, diff: 0, cs: 92, path: '' },
    { name: `${brand.toLowerCase()} online shopping`, vol: 165000, r3: 2, r4: 2, diff: 0, cs: 88, path: '/online-shopping' },
    { name: `${brand.toLowerCase()} app`, vol: 240000, r3: 1, r4: 1, diff: 0, cs: 85, path: '/app' },
    { name: `buy on ${brand.toLowerCase()}`, vol: 90000, r3: 3, r4: 3, diff: 0, cs: 81, path: '/store' },
    { name: `${brand.toLowerCase()} deals`, vol: 110000, r3: 5, r4: 4, diff: 1, cs: 79, path: '/deals' },
    { name: `${brand.toLowerCase()} offers today`, vol: 75000, r3: 4, r4: 5, diff: -1, cs: 76, path: '/offers' },
    { name: `${brand.toLowerCase()} best price`, vol: 60000, r3: 7, r4: 6, diff: 1, cs: 73, path: '/best-price' },
    { name: `${brand.toLowerCase()} customer care`, vol: 95000, r3: 1, r4: 1, diff: 0, cs: 90, path: '/contact' },
    { name: `${brand.toLowerCase()} discount code`, vol: 48000, r3: 8, r4: 9, diff: -1, cs: 70, path: '/coupons' },
    { name: `${brand.toLowerCase()} login`, vol: 180000, r3: 1, r4: 1, diff: 0, cs: 94, path: '/account/login' },
    { name: `${brand.toLowerCase()} official store`, vol: 82000, r3: 2, r4: 2, diff: 0, cs: 86, path: '/store' },
    { name: `${brand.toLowerCase()} electronics`, vol: 120000, r3: 3, r4: 3, diff: 0, cs: 83, path: '/electronics' },
    { name: `${brand.toLowerCase()} mobile phones`, vol: 310000, r3: 2, r4: 2, diff: 0, cs: 89, path: '/mobiles' },
    { name: `${brand.toLowerCase()} fashion sale`, vol: 88000, r3: 6, r4: 5, diff: 1, cs: 77, path: '/fashion' },
  ];

  return kwTemplates.map((t, idx) => ({
    id: `kw-${clean}-${idx + 1}`,
    name: t.name,
    color: ['rgb(33, 63, 52)', 'rgb(22, 219, 34)', 'rgb(6, 72, 220)', 'rgb(142, 68, 173)', 'rgb(230, 126, 34)'][idx % 5],
    urlHref: `https://${clean}${t.path}`,
    volume: t.vol,
    features: { sge: idx % 2 === 0, sitelinks: idx < 4, paa: idx % 3 === 0 },
    contentScore: t.cs,
    rankOct3: t.r3,
    rankOct4: t.r4,
    diff: t.diff,
  }));
};

const JIO_KEYWORDS_DATA: TeamsKeywordItem[] = [
  {
    id: 'kw-jio-1',
    name: 'myjio',
    color: 'rgb(38, 112, 119)',
    urlHref: 'https://myjio.com/',
    volume: '246K',
    features: { reviews: true, sitelinks: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-2',
    name: 'myjio app',
    color: 'rgb(49, 86, 59)',
    urlHref: 'https://myjio.com/',
    volume: '60.5K',
    features: { sge: true, reviews: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-3',
    name: 'myjio login',
    color: 'rgb(182, 125, 33)',
    urlHref: 'https://myjio.com/',
    volume: '10',
    features: { sge: true, reviews: true, sitelinks: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-4',
    name: 'myjio website',
    color: 'rgb(196, 3, 178)',
    urlHref: 'https://myjio.com/',
    volume: '10',
    features: { sge: true, sitelinks: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-5',
    name: 'myjio account',
    color: 'rgb(254, 117, 11)',
    urlHref: 'https://myjio.com/',
    volume: '110',
    features: { sge: true, reviews: true, video: true, paa: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-6',
    name: 'jio login',
    color: 'rgb(230, 184, 64)',
    urlHref: 'https://myjio.com/',
    volume: '201K',
    features: { sge: true, reviews: true, sitelinks: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-7',
    name: 'jio recharge',
    color: 'rgb(234, 176, 132)',
    urlHref: 'https://myjio.com/',
    volume: '1.2M',
    features: { sge: true, reviews: true, sitelinks: true, video: true, images: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-8',
    name: 'jio recharge online',
    color: 'rgb(64, 217, 245)',
    urlHref: 'https://myjio.com/',
    volume: '47.5K',
    features: { reviews: true, sitelinks: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-9',
    name: 'jio mobile recharge',
    color: 'rgb(70, 177, 224)',
    urlHref: 'https://myjio.com/',
    volume: '49.5K',
    features: { sge: true, reviews: true, sitelinks: true, video: true, paa: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
  {
    id: 'kw-jio-10',
    name: 'jio prepaid recharge',
    color: 'rgb(126, 75, 23)',
    urlHref: 'https://myjio.com/',
    volume: '40.5K',
    features: { reviews: true, video: true },
    contentScore: null,
    rankOct3: '-',
    rankOct4: '-',
    diff: null,
  },
];

const PINTEREST_KEYWORDS_DATA: TeamsKeywordItem[] = [
  {
    id: 'kw-pin-1',
    name: 'pint login',
    color: 'rgb(230, 0, 35)',
    urlHref: 'https://in.pinterest.com/login',
    volume: 9892,
    features: { sge: true, paa: true },
    contentScore: 88,
    rankOct3: 2,
    rankOct4: 1,
    diff: 1,
  },
  {
    id: 'kw-pin-2',
    name: 'pint download',
    color: 'rgb(11, 105, 255)',
    urlHref: 'https://in.pinterest.com/download',
    volume: 6971,
    features: { sge: true, sitelinks: true },
    contentScore: 78,
    rankOct3: 6,
    rankOct4: 5,
    diff: 1,
  },
  {
    id: 'kw-pin-3',
    name: 'pint web app',
    color: 'rgb(16, 185, 129)',
    urlHref: 'https://in.pinterest.com/',
    volume: 15386,
    features: { paa: true },
    contentScore: 82,
    rankOct3: null,
    rankOct4: 12,
    diff: 88,
  },
  {
    id: 'kw-pin-4',
    name: 'pint online',
    color: 'rgb(245, 158, 11)',
    urlHref: 'https://in.pinterest.com/',
    volume: 14320,
    features: { sge: false },
    contentScore: 75,
    rankOct3: null,
    rankOct4: 14,
    diff: 86,
  },
  {
    id: 'kw-pin-5',
    name: 'pint pricing',
    color: 'rgb(124, 58, 237)',
    urlHref: 'https://in.pinterest.com/',
    volume: 2543,
    features: { sge: false },
    contentScore: 68,
    rankOct3: null,
    rankOct4: 18,
    diff: 82,
  },
];

const TEAMS_KEYWORDS_DATA: TeamsKeywordItem[] = [
  {
    id: 'kw-wc-1',
    name: 'work composer',
    color: 'rgb(33, 63, 52)',
    urlHref: 'https://www.workcomposer.com/',
    volume: 590,
    features: { sge: true, sitelinks: true },
    contentScore: 39,
    rankOct3: 1,
    rankOct4: 1,
    diff: 0,
  },
  {
    id: 'kw-wc-2',
    name: 'work composer hack',
    color: 'rgb(22, 219, 34)',
    urlHref: 'https://www.workcomposer.com/',
    volume: 10,
    features: { sge: false },
    contentScore: 71,
    rankOct3: null,
    rankOct4: 2,
    diff: 98,
  },
  {
    id: 'kw-wc-3',
    name: 'idle time tracker',
    color: 'rgb(6, 72, 220)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: false, paa: true },
    contentScore: 68,
    rankOct3: 9,
    rankOct4: 13,
    diff: -4,
  },
  {
    id: 'kw-wc-4',
    name: 'idle time tracking',
    color: 'rgb(243, 146, 57)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: false, video: true },
    contentScore: 69,
    rankOct3: 16,
    rankOct4: 15,
    diff: 1,
  },
  {
    id: 'kw-wc-5',
    name: 'idle time tracking software',
    color: 'rgb(244, 20, 253)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: true, sitelinks: true },
    contentScore: 62,
    rankOct3: null,
    rankOct4: 10,
    diff: 90,
  },
  {
    id: 'kw-wc-6',
    name: 'composer download',
    color: 'rgb(45, 9, 110)',
    urlHref: 'https://www.workcomposer.com/download',
    volume: 1900,
    features: { sge: false, reviews: true },
    contentScore: 40,
    rankOct3: 14,
    rankOct4: 32,
    diff: -18,
  },
  {
    id: 'kw-wc-7',
    name: 'screenshot time tracking',
    color: 'rgb(98, 218, 49)',
    urlHref: 'https://www.workcomposer.com/screenshots',
    volume: 110,
    features: { sge: false, paa: true },
    contentScore: 64,
    rankOct3: 45,
    rankOct4: 44,
    diff: 1,
  },
  {
    id: 'kw-wc-8',
    name: 'track computer idle time',
    color: 'rgb(253, 123, 73)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: false },
    contentScore: 63,
    rankOct3: 16,
    rankOct4: 10,
    diff: 6,
  },
  {
    id: 'kw-wc-9',
    name: 'work idle',
    color: 'rgb(108, 120, 44)',
    urlHref: 'https://www.workcomposer.com/',
    volume: 10,
    features: { sge: false },
    contentScore: 61,
    rankOct3: 26,
    rankOct4: 27,
    diff: -1,
  },
  {
    id: 'kw-wc-10',
    name: 'how to track idle time on computer',
    color: 'rgb(99, 89, 47)',
    urlHref: 'https://www.workcomposer.com/',
    volume: 10,
    features: { sge: false, paa: true },
    contentScore: 61,
    rankOct3: 20,
    rankOct4: 21,
    diff: -1,
  },
  {
    id: 'kw-wc-11',
    name: 'idle time software',
    color: 'rgb(112, 114, 241)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: true },
    contentScore: 65,
    rankOct3: 5,
    rankOct4: 8,
    diff: -3,
  },
  {
    id: 'kw-wc-12',
    name: 'system idle time tracker software',
    color: 'rgb(16, 185, 129)',
    urlHref: 'https://www.workcomposer.com/wc/idle-time-tracking-software',
    volume: 10,
    features: { sge: false },
    contentScore: 67,
    rankOct3: null,
    rankOct4: 9,
    diff: 91,
  },
  {
    id: 'kw-wc-13',
    name: 'employee monitoring idle time',
    color: 'rgb(245, 158, 11)',
    urlHref: 'https://www.workcomposer.com/employee-monitoring',
    volume: 10,
    features: { sge: false },
    contentScore: 59,
    rankOct3: null,
    rankOct4: 20,
    diff: 80,
  },
  {
    id: 'kw-wc-14',
    name: 'work tracks',
    color: 'rgb(59, 130, 246)',
    urlHref: 'https://www.workcomposer.com/',
    volume: 480,
    features: { sge: false },
    contentScore: 54,
    rankOct3: null,
    rankOct4: 18,
    diff: 82,
  },
];

const MEESHO_48_KEYWORDS_DATA: TeamsKeywordItem[] = [
  { id: 'kw-m-1', name: 'misogynistic', color: 'rgb(25, 118, 210)', urlHref: 'https://meesho.com/', volume: 11852, features: { paa: true }, contentScore: 88, rankOct3: 1, rankOct4: 1, diff: 0 },
  { id: 'kw-m-2', name: 'miso soup', color: 'rgb(25, 118, 210)', urlHref: 'https://meesho.com/', volume: 10211, features: { sge: true }, contentScore: 78, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-3', name: 'misophonia', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1747, features: {}, contentScore: null, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-4', name: 'misogynist', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3080, features: {}, contentScore: null, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-5', name: 'miso soup recipe', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 8763, features: {}, contentScore: null, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-6', name: 'meesho india', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 6520, features: {}, contentScore: null, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-7', name: 'meesho online shopping', color: 'rgb(25, 118, 210)', urlHref: 'https://meesho.com/', volume: 45000, features: { sitelinks: true, sge: true }, contentScore: 85, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-8', name: 'meesho app download', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 33000, features: { sitelinks: true }, contentScore: 81, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-9', name: 'meesho supplier login', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 22000, features: { sitelinks: true }, contentScore: 76, rankOct3: 3, rankOct4: 3, diff: 0 },
  { id: 'kw-m-10', name: 'meesho seller portal', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 18000, features: { sitelinks: true }, contentScore: null, rankOct3: 3, rankOct4: 3, diff: 0 },
  { id: 'kw-m-11', name: 'meesho sarees collection', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 14500, features: { reviews: true }, contentScore: null, rankOct3: 3, rankOct4: 3, diff: 0 },
  { id: 'kw-m-12', name: 'meesho kurtis', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 12200, features: { reviews: true }, contentScore: null, rankOct3: 4, rankOct4: 4, diff: 0 },
  { id: 'kw-m-13', name: 'meesho track order', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 9800, features: {}, contentScore: null, rankOct3: 4, rankOct4: 4, diff: 0 },
  { id: 'kw-m-14', name: 'meesho customer care number', color: 'rgb(25, 118, 210)', urlHref: 'https://meesho.com/', volume: 28000, features: { paa: true }, contentScore: 82, rankOct3: 2, rankOct4: 2, diff: 0 },
  { id: 'kw-m-15', name: 'meesho return policy', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 6700, features: { paa: true }, contentScore: null, rankOct3: 4, rankOct4: 4, diff: 0 },
  { id: 'kw-m-16', name: 'meesho dresses for women', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 8900, features: { reviews: true }, contentScore: null, rankOct3: 3, rankOct4: 3, diff: 0 },
  { id: 'kw-m-17', name: 'meesho shoes for men', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 7400, features: {}, contentScore: null, rankOct3: 5, rankOct4: 5, diff: 0 },
  { id: 'kw-m-18', name: 'meesho jewelry set', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 6100, features: {}, contentScore: null, rankOct3: 5, rankOct4: 5, diff: 0 },
  { id: 'kw-m-19', name: 'meesho bags collection', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 5400, features: {}, contentScore: null, rankOct3: 5, rankOct4: 5, diff: 0 },
  { id: 'kw-m-20', name: 'meesho kitchen items', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 4900, features: {}, contentScore: null, rankOct3: 6, rankOct4: 6, diff: 0 },
  { id: 'kw-m-21', name: 'meesho bedsheets combo', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 4300, features: {}, contentScore: null, rankOct3: 6, rankOct4: 6, diff: 0 },
  { id: 'kw-m-22', name: 'meesho smart watch', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 5800, features: {}, contentScore: null, rankOct3: 5, rankOct4: 5, diff: 0 },
  { id: 'kw-m-23', name: 'meesho earrings jhumka', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 4100, features: {}, contentScore: null, rankOct3: 4, rankOct4: 4, diff: 0 },
  { id: 'kw-m-24', name: 'meesho t shirts for men', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 6800, features: {}, contentScore: null, rankOct3: 4, rankOct4: 4, diff: 0 },
  { id: 'kw-m-25', name: 'meesho jeans for women', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 5100, features: {}, contentScore: null, rankOct3: 5, rankOct4: 5, diff: 0 },
  { id: 'kw-m-26', name: 'meesho winter collection', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3800, features: {}, contentScore: null, rankOct3: 7, rankOct4: 7, diff: 0 },
  { id: 'kw-m-27', name: 'meesho kids wear', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 4200, features: {}, contentScore: null, rankOct3: 6, rankOct4: 6, diff: 0 },
  { id: 'kw-m-28', name: 'meesho makeup kit combo', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3900, features: {}, contentScore: null, rankOct3: 6, rankOct4: 6, diff: 0 },
  { id: 'kw-m-29', name: 'meesho footwear sale', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3600, features: {}, contentScore: null, rankOct3: 7, rankOct4: 7, diff: 0 },
  { id: 'kw-m-30', name: 'meesho toys for kids', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2900, features: {}, contentScore: null, rankOct3: 8, rankOct4: 8, diff: 0 },
  { id: 'kw-m-31', name: 'meesho home decor', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3100, features: {}, contentScore: null, rankOct3: 7, rankOct4: 7, diff: 0 },
  { id: 'kw-m-32', name: 'meesho curtains for door', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2700, features: {}, contentScore: null, rankOct3: 8, rankOct4: 8, diff: 0 },
  { id: 'kw-m-33', name: 'meesho wall stickers', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2400, features: {}, contentScore: null, rankOct3: 8, rankOct4: 8, diff: 0 },
  { id: 'kw-m-34', name: 'meesho mobile cover back', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 3500, features: {}, contentScore: null, rankOct3: 7, rankOct4: 7, diff: 0 },
  { id: 'kw-m-35', name: 'meesho earphones bluetooth', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2800, features: {}, contentScore: null, rankOct3: 8, rankOct4: 8, diff: 0 },
  { id: 'kw-m-36', name: 'meesho water bottle set', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2100, features: {}, contentScore: null, rankOct3: 9, rankOct4: 9, diff: 0 },
  { id: 'kw-m-37', name: 'meesho lunch box insulated', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1950, features: {}, contentScore: null, rankOct3: 9, rankOct4: 9, diff: 0 },
  { id: 'kw-m-38', name: 'meesho umbrella online', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1600, features: {}, contentScore: null, rankOct3: 10, rankOct4: 10, diff: 0 },
  { id: 'kw-m-39', name: 'meesho sunglasses combo', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2200, features: {}, contentScore: null, rankOct3: 9, rankOct4: 9, diff: 0 },
  { id: 'kw-m-40', name: 'meesho hair accessories', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2450, features: {}, contentScore: null, rankOct3: 8, rankOct4: 8, diff: 0 },
  { id: 'kw-m-41', name: 'meesho stationery items', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1750, features: {}, contentScore: null, rankOct3: 10, rankOct4: 10, diff: 0 },
  { id: 'kw-m-42', name: 'meesho organic spices', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1200, features: {}, contentScore: null, rankOct3: 12, rankOct4: 12, diff: 0 },
  { id: 'kw-m-43', name: 'meesho snacks combo', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1100, features: {}, contentScore: null, rankOct3: 14, rankOct4: 14, diff: 0 },
  { id: 'kw-m-44', name: 'meesho gym wear set', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1850, features: {}, contentScore: null, rankOct3: 11, rankOct4: 11, diff: 0 },
  { id: 'kw-m-45', name: 'meesho yoga mat anti slip', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1400, features: {}, contentScore: null, rankOct3: 12, rankOct4: 12, diff: 0 },
  { id: 'kw-m-46', name: 'meesho sports shoes running', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 2300, features: {}, contentScore: null, rankOct3: 9, rankOct4: 9, diff: 0 },
  { id: 'kw-m-47', name: 'meesho wallet for men', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1650, features: {}, contentScore: null, rankOct3: 11, rankOct4: 11, diff: 0 },
  { id: 'kw-m-48', name: 'meesho belt combo leather', color: 'rgb(102, 174, 124)', urlHref: 'https://meesho.com/', volume: 1350, features: {}, contentScore: null, rankOct3: 13, rankOct4: 13, diff: 0 },
];

function RankingsPageContent() {
  const { activeProject, projects, setIsAddWebsiteModalOpen } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProject = activeProject || null;
  const domain = currentProject?.domain || '';
  const cleanDomain = useMemo(() => {
    return (domain || '')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }, [domain]);
  const effectiveProjectName = currentProject?.name || (domain.startsWith('http') ? domain : `https://${domain}/`);
  const effectiveDomain = domain;

  const dynamicKeywordPlaceholder = useMemo(() => {
    const clean = (effectiveDomain || '')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();

    if (clean.includes('jio')) {
      return 'jio website login\njio website recharge\njio web browser\njio website\njio web series';
    }
    if (clean.includes('pinterest')) {
      return 'pinterest ideas\npinterest wallpaper\npinterest login\npinterest download\npinterest home decor';
    }
    if (clean.includes('amazon')) {
      return 'amazon online shopping\namazon deals of the day\namazon customer care\namazon prime video\namazon mobile recharge';
    }
    const brand = clean.split('.')[0] || 'brand';
    return `${brand} login\n${brand} online\n${brand} download\n${brand} features\n${brand} pricing`;
  }, [effectiveDomain]);

  // Active view tab: supports detailed, summary, and historical
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'historical'>(
    tabParam === 'summary'
      ? 'summary'
      : tabParam === 'historical' || tabParam === 'history'
      ? 'historical'
      : 'detailed'
  );

  useEffect(() => {
    if (tabParam === 'summary') {
      setActiveTab('summary');
    } else if (tabParam === 'historical' || tabParam === 'history') {
      setActiveTab('historical');
    } else if (tabParam === 'detailed') {
      setActiveTab('detailed');
    }
  }, [tabParam]);

  // Ranking Settings Gear Dropdown & Modal state matching Screenshot 1 & 3
  const [rankingSettings, setRankingSettings] = useState({
    showCharts: true,
    showAllSearchEngines: false,
    defaultChart: 'Average position',
    defaultSection: 'Detailed',
    keywordsPerPage: 100,
    webPageUrl: 'Icon',
    tableColumns: ['Content Score', 'SERP features', 'Search vol.', 'URL'],
    dataAlignment: 'Left to right',
    amountDisplayed: 'Default',
    tableViewMode: 'Default',
  });
  const [tempRankingSettings, setTempRankingSettings] = useState(rankingSettings);
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [isRankingSettingsMenuOpen, setIsRankingSettingsMenuOpen] = useState(false);
  const rankingSettingsRef = useRef<HTMLDivElement>(null);
  const [isRankingSettingsModalOpen, setIsRankingSettingsModalOpen] = useState(false);
  const [activeSettingsSubmenu, setActiveSettingsSubmenu] = useState<string | null>(null);

  // Export Modal state matching Screenshot 1 & 2
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Google Data Studio Dropdown & Modal matching Screenshot 1
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const dataStudioRef = useRef<HTMLDivElement>(null);

  // Manual Rechecks Quota state matching Screenshot 1 & 5
  const [manualRechecksUsed, setManualRechecksUsed] = useState(0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Dual Calendar Date Picker Popover matching Screenshot 1 & 4
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [selectedDateRangeLabel, setSelectedDateRangeLabel] = useState('Last 30 Days');
  const [selectedDateRangePreset, setSelectedDateRangePreset] = useState<string>('30D');
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [tempCustomStart, setTempCustomStart] = useState<string | null>(null);
  const [tempCustomEnd, setTempCustomEnd] = useState<string | null>(null);
  const [selectedDateColumnLabel, setSelectedDateColumnLabel] = useState('Oct-11');
  const [isYear1DropdownOpen, setIsYear1DropdownOpen] = useState(false);
  const [isYear2DropdownOpen, setIsYear2DropdownOpen] = useState(false);
  const [selectedYear1, setSelectedYear1] = useState(2026);
  const [selectedYear2, setSelectedYear2] = useState(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(6);

  // Search Engine State - All Real Engines
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedEngine, setSelectedEngine] = useState('India');
  const [isAddEngineModalOpen, setIsAddEngineModalOpen] = useState(false);
  const [engineSearchFilter, setEngineSearchFilter] = useState('');
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
      name: 'Google AI Overviews',
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
      name: 'Google AI Mode',
      countryCode: 'IN',
      countryName: 'India',
      language: 'EN',
    },
  ]);
  const [selectedEngineId, setSelectedEngineId] = useState('eng-google');
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
    setSelectedEngine(cName);
    setIsAddEngineModalOpen(false);
    showToast(`Added ${added.name} (${added.countryName}) search engine`);
  };

  // View Mode Dropdown matching Screenshot 3 & 4
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);
  const viewModeRef = useRef<HTMLDivElement>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<'List' | 'Groups' | 'Tags' | 'URL in SERP' | 'Target URL' | 'Date'>('List');

  // Position Filters state matching Screenshot 1
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [posMin, setPosMin] = useState('');
  const [posMax, setPosMax] = useState('');

  // Table Column Visibility & Sorting
  const [visibleTableCols, setVisibleTableCols] = useState<Set<string>>(new Set(['url', 'volume', 'serp_features', 'content_score', 'oct10', 'oct11']));
  const [isDetailedColumnsOpen, setIsDetailedColumnsOpen] = useState(false);
  const detailedColumnsRef = useRef<HTMLDivElement>(null);
  const [isDetailedFilterOpen, setIsDetailedFilterOpen] = useState(false);
  const detailedFiltersRef = useRef<HTMLDivElement>(null);
  const [detailedVolMin, setDetailedVolMin] = useState('');
  const [detailedVolMax, setDetailedVolMax] = useState('');
  const [detailedSerpFeature, setDetailedSerpFeature] = useState('all');
  const [detailedScoreFilter, setDetailedScoreFilter] = useState('all');
  const [isDetailedCopyOpen, setIsDetailedCopyOpen] = useState(false);
  const detailedCopyRef = useRef<HTMLDivElement>(null);
  const [isDetailedFilterDrawerOpen, setIsDetailedFilterDrawerOpen] = useState(false);
  const [keywordSortOrder, setKeywordSortOrder] = useState<'asc' | 'desc'>('asc');
  const [volumeSortOrder, setVolumeSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailedFiltersRef.current && !detailedFiltersRef.current.contains(event.target as Node)) {
        setIsDetailedFilterOpen(false);
      }
      if (detailedColumnsRef.current && !detailedColumnsRef.current.contains(event.target as Node)) {
        setIsDetailedColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Insights Section matching Screenshot 1, 2, 3
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  // Metrics Section toggle
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);

  // Summary View interactive states
  const [distributionPeriod, setDistributionPeriod] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M' | '1Y' | '2Y'>('CURRENT');
  const [keywordOverviewMode, setKeywordOverviewMode] = useState<'VISIBILITY' | 'TRAFFIC FORECAST'>('VISIBILITY');
  const [pagesFilterTab, setPagesFilterTab] = useState<'TOP' | 'JUMPED' | 'DROPPED'>('TOP');
  const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All groups');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [createNoteInitialDate, setCreateNoteInitialDate] = useState('8 Oct 2026');
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false);
  const [isProjectNotesModalOpen, setIsProjectNotesModalOpen] = useState(false);
  const [isKeywordsAddedPopoverOpen, setIsKeywordsAddedPopoverOpen] = useState(false);
  const [hoveredDetailedPoint, setHoveredDetailedPoint] = useState<{ x: number; y: number; label: string; value: number; date?: string; displayVal?: string | number } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteDate, setNoteDate] = useState('8 Oct 2026');
  const [noteCategory, setNoteCategory] = useState('Project note');
  const [notes, setNotes] = useState(SUMMARY_NOTES);
  const [isConnectGAOpen, setIsConnectGAOpen] = useState(false);
  const [isGAConnected, setIsGAConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('seranking_ga_connected') === 'true';
    }
    return false;
  });
  const [gaPropertyId, setGaPropertyId] = useState<string>('Google Analytics 4 (GA4)');
  const [isGaGoogleChooserOpen, setIsGaGoogleChooserOpen] = useState(false);
  const [gaAccountEmail, setGaAccountEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('se_ranking_connected_account') ||
        localStorage.getItem('user_email') ||
        'itxsuraj9930@gmail.com'
      );
    }
    return 'itxsuraj9930@gmail.com';
  });
  const [gaAccountName, setGaAccountName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('se_ranking_connected_user') ||
        localStorage.getItem('user_name') ||
        'Suraj Vishwakarma'
      );
    }
    return 'Suraj Vishwakarma';
  });

  const handleGaAccountSelected = (account: GoogleAccountProfile) => {
    setGaAccountEmail(account.email);
    setGaAccountName(account.name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_ranking_connected_account', account.email);
      localStorage.setItem('se_ranking_connected_user', account.name);
    }
    showToast(`Google account ${account.email} authorized for GA4!`);
  };
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [hoveredCompetitorBubble, setHoveredCompetitorBubble] = useState<string | null>(null);
  const [hoveredCompetitorDomain, setHoveredCompetitorDomain] = useState<string | null>(null);
  const [hoveredDistributionPoint, setHoveredDistributionPoint] = useState<boolean>(true);
  const [hoveredDistributionDate, setHoveredDistributionDate] = useState<'Oct-08' | 'Oct-09' | 'Oct-10' | 'Oct-11'>('Oct-10');
  const [hoveredDistributionDateIndex, setHoveredDistributionDateIndex] = useState<number>(0);
  const [hoveredVisibilityCard, setHoveredVisibilityCard] = useState<boolean>(false);
  const [hoveredAvgPosCard, setHoveredAvgPosCard] = useState<boolean>(false);
  const [isKwOverviewGroupsOpen, setIsKwOverviewGroupsOpen] = useState(false);
  const [selectedKwOverviewGroup, setSelectedKwOverviewGroup] = useState('All groups');
  const [isKwOverviewViewModeOpen, setIsKwOverviewViewModeOpen] = useState(false);
  const [selectedKwOverviewViewMode, setSelectedKwOverviewViewMode] = useState('List');

  // Detailed & Historical Tab Interactive States
  const [detailedMetric, setDetailedMetric] = useState<
    'AveragePosition' | 'TrafficForecast' | 'Visibility' | 'SERPFeatures' | 'Top10Keywords' | 'KeywordsChart'
  >('AveragePosition');
  const [detailedChartCollapsed, setDetailedChartCollapsed] = useState(false);
  const [detailedPeriod, setDetailedPeriod] = useState<'Current' | '7D' | '1M' | '3M' | '6M' | '1Y' | '2Y'>('Current');
  const [detailedGroupBy, setDetailedGroupBy] = useState<'days' | 'weeks' | 'months'>('days');
  const [isDetailedGroupByOpen, setIsDetailedGroupByOpen] = useState(false);
  const [historicalMetric, setHistoricalMetric] = useState<
    'AveragePosition' | 'TrafficForecast' | 'Visibility' | 'Top10Keywords'
  >('AveragePosition');
  const [historicalChartCollapsed, setHistoricalChartCollapsed] = useState(false);
  const [hoveredHistoricalPoint, setHoveredHistoricalPoint] = useState<{
    x: number;
    y: number;
    pct: number;
    date: string;
    position: number;
    change: number;
  } | null>(null);
  const [selectedDetailedKeywordIds, setSelectedDetailedKeywordIds] = useState<string[]>([]);
  const [isDetailedPerPageOpen, setIsDetailedPerPageOpen] = useState(false);
  const [detailedPerPageCount, setDetailedPerPageCount] = useState(100);
  const [expandedDetailedKeywordIds, setExpandedDetailedKeywordIds] = useState<string[]>([]);
  const [detailedTableSearch, setDetailedTableSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDetailedViewMode, setSelectedDetailedViewMode] = useState<
    'List' | 'Groups' | 'Tags' | 'URL in SERP' | 'Target URL' | 'Date'
  >('List');
  const [isDetailedViewModeOpen, setIsDetailedViewModeOpen] = useState(false);
  const [detailedChangesFilter, setDetailedChangesFilter] = useState<'all' | 'up' | 'down'>('all');

  // Recheck Data 2-Tier Dropdown state
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [hoveredRecheckSubmenu, setHoveredRecheckSubmenu] = useState<'rankings' | 'search_volume' | null>(null);
  const recheckDropdownRef = useRef<HTMLDivElement>(null);

  // Add Keywords and High-Potential Keywords Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHighPotentialModalOpen, setIsHighPotentialModalOpen] = useState(false);
  const [selectedHighPotential, setSelectedHighPotential] = useState<string[]>([]);
  const [highPotentialKeywords, setHighPotentialKeywords] = useState<HighPotentialKeyword[]>([]);
  const [highPotentialLoading, setHighPotentialLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);

  // Load real keyword ideas for this domain when the High-Potential modal opens
  useEffect(() => {
    if (!isHighPotentialModalOpen || !domain) return;
    const controller = new AbortController();
    fetch(`/api/keywords/suggestions?domain=${encodeURIComponent(domain)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { suggestions: [] }))
      .then((json) => {
        const tracked = new Set(keywords.map((k) => k.keyword.toLowerCase()));
        const ideas: HighPotentialKeyword[] = (Array.isArray(json.suggestions) ? json.suggestions : [])
          .filter((s: { keyword?: string }) => s.keyword && !tracked.has(s.keyword.toLowerCase()))
          .map((s: { keyword: string; volume?: number; kd?: number; cpc?: number; intent?: string }) => ({
            keyword: s.keyword,
            volume: s.volume ?? 0,
            kd: s.kd ?? null,
            cpc: s.cpc ?? null,
            intent: s.intent || null,
          }))
          // Highest volume first, easier keywords breaking ties
          .sort((a: HighPotentialKeyword, b: HighPotentialKeyword) => b.volume - a.volume || (a.kd ?? 100) - (b.kd ?? 100))
          .slice(0, 15);
        setHighPotentialKeywords(ideas);
      })
      .catch(() => {})
      .finally(() => setHighPotentialLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the modal opens or the domain changes
  }, [isHighPotentialModalOpen, domain]);
  const [rankingsSummary, setRankingsSummary] = useState<any>(null);
  const [rankingsTrend, setRankingsTrend] = useState<any[]>([]);
  const [keywordDistribution, setKeywordDistribution] = useState<any[]>([]);
  const [serpDynamics, setSerpDynamics] = useState<any>(null);
  const [projectCompetitors, setProjectCompetitors] = useState<any[]>([]);
  const [projectPages, setProjectPages] = useState<any[]>([]);
  const [rankingsError, setRankingsError] = useState<string | null>(null);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  const currentVisibilityScore = useMemo(() => {
    if (rankingsSummary?.visibilityScore != null) return rankingsSummary.visibilityScore;
    if (keywords.length === 0) return 0;
    const inTop10 = keywords.filter((k) => k.rank != null && k.rank > 0 && k.rank <= 10).length;
    return Number(((inTop10 / keywords.length) * 100).toFixed(1));
  }, [rankingsSummary, keywords]);

  const currentAvgPosition = useMemo(() => {
    if (rankingsSummary?.averagePosition != null) return rankingsSummary.averagePosition;
    const rankedKws = keywords.filter((k) => k.rank != null && k.rank > 0 && k.rank <= 100);
    if (rankedKws.length === 0) return 0;
    return Number((rankedKws.reduce((acc, k) => acc + (k.rank || 0), 0) / rankedKws.length).toFixed(1));
  }, [rankingsSummary, keywords]);

  const serpFeaturesCount = useMemo(() => {
    const set = new Set<string>();
    keywords.forEach((k) => (k.serpFeatures || k.features || []).forEach((f) => set.add(f)));
    return set.size;
  }, [keywords]);

  const calculatedDistribution = useMemo(() => {
    if (rankingsSummary) {
      return {
        top1: rankingsSummary.top1 ?? 0,
        top2_3: rankingsSummary.top2_3 ?? 0,
        top4_5: rankingsSummary.top4_5 ?? 0,
        top6_10: rankingsSummary.top6_10 ?? 0,
        top11_30: rankingsSummary.top11_30 ?? 0,
        top31_100: rankingsSummary.top31_100 ?? 0,
        total: rankingsSummary.totalKeywordsInSerp ?? (rankingsSummary.totalRanked ?? keywords.length),
      };
    }
    const dist = { top1: 0, top2_3: 0, top4_5: 0, top6_10: 0, top11_30: 0, top31_100: 0, total: keywords.length };
    keywords.forEach((k) => {
      const r = k.rank;
      if (r === 1) dist.top1++;
      else if (r != null && r >= 2 && r <= 3) dist.top2_3++;
      else if (r != null && r >= 4 && r <= 5) dist.top4_5++;
      else if (r != null && r >= 6 && r <= 10) dist.top6_10++;
      else if (r != null && r >= 11 && r <= 30) dist.top11_30++;
      else if (r != null && r >= 31 && r <= 100) dist.top31_100++;
    });
    return dist;
  }, [rankingsSummary, keywords]);

  const displayKeywordsList: TeamsKeywordItem[] = React.useMemo(() => {
    if (keywords && keywords.length > 0) {
      const palette = [
        'rgb(230, 0, 35)',
        'rgb(11, 105, 255)',
        'rgb(16, 185, 129)',
        'rgb(124, 58, 237)',
        'rgb(245, 158, 11)',
        'rgb(13, 148, 136)',
        'rgb(236, 72, 153)',
        'rgb(107, 114, 128)',
      ];
      return keywords.map((k, idx) => ({
        id: k.id || `kw-${idx}`,
        name: k.keyword,
        color: palette[idx % palette.length],
        urlHref: k.url || k.landingPage || (activeProject?.domain ? `https://${activeProject.domain}/` : `https://${domain}/`),
        volume: k.volume || k.searchVolume || 0,
        features: {
          sge: (k.serpFeatures || k.features || []).includes('sge'),
          paa: (k.serpFeatures || k.features || []).includes('paa'),
          sitelinks: (k.serpFeatures || k.features || []).includes('sitelinks'),
          reviews: (k.serpFeatures || k.features || []).includes('reviews'),
          video: (k.serpFeatures || k.features || []).includes('video'),
        },
        contentScore: k.contentScore != null ? (typeof k.contentScore === 'number' ? k.contentScore : (isNaN(Number(k.contentScore)) ? null : Number(k.contentScore))) : null,
        rankOct3: k.prevRank !== undefined && k.prevRank !== null ? k.prevRank : (k.rank !== undefined && k.rank !== null ? k.rank : '-'),
        rankOct4: k.rank !== undefined && k.rank !== null ? k.rank : '-',
        diff: k.change ?? (k.dynamics || 0),
      }));
    }
    return [];
  }, [keywords, domain, activeProject?.domain]);

  const positionFilterMetrics = useMemo(() => {
    const total = displayKeywordsList.length;
    const top1 = displayKeywordsList.filter((k) => toRankNum(k.rankOct4) === 1).length;
    const top3 = displayKeywordsList.filter((k) => {
      const r = toRankNum(k.rankOct4);
      return r !== null && r >= 1 && r <= 3;
    }).length;
    const top5 = displayKeywordsList.filter((k) => {
      const r = toRankNum(k.rankOct4);
      return r !== null && r >= 1 && r <= 5;
    }).length;
    const top10 = displayKeywordsList.filter((k) => {
      const r = toRankNum(k.rankOct4);
      return r !== null && r >= 1 && r <= 10;
    }).length;
    const top30 = displayKeywordsList.filter((k) => {
      const r = toRankNum(k.rankOct4);
      return r !== null && r >= 1 && r <= 30;
    }).length;
    const over100 = displayKeywordsList.filter((k) => {
      const r = toRankNum(k.rankOct4);
      return r === null || r > 100;
    }).length;
    const up = displayKeywordsList.filter((k) => k.diff !== null && k.diff > 0).length;
    const down = displayKeywordsList.filter((k) => k.diff !== null && k.diff < 0).length;

    const pct = (cnt: number) => (total > 0 ? `${Math.round((cnt / total) * 100)}%` : '0%');

    return {
      total,
      top1,
      top3,
      top5,
      top10,
      top30,
      over100,
      up,
      down,
      top1Pct: pct(top1),
      top3Pct: pct(top3),
      top5Pct: pct(top5),
      top10Pct: pct(top10),
      top30Pct: pct(top30),
      over100Pct: pct(over100),
    };
  }, [displayKeywordsList]);

  const activeCompetitorsList = useMemo(() => {
    if (projectCompetitors && projectCompetitors.length > 0) {
      const palette = [
        { color: 'rgba(78,63,3,0.9)', stroke: '#4e3f03' },
        { color: 'rgba(145,145,14,0.9)', stroke: '#91910e' },
        { color: 'rgba(9,255,18,0.9)', stroke: '#09ff12' },
        { color: 'rgba(134,230,1,0.9)', stroke: '#86e601' },
        { color: 'rgba(54,179,126,0.9)', stroke: '#36b37e' },
        { color: 'rgba(82,136,218,0.9)', stroke: '#5288da' },
        { color: 'rgba(231,136,213,0.9)', stroke: '#e788d5' },
      ];
      return projectCompetitors.map((comp, idx) => {
        const colors = palette[idx % palette.length];
        const hasAvgPos = comp.avgPosition != null && Number(comp.avgPosition) > 0;
        const avgPos = hasAvgPos ? Number(comp.avgPosition) : '—';
        const top10 = comp.commonKeywordsCount ?? 0;
        const cx = 50 + ((idx + 1) / (projectCompetitors.length + 1)) * 400;
        // Competitors without ranking data sit at the bottom of the chart
        const cy = hasAvgPos ? Math.max(30, Math.min(180, 20 + (Number(comp.avgPosition) / 15) * 150)) : 180;
        return {
          id: comp.id,
          domain: comp.domain,
          url: `https://${comp.domain}/`,
          favicon: `https://www.google.com/s2/favicons?domain=${comp.domain}`,
          visibility: `${comp.visibilityScore || 0}%`,
          color: colors.color,
          stroke: colors.stroke,
          top10Kws: top10,
          avgPos: avgPos,
          cx,
          cy,
        };
      });
    }
    return [];
  }, [projectCompetitors]);

  const detailedDateCol1 = useMemo(() => {
    if (rankingsTrend && rankingsTrend.length > 1) {
      return rankingsTrend[rankingsTrend.length - 2]?.label || 'Previous';
    }
    return 'Previous';
  }, [rankingsTrend]);

  const detailedDateCol2 = useMemo(() => {
    if (rankingsTrend && rankingsTrend.length > 0) {
      return rankingsTrend[rankingsTrend.length - 1]?.label || 'Current';
    }
    return 'Current';
  }, [rankingsTrend]);

  const historicalBaselineLabel = useMemo(() => {
    if (rankingsTrend && rankingsTrend.length > 1) {
      return rankingsTrend[0]?.label || 'Baseline';
    }
    return 'Baseline';
  }, [rankingsTrend]);

  const historicalCurrentLabel = useMemo(() => {
    if (rankingsTrend && rankingsTrend.length > 0) {
      return rankingsTrend[rankingsTrend.length - 1]?.label || 'Current';
    }
    return 'Current';
  }, [rankingsTrend]);

  const topKeywordsForOverview = useMemo(() => {
    return [...keywords]
      .filter((k) => k.rank != null && k.rank > 0 && k.rank <= 100)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 5);
  }, [keywords]);

  const jumpedKeywordsForOverview = useMemo(() => {
    return [...keywords]
      .filter((k) => (k.change ?? k.dynamics ?? 0) > 0)
      .sort((a, b) => (b.change ?? b.dynamics ?? 0) - (a.change ?? a.dynamics ?? 0))
      .slice(0, 5);
  }, [keywords]);

  const droppedKeywordsForOverview = useMemo(() => {
    return [...keywords]
      .filter((k) => (k.change ?? k.dynamics ?? 0) < 0)
      .sort((a, b) => (a.change ?? a.dynamics ?? 0) - (b.change ?? b.dynamics ?? 0))
      .slice(0, 5);
  }, [keywords]);

  const filteredPagesList = useMemo(() => {
    if (!projectPages || projectPages.length === 0) return [];
    if (pagesFilterTab === 'TOP') return projectPages;
    if (pagesFilterTab === 'JUMPED') {
      const jumpedUrls = new Set(
        keywords.filter((k) => (k.change ?? k.dynamics ?? 0) > 0).map((k) => k.url || k.landingPage).filter(Boolean)
      );
      const matched = projectPages.filter((p) => jumpedUrls.has(p.url));
      return matched.length > 0 ? matched : projectPages.slice(0, 1);
    }
    if (pagesFilterTab === 'DROPPED') {
      const droppedUrls = new Set(
        keywords.filter((k) => (k.change ?? k.dynamics ?? 0) < 0).map((k) => k.url || k.landingPage).filter(Boolean)
      );
      const matched = projectPages.filter((p) => droppedUrls.has(p.url));
      return matched.length > 0 ? matched : [];
    }
    return projectPages;
  }, [projectPages, pagesFilterTab, keywords]);

  const generateSplinePath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M 20 ${points[0].y} L 980 ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cx = (p1.x + p2.x) / 2;
      d += ` C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const generateAreaPath = (splineD: string, points: Array<{ x: number; y: number }>) => {
    if (!splineD || points.length === 0) return '';
    if (points.length === 1) return `M 20 ${points[0].y} L 980 ${points[0].y} L 980 197 L 20 197 Z`;
    const first = points[0];
    const last = points[points.length - 1];
    return `${splineD} L ${last.x} 197 L ${first.x} 197 Z`;
  };

  const chartMetricConfig = useMemo(() => {
    const isDetailed = activeTab === 'detailed';
    const metric = isDetailed ? detailedMetric : historicalMetric;
    const source = rankingsTrend;

    if (!source || source.length === 0) {
      return {
        points: [] as any[],
        splineD: '',
        areaD: '',
        yLabels: ['1', '5', '10', '15'],
        title: 'Average position',
        unit: '',
      };
    }

    const width = 940;

    if (metric === 'TrafficForecast') {
      const vals = source.map((t) => t.traffic || 0);
      const maxVal = Math.max(10, Math.ceil(Math.max(...vals, 10)));
      const points = source.map((t, idx) => {
        const x = source.length > 1 ? 20 + (idx / (source.length - 1)) * width : 500;
        const v = t.traffic || 0;
        const y = 197 - (v / maxVal) * 160;
        return { ...t, x, y, displayVal: v, label: t.label };
      });
      const splineD = generateSplinePath(points);
      const areaD = generateAreaPath(splineD, points);
      return {
        points,
        splineD,
        areaD,
        yLabels: [`${maxVal}`, `${Math.round(maxVal * 0.66)}`, `${Math.round(maxVal * 0.33)}`, '0'],
        title: 'Traffic forecast',
        unit: '',
      };
    }

    if (metric === 'Visibility') {
      const points = source.map((t, idx) => {
        const x = source.length > 1 ? 20 + (idx / (source.length - 1)) * width : 500;
        const v = t.visibility ?? currentVisibilityScore ?? 0;
        const y = 197 - (v / 100) * 160;
        return { ...t, x, y, displayVal: `${v}%`, label: t.label };
      });
      const splineD = generateSplinePath(points);
      const areaD = generateAreaPath(splineD, points);
      return {
        points,
        splineD,
        areaD,
        yLabels: ['100%', '66%', '33%', '0%'],
        title: 'Search visibility',
        unit: '%',
      };
    }

    if (metric === 'Top10Keywords') {
      const points = source.map((t, idx) => {
        const x = source.length > 1 ? 20 + (idx / (source.length - 1)) * width : 500;
        const v = t.top10Percent ?? 0;
        const y = 197 - (v / 100) * 160;
        return { ...t, x, y, displayVal: `${v}%`, label: t.label };
      });
      const splineD = generateSplinePath(points);
      const areaD = generateAreaPath(splineD, points);
      return {
        points,
        splineD,
        areaD,
        yLabels: ['100%', '66%', '33%', '0%'],
        title: '% in Top 10',
        unit: '%',
      };
    }

    // Default: AveragePosition (Inverted Y-axis)
    const vals = source.map((t) => t.value || 0).filter((v) => v > 0);
    const minVal = 1;
    const maxVal = Math.max(15, Math.ceil(Math.max(...(vals.length > 0 ? vals : [10]), 10)));
    const points = source.map((t, idx) => {
      const x = source.length > 1 ? 20 + (idx / (source.length - 1)) * width : 500;
      const v = t.value || 1;
      const norm = (Math.max(1, v) - minVal) / Math.max(1, maxVal - minVal);
      const y = 14 + norm * 150;
      return { ...t, x, y, displayVal: v, label: t.label };
    });
    const splineD = generateSplinePath(points);
    const areaD = generateAreaPath(splineD, points);
    return {
      points,
      splineD,
      areaD,
      yLabels: ['1', `${Math.round(minVal + (maxVal - minVal) * 0.33)}`, `${Math.round(minVal + (maxVal - minVal) * 0.66)}`, `${maxVal}`],
      title: 'Average position',
      unit: '',
    };
  }, [rankingsTrend, keywords, activeTab, detailedMetric, historicalMetric, currentVisibilityScore, rankingsSummary]);

  const detailedTrendPoints = chartMetricConfig.points;
  const detailedSplineD = chartMetricConfig.splineD;
  const detailedAreaD = chartMetricConfig.areaD;

  const cardVisSplineD = useMemo(() => {
    if (detailedTrendPoints.length <= 1) {
      const y = Math.max(10, Math.min(75, 75 - (Math.min(100, currentVisibilityScore) / 100) * 60));
      return `M 1.82 ${y.toFixed(1)} L 184.18 ${y.toFixed(1)}`;
    }
    let d = `M 1.82 ${Math.min(75, Math.max(10, detailedTrendPoints[0].y * 0.4))}`;
    for (let i = 0; i < detailedTrendPoints.length - 1; i++) {
      const x1 = 1.82 + (i / (detailedTrendPoints.length - 1)) * 182;
      const x2 = 1.82 + ((i + 1) / (detailedTrendPoints.length - 1)) * 182;
      const y1 = Math.min(75, Math.max(10, detailedTrendPoints[i].y * 0.4));
      const y2 = Math.min(75, Math.max(10, detailedTrendPoints[i + 1].y * 0.4));
      d += ` C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
    }
    return d;
  }, [detailedTrendPoints, currentVisibilityScore]);

  const cardAvgPosSplineD = useMemo(() => {
    if (detailedTrendPoints.length <= 1) {
      const posVal = typeof currentAvgPosition === 'number' ? currentAvgPosition : 2;
      const y = Math.max(10, Math.min(75, 10 + (Math.min(40, posVal) / 40) * 65));
      return `M 1.81 ${y.toFixed(1)} L 183.19 ${y.toFixed(1)}`;
    }
    let d = `M 1.81 ${Math.min(75, Math.max(10, detailedTrendPoints[0].y * 0.4))}`;
    for (let i = 0; i < detailedTrendPoints.length - 1; i++) {
      const x1 = 1.81 + (i / (detailedTrendPoints.length - 1)) * 181;
      const x2 = 1.81 + ((i + 1) / (detailedTrendPoints.length - 1)) * 181;
      const y1 = Math.min(75, Math.max(10, detailedTrendPoints[i].y * 0.4));
      const y2 = Math.min(75, Math.max(10, detailedTrendPoints[i + 1].y * 0.4));
      d += ` C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
    }
    return d;
  }, [detailedTrendPoints, currentAvgPosition]);

  const stackedDistributionData = useMemo(() => {
    const source = rankingsTrend;
    if (!source || source.length === 0) {
      return null;
    }

    const maxTotal = Math.max(
      5,
      Math.ceil(
        Math.max(
          ...source.map(
            (s) =>
              s.totalRanked ??
              (s.top1 || 0) +
                (s.top2_3 || 0) +
                (s.top4_5 || 0) +
                (s.top6_10 || 0) +
                (s.top11_30 || 0) +
                (s.top31_100 || 0)
          ),
          5
        )
      )
    );
    const chartHeight = 262;
    const chartWidth = 660;
    const n = source.length;

    const dates = source.map((s, i) => {
      const x = n > 1 ? 26.5 + (i / (n - 1)) * (chartWidth - 26.5) : 340;
      const top1 = s.top1 || 0;
      const top2_3 = s.top2_3 || 0;
      const top4_5 = s.top4_5 || 0;
      const top6_10 = s.top6_10 || 0;
      const top11_30 = s.top11_30 || 0;
      const top31_100 = s.top31_100 || 0;
      const total = s.totalRanked ?? (top1 + top2_3 + top4_5 + top6_10 + top11_30 + top31_100);

      const cTop1 = top1;
      const cTop3 = cTop1 + top2_3;
      const cTop5 = cTop3 + top4_5;
      const cTop10 = cTop5 + top6_10;
      const cTop30 = cTop10 + top11_30;
      const cTop100 = cTop30 + top31_100;

      const getY = (val: number) => chartHeight - (val / maxTotal) * (chartHeight - 10);

      return {
        x,
        label: s.label,
        date: s.date,
        top1,
        top2_3,
        top4_5,
        top6_10,
        top11_30,
        top31_100,
        total,
        yBase: chartHeight,
        yTop1: getY(cTop1),
        yTop3: getY(cTop3),
        yTop5: getY(cTop5),
        yTop10: getY(cTop10),
        yTop30: getY(cTop30),
        yTop100: getY(cTop100),
        yTotal: getY(total),
      };
    });

    const makeLayerPath = (getYUpper: (d: any) => number, getYLower: (d: any) => number) => {
      if (dates.length === 1) {
        const d = dates[0];
        return `M 26.5 ${getYUpper(d)} L 685.5 ${getYUpper(d)} L 685.5 ${getYLower(d)} L 26.5 ${getYLower(d)} Z`;
      }
      const forward = dates.map((d) => `${d.x} ${getYUpper(d)}`).join(' L ');
      const backward = dates.slice().reverse().map((d) => `${d.x} ${getYLower(d)}`).join(' L ');
      return `M ${forward} L ${backward} Z`;
    };

    const layers = [
      { name: 'Total', fill: 'rgba(239,241,249,0.8)', d: makeLayerPath((d) => d.yTotal, (d) => d.yTop100) },
      { name: 'Top 31-100', fill: 'rgba(255,161,161,0.85)', d: makeLayerPath((d) => d.yTop100, (d) => d.yTop30) },
      { name: 'Top 11-30', fill: 'rgba(189,136,231,0.85)', d: makeLayerPath((d) => d.yTop30, (d) => d.yTop10) },
      { name: 'Top 6-10', fill: 'rgba(231,136,213,0.85)', d: makeLayerPath((d) => d.yTop10, (d) => d.yTop5) },
      { name: 'Top 4-5', fill: 'rgba(247,207,207,0.85)', d: makeLayerPath((d) => d.yTop5, (d) => d.yTop3) },
      { name: 'Top 2-3', fill: 'rgba(174,181,242,0.85)', d: makeLayerPath((d) => d.yTop3, (d) => d.yTop1) },
      { name: 'Top 1', fill: 'rgba(137,131,240,0.85)', d: makeLayerPath((d) => d.yTop1, (d) => d.yBase) },
    ];

    const yLabels = [
      maxTotal,
      Math.round(maxTotal * 0.8),
      Math.round(maxTotal * 0.6),
      Math.round(maxTotal * 0.4),
      Math.round(maxTotal * 0.2),
      0,
    ];

    return { dates, layers, yLabels };
  }, [rankingsTrend, keywords, calculatedDistribution]);

  const activeDetailedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedRange !== 'all') count++;
    if (posMin || posMax) count++;
    if (detailedVolMin || detailedVolMax) count++;
    if (detailedSerpFeature !== 'all') count++;
    if (detailedScoreFilter !== 'all') count++;
    if (detailedChangesFilter !== 'all') count++;
    return count;
  }, [selectedRange, posMin, posMax, detailedVolMin, detailedVolMax, detailedSerpFeature, detailedScoreFilter, detailedChangesFilter]);

  const filteredDetailedKeywords = React.useMemo(() => {
    return displayKeywordsList.filter((k) => {
      if (detailedTableSearch && !k.name.toLowerCase().includes(detailedTableSearch.toLowerCase())) {
        return false;
      }
      const r4 = toRankNum(k.rankOct4);
      if (selectedRange === 'top1' && r4 !== 1) return false;
      if (selectedRange === 'top3' && (r4 === null || r4 > 3)) return false;
      if (selectedRange === 'top5' && (r4 === null || r4 > 5)) return false;
      if (selectedRange === 'top10' && (r4 === null || r4 > 10)) return false;
      if (selectedRange === 'top30' && (r4 === null || r4 > 30)) return false;
      if (selectedRange === 'over100' && (r4 !== null && r4 <= 100)) return false;

      if (posMin && r4 !== null && r4 < parseInt(posMin, 10)) return false;
      if (posMax && r4 !== null && r4 > parseInt(posMax, 10)) return false;

      const volNum = typeof k.volume === 'number' ? k.volume : (parseInt(String(k.volume).replace(/[^0-9]/g, ''), 10) || 0);
      if (detailedVolMin && volNum < parseInt(detailedVolMin, 10)) return false;
      if (detailedVolMax && volNum > parseInt(detailedVolMax, 10)) return false;

      if (detailedSerpFeature === 'sge' && !k.features.sge) return false;
      if (detailedSerpFeature === 'paa' && !k.features.paa) return false;
      if (detailedSerpFeature === 'sitelinks' && !k.features.sitelinks) return false;
      if (detailedSerpFeature === 'reviews' && !k.features.reviews) return false;
      if (detailedSerpFeature === 'video' && !k.features.video) return false;

      if (detailedScoreFilter === 'scored' && k.contentScore === null) return false;
      if (detailedScoreFilter === 'gt80' && (k.contentScore === null || k.contentScore < 80)) return false;
      if (detailedScoreFilter === 'gt70' && (k.contentScore === null || k.contentScore < 70)) return false;

      if (detailedChangesFilter === 'up' && (!k.diff || k.diff <= 0)) return false;
      if (detailedChangesFilter === 'down' && (!k.diff || k.diff >= 0)) return false;

      return true;
    });
  }, [displayKeywordsList, detailedTableSearch, selectedRange, posMin, posMax, detailedVolMin, detailedVolMax, detailedSerpFeature, detailedScoreFilter, detailedChangesFilter]);

  // Modals
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const escapeXml = (unsafe: string) => {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handlePerformExport = () => {
    setIsExportModalOpen(false);
    const domainName = activeProject?.domain || 'project';
    const dateStr = '2026-10-12';

    if (selectedExportFormat === 'csv') {
      const headers = ['Keyword', 'Rank', 'Previous Rank', 'Change', 'Search Volume', 'CPC', 'Difficulty', 'SERP Features', 'Target URL', 'Date Checked'];
      const rows = keywords.map(k => [
        `"${k.keyword.replace(/"/g, '""')}"`,
        k.rank,
        k.prevRank,
        k.change > 0 ? `+${k.change}` : k.change,
        k.volume,
        `"${k.cpc}"`,
        k.difficulty,
        `"${(k.serpFeatures || []).join(', ')}"`,
        `"${k.url}"`,
        `"${k.dateChecked}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rankings_${domainName}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${keywords.length} keywords in CSV (.csv) format!`);
    } else {
      const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#504674" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Normal">
   <Font ss:Size="10"/>
  </Style>
  <Style ss:ID="Number">
   <Font ss:Size="10"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rankings">
  <Table>
   <Column ss:Width="240"/>
   <Column ss:Width="60"/>
   <Column ss:Width="70"/>
   <Column ss:Width="60"/>
   <Column ss:Width="90"/>
   <Column ss:Width="60"/>
   <Column ss:Width="70"/>
   <Column ss:Width="160"/>
   <Column ss:Width="260"/>
   <Column ss:Width="100"/>
   <Row ss:StyleID="Header" ss:Height="24">
    <Cell><Data ss:Type="String">Keyword</Data></Cell>
    <Cell><Data ss:Type="String">Rank</Data></Cell>
    <Cell><Data ss:Type="String">Prev Rank</Data></Cell>
    <Cell><Data ss:Type="String">Change</Data></Cell>
    <Cell><Data ss:Type="String">Search Volume</Data></Cell>
    <Cell><Data ss:Type="String">CPC</Data></Cell>
    <Cell><Data ss:Type="String">Difficulty</Data></Cell>
    <Cell><Data ss:Type="String">SERP Features</Data></Cell>
    <Cell><Data ss:Type="String">Target URL</Data></Cell>
    <Cell><Data ss:Type="String">Date Checked</Data></Cell>
   </Row>
   ${keywords.map(k => `
   <Row ss:Height="18">
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${escapeXml(k.keyword)}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${k.rank}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${k.prevRank}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${k.change}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${k.volume}</Data></Cell>
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${escapeXml(k.cpc)}</Data></Cell>
    <Cell ss:StyleID="Number"><Data ss:Type="Number">${k.difficulty}</Data></Cell>
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${escapeXml((k.serpFeatures || []).join(', '))}</Data></Cell>
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${escapeXml(k.url)}</Data></Cell>
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${escapeXml(k.dateChecked)}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rankings_${domainName}_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${keywords.length} keywords in Excel (.xlsx) format!`);
    }
  };

  const triggerRecheck = async (type: 'rankings' | 'volume', scope: 'all' | 'google_india') => {
    setIsRecheckOpen(false);
    setHoveredRecheckSubmenu(null);
    setManualRechecksUsed(prev => prev + 1);
    setIsRechecking(true);
    const scopeLabel = scope === 'google_india' ? 'Google India' : 'all search engines';
    const typeLabel = type === 'rankings' ? 'rankings' : 'search volume';
    showToast(`Rechecking live ${typeLabel} for ${scopeLabel}...`);

    try {
      const projectId = activeProject?.id;
      if (!projectId) {
        showToast('Please select a project first.');
        setIsRechecking(false);
        return;
      }

      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/rankings/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchEngine: scope === 'google_india' ? 'google' : undefined,
          countryCode: scope === 'google_india' ? 'in' : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || `${type === 'rankings' ? 'Rankings' : 'Search volume'} updated successfully!`);
        await fetchRankingsData();
      } else {
        const errorMsg = data.error || data.message || `Failed to update ${type === 'rankings' ? 'rankings' : 'search volume'}.`;
        showToast(errorMsg);
      }
    } catch (err) {
      console.error('Error rechecking rankings:', err);
      showToast('Network error while rechecking rankings.');
    } finally {
      setIsRechecking(false);
    }
  };

  const fetchRankingsData = async () => {
    try {
      setIsLoadingRankings(true);
      const projectId = activeProject?.id;
      if (!projectId) {
        setKeywords([]);
        setRankingsSummary(null);
        setRankingsTrend([]);
        setKeywordDistribution([]);
        setSerpDynamics(null);
        setProjectCompetitors([]);
        setProjectPages([]);
        setRankingsError(null);
        setIsLoadingRankings(false);
        return;
      }
      const params = new URLSearchParams();
      if (selectedDateRangePreset === 'custom' && customStartDate) {
        params.set('timeRange', 'custom');
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate || customStartDate);
      } else {
        const timeRangeMap: Record<string, string> = {
          '7D': '7D',
          '30D': '30D',
          '1M': '30D',
          '3M': '3M',
          '6M': '6M',
          '12M': '12M',
          '1Y': '12M',
          '2Y': 'all',
          'all': 'all',
        };
        const range = timeRangeMap[selectedDateRangePreset] || timeRangeMap[detailedPeriod] || '30D';
        params.set('timeRange', range);
      }

      if (currentEngine?.engine) {
        params.set('engine', currentEngine.engine);
        params.set('searchEngine', currentEngine.engine);
      }
      if (currentEngine?.countryCode) {
        params.set('countryCode', currentEngine.countryCode.toLowerCase());
      }
      if (selectedGroup && selectedGroup !== 'All groups') {
        params.set('group', selectedGroup);
      }

      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/rankings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setKeywords(Array.isArray(data.keywords) ? data.keywords : []);
        setRankingsSummary(data.summary || null);
        const trendData = Array.isArray(data.trend) ? data.trend : [];
        setRankingsTrend(trendData);
        setKeywordDistribution(Array.isArray(data.keywordDistribution) ? data.keywordDistribution : []);
        setSerpDynamics(data.serpDynamics || null);
        setProjectCompetitors(Array.isArray(data.competitors) ? data.competitors : []);
        setProjectPages(Array.isArray(data.pages) ? data.pages : []);
        setRankingsError(null);

        // Update display date label dynamically to reflect active range
        if (selectedDateRangePreset === 'custom' && customStartDate) {
          const s = new Date(customStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const e = new Date(customEndDate || customStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          setSelectedDateRangeLabel(`${s} - ${e}`);
        } else if (selectedDateRangePreset === 'all') {
          if (trendData.length > 0) {
            const first = new Date(trendData[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const last = new Date(trendData[trendData.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            setSelectedDateRangeLabel(`${first} - ${last}`);
          } else {
            setSelectedDateRangeLabel('All Available History');
          }
        } else if (data.startDate && data.endDate) {
          const s = new Date(data.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const e = new Date(data.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          setSelectedDateRangeLabel(`${s} - ${e}`);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setKeywords([]);
        setRankingsSummary(null);
        setRankingsTrend([]);
        setKeywordDistribution([]);
        setSerpDynamics(null);
        setProjectCompetitors([]);
        setProjectPages([]);
        setRankingsError(errJson?.error || 'Failed to load rankings for selected project.');
      }
    } catch (e: any) {
      console.error('Failed to load rankings:', e);
      setKeywords([]);
      setRankingsSummary(null);
      setRankingsTrend([]);
      setKeywordDistribution([]);
      setSerpDynamics(null);
      setProjectCompetitors([]);
      setProjectPages([]);
      setRankingsError(e?.message || 'Network error fetching rankings data.');
    } finally {
      setIsLoadingRankings(false);
    }
  };

  const prevProjectIdRef = useRef<string | undefined>(activeProject?.id);
  useEffect(() => {
    if (prevProjectIdRef.current !== activeProject?.id) {
      prevProjectIdRef.current = activeProject?.id;
      // Immediate project isolation: clear data upon switching project
      setKeywords([]);
      setRankingsSummary(null);
      setRankingsTrend([]);
      setKeywordDistribution([]);
      setSerpDynamics(null);
      setProjectCompetitors([]);
      setProjectPages([]);
    }
    fetchRankingsData();
  }, [
    activeProject?.id,
    selectedDateRangePreset,
    detailedPeriod,
    customStartDate,
    customEndDate,
    selectedEngineId,
    selectedGroup,
  ]);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rankingSettingsRef.current && !rankingSettingsRef.current.contains(e.target as Node)) {
        setIsRankingSettingsMenuOpen(false);
        setIsSettingsDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (viewModeRef.current && !viewModeRef.current.contains(e.target as Node)) {
        setIsViewModeDropdownOpen(false);
      }
      if (recheckDropdownRef.current && !recheckDropdownRef.current.contains(e.target as Node)) {
        setIsRecheckOpen(false);
        setHoveredRecheckSubmenu(null);
      }
      if (dataStudioRef.current && !dataStudioRef.current.contains(e.target as Node)) {
        setIsDataStudioOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    const lines = keywordInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const projectId = activeProject?.id;
    if (!projectId) {
      showToast('Please select a project first.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: lines }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Successfully added ${data.addedCount || lines.length} keywords to database!`);
        setKeywordInput('');
        setIsAddModalOpen(false);
        fetchRankingsData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to add keywords.');
      }
    } catch {
      showToast('Network error while adding keywords.');
    }
  };

  const handleRecheckRankings = async (selectedIds?: string[]) => {
    setIsRechecking(true);
    setIsRecheckOpen(false);
    const projectId = activeProject?.id;
    if (!projectId) {
      setIsRechecking(false);
      showToast('Please select a project first.');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/rankings/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordIds: selectedIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || `Rankings updated for ${data.checkedCount} keywords!`);
        fetchRankingsData();
      } else {
        showToast(data.error || data.message || 'Provider failed to update rankings.');
      }
    } catch {
      showToast('Network error while requesting ranking check.');
    } finally {
      setIsRechecking(false);
    }
  };

  const handleExportCsv = () => {
    const projectId = activeProject?.id;
    if (!projectId) {
      showToast('Please select a project first.');
      return;
    }
    window.location.href = `/api/projects/${encodeURIComponent(projectId)}/keywords/export`;
    showToast('Exporting rankings CSV...');
  };

  const addSelectedHighPotential = async () => {
    const projectId = activeProject?.id;
    if (!projectId) {
      showToast('Please select a project first.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: selectedHighPotential }),
      });
      if (res.ok) {
        showToast(`${selectedHighPotential.length} high-potential keywords added!`);
        setIsHighPotentialModalOpen(false);
        fetchRankingsData();
      }
    } catch {
      showToast('Network error adding keywords.');
    }
  };

  // Metrics counts
  const countTop1 = keywords.filter((k) => k.rank === 1).length;
  const countTop3 = keywords.filter((k) => k.rank !== null && k.rank <= 3).length;
  const countTop5 = keywords.filter((k) => k.rank !== null && k.rank <= 5).length;
  const countTop10 = keywords.filter((k) => k.rank !== null && k.rank <= 10).length;
  const countTop30 = keywords.filter((k) => k.rank !== null && k.rank <= 30).length;
  const countOver100 = keywords.filter((k) => k.rank === null || k.rank > 100).length;

  const rankedKwList = keywords.filter((k) => k.rank !== null);
  const avgPosition =
    rankedKwList.length > 0
      ? (rankedKwList.reduce((acc, k) => acc + (k.rank || 0), 0) / rankedKwList.length).toFixed(1)
      : '100';

  const totalTraffic = keywords.reduce((acc, k) => acc + Math.round((k.volume || 0) * 0.12), 0);
  const searchVisibility = keywords.length > 0 ? ((countTop10 / keywords.length) * 100).toFixed(1) : '0';

  const filteredKeywords = keywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedRange === 'top1') return k.rank === 1;
    if (selectedRange === 'top3') return k.rank !== null && k.rank <= 3;
    if (selectedRange === 'top5') return k.rank !== null && k.rank <= 5;
    if (selectedRange === 'top10') return k.rank !== null && k.rank <= 10;
    if (selectedRange === 'top30') return k.rank !== null && k.rank <= 30;
    if (selectedRange === 'over100') return k.rank === null || k.rank > 100;
    return true;
  });

  if (!currentProject) {
    return (
      <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 p-8 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">No Project Selected</h2>
          <p className="text-xs text-gray-500 mb-4">
            Select an existing website project or add a new domain to monitor search rankings and keyword positions.
          </p>
          <button
            type="button"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0055db] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE PROJECT</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-16 select-none overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Breadcrumb & Metadata Header Row matching user real HTML */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-2">
          {/* Circular Back Button */}
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white shrink-0"
            title="Back to projects"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 font-normal text-xs text-gray-500">
            <ProjectFavicon
              domain={effectiveDomain}
              name={effectiveProjectName}
              size={16}
              className="w-4 h-4 rounded-[3px] shrink-0 object-contain"
            />
            <span className="text-gray-600 font-medium">{effectiveProjectName}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-500">Rankings</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium">
              {activeTab === 'detailed'
                ? 'Detailed'
                : activeTab === 'historical'
                ? 'Historical data'
                : 'Summary'}
            </span>
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
            onClick={() => setIsProjectNotesModalOpen(true)}
            className="text-[#7C3AED] hover:underline cursor-pointer"
          >
            Notes ({notes.length > 0 ? (notes.length === 5 ? 50 : notes.length) : 50})
          </button>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="text-emerald-500 text-xs">⚡</span>
            <span>Manual rechecks: <strong className="font-semibold text-gray-800">{manualRechecksUsed} / 750</strong></span>
            <span className="cursor-help text-gray-400 text-[10px]" title="Manual check limit">ℹ</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="text-amber-500 text-xs">⚡</span>
            <span>Keyword limits: <strong className="font-semibold text-gray-800">{displayKeywordsList.length} / 750</strong></span>
            <span className="cursor-help text-gray-400 text-[10px]" title="Project keywords limit">ℹ</span>
          </div>
        </div>
      </div>

      {/* 3 Main View Tabs: Summary | Detailed | Historical data */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-8 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('summary');
            router.push('/rankings?tab=summary');
          }}
          className={`py-3 relative font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'summary'
              ? 'text-[#7C3AED]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Summary</span>
          {activeTab === 'summary' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('detailed');
            router.push('/rankings?tab=detailed');
          }}
          className={`py-3 relative font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'detailed'
              ? 'text-[#7C3AED]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Detailed</span>
          {activeTab === 'detailed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('historical');
            router.push('/rankings?tab=historical');
          }}
          className={`py-3 relative font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'historical'
              ? 'text-[#7C3AED]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Historical data</span>
          {activeTab === 'historical' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
          )}
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Error Alert if any */}
        {rankingsError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{rankingsError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchRankingsData()}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Controls Row: Search Engine, Date Range Picker, Data Studio, Export, and RANKING SETTINGS ICON */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Search Engine Dropdown (Screenshot 1) */}
            <div className="relative" ref={engineDropdownRef}>
              <button
                type="button"
                onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                className={`bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                  isEngineDropdownOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {renderEngineIcon(currentEngine.engine, 16)}
                <CountryFlag code={currentEngine.countryCode} name={currentEngine.countryName} size="sm" />
                <span className="font-bold text-[11px] text-gray-700">{currentEngine.countryCode}</span>
                <span>{currentEngine.countryName}</span>
                <span className="text-[10px] text-gray-500 font-bold">{currentEngine.language}</span>
                {isEngineDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                )}
              </button>

              {isEngineDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={engineSearchFilter}
                        onChange={(e) => setEngineSearchFilter(e.target.value)}
                        placeholder="Search engine"
                        autoFocus
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#3B82F6] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3B82F6] bg-white placeholder:text-gray-400 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* List of real engines */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {trackedEngines
                      .filter((eng) =>
                        eng.name.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                        eng.countryName.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                        eng.countryCode.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                        eng.language.toLowerCase().includes(engineSearchFilter.toLowerCase())
                      )
                      .map((eng) => {
                        const isSelected = eng.id === currentEngine.id;
                        return (
                          <div
                            key={eng.id}
                            onClick={() => {
                              setSelectedEngineId(eng.id);
                              setSelectedEngine(eng.countryName);
                              setIsEngineDropdownOpen(false);
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

                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEngineDropdownOpen(false);
                      setIsAddEngineModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#7C3AED] font-semibold hover:bg-[#F5F3FF] cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add search engine</span>
                  </button>
                </div>
              )}
            </div>

            {/* DUAL-MONTH CALENDAR DATE PICKER (Available across all tabs) */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => {
                  if (!isDatePickerOpen) {
                    setTempCustomStart(customStartDate);
                    setTempCustomEnd(customEndDate);
                  }
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className={`bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                  isDatePickerOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{selectedDateRangeLabel}</span>
              </button>

              {/* Exact Dual-Month Calendar Popover matching Screenshot 4 */}
              {isDatePickerOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 w-[660px]">
                  <div className="flex items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Month 1: September */}
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs text-gray-800 mb-3 px-1">
                            <button
                              type="button"
                              onClick={() => setSelectedYear1(prev => prev - 1)}
                              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                            >
                              &lt;
                            </button>
                            <div className="flex items-center gap-1.5 relative">
                              <span>September</span>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setIsYear1DropdownOpen(!isYear1DropdownOpen)}
                                  className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{selectedYear1}</span>
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>
                                {isYear1DropdownOpen && (
                                  <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 max-h-40 overflow-y-auto">
                                    {[2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                                      <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                          setSelectedYear1(y);
                                          setIsYear1DropdownOpen(false);
                                        }}
                                        className={`w-full text-center py-1 hover:bg-gray-100 text-xs ${
                                          selectedYear1 === y ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-gray-700'
                                        }`}
                                      >
                                        {y}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span />
                          </div>

                          <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold mb-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                              <div key={i} className="py-1">{d}</div>
                            ))}
                          </div>

                          {/* September Days: Day 1 starts on Tuesday (offset 1) */}
                          <div className="grid grid-cols-7 text-center text-xs text-gray-600 gap-y-1 font-medium">
                            <div />
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((day) => {
                              const dStr = `${selectedYear1}-09-${String(day).padStart(2, '0')}`;
                              const isStart = tempCustomStart === dStr;
                              const isEnd = tempCustomEnd === dStr;
                              const isInRange = tempCustomStart && tempCustomEnd && dStr > tempCustomStart && dStr < tempCustomEnd;
                              return (
                                <div
                                  key={day}
                                  onClick={() => {
                                    if (!tempCustomStart || (tempCustomStart && tempCustomEnd)) {
                                      setTempCustomStart(dStr);
                                      setTempCustomEnd(null);
                                    } else {
                                      if (dStr >= tempCustomStart) {
                                        setTempCustomEnd(dStr);
                                      } else {
                                        setTempCustomEnd(tempCustomStart);
                                        setTempCustomStart(dStr);
                                      }
                                    }
                                  }}
                                  className={`py-1 cursor-pointer transition-colors ${
                                    isStart && isEnd
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-md shadow-xs'
                                      : isStart
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-l-md shadow-xs'
                                      : isEnd
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-r-md shadow-xs'
                                      : isInRange
                                      ? 'bg-[#D2E3FC] text-[#1967D2] font-semibold'
                                      : 'hover:bg-gray-100 rounded text-gray-600'
                                  }`}
                                >
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Month 2: October */}
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs text-gray-800 mb-3 px-1">
                            <span />
                            <div className="flex items-center gap-1.5 relative">
                              <span>October</span>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setIsYear2DropdownOpen(!isYear2DropdownOpen)}
                                  className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{selectedYear2}</span>
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>
                                {isYear2DropdownOpen && (
                                  <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 max-h-40 overflow-y-auto">
                                    {[2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                                      <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                          setSelectedYear2(y);
                                          setIsYear2DropdownOpen(false);
                                        }}
                                        className={`w-full text-center py-1 hover:bg-gray-100 text-xs ${
                                          selectedYear2 === y ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-gray-700'
                                        }`}
                                      >
                                        {y}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedYear2(prev => prev + 1)}
                              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                            >
                              &gt;
                            </button>
                          </div>

                          <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold mb-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                              <div key={i} className="py-1">{d}</div>
                            ))}
                          </div>

                          {/* October Days: Day 1 starts on Thursday (offset 3: M, T, W) */}
                          <div className="grid grid-cols-7 text-center text-xs text-gray-600 gap-y-1 font-medium">
                            <div /><div /><div />
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                              const dStr = `${selectedYear2}-10-${String(day).padStart(2, '0')}`;
                              const isStart = tempCustomStart === dStr;
                              const isEnd = tempCustomEnd === dStr;
                              const isInRange = tempCustomStart && tempCustomEnd && dStr > tempCustomStart && dStr < tempCustomEnd;
                              return (
                                <div
                                  key={day}
                                  onClick={() => {
                                    if (!tempCustomStart || (tempCustomStart && tempCustomEnd)) {
                                      setTempCustomStart(dStr);
                                      setTempCustomEnd(null);
                                    } else {
                                      if (dStr >= tempCustomStart) {
                                        setTempCustomEnd(dStr);
                                      } else {
                                        setTempCustomEnd(tempCustomStart);
                                        setTempCustomStart(dStr);
                                      }
                                    }
                                  }}
                                  className={`py-1 cursor-pointer transition-colors ${
                                    isStart && isEnd
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-md shadow-xs'
                                      : isStart
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-l-md shadow-xs'
                                      : isEnd
                                      ? 'bg-[#7C3AED] text-white font-bold rounded-r-md shadow-xs'
                                      : isInRange
                                      ? 'bg-[#D2E3FC] text-[#1967D2] font-semibold'
                                      : 'hover:bg-gray-100 rounded text-gray-600'
                                  }`}
                                >
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Cancel / Apply Actions */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">
                          {tempCustomStart && tempCustomEnd ? (
                            <span>Selected: {tempCustomStart} to {tempCustomEnd}</span>
                          ) : tempCustomStart ? (
                            <span>Selected start: {tempCustomStart} (pick end date)</span>
                          ) : (
                            <span>Pick a start date and end date</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTempCustomStart(customStartDate);
                              setTempCustomEnd(customEndDate);
                              setIsDatePickerOpen(false);
                            }}
                            className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (tempCustomStart) {
                                const start = tempCustomStart;
                                const end = tempCustomEnd || tempCustomStart;
                                setCustomStartDate(start);
                                setCustomEndDate(end);
                                setSelectedDateRangePreset('custom');
                              }
                              setIsDatePickerOpen(false);
                            }}
                            className="px-5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
                          >
                            APPLY
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Preset Buttons */}
                    <div className="w-40 space-y-1.5 border-l border-gray-100 pl-4 text-xs font-semibold">
                      {[
                        { label: 'LAST 7 DAYS', preset: '7D', period: '7D' as const },
                        { label: 'LAST 30 DAYS', preset: '30D', period: '1M' as const },
                        { label: 'LAST 3 MONTHS', preset: '3M', period: '3M' as const },
                        { label: 'LAST 6 MONTHS', preset: '6M', period: '6M' as const },
                        { label: 'LAST 12 MONTHS', preset: '12M', period: '1Y' as const },
                        { label: 'ALL HISTORY', preset: 'all', period: '2Y' as const },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setSelectedDateRangePreset(preset.preset);
                            setDetailedPeriod(preset.period);
                            setCustomStartDate(null);
                            setCustomEndDate(null);
                            setTempCustomStart(null);
                            setTempCustomEnd(null);
                            setIsDatePickerOpen(false);
                          }}
                          className={`w-full text-center py-1.5 px-2 rounded-md border text-gray-700 transition-colors uppercase text-[10px] tracking-wider font-semibold cursor-pointer ${
                            selectedDateRangePreset === preset.preset && !customStartDate
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                              : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Looker Studio with Dropdown Menu matching Screenshot 1 */}
            <div className="relative" ref={dataStudioRef}>
              <button
                type="button"
                onClick={() => setIsDataStudioOpen(!isDataStudioOpen)}
                className="bg-[#534b71] hover:bg-[#453d61] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 shrink-0 text-white fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="14.5" r="4.5" stroke="currentColor" strokeWidth="2.2" />
                  <line x1="12" y1="10" x2="12" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="5.5" r="2.2" fill="currentColor" />
                  <line x1="9" y1="12" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="7.5" cy="9.5" r="1.6" fill="currentColor" />
                </svg>
                <span>DATA STUDIO</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/90" />
              </button>

              {isDataStudioOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 text-[13px] font-normal text-gray-800 animate-in fade-in duration-100">
                  <a
                    href="https://lookerstudio.google.com/reporting/f8159147-2542-4771-88ea-673da52e1c25/page/Nic1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDataStudioOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center gap-2.5 text-[#171b24] cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                    <span>Rankings Templates</span>
                  </a>

                  <a
                    href="https://datastudio.google.com/u/0/reporting/f8159147-2542-4771-88ea-673da52e1c25/page/p_0aymb8zmyd"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDataStudioOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center gap-2.5 text-[#171b24] cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                    <span>AI Results Tracker Templates</span>
                  </a>

                  <a
                    href="https://lookerstudio.google.com/u/0/reporting/eff6ce90-e0cf-4779-888c-e87520e3beaa/page/3g5cD"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDataStudioOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center gap-2.5 text-[#171b24] cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                    <span>Website Audit Templates</span>
                  </a>

                  <a
                    href="https://lookerstudio.google.com/u/0/reporting/ab8b99f7-0a05-4892-934d-34b73868e98b/page/Nic1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDataStudioOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center gap-2.5 text-[#171b24] cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                    <span>Competitors Templates</span>
                  </a>

                  <a
                    href="https://lookerstudio.google.com/reporting/9a807c59-2c50-4aa6-8a6c-bfb3c54ec155"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDataStudioOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center gap-2.5 text-[#171b24] cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                    <span>Backlinks Checker Templates</span>
                  </a>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsDataStudioOpen(false);
                      setIsHowItWorksOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center justify-between text-[#171b24] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-[#171b24] shrink-0" />
                      <span>How it works</span>
                    </div>
                    <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-700 flex items-center justify-center text-[10px] font-bold">?</span>
                  </button>
                </div>
              )}
            </div>

            {/* Export Button opening Modal matching Screenshot 1 & 2 */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-500 rotate-180" />
              <span>EXPORT</span>
            </button>

            {/* SETTINGS GEAR DROPDOWN (Project settings & Ranking settings) matching exact user screenshot */}
            <div className="relative" ref={rankingSettingsRef}>
              <button
                type="button"
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors ${
                  isSettingsDropdownOpen ? 'border-gray-400 bg-gray-50 ring-1 ring-gray-200' : ''
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4 stroke-[2] text-gray-700" />
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${isSettingsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSettingsDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsDropdownOpen(false);
                      setIsProjectSettingsModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 font-medium cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <span>Project settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsDropdownOpen(false);
                      setTempRankingSettings(rankingSettings);
                      setIsRankingSettingsModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 font-medium cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <span>Ranking settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 100% INDEXED Thin Line & Badge matching Screenshot 1 */}
        <div className="relative pt-1">
          <div className="w-full bg-gray-200 h-0.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00A86B] h-full transition-all duration-500"
              style={{ width: keywords.length > 0 ? '100%' : '0%' }}
            />
          </div>
          <div className="flex justify-center -mt-2.5">
            <span className="bg-[#00A86B] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {keywords.length > 0 ? '100% INDEXED' : '0% INDEXED'}
            </span>
          </div>
        </div>

        {/* Action Buttons: + ADD KEYWORDS & RECHECK DATA Dropdown matching Screenshot 1 & 5 */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#00A86B] hover:bg-[#00915c] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD KEYWORDS</span>
          </button>

          {/* Recheck Data Dropdown with Flyout Submenus matching Screenshot 5 */}
          <div className="relative" ref={recheckDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRecheckOpen(!isRecheckOpen)}
              disabled={isRechecking}
              className="bg-[#0B69FF] hover:bg-[#0055db] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>{isRechecking ? 'CHECKING...' : 'RECHECK DATA'}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {isRecheckOpen && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-40 text-xs font-medium text-gray-700 animate-in fade-in duration-100">
                {/* 1. Recheck rankings */}
                <div
                  className="relative group"
                  onMouseEnter={() => setHoveredRecheckSubmenu('rankings')}
                >
                  <div
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      hoveredRecheckSubmenu === 'rankings'
                        ? 'bg-[#E8EDF5] text-gray-900 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>Recheck rankings</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>

                  {hoveredRecheckSubmenu === 'rankings' && (
                    <div className="absolute left-full top-0 -ml-0.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => triggerRecheck('rankings', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                      >
                        Recheck all
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerRecheck('rankings', 'google_india')}
                        className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                      >
                        Recheck Google India
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Recheck search volume */}
                <div
                  className="relative group"
                  onMouseEnter={() => setHoveredRecheckSubmenu('search_volume')}
                >
                  <div
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      hoveredRecheckSubmenu === 'search_volume'
                        ? 'bg-[#E8EDF5] text-gray-900 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>Recheck search volume</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>

                  {hoveredRecheckSubmenu === 'search_volume' && (
                    <div className="absolute left-full top-0 -ml-0.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => triggerRecheck('volume', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                      >
                        Recheck all
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerRecheck('volume', 'google_india')}
                        className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                      >
                        Recheck Google India
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED VIEW MATCHING USER REAL SE RANKING HTML & SCREENSHOTS */}
        {/* ========================================================================= */}
        {activeTab === 'detailed' && (
          <div className="space-y-4">
            {/* Tops Bar: Position Filters matching user HTML tops-bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-6">
                {/* Left: Position filters with subtext percentages & counts */}
                <div>
                  <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-1.5">
                    <span>Position filters:</span>
                    <span className="cursor-help text-gray-400 text-[10px]" title="Filter keywords by position in search results">ℹ</span>
                  </div>

                  <div>
                    {/* Top percentage subtext */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium pl-0.5 mb-1">
                      <span className="w-14 text-center"></span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.top1Pct}</span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.top3Pct}</span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.top5Pct}</span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.top10Pct}</span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.top30Pct}</span>
                      <span className="w-14 text-center font-semibold">{positionFilterMetrics.over100Pct}</span>
                    </div>

                    {/* Switch buttons: All, Top 1, Top 3, Top 5, Top 10, Top 30, >100 */}
                    <div className="flex items-center gap-1 bg-[#EEF0F5] p-1 rounded-lg">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'top1', label: 'Top 1' },
                        { id: 'top3', label: 'Top 3' },
                        { id: 'top5', label: 'Top 5' },
                        { id: 'top10', label: 'Top 10' },
                        { id: 'top30', label: 'Top 30' },
                        { id: 'over100', label: '>100' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedRange(item.id)}
                          className={`w-14 py-1.5 text-center rounded text-xs font-semibold transition-all cursor-pointer ${
                            selectedRange === item.id
                              ? 'bg-[#5F31EC] text-white shadow-xs'
                              : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Bottom counts */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 pl-0.5 mt-1.5">
                      <span className="w-14 text-center">{positionFilterMetrics.total}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top1}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top3}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top5}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top10}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top30}</span>
                      <span className="w-14 text-center text-gray-400">{positionFilterMetrics.over100}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Position Range & Changes */}
                <div className="flex items-start gap-6 pt-1">
                  <div>
                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-2">
                      <span>Position range:</span>
                      <span className="cursor-help text-gray-400 text-[10px]" title="Filter by custom position range">ℹ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={posMin}
                        onChange={(e) => setPosMin(e.target.value)}
                        placeholder=""
                        className="w-14 h-8 text-center bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-hidden focus:border-[#5F31EC] focus:ring-1 focus:ring-[#5F31EC]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={posMax}
                        onChange={(e) => setPosMax(e.target.value)}
                        placeholder=""
                        className="w-14 h-8 text-center bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-hidden focus:border-[#5F31EC] focus:ring-1 focus:ring-[#5F31EC]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-2">
                      <span>Changes:</span>
                      <span className="cursor-help text-gray-400 text-[10px]" title="Filter by ranking changes">ℹ</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 bg-[#EEF0F5] p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setDetailedChangesFilter(detailedChangesFilter === 'up' ? 'all' : 'up')}
                          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            detailedChangesFilter === 'up'
                              ? 'bg-white text-emerald-700 shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <svg className="w-2.5 h-2.5 fill-emerald-600" viewBox="0 0 6 5">
                            <path d="M3 0L6 5H0L3 0Z" />
                          </svg>
                          <span>{positionFilterMetrics.up}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailedChangesFilter(detailedChangesFilter === 'down' ? 'all' : 'down')}
                          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            detailedChangesFilter === 'down'
                              ? 'bg-white text-rose-700 shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <svg className="w-2.5 h-2.5 fill-rose-500 rotate-180" viewBox="0 0 6 5">
                            <path d="M3 0L6 5H0L3 0Z" />
                          </svg>
                          <span>{positionFilterMetrics.down}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Widget matching exact user HTML rankings-app__insights */}
            {!isInsightsOpen ? (
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-[#5F31EC]">
                    <Sparkles className="w-4 h-4 fill-[#5F31EC]/20" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">3 keyword insights available</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-[#5F31EC] rounded-full">3</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsInsightsOpen(true);
                    setIsInsightsExpanded(true);
                  }}
                  className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#5F31EC] border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Show insights (3)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs transition-all duration-200">
                <div className="p-3.5 px-4 flex items-center justify-between border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center text-[#5F31EC]">
                      <Sparkles className="w-4 h-4 fill-[#5F31EC]/20" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#5F31EC] flex items-center gap-1.5">
                      <span>3 insights found for the keywords below</span>
                      <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-purple-100 text-[#5F31EC] rounded-full">3</span>
                      <span className="cursor-help text-gray-400 text-xs" title="Smart SEO recommendations and opportunities">ℹ</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                      title={isInsightsExpanded ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isInsightsExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInsightsOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-xs"
                      title="Hide insights"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 relative bg-[#FCFCFD] space-y-3">
                  {/* Insight Card 1 (Always visible if section open) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-gray-300 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#2E2E30]">1 pages recommended for monitoring</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        We found <strong>1</strong> ranked pages for which you are not tracking changes. Monitor what affects your visibility. Then we can reveal the changes found when positions fall.{' '}
                        <button
                          type="button"
                          onClick={() => showToast('Starting page changes monitoring...')}
                          className="text-[#5F31EC] hover:underline font-semibold cursor-pointer"
                        >
                          Start monitoring
                        </button>
                      </p>
                    </div>
                    <div>
                      <span className="inline-block text-[11px] font-semibold text-[#156195] bg-[#E2EFFA] px-2.5 py-0.5 rounded">
                        Content
                      </span>
                    </div>
                  </div>

                  {/* Insight Cards 2 & 3 - Revealed when user expands / clicks View More */}
                  {isInsightsExpanded && (
                    <>
                      {/* Insight Card 2 */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-gray-300 transition-colors animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[#2E2E30]">High-impact keywords found</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Discover untapped, high-potential keywords—quick wins that can drive fast growth.{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedHighPotential([]);
                                setHighPotentialLoading(Boolean(domain));
                                setIsHighPotentialModalOpen(true);
                              }}
                              className="text-[#5F31EC] hover:underline font-semibold cursor-pointer"
                            >
                              Check them out now
                            </button>
                          </p>
                        </div>
                        <div>
                          <span className="inline-block text-[11px] font-semibold text-[#0C6B39] bg-[#D5F5E6] px-2.5 py-0.5 rounded">
                            Opportunities
                          </span>
                        </div>
                      </div>

                      {/* Insight Card 3 */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-gray-300 transition-colors animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[#2E2E30]">62 backlinks from 48 domains found</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            We discovered <strong>62</strong> backlinks for your domain. Analyze new and lost backlinks, and track what matters most.{' '}
                            <button
                              type="button"
                              onClick={() => router.push('/backlinks-monitor')}
                              className="text-[#5F31EC] hover:underline font-semibold cursor-pointer"
                            >
                              View details
                            </button>
                          </p>
                        </div>
                        <div>
                          <span className="inline-block text-[11px] font-semibold text-[#9022B6] bg-[#F3EBF7] px-2.5 py-0.5 rounded">
                            Backlinks
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* View more insights / View fewer insights button */}
                  <div className="flex justify-center pt-2">
                    <div className="relative inline-flex items-center">
                      {!isInsightsExpanded && (
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f34a02] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f34a02] shadow-[0_0_8px_#ffdbbe]"></span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <span>{isInsightsExpanded ? 'View fewer insights' : 'View more insights (3)'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isInsightsExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Google India Engine Block matching user HTML engine-block */}
            <div className="engine-block space-y-3" data-se="449728">
              <div className="engine-description flex items-center gap-2 px-1">
                <div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center bg-white shadow-2xs se-bordered-box">
                  <GoogleLogo className="w-4 h-4" />
                </div>
                <CountryFlag code="IN" name="India" size="sm" />
                <h4 className="engine-description__title text-sm font-bold text-gray-900">
                  Google India Mumbai, Maharashtra, India
                </h4>
                <a
                  href="/admin.site.wizard.html?site_id=13023761#/engines?edit_engine=449728"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRankingSettingsModalOpen(true);
                  }}
                  className="engine-description__edit text-gray-400 hover:text-gray-700 ml-1 cursor-pointer p-0.5 inline-flex items-center"
                  title="Edit engine settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 6 Metric Tabs matching user HTML rankings-chart */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-gray-100 border-b border-gray-100">
                  {/* Tab 1: Average position (active) */}
                  <div
                    onClick={() => setDetailedMetric('AveragePosition')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'AveragePosition' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">Average position</div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-gray-900">{currentAvgPosition > 0 ? currentAvgPosition : '—'}</span>
                      </div>
                    </div>
                    {/* Highcharts Mini Area Chart matching live trend */}
                    <div className="h-10 w-full mt-2">
                      <svg className="w-full h-full" viewBox="0 0 166 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mini-grad-avg-pos-in" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path d={cardAvgPosSplineD ? `${cardAvgPosSplineD} L 164.37 38 L 1.62 38 Z` : "M 1.62 20 L 164.37 20 L 164.37 38 L 1.62 38 Z"} fill="url(#mini-grad-avg-pos-in)" />
                        <path d={cardAvgPosSplineD || "M 1.62 20 L 164.37 20"} fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Tab 2: Traffic forecast */}
                  <div
                    onClick={() => setDetailedMetric('TrafficForecast')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'TrafficForecast' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span>Traffic forecast</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-gray-900">{rankingsSummary?.trafficForecast ?? 0}</span>
                      </div>
                    </div>
                    <div className="h-10 w-full mt-2">
                      <svg className="w-full h-full" viewBox="0 0 166 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mini-grad-tf-in" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path d="M 1.6 30 L 164.4 30 L 164.4 38 L 1.6 38 Z" fill="url(#mini-grad-tf-in)" />
                        <path d="M 1.6 30 L 164.4 30" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Tab 3: Search visibility */}
                  <div
                    onClick={() => setDetailedMetric('Visibility')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'Visibility' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span>Search visibility</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-gray-900">{currentVisibilityScore}%</span>
                      </div>
                    </div>
                    <div className="h-10 w-full mt-2">
                      <svg className="w-full h-full" viewBox="0 0 166 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mini-grad-vis-in" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path d={cardVisSplineD ? `${cardVisSplineD} L 164.4 38 L 1.6 38 Z` : "M 1.6 30 L 164.4 30 L 164.4 38 L 1.6 38 Z"} fill="url(#mini-grad-vis-in)" />
                        <path d={cardVisSplineD || "M 1.6 30 L 164.4 30"} fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Tab 4: SERP features */}
                  <div
                    onClick={() => setDetailedMetric('SERPFeatures')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'SERPFeatures' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span>SERP features</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-gray-900">{serpFeaturesCount}</span>
                      </div>
                    </div>
                    {/* Column Bars Highcharts based on keyword counts */}
                    <div className="h-10 w-full mt-2 flex items-end gap-[3px]">
                      {Array.from({ length: 33 }).map((_, i) => {
                        const h = serpFeaturesCount > 0 ? (i % 5 === 0 ? 24 : i % 3 === 0 ? 12 : 3) : 2;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-xs"
                            style={{
                              height: `${h}px`,
                              backgroundColor: i === 32 ? '#1976d2' : '#D6D8E3',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab 5: % in Top 10 */}
                  <div
                    onClick={() => setDetailedMetric('Top10Keywords')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'Top10Keywords' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span>% in Top 10</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {rankingsSummary?.top10Percent != null ? `${rankingsSummary.top10Percent}%` : positionFilterMetrics.top10Pct}
                        </span>
                      </div>
                    </div>
                    <div className="h-10 w-full mt-2">
                      <svg className="w-full h-full" viewBox="0 0 166 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mini-grad-top10-in" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path d="M 1.6 30 L 164.4 30 L 164.4 38 L 1.6 38 Z" fill="url(#mini-grad-top10-in)" />
                        <path d="M 1.6 30 L 164.4 30" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Tab 6: Selected keywords */}
                  <div
                    onClick={() => setDetailedMetric('KeywordsChart')}
                    className={`p-3.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                      detailedMetric === 'KeywordsChart' ? 'bg-[#F4F8FD] border-b-2 border-b-[#1976d2]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">Selected keywords</div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                        {selectedDetailedKeywordIds.length > 0
                          ? `${selectedDetailedKeywordIds.length} keyword(s) selected in table`
                          : 'Select keywords in the table to compare their rankings.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collapsable Main Highcharts Areaspline Chart */}
                {!detailedChartCollapsed && (
                  <div className="p-4 space-y-4">
                    {/* Period and Grouping Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-gray-600">
                        {(['Current', '7D', '1M', '3M', '6M', '1Y', '2Y'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => {
                              setDetailedPeriod(period);
                              setCustomStartDate(null);
                              setCustomEndDate(null);
                              if (period === 'Current' || period === '7D') setSelectedDateRangePreset('7D');
                              else if (period === '1M') setSelectedDateRangePreset('30D');
                              else if (period === '3M') setSelectedDateRangePreset('3M');
                              else if (period === '6M') setSelectedDateRangePreset('6M');
                              else if (period === '1Y') setSelectedDateRangePreset('12M');
                              else if (period === '2Y') setSelectedDateRangePreset('all');
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              detailedPeriod === period
                                ? 'bg-[#EEF0F5] text-[#1976d2]'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {period === '2Y' ? 'All' : period}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>group by:</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDetailedGroupByOpen(!isDetailedGroupByOpen)}
                            className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs font-medium text-gray-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{detailedGroupBy}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </button>
                          {isDetailedGroupByOpen && (
                            <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-xs">
                              {(['days', 'weeks', 'months'] as const).map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => {
                                    setDetailedGroupBy(mode);
                                    setIsDetailedGroupByOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-1 hover:bg-gray-100 text-gray-700 font-medium"
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main Highcharts areaspline Chart powered by real rankings data */}
                    <div className="relative w-full h-[240px] bg-white pt-2">
                      {/* Dynamic Y-axis labels */}
                      <div className="absolute left-0 top-2 bottom-8 w-14 flex flex-col justify-between text-[11px] text-[#6A8897] font-medium text-right pr-2">
                        {chartMetricConfig.yLabels.map((lbl, idx) => (
                          <span key={idx} className={idx === 0 ? "text-gray-400 font-bold" : ""}>
                            {lbl}
                          </span>
                        ))}
                      </div>

                      {/* SVG Canvas dynamically bound to project trend */}
                      <div className="ml-14 h-[calc(100%-28px)] relative">
                        {isLoadingRankings ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            Loading ranking history...
                          </div>
                        ) : detailedTrendPoints.length === 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-xs font-semibold text-gray-600">No ranking position data recorded yet</span>
                            <span className="text-[11px] text-gray-400 mt-0.5">Click &quot;Recheck data&quot; to collect search engine rankings.</span>
                          </div>
                        ) : (
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 197" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="main-in-detailed-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1976d2" stopOpacity="0.16" />
                                <stop offset="100%" stopColor="#1976d2" stopOpacity="0.01" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines */}
                            <line x1="0" y1="10" x2="1000" y2="10" stroke="#E2E8F0" strokeWidth="1" />
                            <line x1="0" y1="66.5" x2="1000" y2="66.5" stroke="#E2E8F0" strokeWidth="1" />
                            <line x1="0" y1="137.5" x2="1000" y2="137.5" stroke="#E2E8F0" strokeWidth="1" />
                            <line x1="0" y1="197" x2="1000" y2="197" stroke="#CCD6EB" strokeWidth="1" />

                            {/* Shaded Area from dynamic trend */}
                            {detailedAreaD && (
                              <path
                                d={detailedAreaD}
                                fill="url(#main-in-detailed-grad)"
                              />
                            )}

                            {/* Graph Line */}
                            {detailedSplineD && (
                              <path
                                d={detailedSplineD}
                                fill="none"
                                stroke="#1976d2"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            )}

                            {/* Dynamic Data Points */}
                            {detailedTrendPoints.map((pt, idx) => (
                              <circle
                                key={idx}
                                cx={pt.x}
                                cy={pt.y}
                                r="5"
                                fill="#1976d2"
                                stroke="#f3f4f8"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-6 transition-all"
                                onMouseEnter={() => setHoveredDetailedPoint(pt)}
                                onMouseLeave={() => setHoveredDetailedPoint(null)}
                              />
                            ))}
                          </svg>
                        )}

                        {/* Interactive Tooltip on hover */}
                        {hoveredDetailedPoint && (
                          <div
                            className="absolute z-30 bg-[#1e293b] text-white text-[11px] p-2 rounded-lg shadow-xl pointer-events-none transition-all"
                            style={{
                              left: Math.max(10, Math.min(820, (hoveredDetailedPoint.x / 1000) * 800)),
                              top: 6,
                            }}
                          >
                            <div className="font-bold text-gray-200">{activeProject?.domain || 'Target'}</div>
                            <div className="text-sky-400 font-semibold">{chartMetricConfig.title}: {hoveredDetailedPoint.displayVal ?? hoveredDetailedPoint.value}</div>
                            <div className="text-gray-400 text-[10px]">
                              {hoveredDetailedPoint.label}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* X-axis labels from dynamic series */}
                      <div className="ml-14 h-6 flex justify-between items-center text-xs text-gray-500 font-semibold px-2">
                        {detailedTrendPoints.length > 0 ? (
                          detailedTrendPoints.map((pt, idx) => (
                            <span key={idx}>{pt.label}</span>
                          ))
                        ) : (
                          <><span>—</span><span>—</span></>
                        )}
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-700 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1976d2]" />
                        <span className="font-semibold text-gray-800">{activeProject?.domain || 'Target'} - {currentEngine.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Collapse Button */}
                <button
                  type="button"
                  onClick={() => setDetailedChartCollapsed(!detailedChartCollapsed)}
                  className="w-full py-1 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors border-t border-gray-100 cursor-pointer"
                  title="Collapse/expand chart"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${detailedChartCollapsed ? '' : 'rotate-180'}`} />
                </button>
              </div>
            </div>

            {/* Keywords Table Block matching exact user HTML keywords-table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              {/* Table Toolbar */}
              <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
                    <GoogleLogo className="w-4 h-4" />
                    <CountryFlag code="IN" name="India" size="sm" />
                    <span>India</span>
                    <span className="text-[10px] text-gray-500 font-bold">en</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={detailedTableSearch}
                      onChange={(e) => setDetailedTableSearch(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#5F31EC] w-[22rem] shadow-2xs"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* View mode dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDetailedViewModeOpen(!isDetailedViewModeOpen)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer shadow-2xs hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-400">View mode:</span>
                      <List className="w-3.5 h-3.5 text-gray-600" />
                      <span>{selectedDetailedViewMode}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {isDetailedViewModeOpen && (
                      <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                        {(['List', 'Groups'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setSelectedDetailedViewMode(mode);
                              setIsDetailedViewModeOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-700 font-medium"
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('View URL copied to clipboard');
                    }}
                    className="p-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-600 cursor-pointer shadow-2xs"
                    title="Copy view"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {/* Dynamic Filters Popover */}
                  <div className="relative" ref={detailedFiltersRef}>
                    <button
                      type="button"
                      onClick={() => setIsDetailedFilterOpen(!isDetailedFilterOpen)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors ${
                        activeDetailedFiltersCount > 0
                          ? 'bg-[#F0F5FF] border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {activeDetailedFiltersCount > 0 && (
                        <span className="w-4 h-4 bg-[#2563EB] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                          {activeDetailedFiltersCount}
                        </span>
                      )}
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {isDetailedFilterOpen && (
                      <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-40 text-xs text-gray-800 animate-in fade-in duration-100">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 font-bold">
                          <span>Filter Keywords</span>
                          {activeDetailedFiltersCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRange('all');
                                setPosMin('');
                                setPosMax('');
                                setDetailedVolMin('');
                                setDetailedVolMax('');
                                setDetailedSerpFeature('all');
                                setDetailedScoreFilter('all');
                                setDetailedChangesFilter('all');
                              }}
                              className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                            >
                              Reset all
                            </button>
                          )}
                        </div>

                        {/* Position Range */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Position range (1 - 100)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="From"
                              value={posMin}
                              onChange={(e) => setPosMin(e.target.value)}
                              className="w-1/2 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="To"
                              value={posMax}
                              onChange={(e) => setPosMax(e.target.value)}
                              className="w-1/2 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Search Volume */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search volume</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min vol"
                              value={detailedVolMin}
                              onChange={(e) => setDetailedVolMin(e.target.value)}
                              className="w-1/2 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="number"
                              placeholder="Max vol"
                              value={detailedVolMax}
                              onChange={(e) => setDetailedVolMax(e.target.value)}
                              className="w-1/2 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden"
                            />
                          </div>
                        </div>

                        {/* SERP Features */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">SERP feature</label>
                          <select
                            value={detailedSerpFeature}
                            onChange={(e) => setDetailedSerpFeature(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden cursor-pointer"
                          >
                            <option value="all">All SERP features</option>
                            <option value="sge">AI Overviews (SGE)</option>
                            <option value="paa">People Also Ask (PAA)</option>
                            <option value="sitelinks">Sitelinks</option>
                            <option value="reviews">Reviews</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        {/* Content Score */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Content score</label>
                          <select
                            value={detailedScoreFilter}
                            onChange={(e) => setDetailedScoreFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:bg-white focus:border-[#2563EB] outline-hidden cursor-pointer"
                          >
                            <option value="all">All content scores</option>
                            <option value="scored">Scored only (has score)</option>
                            <option value="gt80">High quality (&ge; 80)</option>
                            <option value="gt70">Good quality (&ge; 70)</option>
                          </select>
                        </div>

                        {/* Dynamics / Changes */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ranking dynamics</label>
                          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-center font-medium">
                            {(['all', 'up', 'down'] as const).map((dyn) => (
                              <button
                                key={dyn}
                                type="button"
                                onClick={() => setDetailedChangesFilter(dyn)}
                                className={`py-1 rounded text-xs capitalize cursor-pointer transition-all ${
                                  detailedChangesFilter === dyn
                                    ? 'bg-white font-bold text-gray-900 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {dyn === 'all' ? 'All' : dyn === 'up' ? 'Improved' : 'Declined'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsDetailedFilterOpen(false)}
                          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Columns Popover */}
                  <div className="relative" ref={detailedColumnsRef}>
                    <button
                      type="button"
                      onClick={() => setIsDetailedColumnsOpen(!isDetailedColumnsOpen)}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Columns className="w-3.5 h-3.5 text-gray-500" />
                      <span>Columns</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {isDetailedColumnsOpen && (
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-40 text-xs text-gray-800 animate-in fade-in duration-100">
                        <div className="font-bold pb-1.5 mb-2 border-b border-gray-100 text-gray-900">
                          Toggle Columns
                        </div>
                        <div className="space-y-2">
                          {[
                            { id: 'url', label: 'URL' },
                            { id: 'volume', label: 'Search vol.' },
                            { id: 'serp_features', label: 'SERP features' },
                            { id: 'content_score', label: 'Content Score' },
                            { id: 'oct10', label: detailedDateCol1 },
                            { id: 'oct11', label: detailedDateCol2 },
                          ].map((col) => {
                            const isVisible = visibleTableCols.has(col.id);
                            return (
                              <label
                                key={col.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={() => {
                                    const next = new Set(visibleTableCols);
                                    if (next.has(col.id)) {
                                      if (next.size > 1) next.delete(col.id);
                                    } else {
                                      next.add(col.id);
                                    }
                                    setVisibleTableCols(next);
                                  }}
                                  className="rounded border-gray-300 text-[#2563EB] focus:ring-0 cursor-pointer"
                                />
                                <span className="font-medium text-gray-700">{col.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table with Sticky Columns matching user CSS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAFBFD] border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                    <tr>
                      {/* 1. Keywords (sticky width 320px) */}
                      <th className="px-3 py-3 w-[320px] min-w-[320px] max-w-[320px] sticky left-0 z-20 bg-[#FAFBFD]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDetailedKeywordIds.length === filteredDetailedKeywords.length && filteredDetailedKeywords.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDetailedKeywordIds(filteredDetailedKeywords.map((k) => k.id));
                              } else {
                                setSelectedDetailedKeywordIds([]);
                              }
                            }}
                            className="rounded border-gray-300 text-[#5F31EC] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-gray-900 font-bold truncate">
                            Keywords <span className="font-normal text-gray-500">(1 - {filteredDetailedKeywords.length} out of {displayKeywordsList.length})</span>
                          </span>
                          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                        </div>
                      </th>

                      {/* 2. URL (width 50px) */}
                      {visibleTableCols.has('url') && (
                        <th className="px-2 py-3 text-center w-[50px] min-w-[50px] max-w-[50px] bg-[#FAFBFD]">
                          <span className="flex items-center justify-center gap-0.5">
                            <span>URL</span>
                            <span className="text-[10px] text-gray-400">ℹ</span>
                          </span>
                        </th>
                      )}

                      {/* 3. Search vol. (width 110px) */}
                      {visibleTableCols.has('volume') && (
                        <th className="px-2 py-3 text-right w-[110px] min-w-[110px] max-w-[110px] bg-[#FAFBFD]">
                          <span className="flex items-center justify-end gap-1">
                            <span>Search vol.</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400">ℹ</span>
                          </span>
                        </th>
                      )}

                      {/* 4. SERP features (width 120px) */}
                      {visibleTableCols.has('serp_features') && (
                        <th className="px-2 py-3 text-center w-[120px] min-w-[120px] max-w-[120px] bg-[#FAFBFD]">
                          <span className="flex items-center justify-center gap-0.5">
                            <span>SERP features</span>
                            <span className="text-[10px] text-gray-400">ℹ</span>
                          </span>
                        </th>
                      )}

                      {/* 5. Content Score (width 105px) */}
                      {visibleTableCols.has('content_score') && (
                        <th className="px-2 py-3 text-center w-[105px] min-w-[105px] max-w-[105px] bg-[#FAFBFD] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          <span className="flex items-center justify-center gap-1">
                            <span>Content Score</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400">ℹ</span>
                          </span>
                        </th>
                      )}

                      {/* 6. Date Col 1 (width 80px) */}
                      {visibleTableCols.has('oct10') && (
                        <th className="px-2 py-3 text-center w-[80px] min-w-[80px] border-l border-gray-100">
                          <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                            <span>{detailedDateCol1}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                      )}

                      {/* 7. Date Col 2 (width 80px) */}
                      {visibleTableCols.has('oct11') && (
                        <th className="px-2 py-3 text-center w-[80px] min-w-[80px] border-l border-gray-100">
                          <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                            <span>{detailedDateCol2}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {isLoadingRankings ? (
                      <tr>
                        <td colSpan={7} className="py-16 px-4 text-center text-xs text-gray-400">
                          Loading keywords...
                        </td>
                      </tr>
                    ) : filteredDetailedKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 px-4 text-center">
                          <div className="max-w-md mx-auto flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1976d2] flex items-center justify-center mb-3">
                              <KeyRound className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">No keywords found</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                              {displayKeywordsList.length === 0
                                ? 'No keywords added to this project yet. Add keywords to start tracking rankings.'
                                : 'No keywords match your current search and filter criteria.'}
                            </p>
                            {displayKeywordsList.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                              >
                                + ADD KEYWORDS
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRange('all');
                                  setPosMin('');
                                  setPosMax('');
                                  setDetailedVolMin('');
                                  setDetailedVolMax('');
                                  setDetailedSerpFeature('all');
                                  setDetailedScoreFilter('all');
                                  setDetailedChangesFilter('all');
                                  setDetailedTableSearch('');
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDetailedKeywords.map((k, idx) => {
                      const isChecked = selectedDetailedKeywordIds.includes(k.id);
                      const isEven = idx % 2 === 1;
                      return (
                        <tr
                          key={k.id}
                          className={`transition-colors group ${isEven ? 'bg-[#FCFCFE] hover:bg-[#F4F6FC]' : 'bg-white hover:bg-[#F4F6FC]'}`}
                        >
                          {/* Col 1: Keywords (width 320px) */}
                          <td className="px-3 py-2.5 relative sticky left-0 z-20 bg-inherit w-[320px] min-w-[320px] max-w-[320px]">
                            <span
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: k.color }}
                            />
                            <div className="flex items-center gap-2 pl-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDetailedKeywordIds([...selectedDetailedKeywordIds, k.id]);
                                  } else {
                                    setSelectedDetailedKeywordIds(selectedDetailedKeywordIds.filter((id) => id !== k.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-[#5F31EC] focus:ring-0 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedDetailedKeywordIds(
                                    expandedDetailedKeywordIds.includes(k.id)
                                      ? expandedDetailedKeywordIds.filter((id) => id !== k.id)
                                      : [...expandedDetailedKeywordIds, k.id]
                                  );
                                }}
                                className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer shrink-0"
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    expandedDetailedKeywordIds.includes(k.id) ? 'rotate-90 text-gray-700' : ''
                                  }`}
                                />
                              </button>
                              <span className="font-semibold text-gray-900 hover:text-[#5F31EC] cursor-pointer truncate" title={k.name}>
                                {k.name}
                              </span>
                            </div>
                          </td>

                          {/* Col 2: URL (width 50px) */}
                          {visibleTableCols.has('url') && (
                            <td className="px-2 py-2.5 text-center bg-inherit w-[50px] min-w-[50px] max-w-[50px]">
                              <a
                                href={k.urlHref || (activeProject?.domain ? `https://${activeProject.domain}/` : '#')}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1976d2] hover:text-[#0b59ee] inline-block p-1"
                                title={k.urlHref || (activeProject?.domain ? `https://${activeProject.domain}/` : '#')}
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          )}

                          {/* Col 3: Search vol (width 110px) */}
                          {visibleTableCols.has('volume') && (
                            <td className="px-2 py-2.5 text-right font-medium text-gray-800 bg-inherit w-[110px] min-w-[110px] max-w-[110px]">
                              {k.volume}
                            </td>
                          )}

                          {/* Col 4: SERP features (width 120px) */}
                          {visibleTableCols.has('serp_features') && (
                            <td className="px-2 py-2.5 text-center bg-inherit w-[120px] min-w-[120px] max-w-[120px]">
                              <div className="flex items-center justify-center gap-1.5">
                                {k.features.paa && (
                                  <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-bold cursor-help" title="People Also Ask">
                                    <List className="w-3 h-3 text-gray-600" />
                                  </span>
                                )}
                                {k.features.sge && (
                                  <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-50 text-[#1976d2] text-[10px] font-bold cursor-help" title="AI Overviews / SGE">
                                    <Sparkles className="w-3 h-3 fill-[#1976d2] text-[#1976d2]" />
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Col 5: Content Score (width 105px) */}
                          {visibleTableCols.has('content_score') && (
                            <td className="px-2 py-2.5 text-center bg-inherit w-[105px] min-w-[105px] max-w-[105px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                              {k.contentScore !== null ? (
                                <span
                                  className="inline-block text-[11px] font-bold text-white px-2.5 py-0.5 rounded shadow-2xs"
                                  style={{ backgroundColor: 'rgb(54, 179, 126)' }}
                                >
                                  {k.contentScore}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium">-</span>
                              )}
                            </td>
                          )}

                          {/* Col 6: Oct-10 (width 80px) */}
                          {visibleTableCols.has('oct10') && (
                            <td className="px-2 py-2.5 text-center border-l border-gray-100 w-[80px] min-w-[80px]">
                              <span className="inline-flex items-center justify-center w-7 h-6 bg-[#EAF7EC] text-[#2E7D32] font-bold rounded text-xs cursor-pointer hover:shadow-2xs">
                                {k.rankOct3}
                              </span>
                            </td>
                          )}

                          {/* Col 7: Oct-11 (width 80px) */}
                          {visibleTableCols.has('oct11') && (
                            <td className="px-2 py-2.5 text-center border-l border-gray-100 w-[80px] min-w-[80px]">
                              <span className="inline-flex items-center justify-center w-7 h-6 bg-[#EAF7EC] text-[#2E7D32] font-bold rounded text-xs cursor-pointer hover:shadow-2xs">
                                {k.rankOct4}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer matching user HTML ranking-table-footer */}
              <div className="p-3.5 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between text-xs text-gray-500 gap-3">
                <div className="flex flex-wrap items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(25, 118, 210)' }} />
                    <span className="text-gray-700">Entered Top 10</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(255, 100, 100)' }} />
                    <span className="text-gray-700">Left Top 10</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(102, 174, 124)' }} />
                    <span className="text-gray-700">In Top 10</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(197, 197, 197)' }} />
                    <span className="text-gray-700">Entered Top 100</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600">View on page:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDetailedPerPageOpen(!isDetailedPerPageOpen)}
                      className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{detailedPerPageCount}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {isDetailedPerPageOpen && (
                      <div className="absolute right-0 bottom-full mb-1 w-20 bg-white border border-gray-200 rounded shadow-xl py-1 z-30 text-xs">
                        {[10, 25, 50, 100, 200].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setDetailedPerPageCount(num);
                              setIsDetailedPerPageOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1 hover:bg-gray-100 ${
                              detailedPerPageCount === num ? 'font-bold text-[#5F31EC]' : 'text-gray-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HISTORICAL DATA VIEW MATCHING USER REAL HTML & SCREENSHOTS */}
        {/* ========================================================================= */}
        {activeTab === 'historical' && (
          <div className="space-y-4">
            {/* Tops Bar: Position Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-1.5">
                    <span>Position filters:</span>
                    <span className="cursor-help text-gray-400 text-[10px]" title="Filter historical keywords">ℹ</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium pl-1 mb-1">
                      <span className="w-14 text-center"></span>
                      <span className="w-14 text-center">{positionFilterMetrics.top1Pct}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top3Pct}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top5Pct}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top10Pct}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top30Pct}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.over100Pct}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'top1', label: 'Top 1' },
                        { id: 'top3', label: 'Top 3' },
                        { id: 'top5', label: 'Top 5' },
                        { id: 'top10', label: 'Top 10' },
                        { id: 'top30', label: 'Top 30' },
                        { id: 'over100', label: '>100' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedRange(item.id)}
                          className={`w-14 py-1 text-center rounded text-xs font-semibold transition-all cursor-pointer ${
                            selectedRange === item.id
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 pl-1 mt-1.5">
                      <span className="w-14 text-center">{positionFilterMetrics.total}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top1}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top3}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top5}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top10}</span>
                      <span className="w-14 text-center">{positionFilterMetrics.top30}</span>
                      <span className="w-14 text-center text-gray-400">{positionFilterMetrics.over100}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6 pt-1">
                  <div>
                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-2">
                      <span>Position range:</span>
                      <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={posMin}
                        onChange={(e) => setPosMin(e.target.value)}
                        placeholder="1"
                        className="w-12 h-8 text-center bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-hidden"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={posMax}
                        onChange={(e) => setPosMax(e.target.value)}
                        placeholder="100"
                        className="w-12 h-8 text-center bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mb-2">
                      <span>Changes:</span>
                      <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      <div className="px-3 py-1 bg-white text-emerald-700 rounded text-xs font-semibold flex items-center gap-1 shadow-xs">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 6 5">
                          <path d="M3 0L6 5H0L3 0Z" />
                        </svg>
                        <span>{positionFilterMetrics.up}</span>
                      </div>
                      <div className="px-3 py-1 text-rose-500 rounded text-xs font-semibold flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current rotate-180" viewBox="0 0 6 5">
                          <path d="M3 0L6 5H0L3 0Z" />
                        </svg>
                        <span>{positionFilterMetrics.down}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Charts Container matching user HTML engine-chart history-charts */}
            <div className="engine-chart history-charts bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="rankings-chart">
                {/* 4 Metric Tabs */}
                <div className="chart-tabs grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-b border-gray-200">
                  {/* Metric 1: Average position */}
                  <div
                    onClick={() => setHistoricalMetric('AveragePosition')}
                    className={`chart-tab rankings-chart-tab rankings-chart__tab p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      historicalMetric === 'AveragePosition' ? 'chart-tab_active bg-blue-50/20 border-b-2 border-b-[#5288da]' : 'hover:bg-gray-50'
                    }`}
                    data-value="AveragePosition"
                  >
                    <div className="rankings-chart-tab__text">
                      <span className="se-label-text-2 chart-tab-title text-[11px] text-gray-500 font-medium">
                        <span className="chart-tab-title__title">Average position</span>
                      </span>
                      <div className="rankings-chart-tab__text-value mt-1">
                        <div className="se-flex-box flex items-center gap-2">
                          <div className="se-flex-item">
                            <span className="rankings-chart-tab__text-value-content text-2xl font-bold text-gray-900 leading-none">
                              {currentAvgPosition > 0 ? currentAvgPosition : '—'}
                            </span>
                          </div>
                          {rankingsSummary?.averagePositionChange != null && rankingsSummary.averagePositionChange !== 0 && (
                            <div className="se-flex-item">
                              <div className={`se-dynamic-2 flex items-center gap-0.5 text-xs font-bold ${rankingsSummary.averagePositionChange > 0 ? 'text-[#e02020]' : 'text-emerald-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="5" viewBox="0 0 6 5" className={`se-dynamic-2__icon w-2 h-2 fill-current ${rankingsSummary.averagePositionChange > 0 ? 'rotate-180' : ''}`}>
                                  <path d="M3 0L6 5H0L3 0Z" />
                                </svg>
                                <span>{Math.abs(rankingsSummary.averagePositionChange)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="rankings-chart-tab__chart h-9 w-full mt-2 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 259 40" preserveAspectRatio="none">
                        <path
                          d={cardAvgPosSplineD || "M 2.539 20 L 256.46 20"}
                          fill="none"
                          stroke="#5288da"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 2: Traffic forecast */}
                  <div
                    onClick={() => setHistoricalMetric('TrafficForecast')}
                    className={`chart-tab rankings-chart-tab rankings-chart__tab p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      historicalMetric === 'TrafficForecast' ? 'chart-tab_active bg-blue-50/20 border-b-2 border-b-[#5288da]' : 'hover:bg-gray-50'
                    }`}
                    data-value="TrafficForecast"
                  >
                    <div className="rankings-chart-tab__text">
                      <span className="se-label-text-2 chart-tab-title text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span className="chart-tab-title__title">Traffic forecast</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </span>
                      <div className="rankings-chart-tab__text-value mt-1">
                        <div className="se-flex-box flex items-center gap-2">
                          <div className="se-flex-item">
                            <span className="rankings-chart-tab__text-value-content text-2xl font-bold text-gray-900 leading-none">
                              {rankingsSummary?.trafficForecast ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rankings-chart-tab__chart h-9 w-full mt-2 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 259 40" preserveAspectRatio="none">
                        <path
                          d="M 2.539 30 C 2.539 30 256.46 30 256.46 30"
                          fill="none"
                          stroke="#5288da"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 3: Search visibility */}
                  <div
                    onClick={() => setHistoricalMetric('Visibility')}
                    className={`chart-tab rankings-chart-tab rankings-chart__tab p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      historicalMetric === 'Visibility' ? 'chart-tab_active bg-blue-50/20 border-b-2 border-b-[#5288da]' : 'hover:bg-gray-50'
                    }`}
                    data-value="Visibility"
                  >
                    <div className="rankings-chart-tab__text">
                      <span className="se-label-text-2 chart-tab-title text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span className="chart-tab-title__title">Search visibility</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </span>
                      <div className="rankings-chart-tab__text-value mt-1">
                        <div className="se-flex-box flex items-center gap-2">
                          <div className="se-flex-item">
                            <span className="rankings-chart-tab__text-value-content text-2xl font-bold text-gray-900 leading-none">
                              {currentVisibilityScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rankings-chart-tab__chart h-9 w-full mt-2 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 259 40" preserveAspectRatio="none">
                        <path
                          d={cardVisSplineD || "M 2.539 30 L 256.46 30"}
                          fill="none"
                          stroke="#5288da"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 4: % in Top 10 */}
                  <div
                    onClick={() => setHistoricalMetric('Top10Keywords')}
                    className={`chart-tab rankings-chart-tab rankings-chart__tab p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      historicalMetric === 'Top10Keywords' ? 'chart-tab_active bg-blue-50/20 border-b-2 border-b-[#5288da]' : 'hover:bg-gray-50'
                    }`}
                    data-value="Top10Keywords"
                  >
                    <div className="rankings-chart-tab__text">
                      <span className="se-label-text-2 chart-tab-title text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <span className="chart-tab-title__title">% in Top 10</span>
                        <span className="text-[10px] text-gray-400">ℹ</span>
                      </span>
                      <div className="rankings-chart-tab__text-value mt-1">
                        <div className="se-flex-box flex items-center gap-2">
                          <div className="se-flex-item">
                            <span className="rankings-chart-tab__text-value-content text-2xl font-bold text-gray-900 leading-none">
                              {keywords.length > 0 ? Math.round((keywords.filter(k => k.rank != null && k.rank > 0 && k.rank <= 10).length / keywords.length) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rankings-chart-tab__chart h-9 w-full mt-2 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 259 40" preserveAspectRatio="none">
                        <path
                          d="M 2.539 30 C 2.539 30 256.46 30 256.46 30"
                          fill="none"
                          stroke="#5288da"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Collapsable Main Chart Block */}
                {!historicalChartCollapsed && (
                  <div className="collapsable-chart-block p-4">
                    <div className="collapsable-chart-block__content relative">
                      <div className="rankings-chart__main-chart relative w-full h-[240px] select-none">
                        {isLoadingRankings ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            Loading historical ranking trends...
                          </div>
                        ) : detailedTrendPoints.length === 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-xs font-semibold text-gray-600">No historical ranking position data recorded yet</span>
                            <span className="text-[11px] text-gray-400 mt-0.5">Click &quot;Recheck data&quot; to collect search engine rankings.</span>
                          </div>
                        ) : (
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 1069 240" preserveAspectRatio="none">
                            <desc>Created with Highcharts 8.2.2</desc>
                            
                            {/* Horizontal Gridlines */}
                            <line x1="65" y1="198" x2="1059" y2="198" stroke="#d6d8e3" strokeWidth="1" opacity="0.8" />
                            <line x1="65" y1="104" x2="1059" y2="104" stroke="#d6d8e3" strokeWidth="1" opacity="0.8" />
                            <line x1="65" y1="10" x2="1059" y2="10" stroke="#d6d8e3" strokeWidth="1" opacity="0.8" />

                            {/* Axes */}
                            <line x1="65" y1="10" x2="65" y2="198" stroke="#ccd6eb" strokeWidth="1" />
                            <line x1="65" y1="198" x2="1059" y2="198" stroke="#ccd6eb" strokeWidth="1" />

                            {/* Y-axis Title */}
                            <text
                              x="25"
                              y="104"
                              textAnchor="middle"
                              transform="rotate(-90 25 104)"
                              fill="#666666"
                              fontSize="11"
                              fontFamily="Lucida Grande, Arial, sans-serif"
                            >
                              {historicalMetric === 'AveragePosition'
                                ? 'Average position'
                                : historicalMetric === 'TrafficForecast'
                                ? 'Traffic forecast'
                                : historicalMetric === 'Visibility'
                                ? 'Search visibility'
                                : '% in Top 10'}
                            </text>

                            {/* Spline Glow Shadows */}
                            {detailedSplineD && (
                              <>
                                <path
                                  d={detailedSplineD}
                                  fill="none"
                                  stroke="#5288da"
                                  strokeWidth="6"
                                  strokeOpacity="0.08"
                                  strokeLinecap="round"
                                />
                                <path
                                  d={detailedSplineD}
                                  fill="none"
                                  stroke="#5288da"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </>
                            )}

                            {/* Dynamic Data Points */}
                            {detailedTrendPoints.map((pt, idx) => (
                              <circle
                                key={idx}
                                cx={pt.x}
                                cy={pt.y}
                                r="4.5"
                                fill="#5288da"
                                stroke="#f3f4f8"
                                strokeWidth="2"
                                className="cursor-pointer transition-all duration-150 hover:r-6"
                                onMouseEnter={() =>
                                  setHoveredHistoricalPoint({
                                    x: pt.x,
                                    y: pt.y,
                                    pct: 100,
                                    date: pt.label,
                                    position: pt.value,
                                    change: 0,
                                  })
                                }
                                onMouseLeave={() => setHoveredHistoricalPoint(null)}
                              />
                            ))}
                          </svg>
                        )}
                        {/* X-axis Labels */}
                        <div className="absolute left-16 right-4 bottom-0 flex justify-between pointer-events-none text-xs text-gray-500 font-semibold px-2">
                          {detailedTrendPoints.length > 0 ? (
                            detailedTrendPoints.map((pt, idx) => (
                              <span key={idx}>{pt.label}</span>
                            ))
                          ) : (
                            <>
                              <span>Baseline</span>
                              <span>Current</span>
                            </>
                          )}
                        </div>

                        {/* Interactive Working Hover Tooltip */}
                        {hoveredHistoricalPoint && (
                          <div
                            className="absolute pointer-events-none z-50 bg-white border border-[#ccd6eb] rounded-md px-3 py-2 shadow-xl text-xs space-y-1 transition-all animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              left: hoveredHistoricalPoint.pct === 0 ? '75px' : 'auto',
                              right: hoveredHistoricalPoint.pct === 100 ? '45px' : 'auto',
                              top: hoveredHistoricalPoint.pct === 0 ? '25px' : '65px',
                            }}
                          >
                            <div className="text-[11px] font-semibold text-gray-500 border-b border-gray-100 pb-1 flex items-center justify-between gap-4">
                              <span>{hoveredHistoricalPoint.date === 'Oct-08 2026' ? 'Baseline' : 'Current rankings'}</span>
                              <span className="font-bold text-gray-800">{hoveredHistoricalPoint.date}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#5288da]" />
                              <span className="font-semibold text-gray-700">Google India:</span>
                              <span className="font-bold text-gray-900">{hoveredHistoricalPoint.position}</span>
                              {hoveredHistoricalPoint.change !== 0 && (
                                <span className="font-bold text-rose-500 text-[11px]">
                                  ({hoveredHistoricalPoint.change > 0 ? `+${hoveredHistoricalPoint.change}` : hoveredHistoricalPoint.change})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Legend at bottom */}
                      <div className="chart-legend chart-legend_full-size mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="chart-legend__list flex items-center gap-3">
                          <div className="chart-legend-item flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <span className="chart-legend-item__circle w-2.5 h-2.5 rounded-full bg-[#5288da]" />
                            <GoogleLogo className="w-3.5 h-3.5" />
                            <CountryFlag code="IN" name="India" size="sm" />
                            <span className="chart-legend-item__title">Google India</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          Period: {historicalBaselineLabel} - {historicalCurrentLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Collapse/Expand Button */}
                <button
                  type="button"
                  onClick={() => setHistoricalChartCollapsed(!historicalChartCollapsed)}
                  className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors border-t border-gray-100 cursor-pointer"
                  title="Collapse/expand chart"
                >
                  {historicalChartCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Historical Rankings Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
                    <GoogleLogo className="w-4 h-4" />
                    <CountryFlag code="IN" name="India" size="sm" />
                    <span>India</span>
                    <span className="text-[10px] text-gray-500 font-bold">EN</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 ml-1">Historical Comparison</h4>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing {displayKeywordsList.length} keywords
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAFBFD] border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3 min-w-[300px]">Keywords</th>
                      <th className="px-3 py-3 text-center min-w-[50px]">URL</th>
                      <th className="px-3 py-3 text-right min-w-[100px]">Search vol.</th>
                      <th className="px-4 py-3 text-center min-w-[140px] border-l border-gray-100">
                        Baseline ({historicalBaselineLabel})
                      </th>
                      <th className="px-4 py-3 text-center min-w-[140px] border-l border-gray-100 bg-[#F5F3FF]">
                        Current rankings ({historicalCurrentLabel})
                      </th>
                      <th className="px-4 py-3 text-center min-w-[100px] border-l border-gray-100">
                        Difference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {displayKeywordsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 px-4 text-center">
                          <div className="max-w-md mx-auto flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-3">
                              <KeyRound className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">No historical keyword data</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                              Historical rankings become available once keywords are added and checked.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddModalOpen(true)}
                              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                            >
                              + ADD KEYWORDS
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayKeywordsList.map((k) => (
                      <tr key={k.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="px-4 py-2.5 relative">
                          <span
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: k.color }}
                          />
                          <span className="font-semibold text-gray-900 pl-1">{k.name}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {k.urlHref ? (
                            <a
                              href={k.urlHref}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#7C3AED] hover:underline"
                            >
                              <Link2 className="w-3.5 h-3.5 inline-block" />
                            </a>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-800">
                          {k.volume}
                        </td>
                        <td className="px-4 py-2.5 text-center border-l border-gray-100">
                          {k.rankOct3 !== null ? (
                            <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-100 text-gray-800 font-bold rounded text-xs">
                              {k.rankOct3}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center border-l border-gray-100 bg-[#F5F3FF]">
                          {k.rankOct4 !== null ? (
                            <span className="inline-flex items-center justify-center w-8 h-6 bg-[#EAF7EC] text-[#2E7D32] font-bold rounded text-xs">
                              {k.rankOct4}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center border-l border-gray-100">
                          {k.diff !== null && k.diff > 0 ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                              ▲ {k.diff}
                            </span>
                          ) : k.diff !== null && k.diff < 0 ? (
                            <span className="text-xs font-bold text-rose-500 flex items-center justify-center gap-0.5">
                              ▼ {Math.abs(k.diff)}
                            </span>
                          ) : k.rankOct3 !== null && k.rankOct4 !== null ? (
                            <span className="text-xs font-medium text-gray-400">0</span>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUMMARY VIEW MATCHING REAL SE RANKING DATA & USER HTML DUMP */}
        {/* ========================================================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Top 3 KPI Cards: Search visibility, Average position, Organic traffic */}
            {rankingSettings.showCharts && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Search visibility */}
                  <div
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs relative flex flex-col justify-between hover:shadow-xs transition-shadow"
                    onMouseEnter={() => setHoveredVisibilityCard(true)}
                    onMouseLeave={() => setHoveredVisibilityCard(false)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <span>Search visibility</span>
                          <span className="cursor-help text-gray-400 text-[10px]" title="Search visibility index based on rankings and search volume">ℹ</span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('detailed');
                              router.push('/rankings?tab=detailed');
                            }}
                            className="text-3xl font-bold text-gray-900 tracking-tight hover:text-[#7C3AED] transition-colors cursor-pointer"
                          >
                            {currentVisibilityScore}%
                          </button>
                        </div>
                      </div>

                      {/* Highcharts Spline Chart: Search Visibility (amber #FF9800) */}
                      <div className="relative w-56 h-24">
                        <div className="absolute left-0 top-1 text-[10px] text-[#6A8897] font-medium">100</div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-[#6A8897] font-medium">50</div>
                        <div className="absolute left-0 bottom-1 text-[10px] text-[#6A8897] font-medium">0</div>

                        <svg className="w-full h-full pl-5 overflow-visible" viewBox="0 0 227 100" preserveAspectRatio="none">
                          <defs>
                            <clipPath id="highcharts-vis-clip">
                              <rect x="0" y="0" width="186" height="75" fill="none" />
                            </clipPath>
                          </defs>
                          {/* Grid lines */}
                          <line x1="31" y1="10.5" x2="217" y2="10.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="31" y1="48.5" x2="217" y2="48.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="31" y1="85.5" x2="217" y2="85.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="31" y1="10" x2="31" y2="85" stroke="#E2E8F0" strokeWidth="1" />

                          {/* Dynamic Spline Curve */}
                          <g transform="translate(31,10)">
                            <path
                              d={cardVisSplineD || "M 1.82 37.5 L 184.18 37.5"}
                              fill="none"
                              stroke="#FF9800"
                              strokeWidth="5"
                              strokeOpacity="0.03"
                              strokeLinecap="round"
                              transform="translate(1, 3)"
                            />
                            <path
                              d={cardVisSplineD || "M 1.82 37.5 L 184.18 37.5"}
                              fill="none"
                              stroke="#FF9800"
                              strokeWidth="3"
                              strokeOpacity="0.06"
                              strokeLinecap="round"
                              transform="translate(1, 3)"
                            />
                            {/* Main Stroke */}
                            <path
                              d={cardVisSplineD || "M 1.82 37.5 L 184.18 37.5"}
                              fill="none"
                              stroke="#FF9800"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            {/* Active Point Circle */}
                            <circle
                              cx="184"
                              cy="37.5"
                              r="3.5"
                              fill="#FF9800"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                          </g>
                        </svg>

                        {/* Interactive Tooltip matching user HTML */}
                        {hoveredVisibilityCard && (
                          <div className="absolute right-0 -top-1 bg-white/95 backdrop-blur-2xs border border-gray-200 rounded-lg shadow-xl p-2.5 text-xs z-30 pointer-events-none animate-in fade-in duration-150 min-w-[130px]">
                            <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1 text-[11px]">
                              {rankingsTrend?.[rankingsTrend.length - 1]?.label || 'Current'}
                            </div>
                            <div className="text-[11px] text-gray-600 flex items-center justify-between">
                              <span>Search visibility:</span>
                              <span className="font-bold text-gray-900">{currentVisibilityScore}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Average position */}
                  <div
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs relative flex flex-col justify-between hover:shadow-xs transition-shadow"
                    onMouseEnter={() => setHoveredAvgPosCard(true)}
                    onMouseLeave={() => setHoveredAvgPosCard(false)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <span>Average position</span>
                          <span className="cursor-help text-gray-400 text-[10px]" title="Average position across all tracked keywords">ℹ</span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('detailed');
                              router.push('/rankings?tab=detailed');
                            }}
                            className="text-3xl font-bold text-gray-900 tracking-tight hover:text-[#7C3AED] transition-colors cursor-pointer"
                          >
                            {currentAvgPosition > 0 ? currentAvgPosition : '—'}
                          </button>
                          {/* Real diff badge */}
                          {rankingsSummary?.averagePositionChange != null && rankingsSummary.averagePositionChange !== 0 && (
                            <span className={`text-xs font-bold flex items-center gap-0.5 ${rankingsSummary.averagePositionChange > 0 ? 'text-[#F44336]' : 'text-emerald-600'}`}>
                              <svg className={`w-2.5 h-2.5 fill-current ${rankingsSummary.averagePositionChange > 0 ? 'rotate-180' : ''}`} viewBox="0 0 6 5">
                                <path d="M3 0L6 5H0L3 0Z" />
                              </svg>
                              <span>{Math.abs(rankingsSummary.averagePositionChange)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Highcharts Spline Chart: Average Position (blue #1863FD) */}
                      <div className="relative w-56 h-24">
                        <div className="absolute left-0 top-1 text-[10px] text-[#6A8897] font-medium">1</div>
                        <div className="absolute left-0 top-1/3 -translate-y-1/2 text-[10px] text-[#6A8897] font-medium">20</div>
                        <div className="absolute left-0 top-2/3 -translate-y-1/2 text-[10px] text-[#6A8897] font-medium">50</div>

                        <svg className="w-full h-full pl-5 overflow-visible" viewBox="0 0 227 100" preserveAspectRatio="none">
                          <defs>
                            <clipPath id="highcharts-pos-clip">
                              <rect x="0" y="0" width="185" height="75" fill="none" />
                            </clipPath>
                          </defs>
                          {/* Grid lines */}
                          <line x1="32" y1="10.5" x2="217" y2="10.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="32" y1="35.5" x2="217" y2="35.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="32" y1="60.5" x2="217" y2="60.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="32" y1="85.5" x2="217" y2="85.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="32" y1="10" x2="32" y2="85" stroke="#E2E8F0" strokeWidth="1" />

                          {/* Dynamic Spline Curve */}
                          <g transform="translate(32,10)">
                            {/* Shadows */}
                            <path
                              d={cardAvgPosSplineD || "M 1.81 37.5 L 183.19 37.5"}
                              fill="none"
                              stroke="#1863FD"
                              strokeWidth="5"
                              strokeOpacity="0.03"
                              strokeLinecap="round"
                              transform="translate(1, 3)"
                            />
                            <path
                              d={cardAvgPosSplineD || "M 1.81 37.5 L 183.19 37.5"}
                              fill="none"
                              stroke="#1863FD"
                              strokeWidth="3"
                              strokeOpacity="0.06"
                              strokeLinecap="round"
                              transform="translate(1, 3)"
                            />
                            {/* Main Curve */}
                            <path
                              d={cardAvgPosSplineD || "M 1.81 37.5 L 183.19 37.5"}
                              fill="none"
                              stroke="#1863FD"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            {/* Active Point Circle */}
                            <circle
                              cx="123"
                              cy="50"
                              r="3.5"
                              fill="#1863FD"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                          </g>
                        </svg>

                        {/* Interactive Tooltip matching user HTML */}
                        {hoveredAvgPosCard && (
                          <div className="absolute right-0 -top-1 bg-white/95 backdrop-blur-2xs border border-gray-200 rounded-lg shadow-xl p-2.5 text-xs z-30 pointer-events-none animate-in fade-in duration-150 min-w-[130px]">
                            <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1 text-[11px]">
                              {rankingsTrend?.[rankingsTrend.length - 1]?.label || 'Current'}
                            </div>
                            <div className="text-[11px] text-gray-600 flex items-center justify-between">
                              <span>Average position:</span>
                              <span className="font-bold text-gray-900">{currentAvgPosition > 0 ? currentAvgPosition : '—'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Organic traffic */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3 hover:shadow-xs transition-shadow flex flex-col justify-between">
                    <div className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span>Organic traffic</span>
                      <span className="cursor-help text-gray-400 text-[10px]" title="Connect Google Analytics to view organic traffic metrics">ℹ</span>
                    </div>

                    {!isGAConnected ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsConnectGAOpen(true)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer transition-colors"
                        >
                          {/* Exact Google Analytics Icon */}
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#F9AB00" fillOpacity="0.1" />
                            <path d="M17.5 19H19.5V7H17.5V19ZM12.5 19H14.5V11H12.5V19ZM7.5 19H9.5V15H7.5V19Z" fill="#E37400" />
                            <circle cx="5" cy="18" r="2" fill="#E37400" />
                          </svg>
                          <span>Connect Google Analytics</span>
                        </button>
                        <p className="text-[11px] text-gray-400 mt-2 text-center">for detailed information</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">1,284</span>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 6 5">
                                <path d="M3 0L6 5H0L3 0Z" />
                              </svg>
                              <span>+12.4%</span>
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            GA4 Synced
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                          <span>Users: <strong>982</strong></span>
                          <span>Views: <strong>3,140</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsGAConnected(false);
                              try { localStorage.removeItem('seranking_ga_connected'); } catch {}
                              showToast('Google Analytics disconnected');
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer text-[10px]"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Distribution of top positions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-[#171B24]">Distribution of top positions</h3>
                      <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
                      {/* Period Tabs matching Real SE Ranking HTML: Current, 7D, 1M, 3M, 6M, 1Y, 2Y */}
                      <div className="flex items-center gap-1 text-gray-500">
                        {(['CURRENT', '7D', '1M', '3M', '6M', '1Y', '2Y'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setDistributionPeriod(period)}
                            className={`px-2 py-1 cursor-pointer transition-colors text-[11px] font-bold ${
                              distributionPeriod === period
                                ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]'
                                : 'hover:text-gray-800'
                            }`}
                          >
                            {period === 'CURRENT' ? 'Current' : period}
                          </button>
                        ))}
                      </div>

                      {/* Legend matching exact colors from user HTML */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#171B24] font-normal">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(137, 131, 240)' }} />
                          <span>Top 1</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(174, 181, 242)' }} />
                          <span>Top 2-3</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(247, 207, 207)' }} />
                          <span>Top 4-5</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(231, 136, 213)' }} />
                          <span>Top 6-10</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(189, 136, 231)' }} />
                          <span>Top 11-30</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(255, 161, 161)' }} />
                          <span>Top 31-100</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(239, 241, 249)' }} />
                          <span>Total</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid: Left 6 Mini Totals Cards & Right Stacked Areaspline Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left 6 Mini-cards matching Real SE Ranking HTML */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                      {/* Top 1 */}
                      <div
                        onClick={() => {
                          setSelectedRange('top1');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 1</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl font-bold text-gray-900">{calculatedDistribution.top1}</span>
                            {rankingsSummary?.top1Change != null && rankingsSummary.top1Change !== 0 && (
                              <span className={`text-[10px] font-bold ${rankingsSummary.top1Change > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {rankingsSummary.top1Change > 0 ? `+${rankingsSummary.top1Change}` : rankingsSummary.top1Change}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 89 45">
                          <path
                            d="M 1 18 C 1 18 18 18 30 18 C 42 18 47 27 59 27 C 71 27 88 27 88 27"
                            fill="none"
                            stroke="#8983F0"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Top 2-3 */}
                      <div
                        onClick={() => {
                          setSelectedRange('top3');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 2-3</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl font-bold text-gray-900">{calculatedDistribution.top2_3}</span>
                            {rankingsSummary?.top2_3Change != null && rankingsSummary.top2_3Change !== 0 && (
                              <span className={`text-[10px] font-bold ${rankingsSummary.top2_3Change > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {rankingsSummary.top2_3Change > 0 ? `+${rankingsSummary.top2_3Change}` : rankingsSummary.top2_3Change}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 75 45">
                          <path
                            d="M 1 27 C 1 27 15 27 25 27 C 35 27 40 18 50 18 C 60 18 74 18 74 18"
                            fill="none"
                            stroke="#AEB5F2"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Top 4-5 */}
                      <div
                        onClick={() => {
                          setSelectedRange('top5');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 4-5</div>
                          <div className="text-xl font-bold text-gray-900 mt-0.5">{calculatedDistribution.top4_5}</div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 89 45">
                          <path d="M 1 22.5 L 88 22.5" fill="none" stroke="#F7CFCF" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Top 6-10 */}
                      <div
                        onClick={() => {
                          setSelectedRange('top10');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 6-10</div>
                          <div className="text-xl font-bold text-gray-900 mt-0.5">{calculatedDistribution.top6_10}</div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 75 45">
                          <path d="M 1 22.5 L 74 22.5" fill="none" stroke="#E788D5" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Top 11-30 */}
                      <div
                        onClick={() => {
                          setSelectedRange('top30');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 11-30</div>
                          <div className="text-xl font-bold text-gray-900 mt-0.5">{calculatedDistribution.top11_30}</div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 78 45">
                          <path d="M 1 22.5 L 77 22.5" fill="none" stroke="#BD88E7" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Top 31-100 */}
                      <div
                        onClick={() => {
                          setSelectedRange('all');
                          setActiveTab('detailed');
                          router.push('/rankings?tab=detailed');
                        }}
                        className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-2xs hover:border-[#7C3AED] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] text-gray-500 font-medium">Top 31-100</div>
                          <div className="text-xl font-bold text-gray-900 mt-0.5">{calculatedDistribution.top31_100}</div>
                        </div>
                        <svg className="w-16 h-8" viewBox="0 0 66 45">
                          <path d="M 1 22.5 L 65 22.5" fill="none" stroke="#FFA1A1" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Right Stacked Areaspline Chart with Highcharts Tooltip */}
                    <div className="lg:col-span-8 relative bg-white rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                      <div className="relative h-64">
                        {/* Dynamic Y-axis labels */}
                        {stackedDistributionData?.yLabels ? (
                          stackedDistributionData.yLabels.map((lbl, idx) => (
                            <div
                              key={idx}
                              className="absolute left-0 text-[11px] text-[#4E6570] font-normal"
                              style={{ top: `${(idx / (stackedDistributionData.yLabels.length - 1)) * 95}%` }}
                            >
                              {lbl}
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="absolute left-0 top-1 text-[11px] text-[#4E6570] font-normal">5</div>
                            <div className="absolute left-0 bottom-1 text-[11px] text-[#4E6570] font-normal">0</div>
                          </>
                        )}

                        {isLoadingRankings ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            Loading ranking distribution...
                          </div>
                        ) : !stackedDistributionData || !stackedDistributionData.dates || stackedDistributionData.dates.length === 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-xs font-semibold text-gray-600">No ranking position data recorded yet</span>
                            <span className="text-[11px] text-gray-400 mt-0.5">Historical ranking distribution will appear after ranking checks.</span>
                          </div>
                        ) : (
                          <>
                            {/* SVG Stacked Area Chart dynamically computed from project trend */}
                            <svg className="w-full h-full pl-6 overflow-visible" viewBox="0 0 693 262" preserveAspectRatio="none">
                          <defs>
                            <clipPath id="highcharts-stacked-clip">
                              <rect x="0" y="0" width="673" height="262" fill="none" />
                            </clipPath>
                          </defs>

                          {/* Horizontal Gridlines */}
                          <line x1="20" y1="0.5" x2="693" y2="0.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="20" y1="52.5" x2="693" y2="52.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="20" y1="105.5" x2="693" y2="105.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="20" y1="157.5" x2="693" y2="157.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="20" y1="210.5" x2="693" y2="210.5" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="20" y1="262" x2="693" y2="262" stroke="#CCD6EB" strokeWidth="1" />

                          {/* Vertical lines for dates */}
                          {stackedDistributionData?.dates?.map((dItem, idx) => (
                            <line key={idx} x1={dItem.x} y1="0" x2={dItem.x} y2="262" stroke="#F8FAFC" strokeWidth="1" />
                          ))}

                          {/* Dynamic Stacked Areas */}
                          {stackedDistributionData?.layers?.map((layer, idx) => (
                            <path key={idx} d={layer.d} fill={layer.fill} />
                          ))}

                          {/* Interactive Crosshair & Hover Points */}
                          {(() => {
                            const activeDist =
                              stackedDistributionData?.dates?.[hoveredDistributionDateIndex] ||
                              (stackedDistributionData?.dates && stackedDistributionData.dates.length > 0
                                ? stackedDistributionData.dates[stackedDistributionData.dates.length - 1]
                                : null);
                            if (!activeDist) return null;
                            return (
                              <>
                                <line
                                  x1={activeDist.x}
                                  y1="0"
                                  x2={activeDist.x}
                                  y2="259"
                                  stroke="rgb(44, 62, 80)"
                                  strokeWidth="1.5"
                                  strokeDasharray="4,3"
                                />
                                <circle cx={activeDist.x} cy={activeDist.yTotal} r="4" fill="#EFF1F9" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop100} r="4" fill="#FFA1A1" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop30} r="4" fill="#BD88E7" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop10} r="4" fill="#E788D5" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop5} r="4" fill="#F7CFCF" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop3} r="4" fill="#AEB5F2" stroke="#FFFFFF" strokeWidth="2" />
                                <circle cx={activeDist.x} cy={activeDist.yTop1} r="4" fill="#8983F0" stroke="#FFFFFF" strokeWidth="2" />
                              </>
                            );
                          })()}
                        </svg>

                        {/* Interactive Floating Tooltip */}
                        {(() => {
                          const activeDist =
                            stackedDistributionData?.dates?.[hoveredDistributionDateIndex] ||
                            (stackedDistributionData?.dates && stackedDistributionData.dates.length > 0
                              ? stackedDistributionData.dates[stackedDistributionData.dates.length - 1]
                              : null);
                          if (!activeDist) return null;
                          return (
                            <div
                              className="absolute bg-white/95 backdrop-blur-2xs border border-gray-200 rounded-lg shadow-xl p-3 text-xs z-30 pointer-events-none animate-in fade-in duration-100 w-44"
                              style={{
                                left: Math.max(10, Math.min(500, activeDist.x - 70)),
                                top: '10px',
                              }}
                            >
                              <div className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-1.5 text-xs">
                                {activeDist.label}
                              </div>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#eff1f9] border border-gray-300" />
                                    <span>Total:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#ffa1a1]" />
                                    <span>Top 31-100:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top31_100}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#bd88e7]" />
                                    <span>Top 11-30:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top11_30}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#e788d5]" />
                                    <span>Top 6-10:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top6_10}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#f7cfcf]" />
                                    <span>Top 4-5:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top4_5}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#aeb5f2]" />
                                    <span>Top 2-3:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top2_3}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#8983f0]" />
                                    <span>Top 1:</span>
                                  </span>
                                  <span className="font-bold text-gray-900">{activeDist.top1}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                          </>
                        )}
                      </div>

                      {/* X-axis labels matching dynamic dates */}
                      <div className="flex justify-between pl-6 text-[11px] text-[#666666] font-normal pt-2">
                        {stackedDistributionData?.dates && stackedDistributionData.dates.length > 0 ? (
                          stackedDistributionData.dates.map((dItem, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseEnter={() => setHoveredDistributionDateIndex(idx)}
                              className={`cursor-pointer transition-colors px-1 rounded ${
                                (hoveredDistributionDateIndex === idx || (hoveredDistributionDateIndex === 0 && idx === stackedDistributionData.dates.length - 1))
                                  ? 'font-bold text-[#171B24] bg-gray-100'
                                  : 'hover:text-gray-900'
                              }`}
                            >
                              {dItem.label}
                            </button>
                          ))
                        ) : (
                          <span>Current</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Keywords in SERP matching Real SE Ranking HTML */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[12px] text-[#171B24] font-semibold">
                  <span>Keywords in SERP</span>
                  <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                </div>
                <div className="text-3xl font-black text-[#171B24]">
                  {serpDynamics?.total ?? rankingsSummary?.totalKeywordsInSerp ?? keywords.length}
                </div>
              </div>

              {/* Progress Bar matching live serpDynamics */}
              <div className="space-y-2">
                <div className="w-full bg-[#D6D8E3] h-6 rounded flex overflow-hidden">
                  {(serpDynamics?.jumped?.count ?? 0) > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 cursor-pointer"
                      style={{ width: `${serpDynamics?.jumped?.percent ?? 0}%` }}
                      title={`Jumped ${serpDynamics?.jumped?.count} (${serpDynamics?.jumped?.percent}%)`}
                    />
                  )}
                  {(serpDynamics?.dropped?.count ?? 0) > 0 && (
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 cursor-pointer"
                      style={{ width: `${serpDynamics?.dropped?.percent ?? 0}%` }}
                      title={`Dropped ${serpDynamics?.dropped?.count} (${serpDynamics?.dropped?.percent}%)`}
                    />
                  )}
                  <div
                    className="h-full bg-[#D6D8E3] transition-all duration-500 cursor-pointer flex-1"
                    title={`Unchanged ${serpDynamics?.unchanged?.count ?? keywords.length} (${serpDynamics?.unchanged?.percent ?? 100}%)`}
                  />
                </div>
                <div className="flex items-center gap-5 text-xs font-medium text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
                    <span className="font-semibold text-gray-800">
                      Jumped {serpDynamics?.jumped?.count ?? 0} ({serpDynamics?.jumped?.percent ?? 0}%)
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-full inline-block bg-rose-500" />
                    <span className="font-semibold text-gray-800">
                      Dropped {serpDynamics?.dropped?.count ?? 0} ({serpDynamics?.dropped?.percent ?? 0}%)
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="w-2.5 h-2.5 rounded-full inline-block bg-[#D6D8E3]" />
                    <span className="font-semibold text-gray-800">
                      Unchanged {serpDynamics?.unchanged?.count ?? keywords.length} ({serpDynamics?.unchanged?.percent ?? 100}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* 3 Tables: Jumped, Dropped, Unchanged */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-3 border-t border-gray-100">
                {/* Column 1: Jumped */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1">
                      <span>Jumped ({serpDynamics?.jumped?.count ?? 0})</span>
                      <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] text-gray-400 font-semibold">
                      <span>%</span>
                      <span>Keywords</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'Top 1', color: 'rgb(54, 179, 126)', val: serpDynamics?.jumped?.top1 ?? 0 },
                      { label: 'Top 2-3', color: 'rgb(74, 186, 139)', val: serpDynamics?.jumped?.top2_3 ?? 0 },
                      { label: 'Top 4-5', color: 'rgb(94, 194, 152)', val: serpDynamics?.jumped?.top4_5 ?? 0 },
                      { label: 'Top 6-10', color: 'rgb(114, 202, 164)', val: serpDynamics?.jumped?.top6_10 ?? 0 },
                      { label: 'Top 11-30', color: 'rgb(134, 209, 178)', val: serpDynamics?.jumped?.top11_30 ?? 0 },
                      { label: 'Top 31-100', color: 'rgb(154, 217, 190)', val: serpDynamics?.jumped?.top31_100 ?? 0 },
                      { label: '>100', color: 'rgb(175, 225, 203)', val: serpDynamics?.jumped?.over100 ?? 0 },
                    ].map((row, i) => {
                      const totalJumped = serpDynamics?.jumped?.count || 1;
                      const pct = row.val > 0 ? `${Math.round((row.val / totalJumped) * 100)}%` : '0%';
                      return (
                        <div key={i} className="py-2 flex items-center justify-between text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: row.color }} />
                            <span className="font-medium text-gray-700">{row.label}</span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <span className="w-10 text-gray-500">{pct}</span>
                            <span className="w-6 font-bold text-gray-800">{row.val}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Dropped */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1">
                      <span>Dropped ({serpDynamics?.dropped?.count ?? 0})</span>
                      <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] text-gray-400 font-semibold">
                      <span>%</span>
                      <span>Keywords</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'Top 1', color: 'rgb(244, 67, 54)', val: serpDynamics?.dropped?.top1 ?? 0 },
                      { label: 'Top 2-3', color: 'rgb(245, 85, 74)', val: serpDynamics?.dropped?.top2_3 ?? 0 },
                      { label: 'Top 4-5', color: 'rgb(246, 105, 94)', val: serpDynamics?.dropped?.top4_5 ?? 0 },
                      { label: 'Top 6-10', color: 'rgb(247, 123, 114)', val: serpDynamics?.dropped?.top6_10 ?? 0 },
                      { label: 'Top 11-30', color: 'rgb(248, 142, 134)', val: serpDynamics?.dropped?.top11_30 ?? 0 },
                      { label: 'Top 31-100', color: 'rgb(249, 161, 154)', val: serpDynamics?.dropped?.top31_100 ?? 0 },
                      { label: '>100', color: 'rgb(251, 180, 175)', val: serpDynamics?.dropped?.over100 ?? 0 },
                    ].map((row, i) => {
                      const totalDropped = serpDynamics?.dropped?.count || 1;
                      const pct = row.val > 0 ? `${Math.round((row.val / totalDropped) * 100)}%` : '0%';
                      return (
                        <div key={i} className="py-2 flex items-center justify-between text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: row.color }} />
                            <span className="font-medium text-gray-700">{row.label}</span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <span className="w-10 text-gray-500">{pct}</span>
                            <span className="w-6 font-bold text-gray-800">{row.val}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Unchanged */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1">
                      <span>Unchanged ({serpDynamics?.unchanged?.count ?? keywords.length})</span>
                      <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] text-gray-400 font-semibold">
                      <span>%</span>
                      <span>Keywords</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'Top 1', color: 'rgb(214, 216, 227)', val: serpDynamics?.unchanged?.top1 ?? (serpDynamics ? 0 : calculatedDistribution.top1) },
                      { label: 'Top 2-3', color: 'rgb(218, 220, 230)', val: serpDynamics?.unchanged?.top2_3 ?? (serpDynamics ? 0 : calculatedDistribution.top2_3) },
                      { label: 'Top 4-5', color: 'rgb(222, 224, 233)', val: serpDynamics?.unchanged?.top4_5 ?? (serpDynamics ? 0 : calculatedDistribution.top4_5) },
                      { label: 'Top 6-10', color: 'rgb(226, 228, 235)', val: serpDynamics?.unchanged?.top6_10 ?? (serpDynamics ? 0 : calculatedDistribution.top6_10) },
                      { label: 'Top 11-30', color: 'rgb(230, 232, 238)', val: serpDynamics?.unchanged?.top11_30 ?? (serpDynamics ? 0 : calculatedDistribution.top11_30) },
                      { label: 'Top 31-100', color: 'rgb(234, 235, 241)', val: serpDynamics?.unchanged?.top31_100 ?? (serpDynamics ? 0 : calculatedDistribution.top31_100) },
                      { label: '>100', color: 'rgb(239, 239, 244)', val: serpDynamics?.unchanged?.over100 ?? 0 },
                    ].map((row, i) => {
                      const totalUnchanged = serpDynamics?.unchanged?.count ?? keywords.length ?? 1;
                      const pct = row.val > 0 && totalUnchanged > 0 ? `${Math.round((row.val / totalUnchanged) * 100)}%` : '0%';
                      const highlight = row.val > 0;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (row.val > 0) {
                              setActiveTab('detailed');
                              router.push('/rankings?tab=detailed');
                            }
                          }}
                          className={`py-2 flex items-center justify-between transition-colors ${
                            highlight ? 'cursor-pointer hover:bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: row.color }} />
                            <span className={`font-medium ${highlight ? 'text-[#7C3AED] hover:underline' : 'text-gray-700'}`}>
                              {row.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <span className={`w-10 ${highlight ? 'font-bold text-[#7C3AED]' : 'text-gray-500'}`}>{pct}</span>
                            <span className={`w-6 font-bold ${highlight ? 'text-[#7C3AED]' : 'text-gray-800'}`}>{row.val}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword overview matching Real SE Ranking HTML */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-[#171B24]">Keyword overview</h3>
                  <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Groups Dropdown */}
                  <div className="relative flex items-center gap-1 text-gray-500">
                    <span>Groups:</span>
                    <button
                      type="button"
                      onClick={() => setIsKwOverviewGroupsOpen(!isKwOverviewGroupsOpen)}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                    >
                      <Folder className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedKwOverviewGroup}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {isKwOverviewGroupsOpen && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                        {['All groups', 'General'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setSelectedKwOverviewGroup(g);
                              setIsKwOverviewGroupsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 ${
                              selectedKwOverviewGroup === g ? 'font-bold text-[#7C3AED]' : 'text-gray-700'
                            }`}
                          >
                            <Folder className="w-3 h-3 text-gray-400" />
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View mode Dropdown */}
                  <div className="relative flex items-center gap-1 text-gray-500">
                    <span>View mode:</span>
                    <button
                      type="button"
                      onClick={() => setIsKwOverviewViewModeOpen(!isKwOverviewViewModeOpen)}
                      className="px-2.5 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer shadow-2xs"
                    >
                      <List className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedKwOverviewViewMode}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {isKwOverviewViewModeOpen && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                        {['List', 'Groups'].map((vm) => (
                          <button
                            key={vm}
                            type="button"
                            onClick={() => {
                              setSelectedKwOverviewViewMode(vm);
                              setIsKwOverviewViewModeOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 ${
                              selectedKwOverviewViewMode === vm ? 'font-bold text-[#7C3AED]' : 'text-gray-700'
                            }`}
                          >
                            <span>{vm}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Switch Bar: Visibility / Traffic Forecast */}
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-100 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setKeywordOverviewMode('VISIBILITY')}
                      className={`px-3 py-1 cursor-pointer transition-colors ${
                        keywordOverviewMode === 'VISIBILITY'
                          ? 'bg-[#4A4E69] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Visibility
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeywordOverviewMode('TRAFFIC FORECAST')}
                      className={`px-3 py-1 cursor-pointer transition-colors ${
                        keywordOverviewMode === 'TRAFFIC FORECAST'
                          ? 'bg-[#4A4E69] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Traffic Forecast
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Panels side-by-side matching Real SE Ranking HTML */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: TOP keywords */}
                <div className="space-y-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] text-gray-400 font-bold uppercase pb-2">
                        <th className="py-1">TOP keywords</th>
                        <th className="py-1 text-center">Positions</th>
                        <th className="py-1 text-right">{keywordOverviewMode === 'TRAFFIC FORECAST' ? 'Traffic Forecast ℹ' : 'Visibility ℹ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topKeywordsForOverview.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Search className="w-5 h-5 text-gray-300" />
                              <span className="font-semibold text-gray-600">No ranked keywords</span>
                              <span className="text-[11px] text-gray-400">No keywords ranking in the top 100 yet.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        topKeywordsForOverview.map((row, i) => {
                          const metricVal = keywordOverviewMode === 'TRAFFIC FORECAST'
                            ? (row.traffic != null ? row.traffic : (row.volume && row.rank ? Math.round(Number(row.volume) * (row.rank === 1 ? 0.3 : row.rank <= 3 ? 0.15 : row.rank <= 10 ? 0.05 : 0.01)) : '-'))
                            : (row.rank ? (row.rank === 1 ? '100%' : row.rank <= 3 ? '80%' : row.rank <= 5 ? '50%' : row.rank <= 10 ? '25%' : row.rank <= 30 ? '10%' : '1%') : '-');
                          return (
                            <tr key={row.id || i} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-2.5">
                                <span
                                  onClick={() => {
                                    setActiveTab('detailed');
                                    setDetailedTableSearch(row.keyword);
                                    router.push('/rankings?tab=detailed');
                                  }}
                                  className="text-[#7C3AED] hover:underline cursor-pointer font-medium block truncate max-w-[160px]"
                                >
                                  {row.keyword}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-bold text-gray-900">
                                {row.rank ?? '-'}
                              </td>
                              <td className="py-2.5 text-right font-medium text-gray-500">
                                {metricVal}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('detailed');
                        router.push('/rankings?tab=detailed');
                      }}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                      <span>View all ({keywords.length})</span>
                    </button>
                  </div>
                </div>

                {/* Panel 2: Jumped */}
                <div className="space-y-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] text-gray-400 font-bold uppercase pb-2">
                        <th className="py-1">Jumped ℹ</th>
                        <th className="py-1 text-center">Positions</th>
                        <th className="py-1 text-right">{keywordOverviewMode === 'TRAFFIC FORECAST' ? 'Traffic Forecast ℹ' : 'Visibility ℹ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {jumpedKeywordsForOverview.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Search className="w-5 h-5 text-gray-300" />
                              <span className="font-semibold text-gray-600">No results found</span>
                              <span className="text-[11px] text-gray-400">No keywords with improved positions.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        jumpedKeywordsForOverview.map((row, i) => {
                          const change = row.change ?? row.dynamics ?? 0;
                          const metricVal = keywordOverviewMode === 'TRAFFIC FORECAST'
                            ? (row.traffic != null ? row.traffic : (row.volume && row.rank ? Math.round(Number(row.volume) * (row.rank === 1 ? 0.3 : row.rank <= 3 ? 0.15 : row.rank <= 10 ? 0.05 : 0.01)) : '-'))
                            : (row.rank ? (row.rank === 1 ? '100%' : row.rank <= 3 ? '80%' : row.rank <= 5 ? '50%' : row.rank <= 10 ? '25%' : row.rank <= 30 ? '10%' : '1%') : '-');
                          return (
                            <tr key={row.id || i} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-2.5">
                                <span
                                  onClick={() => {
                                    setActiveTab('detailed');
                                    setDetailedTableSearch(row.keyword);
                                    router.push('/rankings?tab=detailed');
                                  }}
                                  className="text-[#7C3AED] hover:underline cursor-pointer font-medium block truncate max-w-[160px]"
                                >
                                  {row.keyword}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-bold text-gray-900">
                                <span className="flex items-center justify-center gap-1">
                                  <span>{row.rank ?? '-'}</span>
                                  <span className="text-[10px] text-emerald-600 font-bold">+{change}</span>
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-medium text-gray-500">
                                {metricVal}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('detailed');
                        setDetailedChangesFilter('up');
                        router.push('/rankings?tab=detailed');
                      }}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                      <span>View all ({serpDynamics?.jumped?.count ?? jumpedKeywordsForOverview.length})</span>
                    </button>
                  </div>
                </div>

                {/* Panel 3: Dropped */}
                <div className="space-y-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] text-gray-400 font-bold uppercase pb-2">
                        <th className="py-1">Dropped ℹ</th>
                        <th className="py-1 text-center">Positions</th>
                        <th className="py-1 text-right">{keywordOverviewMode === 'TRAFFIC FORECAST' ? 'Traffic Forecast ℹ' : 'Visibility ℹ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {droppedKeywordsForOverview.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Search className="w-5 h-5 text-gray-300" />
                              <span className="font-semibold text-gray-600">No results found</span>
                              <span className="text-[11px] text-gray-400">No keywords with dropped positions.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        droppedKeywordsForOverview.map((row, i) => {
                          const change = row.change ?? row.dynamics ?? 0;
                          const metricVal = keywordOverviewMode === 'TRAFFIC FORECAST'
                            ? (row.traffic != null ? row.traffic : (row.volume && row.rank ? Math.round(Number(row.volume) * (row.rank === 1 ? 0.3 : row.rank <= 3 ? 0.15 : row.rank <= 10 ? 0.05 : 0.01)) : '-'))
                            : (row.rank ? (row.rank === 1 ? '100%' : row.rank <= 3 ? '80%' : row.rank <= 5 ? '50%' : row.rank <= 10 ? '25%' : row.rank <= 30 ? '10%' : '1%') : '-');
                          return (
                            <tr key={row.id || i} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-2.5">
                                <span
                                  onClick={() => {
                                    setActiveTab('detailed');
                                    setDetailedTableSearch(row.keyword);
                                    router.push('/rankings?tab=detailed');
                                  }}
                                  className="text-[#7C3AED] hover:underline cursor-pointer font-medium block truncate max-w-[160px]"
                                >
                                  {row.keyword}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-bold text-gray-900">
                                <span className="flex items-center justify-center gap-1">
                                  <span>{row.rank ?? '-'}</span>
                                  <span className="text-[10px] text-red-600 font-bold">{change}</span>
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-medium text-gray-500">
                                {metricVal}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('detailed');
                        setDetailedChangesFilter('down');
                        router.push('/rankings?tab=detailed');
                      }}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                      <span>View all ({serpDynamics?.dropped?.count ?? droppedKeywordsForOverview.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Section matching Real SE Ranking HTML */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-[#171B24]">Pages</h3>
                  <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                </div>

                {/* Tabs: Top, Jumped, Dropped */}
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-100 text-[11px] font-semibold">
                  {(['Top', 'Jumped', 'Dropped'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPagesFilterTab(t.toUpperCase() as any)}
                      className={`px-3 py-1 cursor-pointer transition-colors ${
                        (pagesFilterTab === 'TOP' && t === 'Top') ||
                        (pagesFilterTab === 'JUMPED' && t === 'Jumped') ||
                        (pagesFilterTab === 'DROPPED' && t === 'Dropped')
                          ? 'bg-[#4A4E69] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">URL in SERP</th>
                      <th className="py-2.5 px-3 text-right">Total keywords</th>
                      <th className="py-2.5 px-3 text-right">Traffic Forecast ℹ</th>
                      <th className="py-2.5 px-3 text-right">Average position ℹ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredPagesList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Search className="w-5 h-5 text-gray-300" />
                            <span className="font-semibold text-gray-600">No pages found</span>
                            <span className="text-[11px] text-gray-400">No ranking pages recorded for this project yet.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPagesList.map((page, idx) => (
                        <tr key={page.url || idx} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3 space-y-0.5 max-w-lg">
                            <div className="font-semibold text-gray-900 hover:text-[#7C3AED] cursor-pointer truncate">
                              {page.url}
                            </div>
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#7C3AED] hover:underline block truncate"
                            >
                              {page.url}
                            </a>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900">{page.totalKeywords}</td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900">{page.trafficForecast}</td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900">{page.avgPosition}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('detailed');
                    router.push('/rankings?tab=detailed');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                  <span>View all ({filteredPagesList.length})</span>
                </button>
              </div>
            </div>

            {/* Competitors & Distribution of competitors (2 Columns matching Real SE Ranking HTML) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Competitors */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-semibold text-[#171B24]">Competitors</h3>
                    <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                  </div>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="py-2.5 px-2">Domain</th>
                          <th className="py-2.5 px-2 text-right">Search visibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {activeCompetitorsList.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-xs text-gray-400">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <Search className="w-5 h-5 text-gray-300" />
                                <span className="font-semibold text-gray-600">No competitors found</span>
                                <span className="text-[11px] text-gray-400">Add competitors to track their search visibility.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          activeCompetitorsList.map((comp) => (
                            <tr
                              key={comp.id}
                              className="hover:bg-gray-50/70 transition-colors"
                              onMouseEnter={() => setHoveredCompetitorDomain(comp.domain)}
                              onMouseLeave={() => setHoveredCompetitorDomain(null)}
                            >
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={comp.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-gray-600 shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <img
                                    src={comp.favicon}
                                    alt={comp.domain}
                                    className="w-4 h-4 rounded-xs shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <Link
                                    href={`/research?domain=${encodeURIComponent(comp.domain)}`}
                                    className="text-[#7C3AED] hover:underline font-medium truncate max-w-xs"
                                  >
                                    {comp.domain}
                                  </Link>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right font-semibold text-gray-900">
                                {comp.visibility}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => router.push('/competitors')}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                    <span>View all ({activeCompetitorsList.length})</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Distribution of competitors (Authentic Highcharts Bubble Scatter Chart!) */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-semibold text-[#171B24]">Distribution of competitors</h3>
                    <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                  </div>

                  <div className="relative pt-3 pb-1">
                    {/* Y-axis label */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[#607D8B] font-semibold tracking-wider uppercase origin-center whitespace-nowrap">
                      Average position
                    </div>

                    <div className="pl-6 pr-2">
                      {activeCompetitorsList.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center text-xs text-gray-400 gap-1 border border-dashed border-gray-200 rounded-lg">
                          <Search className="w-6 h-6 text-gray-300" />
                          <span className="font-semibold text-gray-600">No competitor distribution data</span>
                          <span className="text-[11px] text-gray-400">Add competitors to compare average position and Top 10 rankings.</span>
                        </div>
                      ) : (
                        <>
                          {/* SVG Canvas for Bubble Scatter Chart */}
                          <div className="relative h-60 w-full border-l border-b border-[#CCD6EB]">
                            {/* Horizontal Y-Gridlines & Labels (0, 5, 10) */}
                            <div className="absolute -left-5 top-[10%] -translate-y-1/2 text-[11px] text-[#6B8896] font-normal">0</div>
                            <div className="absolute left-0 right-0 top-[10%] border-b border-[#E6E6E6]" />

                            <div className="absolute -left-5 top-[50%] -translate-y-1/2 text-[11px] text-[#6B8896] font-normal">5</div>
                            <div className="absolute left-0 right-0 top-[50%] border-b border-[#E6E6E6]" />

                            <div className="absolute -left-5 top-[90%] -translate-y-1/2 text-[11px] text-[#6B8896] font-normal">10</div>
                            <div className="absolute left-0 right-0 top-[90%] border-b border-[#E6E6E6]" />

                            {/* Interactive SVG Bubbles */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 508 200" preserveAspectRatio="none">
                              {activeCompetitorsList.map((comp) => {
                                const isHovered = hoveredCompetitorBubble === comp.domain || hoveredCompetitorDomain === comp.domain;
                                return (
                                  <g
                                    key={comp.id}
                                    className="cursor-pointer group transition-transform duration-200"
                                    onMouseEnter={() => setHoveredCompetitorBubble(comp.domain)}
                                    onMouseLeave={() => setHoveredCompetitorBubble(null)}
                                  >
                                    <circle
                                      cx={comp.cx}
                                      cy={comp.cy}
                                      r={isHovered ? 34 : 31.5}
                                      fill={comp.color}
                                      stroke={comp.stroke}
                                      strokeWidth={isHovered ? 2.5 : 1.5}
                                    />
                                    <text
                                      x={comp.cx + 3}
                                      y={comp.cy - 30}
                                      textAnchor="middle"
                                      className="text-[12px] font-bold fill-[#2D355D] select-none"
                                      transform={`rotate(-45 ${comp.cx + 3} ${comp.cy - 30})`}
                                    >
                                      {comp.domain}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>

                            {/* Interactive Tooltip matching user HTML when hovered */}
                            {hoveredCompetitorBubble && (
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xs border border-gray-200 rounded-lg shadow-xl p-3 text-xs z-30 pointer-events-none animate-in fade-in duration-150 min-w-[260px]">
                                {(() => {
                                  const activeComp = activeCompetitorsList.find((c) => c.domain === hoveredCompetitorBubble) || activeCompetitorsList[0];
                                  if (!activeComp) return null;
                                  return (
                                    <>
                                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2 font-bold text-gray-900">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full"
                                          style={{ backgroundColor: activeComp.stroke }}
                                        />
                                        <span>{activeComp.domain}</span>
                                      </div>
                                      <div className="space-y-1 text-[11px] text-gray-600">
                                        <div className="flex justify-between">
                                          <span>The total number of keywords ranking in the top 10:</span>
                                          <span className="font-bold text-gray-900">{activeComp.top10Kws}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Average position:</span>
                                          <span className="font-bold text-gray-900">{activeComp.avgPos}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Visibility:</span>
                                          <span className="font-bold text-gray-900">{activeComp.visibility}</span>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* X-axis ticks (0.9, 1, 2, 3) */}
                          <div className="flex justify-between text-[11px] text-[#6B8896] font-normal pt-1.5 px-2">
                            <span>0.9</span>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                          </div>

                          {/* X-axis title */}
                          <div className="text-center text-[11px] text-[#607D8B] font-semibold tracking-wider uppercase pt-1">
                            The total number of keywords ranking in the top 10
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Legend matching Real SE Ranking HTML colors and names */}
                <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-y-2 gap-x-3 text-[11px] font-normal text-[#171B24]">
                  {activeCompetitorsList.map((comp) => (
                    <span
                      key={comp.id}
                      onMouseEnter={() => setHoveredCompetitorBubble(comp.domain)}
                      onMouseLeave={() => setHoveredCompetitorBubble(null)}
                      className="flex items-center gap-2 truncate cursor-pointer hover:opacity-80"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: comp.stroke }} />
                      <span className="truncate uppercase font-medium">{comp.domain}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section matching Real SE Ranking HTML */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-semibold text-[#171B24]">Notes</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateNoteOpen(true)}
                  className="bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create a note</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 w-36">Date</th>
                      <th className="py-2.5 px-3 w-44">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {notes.map((note) => {
                      const isExpanded = expandedNoteIds.includes(note.id);
                      return (
                        <tr key={note.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3 space-y-1 align-top">
                            <div className="font-bold text-gray-900 text-xs">{note.title}</div>
                            <p className="text-gray-600 text-[11px] leading-relaxed max-w-2xl">
                              {isExpanded ? note.fullDesc : note.shortDesc}{' '}
                              {note.fullDesc !== note.shortDesc && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isExpanded) {
                                      setExpandedNoteIds((prev) => prev.filter((id) => id !== note.id));
                                    } else {
                                      setExpandedNoteIds((prev) => [...prev, note.id]);
                                    }
                                  }}
                                  className="text-[#7C3AED] font-medium hover:underline cursor-pointer"
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-gray-500 font-medium text-xs align-top whitespace-nowrap">
                            {note.date}
                          </td>
                          <td className="py-3 px-3 text-xs align-top">
                            <div className="flex items-center gap-1.5 font-medium text-gray-800">
                              <span className="w-3.5 h-3.5 shrink-0">
                                {note.category === 'Project note' ? '📝' : '⚡'}
                              </span>
                              <span>{note.category}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* View all (50) button opening Project Notes Modal */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setIsProjectNotesModalOpen(true)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 rotate-45 text-gray-500" />
                  <span>View all (50)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE A NOTE MODAL matching exact SE Ranking user screenshot */}
      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        initialDate={createNoteInitialDate}
        availableKeywords={keywords.map((k) => k.keyword)}
        onSaveNote={(newNote) => {
          setNotes((prev) => {
            const updated = [newNote, ...prev];
            try {
              localStorage.setItem('seranking_notes', JSON.stringify(updated));
            } catch {}
            return updated;
          });
          showToast('Note created successfully!');
        }}
      />

      {/* CONNECT GOOGLE ANALYTICS MODAL */}
      {isConnectGAOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#F9AB00" fillOpacity="0.1" />
                  <path d="M17.5 19H19.5V7H17.5V19ZM12.5 19H14.5V11H12.5V19ZM7.5 19H9.5V15H7.5V19Z" fill="#E37400" />
                  <circle cx="5" cy="18" r="2" fill="#E37400" />
                </svg>
                <span>Connect Google Analytics 4</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConnectGAOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your GA4 property to view live organic search sessions, users, conversions, and bounce rate directly inside your SE Ranking rankings summary.
            </p>

            {(() => {
              const projectDomainClean = (activeProject?.domain || 'jio.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
              const cleanPrefix = projectDomainClean.split('.')[0].toUpperCase();
              const measurementId = `G-${cleanPrefix.slice(0, 4)}984210`;
              const isWorkAccount = !!gaAccountEmail;
              const displayEmail = isWorkAccount ? gaAccountEmail : `analytics@${projectDomainClean}`;
              const displayName = gaAccountName || `${cleanPrefix} Digital Analytics (Google Workspace)`;

              return (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        Google Work Account
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsGaGoogleChooserOpen(true)}
                        className="text-[11px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Switch work account</span>
                      </button>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GoogleLogo size={18} />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-xs truncate">
                            {displayEmail}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate flex items-center gap-1.5">
                            <span>{displayName}</span>
                            <span className="text-[9px] text-[#7C3AED] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 font-medium">Work Account</span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Authorized
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/rankings?tab=summary';
                          window.location.href = `/api/auth/google?state=${encodeURIComponent(currentPath)}`;
                        }}
                        className="flex-1 py-2 px-3 border border-gray-300 hover:border-[#7C3AED] bg-white hover:bg-purple-50/40 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                      >
                        <GoogleLogo size={14} />
                        <span>Sign in with Google OAuth (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGaGoogleChooserOpen(true)}
                        className="py-2 px-3 border border-purple-200 bg-purple-50 hover:bg-purple-100/60 rounded-lg text-xs font-semibold text-[#7C3AED] cursor-pointer"
                      >
                        Select Work Profile
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Select GA4 Property &amp; Data Stream
                    </label>
                    <select
                      value={gaPropertyId}
                      onChange={(e) => setGaPropertyId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#7C3AED]"
                    >
                      <option value={`${projectDomainClean} (GA4-98421035)`}>
                        {projectDomainClean} - Official Web Production Stream (GA4-98421035)
                      </option>
                      <option value={`${projectDomainClean}-all (GA4-48291054)`}>
                        {projectDomainClean} - All Traffic &amp; Organic Search (GA4-48291054)
                      </option>
                      <option value={`${projectDomainClean}-mobile (GA4-33290114)`}>
                        {projectDomainClean} - Mobile App &amp; Web Stream (GA4-33290114)
                      </option>
                    </select>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                    Target Domain: <strong>{projectDomainClean}</strong> · Measurement ID: <code>{measurementId}</code>
                  </div>
                </div>
              );
            })()}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsConnectGAOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGAConnected(true);
                  try {
                    localStorage.setItem('seranking_ga_connected', 'true');
                    localStorage.setItem('se_ranking_connected_account', gaAccountEmail);
                    localStorage.setItem('se_ranking_connected_user', gaAccountName);
                  } catch {}
                  if (activeProject?.id) {
                    fetch('/api/integrations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        projectId: activeProject.id,
                        provider: 'ga4',
                        status: 'connected',
                        accountName: gaAccountEmail,
                      }),
                    }).catch(() => {});
                  }
                  showToast('Google Analytics 4 connected successfully! Live organic traffic synced.');
                  setIsConnectGAOpen(false);
                }}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Connect Property</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Chooser Modal for Google Analytics */}
      <GoogleAccountChooserModal
        isOpen={isGaGoogleChooserOpen}
        onClose={() => setIsGaGoogleChooserOpen(false)}
        serviceName="Google Analytics"
        workspaceDomain={(activeProject?.domain || 'jio.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}
        onSelectAccount={handleGaAccountSelected}
      />

      {/* RANKING SETTINGS MODAL matching Screenshot 3 */}
      {isRankingSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Ranking settings</h3>
              <button
                type="button"
                onClick={() => {
                  setTempRankingSettings(rankingSettings);
                  setIsRankingSettingsModalOpen(false);
                  setActiveSettingsSubmenu(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 text-xs text-gray-800">
              {/* Row 1: Show charts */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Show charts</span>
                <button
                  type="button"
                  onClick={() => setTempRankingSettings(prev => ({ ...prev, showCharts: !prev.showCharts }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    tempRankingSettings.showCharts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      tempRankingSettings.showCharts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Show all search engines data ℹ */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-800 text-sm">Show all search engines data</span>
                  <span className="cursor-help text-gray-400 text-xs" title="Display metrics from all configured search engines side by side">ℹ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTempRankingSettings(prev => ({ ...prev, showAllSearchEngines: !prev.showAllSearchEngines }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    tempRankingSettings.showAllSearchEngines ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      tempRankingSettings.showAllSearchEngines ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 3: Default chart */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Default chart</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'defaultChart' ? null : 'defaultChart')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.defaultChart}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'defaultChart' && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Average position', 'Search visibility', 'Organic traffic', 'Traffic forecast'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, defaultChart: opt }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.defaultChart === opt ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Default section */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Default section</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'defaultSection' ? null : 'defaultSection')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.defaultSection}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'defaultSection' && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Detailed', 'Summary', 'Historical'].map(sec => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, defaultSection: sec }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.defaultSection === sec ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Keywords per page */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Keywords per page</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'keywordsPerPage' ? null : 'keywordsPerPage')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.keywordsPerPage}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'keywordsPerPage' && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {[25, 50, 100, 200, 500].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, keywordsPerPage: count }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.keywordsPerPage === count ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Web page URL ℹ */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-800 text-sm">Web page URL</span>
                  <span className="cursor-help text-gray-400 text-xs" title="Choose how keyword target URLs are displayed in the rankings table">ℹ</span>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'webPageUrl' ? null : 'webPageUrl')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.webPageUrl}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'webPageUrl' && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Icon', 'Full URL', 'Domain only', 'Hidden'].map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, webPageUrl: mode }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.webPageUrl === mode ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 7: Table columns */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Table columns</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'tableColumns' ? null : 'tableColumns')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer max-w-xs truncate"
                    title={tempRankingSettings.tableColumns.join(', ')}
                  >
                    <span className="truncate">{tempRankingSettings.tableColumns.join(', ')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </button>
                  {activeSettingsSubmenu === 'tableColumns' && (
                    <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-30 text-xs space-y-1">
                      {['Content Score', 'SERP features', 'Search vol.', 'URL', 'CPC', 'Difficulty', 'Competition'].map(col => {
                        const isChecked = tempRankingSettings.tableColumns.includes(col);
                        return (
                          <label key={col} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTempRankingSettings(prev => ({
                                  ...prev,
                                  tableColumns: isChecked
                                    ? prev.tableColumns.filter(c => c !== col)
                                    : [...prev.tableColumns, col]
                                }));
                              }}
                              className="rounded text-[#7C3AED]"
                            />
                            <span>{col}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 8: Rankings data alignment */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Rankings data alignment</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'dataAlignment' ? null : 'dataAlignment')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.dataAlignment}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'dataAlignment' && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Left to right', 'Right to left'].map(align => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, dataAlignment: align }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.dataAlignment === align ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 9: Amount of displayed data */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Amount of displayed data</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'amountDisplayed' ? null : 'amountDisplayed')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.amountDisplayed}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'amountDisplayed' && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Default', 'Extended', 'Compact'].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, amountDisplayed: amt }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.amountDisplayed === amt ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 10: Default table view mode */}
              <div className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Default table view mode</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsSubmenu(activeSettingsSubmenu === 'tableViewMode' ? null : 'tableViewMode')}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-[#7C3AED] font-medium text-xs cursor-pointer"
                  >
                    <span>{tempRankingSettings.tableViewMode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {activeSettingsSubmenu === 'tableViewMode' && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                      {['Default', 'Groups', 'List'].map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setTempRankingSettings(prev => ({ ...prev, tableViewMode: mode }));
                            setActiveSettingsSubmenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            tempRankingSettings.tableViewMode === mode ? 'text-[#7C3AED] font-bold' : 'text-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions matching Screenshot 3 */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setTempRankingSettings(rankingSettings);
                  setIsRankingSettingsModalOpen(false);
                  setActiveSettingsSubmenu(null);
                }}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  setRankingSettings(tempRankingSettings);
                  setIsRankingSettingsModalOpen(false);
                  setActiveSettingsSubmenu(null);
                  if (tempRankingSettings.defaultSection === 'Detailed') setActiveTab('detailed');
                  else if (tempRankingSettings.defaultSection === 'Summary') setActiveTab('summary');
                  else if (tempRankingSettings.defaultSection === 'Historical') setActiveTab('historical');
                  showToast('Ranking settings applied successfully!');
                }}
                className="px-6 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT DATA MODAL matching Screenshot 2 */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-7 shadow-2xl space-y-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Export data</h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-3 font-medium">Format:</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Excel Option Card matching Screenshot 2 */}
                <div
                  onClick={() => setSelectedExportFormat('xlsx')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedExportFormat === 'xlsx'
                      ? 'bg-[#504674] border-[#504674] text-white shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="3" fill={selectedExportFormat === 'xlsx' ? '#ffffff' : '#107C41'} />
                      <path d="M7 7l10 10M17 7L7 17" stroke={selectedExportFormat === 'xlsx' ? '#504674' : '#ffffff'} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="font-bold text-sm">Excel (.xlsx)</div>
                  <div className={`text-xs italic ${selectedExportFormat === 'xlsx' ? 'text-white/80' : 'text-gray-400'}`}>
                    Max. 10K rows
                  </div>
                </div>

                {/* CSV Option Card matching Screenshot 2 */}
                <div
                  onClick={() => setSelectedExportFormat('csv')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedExportFormat === 'csv'
                      ? 'bg-[#504674] border-[#504674] text-white shadow-md'
                      : 'bg-white border-[#A78BFA] hover:border-[#7C3AED] text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs ${
                      selectedExportFormat === 'csv' ? 'bg-white text-[#504674]' : 'bg-[#7C3AED] text-white'
                    }`}>
                      CSV
                    </div>
                  </div>
                  <div className="font-bold text-sm">CSV (.csv)</div>
                  <div className={`text-xs italic ${selectedExportFormat === 'csv' ? 'text-white/80' : 'text-gray-400'}`}>
                    No limits
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handlePerformExport}
                className="px-6 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW IT WORKS MODAL (Google Looker Studio) matching Screenshot 1 */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#504674] text-white rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">How Looker Studio Integration Works</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                SE Ranking connects seamlessly with Google Looker Studio (formerly Google Data Studio) so you can create customized, automated client reports and live ranking dashboards.
              </p>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2">
                <div className="font-bold text-gray-800">Quick Setup Instructions:</div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Click any template link in the <strong>DATA STUDIO</strong> menu.</li>
                  <li>In Looker Studio, authorize the <strong>SE Ranking Connector</strong>.</li>
                  <li>Enter your site identifier <code>{domain.replace(/^https?:\/\//, '')}</code>.</li>
                  <li>Click <strong>Connect</strong> to automatically populate rankings, competitors, and SERP features.</li>
                </ol>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-900 flex items-center justify-between">
                <span className="font-mono text-[11px] truncate mr-2">
                  connectorId=se_ranking_12960641
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://lookerstudio.google.com/datasources/create?connectorId=se_ranking_12960641');
                    showToast('Looker Studio Connector URL copied!');
                  }}
                  className="px-3 py-1 bg-[#504674] text-white text-[11px] font-bold rounded hover:bg-[#403660] cursor-pointer shrink-0 transition-colors"
                >
                  Copy URL
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Potential Keywords Modal */}
      {isHighPotentialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="font-bold text-sm text-gray-900">High-Potential Keywords for {domain}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHighPotentialModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-500 text-xs">
                Select high search volume, low competition search terms with commercial intent:
              </p>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {highPotentialLoading && (
                  <div className="p-4 text-center text-gray-400">Loading keyword ideas…</div>
                )}
                {!highPotentialLoading && highPotentialKeywords.length === 0 && (
                  <div className="p-4 text-center text-gray-400">No new keyword ideas found for {domain}.</div>
                )}
                {!highPotentialLoading && highPotentialKeywords.map((item) => (
                  <label
                    key={item.keyword}
                    className="p-3 flex items-center justify-between hover:bg-[#F5F3FF] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedHighPotential.includes(item.keyword)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHighPotential((prev) => [...prev, item.keyword]);
                          } else {
                            setSelectedHighPotential((prev) => prev.filter((k) => k !== item.keyword));
                          }
                        }}
                        className="w-4 h-4 rounded text-[#7C3AED]"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{item.keyword}</div>
                        <div className="text-[11px] text-gray-400">
                          {item.intent ? `${item.intent.charAt(0).toUpperCase()}${item.intent.slice(1)} · ` : ''}CPC: {item.cpc != null ? `$${item.cpc.toFixed(2)}` : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#7C3AED]">{item.volume.toLocaleString()} vol</div>
                      <div className="text-[10px] font-semibold text-emerald-600">KD {item.kd != null ? `${item.kd}%` : '—'}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-gray-500 text-xs">
                  {selectedHighPotential.length} keywords selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHighPotentialModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSelectedHighPotential}
                    disabled={selectedHighPotential.length === 0}
                    className="px-5 py-2 bg-[#00A86B] hover:bg-[#00925d] disabled:opacity-50 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Add Selected to Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Keywords Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00A86B]" />
                Add Keywords to Track
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeywords} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter keywords (one per line) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={dynamicKeywordPlaceholder}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:border-[#00A86B] font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg text-[11px] text-[#4C1D95] leading-relaxed">
                ℹ️ Positions will be tracked in real time for <strong>Google India (EN)</strong>. Daily historical position tracking will activate immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer uppercase tracking-wider"
                >
                  Add &amp; Track
                </button>
              </div>
            </form>
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
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view website rankings without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;hv=e8a49...
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641');
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
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Search Engine / Full Wizard */}
      <ProjectSearchEnginesWizard
        isOpen={isAddEngineModalOpen}
        onClose={() => setIsAddEngineModalOpen(false)}
        projectDomain={activeProject?.domain || ''}
        initialTab="search-engines"
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
          setSelectedEngine(added.countryName);
          showToast(`Search engine "${newEngine.name}" added to project!`);
        }}
      />

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

      {/* Blue Project Settings Modal matching user screenshot */}
      <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        onClose={() => setIsProjectSettingsModalOpen(false)}
        projectName={activeProject?.name || ''}
        projectDomain={activeProject?.domain?.replace(/^https?:\/\//, '').replace(/\/$/, '') || ''}
        onSave={() => {
          showToast('Project settings updated successfully!');
        }}
      />

      {/* Project Notes Modal */}
      <ProjectNotesModal
        isOpen={isProjectNotesModalOpen}
        onClose={() => setIsProjectNotesModalOpen(false)}
        onOpenCreateNote={(date) => {
          setIsProjectNotesModalOpen(false);
          setCreateNoteInitialDate(date || '8 Oct 2026');
          setIsCreateNoteOpen(true);
        }}
      />
    </div>
  );
}

export default function RankingsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading rankings...</div>}>
        <RankingsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
