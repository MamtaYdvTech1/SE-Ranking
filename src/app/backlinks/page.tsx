'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Info,
  X,
  Globe2,
  ExternalLink,
  Download,
  Filter,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Link2,
  RefreshCw,
  Table as TableIcon,
  HelpCircle,
  AlertTriangle,
  Flame,
  Check,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/components/providers/AppProviders';
import { CountryFlag } from '@/components/ui/CountryFlag';

// ==========================================
// DATA TYPES
// ==========================================
interface BacklinkRowItem {
  id: string;
  title: string;
  sourceUrl: string;
  isBestLink?: boolean;
  domainTraffic: string;
  pageTraffic: string;
  dt: number;
  pt: number;
  keywords: number;
  anchor: string;
  targetUrl: string;
  type: 'TEXT' | 'IMAGE';
  nofollow?: boolean;
  firstSeen: string;
  lastSeen: string;
}

interface ReferringDomainItem {
  domain: string;
  dt: number;
  domainTraffic: string;
  backlinks: number;
  keywords: string;
  domainAge: string;
  firstSeen: string;
}

interface AnchorTextItem {
  anchor: string;
  refDomains: number;
  backlinks: number;
  dofollowCount: number;
  dofollowPercent: number;
  firstSeen: string;
  lastSeen: string;
}

interface PageItem {
  url: string;
  backlinks: number;
  refDomains: number;
}

interface IpItem {
  ip: string;
  country: string;
  flag: string;
  refDomains: number;
  backlinks: number;
}

// ==========================================
// DATASETS MATCHING EXACT SCREENSHOTS
// ==========================================

// OVERVIEW TAB: Overall History Chart Data (28 Jun - 23 Sep)
const OVERALL_CHART_DATA = [
  { date: '28 Jun', refDomains: 43.1, backlinks: 73.0, dt: 21, pt: 6 },
  { date: '05 Jul', refDomains: 43.0, backlinks: 73.0, dt: 21, pt: 6 },
  { date: '12 Jul', refDomains: 43.0, backlinks: 72.8, dt: 21, pt: 6 },
  { date: '19 Jul', refDomains: 42.4, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '26 Jul', refDomains: 41.7, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '02 Aug', refDomains: 41.6, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '09 Aug', refDomains: 41.6, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '16 Aug', refDomains: 41.6, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '23 Aug', refDomains: 41.6, backlinks: 72.5, dt: 21, pt: 6 },
  { date: '30 Aug', refDomains: 41.6, backlinks: 72.4, dt: 21, pt: 6 },
  { date: '06 Sep', refDomains: 40.8, backlinks: 65.0, dt: 21, pt: 6 },
  { date: '13 Sep', refDomains: 40.8, backlinks: 65.0, dt: 21, pt: 6 },
  { date: '20 Sep', refDomains: 40.8, backlinks: 65.0, dt: 21, pt: 6 },
  { date: '23 Sep', refDomains: 40.8, backlinks: 65.0, dt: 21, pt: 6 },
];

// OVERVIEW TAB: New & Lost Referring Domains Bar Chart Data
const NEW_LOST_DOMAINS_DATA = [
  { date: '28 Jun', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '05 Jul', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '12 Jul', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '19 Jul', newCount: 0.0, lostCount: -0.8, change: -0.8 },
  { date: '26 Jul', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '02 Aug', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '09 Aug', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '16 Aug', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '23 Aug', newCount: 0.6, lostCount: -0.8, change: -0.2 },
  { date: '30 Aug', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '06 Sep', newCount: 0.0, lostCount: -0.8, change: -0.8 },
  { date: '13 Sep', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '20 Sep', newCount: 0.1, lostCount: -0.1, change: 0 },
  { date: '23 Sep', newCount: 0.1, lostCount: -0.1, change: 0 },
];

// OVERVIEW TAB: New & Lost Backlinks Bar Chart Data
const NEW_LOST_BACKLINKS_DATA = [
  { date: '28 Jun', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '05 Jul', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '12 Jul', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '19 Jul', newCount: 0.0, lostCount: -1.8, change: -1.8 },
  { date: '26 Jul', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '02 Aug', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '09 Aug', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '16 Aug', newCount: 0.4, lostCount: -0.2, change: 0.2 },
  { date: '23 Aug', newCount: 0.4, lostCount: -0.2, change: 0.2 },
  { date: '30 Aug', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '06 Sep', newCount: 0.7, lostCount: -2.8, change: -2.1 },
  { date: '13 Sep', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '20 Sep', newCount: 0.2, lostCount: -0.2, change: 0 },
  { date: '23 Sep', newCount: 0.2, lostCount: -0.2, change: 0 },
];

// OVERVIEW TAB: Top backlink anchors generator
export const getTopAnchorsForDomain = (domain: string = 'jio.com') => [
  { anchor: domain, backlinks: 40, percent: 64.5 },
  { anchor: 'Website', backlinks: 14, percent: 22.6 },
  { anchor: `https://${domain}/`, backlinks: 3, percent: 4.8 },
  { anchor: `visit ${domain} for latest info`, backlinks: 2, percent: 3.2 },
  { anchor: `portal: ${domain}`, backlinks: 1, percent: 1.6 },
  { anchor: domain.split('.')[0].toUpperCase(), backlinks: 1, percent: 1.6 },
  { anchor: `https://www.${domain}`, backlinks: 1, percent: 1.6 },
];

// OVERVIEW TAB: Domains by Domain Trust (10 tiers)
const OVERVIEW_DOMAINS_BY_DT = [
  { range: '0-9', refDomains: 8, percent: 16.67 },
  { range: '10-19', refDomains: 2, percent: 4.17 },
  { range: '20-29', refDomains: 1, percent: 2.08 },
  { range: '30-39', refDomains: 2, percent: 4.17 },
  { range: '40-49', refDomains: 5, percent: 10.42 },
  { range: '50-59', refDomains: 17, percent: 35.42 },
  { range: '60-69', refDomains: 9, percent: 18.75 },
  { range: '70-79', refDomains: 0, percent: 0.00 },
  { range: '80-89', refDomains: 3, percent: 6.25 },
  { range: '90-100', refDomains: 1, percent: 2.08 },
];

// OVERVIEW TAB: Countries
const OVERVIEW_COUNTRIES = [
  { flag: '🇲🇩', country: 'Moldova', refDomains: 12, percent: 29.3 },
  { flag: '🇫🇷', country: 'France', refDomains: 9, percent: 22.0 },
  { flag: '🇦🇹', country: 'Austria', refDomains: 9, percent: 22.0 },
  { flag: '🇷🇴', country: 'Romania', refDomains: 4, percent: 9.8 },
  { flag: '🇸🇬', country: 'Singapore', refDomains: 3, percent: 7.3 },
  { flag: '🇺🇸', country: 'USA', refDomains: 2, percent: 4.9 },
  { flag: '🇩🇪', country: 'Germany', refDomains: 1, percent: 2.4 },
  { flag: '🇬🇧', country: 'United Kingdom', refDomains: 1, percent: 2.4 },
];

const INITIAL_BACKLINKS_ROWS: BacklinkRowItem[] = [
  {
    id: 'b1',
    title: 'Afrika',
    sourceUrl: 'https://afrika.kompasoutdoor.nl/',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 43,
    pt: 38,
    keywords: 2,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '09 Mar 2024',
    lastSeen: '21 Mar 2025',
  },
  {
    id: 'b2',
    title: 'NEWS & COMMENTARY | PROJECT CAMELOT',
    sourceUrl: 'https://projectcamelotportal.com/2020/04/23/running-news-items-commentary/',
    isBestLink: true,
    domainTraffic: '1.3K',
    pageTraffic: '0',
    dt: 65,
    pt: 13,
    keywords: 9,
    anchor: 'https://workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '01 Oct 2024',
    lastSeen: '17 Aug 2026',
  },
  {
    id: 'b3',
    title: 'NEWS & COMMENTARY | PROJECT CAMELOT',
    sourceUrl: 'https://projectcamelotportal.com/2020/04/25/running-news-items-commentary-2/',
    isBestLink: true,
    domainTraffic: '1.3K',
    pageTraffic: '0',
    dt: 65,
    pt: 11,
    keywords: 0,
    anchor: 'https://workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '29 Jun 2025',
    lastSeen: '11 Jun 2026',
  },
  {
    id: 'b4',
    title: 'NEWS & COMMENTARY | PROJECT CAMELOT',
    sourceUrl: 'https://projectcamelotportal.com/2020/06/06/running-news-items-commentary-update-2/',
    isBestLink: true,
    domainTraffic: '1.3K',
    pageTraffic: '0',
    dt: 65,
    pt: 10,
    keywords: 2,
    anchor: 'https://workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '06 Aug 2025',
    lastSeen: '11 Jun 2026',
  },
  {
    id: 'b5',
    title: 'NEWS & COMMENTARY – updated | PROJECT CAMELOT',
    sourceUrl: 'https://projectcamelotportal.com/2020/07/07/running-news-items-commentary-update-2-2/',
    isBestLink: true,
    domainTraffic: '1.3K',
    pageTraffic: '0',
    dt: 65,
    pt: 10,
    keywords: 0,
    anchor: 'https://workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '29 Jun 2025',
    lastSeen: '06 Aug 2026',
  },
  {
    id: 'b6',
    title: 'NEWS & COMMENTARY | PROJECT CAMELOT',
    sourceUrl: 'https://projectcamelotportal.com/2020/05/03/running-news-items-commentary-update/',
    isBestLink: true,
    domainTraffic: '1.3K',
    pageTraffic: '0',
    dt: 65,
    pt: 10,
    keywords: 0,
    anchor: 'https://workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '29 Jun 2025',
    lastSeen: '12 Jun 2026',
  },
  {
    id: 'b7',
    title: 'Afrika',
    sourceUrl: 'http://afrika.kompasoutdoor.nl/',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 43,
    pt: 9,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    firstSeen: '09 May 2026',
    lastSeen: '09 May 2026',
  },
  {
    id: 'b8',
    title: 'Best Employee Monitoring & Time Tracking Software in 2025',
    sourceUrl: 'https://www.glenhuff.com/the-best-employee-monitoring-tools/',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 15,
    pt: 1,
    keywords: 3,
    anchor: 'WorkComposer Remote Tracker',
    targetUrl: 'https://www.workcomposer.com/',
    type: 'TEXT',
    firstSeen: '07 Dec 2025',
    lastSeen: '08 Jun 2026',
  },
  {
    id: 'b9',
    title: 'www.workcomposer.com - Trust Reviewing',
    sourceUrl: 'https://trustreviewing.com/review/www.workcomposer.com-2/',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 21,
    pt: 0,
    keywords: 0,
    anchor: 'IMAGE',
    targetUrl: 'https://www.workcomposer.com/',
    type: 'IMAGE',
    firstSeen: '12 Dec 2025',
    lastSeen: '11 Sep 2026',
  },
  {
    id: 'b10',
    title: '❤️ URL Shared ❤️',
    sourceUrl: 'https://sites.loseyourip.com/share/12978',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 51,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '31 Dec 2025',
    lastSeen: '19 Jan 2026',
  },
  {
    id: 'b11',
    title: 'www.workcomposer.com - Trust Reviewing',
    sourceUrl: 'https://trustreviewing.com/review/www.workcomposer.com/',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 21,
    pt: 0,
    keywords: 0,
    anchor: 'IMAGE',
    targetUrl: 'https://www.workcomposer.com/',
    type: 'IMAGE',
    firstSeen: '12 Dec 2025',
    lastSeen: '11 Sep 2026',
  },
  {
    id: 'b12',
    title: '❤️ URL Shared ❤️',
    sourceUrl: 'https://buzzshrink.website/share/12978',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 55,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '24 Dec 2025',
    lastSeen: '24 Mar 2026',
  },
  {
    id: 'b13',
    title: '✅ Website Stats 📊',
    sourceUrl: 'https://metamagic.top/stats/12978',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 59,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '24 Nov 2025',
    lastSeen: '30 Mar 2026',
  },
  {
    id: 'b14',
    title: '❤️ URL Shared ❤️',
    sourceUrl: 'https://shortenurls.eu/share/12978',
    domainTraffic: '11',
    pageTraffic: '0',
    dt: 59,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '23 Nov 2025',
    lastSeen: '25 Mar 2026',
  },
  {
    id: 'b15',
    title: '🧑‍💼 Domain Report 🧑‍💼',
    sourceUrl: 'https://quero.party/report/12978',
    domainTraffic: '0',
    pageTraffic: '0',
    dt: 67,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '23 Nov 2025',
    lastSeen: '25 Mar 2026',
  },
  {
    id: 'b16',
    title: '🧑‍💼 Domain Report 🧑‍💼',
    sourceUrl: 'https://kyo.fyi/report/12978',
    domainTraffic: '1',
    pageTraffic: '0',
    dt: 65,
    pt: 0,
    keywords: 0,
    anchor: 'workcomposer.com',
    targetUrl: 'https://workcomposer.com/',
    type: 'TEXT',
    nofollow: true,
    firstSeen: '20 Nov 2025',
    lastSeen: '24 Mar 2026',
  },
  {
    id: 'b17',
    title: '15 Remote Productivity & Monitoring Tools You Cannot Ignore in 2025 - IWrite Tech',
    sourceUrl: 'https://iwritetech.com/blog/15-remote-productivity-tools-you-cannot-ignore-in-2025/',
    domainTraffic: '72',
    pageTraffic: '0',
    dt: 50,
    pt: 0,
    keywords: 0,
    anchor: 'WorkComposer',
    targetUrl: 'https://www.workcomposer.com/',
    type: 'TEXT',
    firstSeen: '11 Oct 2025',
    lastSeen: '11 Oct 2025',
  },
];

// REFERRING DOMAINS TAB: 20 Domains Matching Screenshot 3
const INITIAL_REF_DOMAINS: ReferringDomainItem[] = [
  {
    domain: 'ai-seo.keywordseverywhere.com',
    dt: 89,
    domainTraffic: '34',
    backlinks: 1,
    keywords: '154',
    domainAge: '-',
    firstSeen: '03 May 2026',
  },
  {
    domain: 'www.mentionlytics.com',
    dt: 84,
    domainTraffic: '8.9K',
    backlinks: 1,
    keywords: '218K',
    domainAge: '>10 (01 Sep 2015)',
    firstSeen: '15 Jan 2026',
  },
  {
    domain: 'www.socialchamp.com',
    dt: 84,
    domainTraffic: '46.4K',
    backlinks: 2,
    keywords: '423.5K',
    domainAge: '5-10 (25 Apr 2018)',
    firstSeen: '05 Sep 2025',
  },
  {
    domain: 'businessyield.com',
    dt: 71,
    domainTraffic: '68',
    backlinks: 10,
    keywords: '52.7K',
    domainAge: '5-10 (30 Jan 2018)',
    firstSeen: '23 Aug 2025',
  },
  {
    domain: 'takre.ebs',
    dt: 68,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '-',
    firstSeen: '03 Mar 2026',
  },
  {
    domain: 'quero.party',
    dt: 67,
    domainTraffic: '0',
    backlinks: 2,
    keywords: '0',
    domainAge: '5-10 (22 Mar 2018)',
    firstSeen: '23 Nov 2025',
  },
  {
    domain: 'urls-shortener.eu',
    dt: 66,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '4',
    domainAge: '-',
    firstSeen: '08 Apr 2026',
  },
  {
    domain: 'projectcamelotportal.com',
    dt: 65,
    domainTraffic: '1.3K',
    backlinks: 5,
    keywords: '1.2K',
    domainAge: '-',
    firstSeen: '01 Oct 2024',
  },
  {
    domain: 'kyo.fyi',
    dt: 65,
    domainTraffic: '1',
    backlinks: 1,
    keywords: '619',
    domainAge: '5-10 (21 Jun 2020)',
    firstSeen: '20 Nov 2025',
  },
  {
    domain: 'staging1.projectcamelotportal...',
    dt: 63,
    domainTraffic: '2',
    backlinks: 1,
    keywords: '14',
    domainAge: '-',
    firstSeen: '09 Aug 2025',
  },
  {
    domain: 'atomizelink.icu',
    dt: 62,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '1',
    domainAge: '1-3 (15 May 2024)',
    firstSeen: '03 Apr 2026',
  },
  {
    domain: 'backlinks-checker.com',
    dt: 59,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '72',
    domainAge: '1-3 (02 Nov 2023)',
    firstSeen: '03 Apr 2026',
  },
  {
    domain: 'shortenurls.eu',
    dt: 59,
    domainTraffic: '11',
    backlinks: 1,
    keywords: '216',
    domainAge: '1-3 (13 Jul 2024)',
    firstSeen: '23 Nov 2025',
  },
  {
    domain: 'byteshort.xyz',
    dt: 59,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '-',
    firstSeen: '03 Apr 2026',
  },
  {
    domain: 'anchorurl.cloud',
    dt: 59,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '1-3 (15 May 2024)',
    firstSeen: '03 Apr 2026',
  },
  {
    domain: 'metamagic.top',
    dt: 59,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '1',
    domainAge: '1-3 (13 May 2025)',
    firstSeen: '24 Nov 2025',
  },
  {
    domain: 'optimizelfow.top',
    dt: 58,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '1-3 (24 May 2025)',
    firstSeen: '03 Apr 2026',
  },
  {
    domain: 'takes.homes',
    dt: 57,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '-',
    firstSeen: '06 May 2026',
  },
  {
    domain: 'buzzshrink.website',
    dt: 55,
    domainTraffic: '0',
    backlinks: 1,
    keywords: '0',
    domainAge: '1-3 (15 May 2024)',
    firstSeen: '24 Dec 2025',
  },
  {
    domain: 'analyticshaven.top',
    dt: 55,
    domainTraffic: '0',
    backlinks: 2,
    keywords: '0',
    domainAge: '1-3 (13 May 2025)',
    firstSeen: '02 Mar 2026',
  },
];

// ANCHORS TAB
const INITIAL_ANCHORS: AnchorTextItem[] = [
  {
    anchor: 'workcomposer.com',
    refDomains: 26,
    backlinks: 33,
    dofollowCount: 10,
    dofollowPercent: 45.5,
    firstSeen: '09 Mar 2024',
    lastSeen: '12 Sep 2026',
  },
  {
    anchor: 'Employee Monitoring',
    refDomains: 7,
    backlinks: 8,
    dofollowCount: 4,
    dofollowPercent: 18.2,
    firstSeen: '17 Jun 2025',
    lastSeen: '23 Sep 2026',
  },
  {
    anchor: 'WorkComposer',
    refDomains: 3,
    backlinks: 7,
    dofollowCount: 6,
    dofollowPercent: 27.3,
    firstSeen: '01 Oct 2024',
    lastSeen: '17 Aug 2026',
  },
  {
    anchor: 'https://workcomposer.com',
    refDomains: 1,
    backlinks: 3,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '01 Sep 2025',
    lastSeen: '09 Sep 2026',
  },
  {
    anchor: 'Free Trial',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '01 Sep 2025',
    lastSeen: '09 Sep 2026',
  },
  {
    anchor: 'Try WorkComposer Free',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '17 Jun 2026',
    lastSeen: '07 Sep 2026',
  },
  {
    anchor: 'https://www.workcomposer.com',
    refDomains: 1,
    backlinks: 2,
    dofollowCount: 2,
    dofollowPercent: 9.1,
    firstSeen: '12 Dec 2025',
    lastSeen: '11 Sep 2026',
  },
  {
    anchor: 'No text',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 1,
    dofollowPercent: 4.5,
    firstSeen: '07 Dec 2025',
    lastSeen: '08 Jun 2026',
  },
  {
    anchor: 'Top Productivity Tool: WorkComposer',
    refDomains: 1,
    backlinks: 7,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '21 Aug 2025',
    lastSeen: '13 Sep 2026',
  },
  {
    anchor: 'WorkComposer App',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '13 Sep 2025',
    lastSeen: '20 Nov 2025',
  },
  {
    anchor: 'WorkComposer Features',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '04 Sep 2025',
    lastSeen: '12 Nov 2025',
  },
];

// PAGES TAB
const INITIAL_PAGES: PageItem[] = [
  { url: 'https://workcomposer.com/', backlinks: 36, refDomains: 30 },
  { url: 'https://workcomposer.com/features', backlinks: 24, refDomains: 6 },
  { url: 'https://workcomposer.com/pricing', backlinks: 2, refDomains: 2 },
  { url: 'https://workcomposer.com/download', backlinks: 3, refDomains: 2 },
];

// IPS TAB
const INITIAL_IPS: IpItem[] = [
  { ip: '195.20.79.178', country: 'US', flag: '🇺🇸', refDomains: 15, backlinks: 18 },
  { ip: '45.13.58.15', country: 'ES', flag: '🇪🇸', refDomains: 3, backlinks: 4 },
  { ip: '24.199.114.38', country: 'US', flag: '🇺🇸', refDomains: 3, backlinks: 7 },
  { ip: '152.53.38.228', country: 'ES', flag: '🇪🇸', refDomains: 2, backlinks: 2 },
  { ip: '192.124.249.68', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '74.208.236.184', country: 'CA', flag: '🇨🇦', refDomains: 1, backlinks: 2 },
  { ip: '23.227.38.65', country: 'GB', flag: '🇬🇧', refDomains: 1, backlinks: 1 },
  { ip: '46.202.168.212', country: 'FR', flag: '🇫🇷', refDomains: 1, backlinks: 10 },
  { ip: '217.182.220.21', country: 'FR', flag: '🇫🇷', refDomains: 1, backlinks: 6 },
  { ip: '192.64.119.145', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '70.70.21.241', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '172.67.212.72', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 2 },
  { ip: '66.29.152.156', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '104.21.21.200', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '92.113.15.67', country: 'DE', flag: '🇩🇪', refDomains: 1, backlinks: 1 },
  { ip: '216.150.1.65', country: 'NL', flag: '🇳🇱', refDomains: 1, backlinks: 1 },
  { ip: '82.25.125.136', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '194.59.167.151', country: 'BG', flag: '🇧🇬', refDomains: 1, backlinks: 1 },
  { ip: '118.139.177.45', country: 'CL', flag: '🇨🇱', refDomains: 1, backlinks: 1 },
  { ip: '35.219.200.15', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 4 },
  { ip: '198.54.117.210', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
];

function BacklinkCheckerContent() {
  const searchParams = useSearchParams();
  const { activeProject } = useApp();

  type SubTabType = 'overview' | 'backlinks' | 'referring-domains' | 'anchor-texts' | 'pages' | 'ips';
  const initialTab = (searchParams.get('tab') as SubTabType) || 'overview';
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>(initialTab);

  const cleanProjectDomain = useMemo(() => {
    if (!activeProject?.domain) return 'jio.com';
    return activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }, [activeProject?.domain]);

  const [analyzedDomain, setAnalyzedDomain] = useState(cleanProjectDomain);

  React.useEffect(() => {
    if (cleanProjectDomain) {
      setAnalyzedDomain(cleanProjectDomain);
    }
  }, [cleanProjectDomain]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Overview Tab Chart Controls
  const [overallPeriod, setOverallPeriod] = useState<'7D' | '1M' | '3M' | '6M' | '12M'>('3M');
  const [showTotalRefDomains, setShowTotalRefDomains] = useState(true);
  const [showTotalBacklinks, setShowTotalBacklinks] = useState(true);
  const [showDomainTrust, setShowDomainTrust] = useState(false);
  const [showPageTrust, setShowPageTrust] = useState(false);

  const [backlinksData, setBacklinksData] = useState<any>(null);

  React.useEffect(() => {
    async function loadProjectBacklinks() {
      if (!activeProject?.id) return;
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/backlinks`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setBacklinksData(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load project backlinks:', err);
      }
    }
    loadProjectBacklinks();
  }, [activeProject?.id]);

  // Backlinks Tab Filters
  const [backlinkFilterPill, setBacklinkFilterPill] = useState<'all' | 'new' | 'lost'>('all');
  const [backlinkSearch, setBacklinkSearch] = useState('');
  const [oneBacklinkPerDomain, setOneBacklinkPerDomain] = useState(false);

  // Referring Domains Filters
  const [refDomainFilterPill, setRefDomainFilterPill] = useState<'active' | 'new' | 'lost'>('active');

  // Anchor Texts Filters
  const [anchorFilterPill, setAnchorFilterPill] = useState<'all' | '1-word' | '2-word' | '3-word' | '4-word'>('all');
  const [anchorSearch, setAnchorSearch] = useState('');

  // Pages Filters
  const [pageSearch, setPageSearch] = useState('');

  // IPs Filters
  const [ipFilterTab, setIpFilterTab] = useState<'ips' | 'subnets'>('ips');
  const [ipSearch, setIpSearch] = useState('');

  const handleSearch = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 400);
  };

  const getSubTabTitle = () => {
    switch (activeSubTab) {
      case 'overview':
        return 'Overview';
      case 'backlinks':
        return 'Backlinks';
      case 'referring-domains':
        return 'Referring Domains';
      case 'anchor-texts':
        return 'Anchor Texts';
      case 'pages':
        return 'Pages';
      case 'ips':
        return 'IPs';
      default:
        return 'Overview';
    }
  };

  const filteredAnchors = useMemo(() => {
    let list = [...INITIAL_ANCHORS];
    if (anchorFilterPill === '1-word') {
      list = list.filter((a) => a.anchor.trim().split(/\s+/).length === 1);
    } else if (anchorFilterPill === '2-word') {
      list = list.filter((a) => a.anchor.trim().split(/\s+/).length === 2);
    } else if (anchorFilterPill === '3-word') {
      list = list.filter((a) => a.anchor.trim().split(/\s+/).length === 3);
    } else if (anchorFilterPill === '4-word') {
      list = list.filter((a) => a.anchor.trim().split(/\s+/).length >= 4);
    }
    if (anchorSearch.trim()) {
      const q = anchorSearch.toLowerCase();
      list = list.filter((a) => a.anchor.toLowerCase().includes(q));
    }
    return list;
  }, [anchorFilterPill, anchorSearch]);

  const filteredPages = useMemo(() => {
    let list = [...INITIAL_PAGES];
    if (pageSearch.trim()) {
      const q = pageSearch.toLowerCase();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }
    return list;
  }, [pageSearch]);

  const filteredIps = useMemo(() => {
    let list = [...INITIAL_IPS];
    if (ipSearch.trim()) {
      const q = ipSearch.toLowerCase();
      list = list.filter(
        (i) => i.ip.includes(q) || i.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ipSearch]);

  const filteredBacklinks = useMemo(() => {
    let list = [...INITIAL_BACKLINKS_ROWS];
    if (backlinkSearch.trim()) {
      const q = backlinkSearch.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.sourceUrl.toLowerCase().includes(q) ||
          b.anchor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [backlinkSearch]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-60px)] text-gray-900 select-none pb-16 flex flex-col justify-between relative">
      <div>
        {/* Top Dismissible Blue Notice Banner matching Screenshots */}
        {showNoticeBanner && (
          <div className="bg-[#EBF3FF] border-b border-[#CBE0FF] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#1E3A8A]">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
              <span>
                You may have noticed some changes in the number of backlinks and DT value. This is
                because we removed many outdated, disruptive backlinks from the new database. Our new
                data is more precise and reliable.
              </span>
            </div>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="text-[#1E3A8A]/60 hover:text-[#1E3A8A] ml-3 cursor-pointer shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Breadcrumbs & Limits Row matching Screenshots */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 font-medium">{analyzedDomain}</span>
              <span>&gt;</span>
              <span className="text-gray-600 font-medium">Backlink Checker</span>
              <span>&gt;</span>
              <span className="text-gray-900 font-bold">{getSubTabTitle()}</span>
              {(activeSubTab === 'backlinks' || activeSubTab === 'referring-domains') && (
                <>
                  <span>&gt;</span>
                  <span className="text-gray-500 font-medium">Active</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                Feedback
              </button>
              <button className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                Notes (46)
              </button>
              <div className="flex items-center gap-1 text-gray-700 bg-amber-50/80 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>Account limit 0 / 10</span>
                <span className="text-gray-400">ⓘ</span>
              </div>
            </div>
          </div>

          {/* Page Title & Actions Row matching Screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>{getSubTabTitle()} / {analyzedDomain}</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>Email notification: <strong className="text-gray-700 font-semibold">Bi-weekly</strong></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6A] shadow-xs inline-block" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">Last check: October 08, 2026</span>
              <button
                onClick={() => handleSearch()}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>UPDATE REPORT</span>
              </button>
            </div>
          </div>

          {/* Subtabs Bar matching Screenshots */}
          <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-2 pt-1 rounded-t-xl overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'backlinks', label: 'Backlinks' },
              { id: 'referring-domains', label: 'Referring Domains' },
              { id: 'anchor-texts', label: 'Anchor Texts' },
              { id: 'pages', label: 'Pages' },
              { id: 'ips', label: 'IPs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as SubTabType);
                }}
                className={`px-4 py-2.5 transition-all border-b-2 font-bold whitespace-nowrap cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-[#7C3AED] text-[#7C3AED] bg-[#F5F3FF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dismissible Info Box matching Screenshots (shown on non-overview tabs or as needed) */}
          {activeSubTab !== 'overview' && showInfoBanner && (
            <div className="p-3.5 bg-white border border-[#7C3AED]/20 rounded-xl relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
              </div>
              <p className="leading-relaxed pr-6 text-gray-600">
                Get a full list of backlinks for any domain, complete with detailed data on each link.
                This tool is perfect for analysing any website&apos;s backlink profiles, including
                your competitors&apos; sites. In just minutes, you&apos;ll receive a report
                detailing every backlink, including information on the originating domains and pages
                they link to. With this data, you can get the full picture of any backlink profile and
                effectively evaluate the value and quality of each backlink.
              </p>
              <button
                onClick={() => setShowInfoBanner(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW (MATCHING SCREENSHOT 1) */}
          {/* ======================================================== */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Row 1: 4 Top Metric Cards (Exact match to Screenshot 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Domain Trust & Page Trust */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span>DOMAIN TRUST</span>
                      <span className="text-gray-400">ⓘ</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {backlinksData?.domainTrust ?? 3} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span>PAGE TRUST</span>
                      <span className="text-gray-400">ⓘ</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {backlinksData?.pageTrust ?? 1} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Referring Domains */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span>REFERRING DOMAINS</span>
                    <span className="text-gray-400">ⓘ</span>
                  </div>
                  <div className="text-3xl font-black text-[#7C3AED]">
                    {backlinksData?.referringDomains ?? 48}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1 space-y-1">
                    <div>Referring domains analyzed: <strong className="text-gray-700">{backlinksData?.referringDomains ?? 48} ⓘ</strong></div>
                    <div>New in last 30 days: <strong className="text-[#7C3AED]">{backlinksData?.newBacklinksLast30Days ?? 1}</strong></div>
                    <div>Lost in last 30 days: <strong className="text-rose-500">{backlinksData?.lostBacklinksLast30Days ?? 4}</strong></div>
                    <div>Broken: <strong className="text-gray-700">0</strong></div>
                  </div>
                </div>

                {/* Card 3: Backlinks */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span>BACKLINKS</span>
                    <span className="text-gray-400">ⓘ</span>
                  </div>
                  <div className="text-3xl font-black text-[#7C3AED]">
                    {backlinksData?.totalBacklinks ?? 65}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1 space-y-1">
                    <div>Backlinks analyzed: <strong className="text-gray-700">{backlinksData?.totalBacklinks ?? 65} ⓘ</strong></div>
                    <div>New in last 30 days: <strong className="text-[#7C3AED]">{backlinksData?.newBacklinksLast30Days ?? 4}</strong></div>
                    <div>Lost in last 30 days: <strong className="text-rose-500">{backlinksData?.lostBacklinksLast30Days ?? 8}</strong></div>
                    <div>Broken: <strong className="text-gray-700">0</strong></div>
                  </div>
                </div>

                {/* Card 4: Backlinks Toxicity Score */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span>BACKLINKS TOXICITY SCORE</span>
                      <span className="text-gray-400">ⓘ</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      Identify harmful links that hurt your site&apos;s SEO and clean up your backlink profile
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Starting toxic backlink scanner...')}
                    className="w-full py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    FIND TOXIC LINKS
                  </button>
                </div>
              </div>

              {/* Row 2: Large Overall Line Chart Card (Screenshot 1) */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <span className="font-bold text-sm text-gray-900">Overall</span>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                      <span>PERIOD:</span>
                      {(['7D', '1M', '3M', '6M', '12M'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setOverallPeriod(p)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            overallPeriod === p
                              ? 'text-[#7C3AED] font-black border-b-2 border-[#7C3AED]'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50 cursor-pointer">
                      <span>GROUP BY: <strong className="text-gray-800">WEEKS</strong></span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Y-axis Labels Row */}
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#00BCD4]">Total referring domains</span>
                  <span className="text-[#22C55E]">Total backlinks</span>
                </div>

                {/* Recharts Curve matching Screenshot 1 */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={OVERALL_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis
                        yAxisId="left"
                        domain={[40.5, 43.5]}
                        tick={{ fontSize: 10, fill: '#00BCD4' }}
                        tickFormatter={(v) => String(Number(v).toFixed(1))}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[50, 90]}
                        tick={{ fontSize: 10, fill: '#22C55E' }}
                        tickFormatter={(v) => String(Math.round(v))}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                      />
                      {showTotalRefDomains && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="refDomains"
                          name="Total referring domains"
                          stroke="#00BCD4"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                      {showTotalBacklinks && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="backlinks"
                          name="Total backlinks"
                          stroke="#22C55E"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                      {showDomainTrust && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="dt"
                          name="Domain Trust"
                          stroke="#F97316"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                      {showPageTrust && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="pt"
                          name="Page Trust"
                          stroke="#EAB308"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Checkbox Legend matching Screenshot 1 */}
                <div className="flex flex-wrap items-center gap-5 text-xs text-gray-700 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={showTotalRefDomains}
                      onChange={(e) => setShowTotalRefDomains(e.target.checked)}
                      className="rounded text-[#00BCD4]"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00BCD4] inline-block" />
                    <span>Total referring domains</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={showTotalBacklinks}
                      onChange={(e) => setShowTotalBacklinks(e.target.checked)}
                      className="rounded text-[#22C55E]"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                    <span>Total backlinks</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-500">
                    <input
                      type="checkbox"
                      checked={showDomainTrust}
                      onChange={(e) => setShowDomainTrust(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Domain Trust</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-500">
                    <input
                      type="checkbox"
                      checked={showPageTrust}
                      onChange={(e) => setShowPageTrust(e.target.checked)}
                      className="rounded text-yellow-500"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                    <span>Page Trust</span>
                  </label>
                </div>
              </div>

              {/* Row 3: Two Side-by-Side Bar Charts (Screenshot 1) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Chart: New & lost referring domains */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-xs text-gray-900">New &amp; lost referring domains</span>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>PERIOD: 7D 1M <strong>3M</strong> 6M 12M</span>
                      <span className="border px-1.5 py-0.5 rounded bg-gray-50">WEEKS ⌄</span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={NEW_LOST_DOMAINS_DATA} stackOffset="sign">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={[-1.2, 1.2]} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="newCount" fill="#22C55E" name="New" />
                        <Bar dataKey="lostCount" fill="#EF4444" name="Lost" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> New
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Lost
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-700" /> Change
                    </span>
                  </div>
                </div>

                {/* Right Chart: New & lost backlinks */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-xs text-gray-900">New &amp; lost backlinks</span>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>PERIOD: 7D 1M <strong>3M</strong> 6M 12M</span>
                      <span className="border px-1.5 py-0.5 rounded bg-gray-50">WEEKS ⌄</span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={NEW_LOST_BACKLINKS_DATA} stackOffset="sign">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={[-4, 8]} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="newCount" fill="#22C55E" name="New" />
                        <Bar dataKey="lostCount" fill="#EF4444" name="Lost" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> New
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Lost
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-700" /> Change
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: 3 Summary Tables (Screenshot 1) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Table 1: Top backlink anchors */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span>Top backlink anchors ⓘ</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-1.5 font-semibold">Anchor text</th>
                          <th className="pb-1.5 text-center font-semibold">Backlinks</th>
                          <th className="pb-1.5 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {getTopAnchorsForDomain(cleanProjectDomain).map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-1.5 text-gray-800 font-medium truncate max-w-[140px]">
                              {r.anchor}
                            </td>
                            <td className="py-1.5 text-center text-[#7C3AED] font-semibold">
                              {r.backlinks}
                            </td>
                            <td className="py-1.5 text-right text-gray-500">
                              {r.percent.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => setActiveSubTab('anchor-texts')}
                      className="w-full py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      VIEW FULL REPORT
                    </button>
                  </div>
                </div>

                {/* Table 2: Domains by Domain Trust */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span>Domains by Domain Trust ⓘ</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-1.5 font-semibold">Domain Trust</th>
                          <th className="pb-1.5 text-center font-semibold">Ref.domains</th>
                          <th className="pb-1.5 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {OVERVIEW_DOMAINS_BY_DT.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-1.5 text-gray-800 font-medium">
                              {r.range}
                            </td>
                            <td className="py-1.5 text-center text-[#7C3AED] font-semibold">
                              {r.refDomains}
                            </td>
                            <td className="py-1.5 text-right text-gray-500">
                              {r.percent.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => setActiveSubTab('referring-domains')}
                      className="w-full py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      VIEW FULL REPORT
                    </button>
                  </div>
                </div>

                {/* Table 3: Countries */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span>Countries ⓘ</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-1.5 font-semibold">Country</th>
                          <th className="pb-1.5 text-center font-semibold">Ref.domains</th>
                          <th className="pb-1.5 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {OVERVIEW_COUNTRIES.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-1.5 text-gray-800 font-medium flex items-center gap-1.5">
                              <CountryFlag name={r.country} />
                              <span className="truncate max-w-[120px]">{r.country}</span>
                            </td>
                            <td className="py-1.5 text-center text-gray-900 font-semibold">
                              {r.refDomains}
                            </td>
                            <td className="py-1.5 text-right text-gray-500">
                              {r.percent.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => setActiveSubTab('ips')}
                      className="w-full py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      VIEW FULL REPORT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: BACKLINKS (MATCHING SCREENSHOT 2) */}
          {/* ======================================================== */}
          {activeSubTab === 'backlinks' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden animate-in fade-in duration-200">
              {/* Header Filter Row matching Screenshot 2 */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    65 backlinks
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Filter row matching Screenshot 2 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBacklinkFilterPill('all')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          backlinkFilterPill === 'all'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        ALL
                      </button>
                      <button
                        onClick={() => setBacklinkFilterPill('new')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          backlinkFilterPill === 'new'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        NEW
                      </button>
                      <button
                        onClick={() => setBacklinkFilterPill('lost')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          backlinkFilterPill === 'lost'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        LOST
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={backlinkSearch}
                        onChange={(e) => setBacklinkSearch(e.target.value)}
                        className="px-3 pr-7 py-1.5 border border-gray-300 rounded text-xs placeholder:text-gray-400 w-36 sm:w-44 focus:outline-hidden focus:border-[#7C3AED]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={oneBacklinkPerDomain}
                        onChange={(e) => setOneBacklinkPerDomain(e.target.checked)}
                        className="rounded text-[#7C3AED]"
                      />
                      <span>One backlink per domain</span>
                    </label>

                    <div className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-gray-700 text-xs flex items-center gap-1 cursor-pointer">
                      <span>History: Don&apos;t show</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>

                    <div className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-gray-700 text-xs flex items-center gap-1 cursor-pointer">
                      <span>DT</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>

                    <button className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                      USE BACKLINKS
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                      <span>PRESETS</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button className="px-2.5 py-1 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                    <span>+ FILTER</span>
                  </button>
                </div>
              </div>

              {/* Table matching Screenshot 2 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 w-8">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="p-3 min-w-[240px]">BACKLINK</th>
                      <th className="p-3 text-center">DOMAIN TRAFFIC</th>
                      <th className="p-3 text-center">PAGE TRAFFIC</th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-0.5 cursor-pointer">
                          DT <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-0.5 cursor-pointer">
                          PT <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">KEYWORDS</th>
                      <th className="p-3 min-w-[200px]">ANCHOR AND TARGET URL</th>
                      <th className="p-3 whitespace-nowrap">FIRST SEEN / LAST SEEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBacklinks.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="p-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900 leading-snug line-clamp-1">
                            {b.title}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#7C3AED] hover:underline mt-0.5">
                            <span className="truncate max-w-xs">{b.sourceUrl}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                          </div>
                          {b.isBestLink && (
                            <span className="mt-1 inline-block text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              BEST LINK
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-gray-700 font-medium">
                          {b.domainTraffic}
                        </td>
                        <td className="p-3 text-center text-gray-700 font-medium">
                          {b.pageTraffic}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-900">{b.dt}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{b.pt}</td>
                        <td className="p-3 text-center text-gray-700 font-medium">
                          {b.keywords}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-[#7C3AED] hover:underline cursor-pointer">
                            {b.anchor}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold uppercase bg-gray-100 text-gray-600 px-1 py-0.2 rounded">
                              {b.type}
                            </span>
                            {b.nofollow && (
                              <span className="text-[9px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded">
                                NOFOLLOW
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5 max-w-xs">
                            {b.targetUrl}
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 whitespace-nowrap text-[11px]">
                          <div>{b.firstSeen}</div>
                          <div>{b.lastSeen}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom bar */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-end text-xs text-gray-500">
                <div className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1 text-gray-700 bg-white shadow-2xs font-medium cursor-pointer">
                  <span>20</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REFERRING DOMAINS (MATCHING SCREENSHOT 3) */}
          {/* ======================================================== */}
          {activeSubTab === 'referring-domains' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden animate-in fade-in duration-200">
              {/* Header Filter Row matching Screenshot 3 */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    40 referring domains
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Filter row matching Screenshot 3 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setRefDomainFilterPill('active')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          refDomainFilterPill === 'active'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        ACTIVE
                      </button>
                      <button
                        onClick={() => setRefDomainFilterPill('new')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          refDomainFilterPill === 'new'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        NEW
                      </button>
                      <button
                        onClick={() => setRefDomainFilterPill('lost')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                          refDomainFilterPill === 'lost'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        LOST
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-gray-700 text-xs flex items-center gap-1 cursor-pointer">
                      <span>History: Don&apos;t show</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>

                    <button className="px-2.5 py-1.5 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                      <span>+ FILTER</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                      <span>PRESETS</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table matching Screenshot 3 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">DOMAIN</th>
                      <th className="p-3 text-center min-w-[90px]">
                        <span className="inline-flex items-center gap-0.5 cursor-pointer">
                          DT <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">DOMAIN TRAFFIC</th>
                      <th className="p-3 text-center">BACKLINKS</th>
                      <th className="p-3 text-center">KEYWORDS</th>
                      <th className="p-3 text-center">DOMAIN AGE</th>
                      <th className="p-3 whitespace-nowrap">FIRST SEEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {INITIAL_REF_DOMAINS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="p-3 font-semibold text-[#7C3AED]">
                          <a href={`https://${row.domain}`} target="_blank" rel="noreferrer" className="hover:underline">
                            {row.domain}
                          </a>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-[#1E293B] inline-block" />
                            <span className="font-bold text-gray-900">{row.dt}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-medium text-gray-700">
                          {row.domainTraffic}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{row.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center font-medium text-gray-700">
                          {row.keywords}
                        </td>
                        <td className="p-3 text-center text-gray-500">
                          {row.domainAge}
                        </td>
                        <td className="p-3 text-gray-500 whitespace-nowrap">
                          {row.firstSeen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination matching Screenshot 3 */}
              <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &lt;
                  </button>
                  <button className="px-2.5 py-1 bg-[#374151] text-white rounded font-bold cursor-pointer">
                    1
                  </button>
                  <button className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    2
                  </button>
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &gt;
                  </button>
                  <span className="ml-2 font-medium">Go to page:</span>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-12 px-2 py-0.5 border border-gray-300 rounded text-center text-xs"
                  />
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1 text-gray-700 bg-white shadow-2xs font-medium cursor-pointer">
                  <span>20</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ANCHOR TEXTS (MATCHING SCREENSHOT 1) */}
          {/* ======================================================== */}
          {activeSubTab === 'anchor-texts' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden animate-in fade-in duration-200">
              {/* Header Filter Row */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredAnchors.length} anchor texts
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <a
                      href={`/api/export?format=csv&domain=${analyzedDomain}&type=anchors`}
                      download
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </a>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => setAnchorFilterPill('all')}
                      className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                        anchorFilterPill === 'all'
                          ? 'bg-[#374151] text-white'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      ANCHOR TEXTS
                    </button>
                    {(['1-word', '2-word', '3-word', '4-word'] as const).map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setAnchorFilterPill(pill)}
                        className={`px-2.5 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                          anchorFilterPill === pill
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pill.toUpperCase()} TERMS
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        const q = prompt('Filter anchor texts by keyword:', anchorSearch);
                        if (q !== null) setAnchorSearch(q);
                      }}
                      className="px-2.5 py-1.5 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+ FILTER</span>
                      {anchorSearch && (
                        <span className="bg-blue-100 text-[#5B21B6] px-1 rounded text-[10px]">
                          &quot;{anchorSearch}&quot;
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                      <span>PRESETS</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">ANCHOR TEXT</th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 cursor-pointer">
                          REF.DOMAINS <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">BACKLINKS</th>
                      <th className="p-3 text-center min-w-[140px]">DOFOLLOW</th>
                      <th className="p-3">FIRST SEEN</th>
                      <th className="p-3">LAST SEEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAnchors.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="p-3 font-semibold text-gray-900 max-w-xs truncate">
                          {item.anchor}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{item.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{item.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold text-xs text-gray-800 w-4 text-right">
                              {item.dofollowCount}
                            </span>
                            <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden flex shrink-0">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${item.dofollowPercent}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-500 w-10 text-left">
                              {item.dofollowPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.firstSeen}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.lastSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-end text-xs text-gray-500">
                <div className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1 text-gray-700 bg-white shadow-2xs font-medium cursor-pointer">
                  <span>20</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PAGES (MATCHING SCREENSHOT 4) */}
          {/* ======================================================== */}
          {activeSubTab === 'pages' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden animate-in fade-in duration-200">
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredPages.length} pages
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="URL or domain"
                        value={pageSearch}
                        onChange={(e) => setPageSearch(e.target.value)}
                        className="px-3 pr-8 py-1.5 border border-gray-300 rounded text-xs placeholder:text-gray-400 w-56 sm:w-72 focus:outline-hidden focus:border-[#7C3AED]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => {
                        const q = prompt('Filter pages by URL keyword:', pageSearch);
                        if (q !== null) setPageSearch(q);
                      }}
                      className="px-2.5 py-1.5 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+ FILTER</span>
                    </button>
                  </div>

                  <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                    <span>PRESETS</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">URL</th>
                      <th className="p-3 text-center">BACKLINKS</th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 cursor-pointer">
                          REF.DOMAINS <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="p-3 font-semibold text-[#7C3AED]">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 hover:underline"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                              🌐
                            </span>
                            <span>{page.url}</span>
                          </a>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{page.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{page.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-gray-100 flex items-center justify-end text-xs text-gray-500">
                <div className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1 text-gray-700 bg-white shadow-2xs font-medium cursor-pointer">
                  <span>20</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: IPs (MATCHING SCREENSHOT 3) */}
          {/* ======================================================== */}
          {activeSubTab === 'ips' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden animate-in fade-in duration-200">
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredIps.length} referring ips
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <button
                        onClick={() => setIpFilterTab('ips')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                          ipFilterTab === 'ips'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        IPS
                      </button>
                      <button
                        onClick={() => setIpFilterTab('subnets')}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                          ipFilterTab === 'subnets'
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        SUBNETS
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const q = prompt('Filter IPs by address or country:', ipSearch);
                        if (q !== null) setIpSearch(q);
                      }}
                      className="px-2.5 py-1.5 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+ FILTER</span>
                      {ipSearch && (
                        <span className="bg-blue-100 text-[#5B21B6] px-1 rounded text-[10px]">
                          &quot;{ipSearch}&quot;
                        </span>
                      )}
                    </button>
                  </div>

                  <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                    <span>PRESETS</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">IP</th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 cursor-pointer">
                          REF.DOMAINS <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">BACKLINKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredIps.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F3FF] transition-colors">
                        <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                          <CountryFlag code={row.country} />
                          <span className="font-semibold text-gray-700 text-xs uppercase">{row.country}</span>
                          <span className="font-mono text-xs">{row.ip}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{row.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{row.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &lt;
                  </button>
                  <button className="px-2.5 py-1 bg-[#374151] text-white rounded font-bold cursor-pointer">
                    1
                  </button>
                  <button className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    2
                  </button>
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &gt;
                  </button>
                  <span className="ml-2 font-medium">Go to page:</span>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-12 px-2 py-0.5 border border-gray-300 rounded text-center text-xs"
                  />
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1 text-gray-700 bg-white shadow-2xs font-medium cursor-pointer">
                  <span>20</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

export default function BacklinkCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Backlink Checker...</div>}>
      <BacklinkCheckerContent />
    </Suspense>
  );
}
