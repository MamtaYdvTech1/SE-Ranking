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
import {
  SeRankingBacklinksOverallChart,
  SeRankingNewLostBarChart,
} from '@/components/backlinks/SeRankingBacklinksCharts';

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

// OVERVIEW TAB: Overall History Chart Data (12 Jul - 06 Oct)
const OVERALL_CHART_DATA = [
  { date: '12 Jul', range: '06 Jul 2026 - 12 Jul 2026', refDomains: 68, backlinks: 94, dt: 11, pt: 3, organic: 0 },
  { date: '19 Jul', range: '13 Jul 2026 - 19 Jul 2026', refDomains: 65, backlinks: 93, dt: 11, pt: 3, organic: 0 },
  { date: '26 Jul', range: '20 Jul 2026 - 26 Jul 2026', refDomains: 63, backlinks: 92, dt: 11, pt: 3, organic: 0 },
  { date: '02 Aug', range: '27 Jul 2026 - 02 Aug 2026', refDomains: 63, backlinks: 91, dt: 11, pt: 3, organic: 0 },
  { date: '09 Aug', range: '03 Aug 2026 - 09 Aug 2026', refDomains: 63, backlinks: 91, dt: 11, pt: 3, organic: 0 },
  { date: '16 Aug', range: '10 Aug 2026 - 16 Aug 2026', refDomains: 63, backlinks: 91, dt: 11, pt: 3, organic: 0 },
  { date: '23 Aug', range: '17 Aug 2026 - 23 Aug 2026', refDomains: 63, backlinks: 91, dt: 11, pt: 3, organic: 0 },
  { date: '30 Aug', range: '24 Aug 2026 - 30 Aug 2026', refDomains: 63, backlinks: 90, dt: 11, pt: 3, organic: 0 },
  { date: '06 Sep', range: '31 Aug 2026 - 06 Sep 2026', refDomains: 63, backlinks: 89, dt: 11, pt: 3, organic: 0 },
  { date: '13 Sep', range: '07 Sep 2026 - 13 Sep 2026', refDomains: 62, backlinks: 87, dt: 11, pt: 3, organic: 0 },
  { date: '20 Sep', range: '14 Sep 2026 - 20 Sep 2026', refDomains: 61, backlinks: 85, dt: 11, pt: 3, organic: 0 },
  { date: '27 Sep', range: '21 Sep 2026 - 27 Sep 2026', refDomains: 60, backlinks: 85, dt: 11, pt: 3, organic: 0 },
  { date: '04 Oct', range: '28 Sep 2026 - 04 Oct 2026', refDomains: 60, backlinks: 85, dt: 11, pt: 3, organic: 0 },
  { date: '06 Oct', range: '05 Oct 2026 - 06 Oct 2026', refDomains: 60, backlinks: 85, dt: 11, pt: 3, organic: 0 },
];

// OVERVIEW TAB: New & Lost Referring Domains Bar Chart Data
const NEW_LOST_DOMAINS_DATA = [
  { date: '12 Jul', range: '06 Jul 2026 - 12 Jul 2026', newCount: 0, lostCount: -2.0, change: -2.0 },
  { date: '19 Jul', range: '13 Jul 2026 - 19 Jul 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '26 Jul', range: '20 Jul 2026 - 26 Jul 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '02 Aug', range: '27 Jul 2026 - 02 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '09 Aug', range: '03 Aug 2026 - 09 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '16 Aug', range: '10 Aug 2026 - 16 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '23 Aug', range: '17 Aug 2026 - 23 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '30 Aug', range: '24 Aug 2026 - 30 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '06 Sep', range: '31 Aug 2026 - 06 Sep 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '13 Sep', range: '07 Sep 2026 - 13 Sep 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '20 Sep', range: '14 Sep 2026 - 20 Sep 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '27 Sep', range: '21 Sep 2026 - 27 Sep 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '04 Oct', range: '28 Sep 2026 - 04 Oct 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '06 Oct', range: '05 Oct 2026 - 06 Oct 2026', newCount: 0, lostCount: 0, change: 0 },
];

// OVERVIEW TAB: New & Lost Backlinks Bar Chart Data
const NEW_LOST_BACKLINKS_DATA = [
  { date: '12 Jul', range: '06 Jul 2026 - 12 Jul 2026', newCount: 0, lostCount: -2.0, change: -2.0 },
  { date: '19 Jul', range: '13 Jul 2026 - 19 Jul 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '26 Jul', range: '20 Jul 2026 - 26 Jul 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '02 Aug', range: '27 Jul 2026 - 02 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '09 Aug', range: '03 Aug 2026 - 09 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '16 Aug', range: '10 Aug 2026 - 16 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '23 Aug', range: '17 Aug 2026 - 23 Aug 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '30 Aug', range: '24 Aug 2026 - 30 Aug 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '06 Sep', range: '31 Aug 2026 - 06 Sep 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '13 Sep', range: '07 Sep 2026 - 13 Sep 2026', newCount: 0, lostCount: -2.0, change: -2.0 },
  { date: '20 Sep', range: '14 Sep 2026 - 20 Sep 2026', newCount: 0, lostCount: -2.0, change: -2.0 },
  { date: '27 Sep', range: '21 Sep 2026 - 27 Sep 2026', newCount: 0, lostCount: -1.0, change: -1.0 },
  { date: '04 Oct', range: '28 Sep 2026 - 04 Oct 2026', newCount: 0, lostCount: 0, change: 0 },
  { date: '06 Oct', range: '05 Oct 2026 - 06 Oct 2026', newCount: 0, lostCount: 0, change: 0 },
];

// OVERVIEW TAB: Top backlink anchors generator (dynamically binds to domain)
export const getTopAnchorsForDomain = (domain: string = 'flipkart.com') => {
  const clean = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '') || 'flipkart.com';
  const brand = clean.split('.')[0] || 'Brand';
  const brandCap = brand.charAt(0).toUpperCase() + brand.slice(1);
  return [
    { anchor: clean, backlinks: 66, percent: 77.6 },
    { anchor: `WWW.${clean}`, backlinks: 12, percent: 14.1 },
    { anchor: brandCap, backlinks: 2, percent: 2.4 },
    { anchor: `https://${clean}`, backlinks: 1, percent: 1.2 },
    { anchor: `${brandCap} App`, backlinks: 1, percent: 1.2 },
    { anchor: `Buy on ${brandCap}`, backlinks: 1, percent: 1.2 },
    { anchor: 'No text', backlinks: 1, percent: 1.2, isNoText: true },
    { anchor: `Explore ${brandCap}`, backlinks: 1, percent: 1.2 },
  ];
};

// OVERVIEW TAB: Domains by Domain Trust (10 tiers matching exact real dump)
const OVERVIEW_DOMAINS_BY_DT = [
  { range: '0-9', refDomains: 7, percent: 11.67 },
  { range: '10-19', refDomains: 3, percent: 5.00 },
  { range: '20-29', refDomains: 1, percent: 1.67 },
  { range: '30-39', refDomains: 1, percent: 1.67 },
  { range: '40-49', refDomains: 4, percent: 6.67 },
  { range: '50-59', refDomains: 28, percent: 46.67 },
  { range: '60-69', refDomains: 12, percent: 20.00 },
  { range: '70-79', refDomains: 3, percent: 5.00 },
  { range: '80-89', refDomains: 1, percent: 1.67 },
  { range: '90-100', refDomains: 0, percent: 0.00 },
];

// OVERVIEW TAB: Countries (matching exact real dump)
const OVERVIEW_COUNTRIES = [
  { flag: '🇲🇩', country: 'Moldova', refDomains: 17, percent: 34.7 },
  { flag: '🇺🇸', country: 'USA', refDomains: 12, percent: 24.5 },
  { flag: '🇦🇹', country: 'Austria', refDomains: 11, percent: 22.4 },
  { flag: '🇷🇴', country: 'Romania', refDomains: 4, percent: 8.2 },
  { flag: '🇫🇮', country: 'Finland', refDomains: 2, percent: 4.1 },
  { flag: '🇸🇬', country: 'Singapore', refDomains: 2, percent: 4.1 },
  { flag: '🇩🇪', country: 'Germany', refDomains: 1, percent: 2.0 },
];
// Base template containers (dynamically bound to active project domain in component)
const INITIAL_BACKLINKS_ROWS: BacklinkRowItem[] = [];
const INITIAL_REF_DOMAINS: ReferringDomainItem[] = [];
const INITIAL_ANCHORS: AnchorTextItem[] = [];
const INITIAL_PAGES: PageItem[] = [];

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
  const { activeProject, projects } = useApp();

  type SubTabType = 'overview' | 'backlinks' | 'referring-domains' | 'anchor-texts' | 'pages' | 'ips';
  const initialTab = (searchParams.get('tab') as SubTabType) || 'overview';
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>(initialTab);

  const cleanProjectDomain = useMemo(() => {
    const raw = activeProject?.domain || (projects && projects[0]?.domain) || 'flipkart.com';
    return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  }, [activeProject?.domain, projects]);

  const brandName = useMemo(() => {
    const raw = cleanProjectDomain.split('.')[0] || 'Domain';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [cleanProjectDomain]);

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

  const domainAnchors = useMemo<AnchorTextItem[]>(() => {
    if (backlinksData?.recentBacklinks && backlinksData.recentBacklinks.length > 0) {
      const map: Record<string, { refHosts: Set<string>; count: number; dofollow: number; firstSeen: string; lastSeen: string }> = {};
      for (const b of backlinksData.recentBacklinks) {
        const text = b.anchorText?.trim() || cleanProjectDomain;
        if (!map[text]) {
          map[text] = {
            refHosts: new Set<string>(),
            count: 0,
            dofollow: 0,
            firstSeen: b.firstSeenDate ? new Date(b.firstSeenDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025',
            lastSeen: b.lastSeenDate ? new Date(b.lastSeenDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Oct 2026',
          };
        }
        map[text].count++;
        if (b.isDoFollow) map[text].dofollow++;
        try {
          map[text].refHosts.add(new URL(b.sourceUrl).hostname);
        } catch {
          map[text].refHosts.add(b.sourceUrl);
        }
      }
      return Object.entries(map).map(([anchor, val]) => ({
        anchor,
        refDomains: val.refHosts.size,
        backlinks: val.count,
        dofollowCount: val.dofollow,
        dofollowPercent: val.count > 0 ? Math.round((val.dofollow / val.count) * 100) : 100,
        firstSeen: val.firstSeen,
        lastSeen: val.lastSeen,
      }));
    }
    return [
      { anchor: cleanProjectDomain, refDomains: 34, backlinks: 48, dofollowCount: 42, dofollowPercent: 88, firstSeen: '24 Jan 2024', lastSeen: '12 Oct 2026' },
      { anchor: `WWW.${cleanProjectDomain.toUpperCase()}`, refDomains: 12, backlinks: 14, dofollowCount: 14, dofollowPercent: 100, firstSeen: '15 Mar 2024', lastSeen: '10 Oct 2026' },
      { anchor: brandName, refDomains: 8, backlinks: 11, dofollowCount: 9, dofollowPercent: 82, firstSeen: '02 Feb 2024', lastSeen: '12 Oct 2026' },
      { anchor: `https://${cleanProjectDomain}`, refDomains: 6, backlinks: 7, dofollowCount: 6, dofollowPercent: 86, firstSeen: '18 Apr 2024', lastSeen: '11 Oct 2026' },
      { anchor: `${brandName} App`, refDomains: 4, backlinks: 4, dofollowCount: 4, dofollowPercent: 100, firstSeen: '10 May 2024', lastSeen: '09 Oct 2026' },
      { anchor: `Buy on ${brandName}`, refDomains: 3, backlinks: 3, dofollowCount: 3, dofollowPercent: 100, firstSeen: '22 Jun 2024', lastSeen: '08 Oct 2026' },
      { anchor: 'No text', refDomains: 2, backlinks: 2, dofollowCount: 1, dofollowPercent: 50, firstSeen: '05 Jul 2024', lastSeen: '05 Oct 2026' },
      { anchor: `Explore ${brandName}`, refDomains: 2, backlinks: 2, dofollowCount: 2, dofollowPercent: 100, firstSeen: '14 Aug 2024', lastSeen: '06 Oct 2026' },
    ];
  }, [backlinksData, cleanProjectDomain, brandName]);

  const domainBacklinks = useMemo<BacklinkRowItem[]>(() => {
    if (backlinksData?.recentBacklinks && backlinksData.recentBacklinks.length > 0) {
      return backlinksData.recentBacklinks.map((b: any, idx: number) => {
        let hostname = '';
        try { hostname = new URL(b.sourceUrl).hostname; } catch { hostname = b.sourceUrl; }
        return {
          id: b.id || idx + 1,
          title: `${brandName} Overview & Reviews on ${hostname}`,
          sourceUrl: b.sourceUrl,
          domainTraffic: '18.4K',
          pageTraffic: '320',
          dt: b.domainTrust || 62,
          pt: b.pageTrust || 48,
          keywords: 12,
          anchor: b.anchorText || brandName,
          type: 'TEXT',
          nofollow: !b.isDoFollow,
          targetUrl: b.targetUrl || `https://${cleanProjectDomain}/`,
          firstSeen: b.firstSeenDate ? new Date(b.firstSeenDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Jan 2025',
          lastSeen: b.lastSeenDate ? new Date(b.lastSeenDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Oct 2026',
          isBestLink: idx === 0,
        };
      });
    }
    const donors = [
      { host: 'techcrunch.com', dt: 92, pt: 64, traffic: '18.2M', kw: 24, path: '/startups/ecommerce-scaling' },
      { host: 'forbes.com', dt: 94, pt: 72, traffic: '52.1M', kw: 36, path: '/business/digital-commerce-leaders' },
      { host: 'medium.com', dt: 88, pt: 55, traffic: '24.5M', kw: 18, path: '/tech-digest/top-platforms-guide' },
      { host: 'producthunt.com', dt: 85, pt: 58, traffic: '4.8M', kw: 14, path: '/posts/brand-showcase' },
      { host: 'economictimes.indiatimes.com', dt: 89, pt: 68, traffic: '36.4M', kw: 42, path: '/industry/retail-growth' },
      { host: 'businessinsider.com', dt: 91, pt: 60, traffic: '28.9M', kw: 28, path: '/retail/marketplace-analysis' },
      { host: 'crunchbase.com', dt: 87, pt: 52, traffic: '9.2M', kw: 16, path: `/organization/${cleanProjectDomain.split('.')[0]}` },
      { host: 'wikipedia.org', dt: 98, pt: 84, traffic: '120.4M', kw: 95, path: `/wiki/${brandName}` },
    ];
    return donors.map((d, idx) => ({
      id: idx + 1,
      title: `${brandName} Profile & Features on ${d.host}`,
      sourceUrl: `https://${d.host}${d.path}`,
      domainTraffic: d.traffic,
      pageTraffic: `${Math.round(200 + idx * 45)}`,
      dt: d.dt,
      pt: d.pt,
      keywords: d.kw,
      anchor: idx % 2 === 0 ? brandName : cleanProjectDomain,
      type: 'TEXT',
      nofollow: idx % 3 === 0,
      targetUrl: `https://${cleanProjectDomain}/`,
      firstSeen: `${(10 + idx).toString().padStart(2, '0')} Jan 2025`,
      lastSeen: `${(idx + 1).toString().padStart(2, '0')} Oct 2026`,
      isBestLink: idx === 0,
    }));
  }, [backlinksData, cleanProjectDomain, brandName]);

  const domainPages = useMemo<PageItem[]>(() => {
    if (backlinksData?.recentBacklinks && backlinksData.recentBacklinks.length > 0) {
      const pageMap: Record<string, { backlinks: number; refHosts: Set<string> }> = {};
      for (const b of backlinksData.recentBacklinks) {
        const u = b.targetUrl || `https://${cleanProjectDomain}/`;
        if (!pageMap[u]) pageMap[u] = { backlinks: 0, refHosts: new Set() };
        pageMap[u].backlinks++;
        try { pageMap[u].refHosts.add(new URL(b.sourceUrl).hostname); } catch { pageMap[u].refHosts.add(b.sourceUrl); }
      }
      return Object.entries(pageMap).map(([url, val]) => ({
        url,
        backlinks: val.backlinks,
        refDomains: val.refHosts.size,
      }));
    }
    return [
      { url: `https://${cleanProjectDomain}/`, backlinks: 42, refDomains: 28 },
      { url: `https://${cleanProjectDomain}/about-us`, backlinks: 14, refDomains: 9 },
      { url: `https://${cleanProjectDomain}/products`, backlinks: 11, refDomains: 8 },
      { url: `https://${cleanProjectDomain}/contact`, backlinks: 6, refDomains: 5 },
      { url: `https://${cleanProjectDomain}/blog`, backlinks: 5, refDomains: 4 },
      { url: `https://${cleanProjectDomain}/terms`, backlinks: 3, refDomains: 3 },
    ];
  }, [backlinksData, cleanProjectDomain]);

  const domainReferringDomains = useMemo<ReferringDomainItem[]>(() => {
    if (backlinksData?.recentBacklinks && backlinksData.recentBacklinks.length > 0) {
      const hostMap: Record<string, { dt: number; backlinks: number; firstSeen: string }> = {};
      for (const b of backlinksData.recentBacklinks) {
        let h = '';
        try { h = new URL(b.sourceUrl).hostname; } catch { h = b.sourceUrl; }
        if (!hostMap[h]) {
          hostMap[h] = {
            dt: b.domainTrust || 55,
            backlinks: 0,
            firstSeen: b.firstSeenDate ? new Date(b.firstSeenDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025',
          };
        }
        hostMap[h].backlinks++;
      }
      return Object.entries(hostMap).map(([d, val]) => ({
        domain: d,
        dt: val.dt,
        domainTraffic: `${(val.dt * 0.35).toFixed(1)}M`,
        backlinks: val.backlinks,
        keywords: `${Math.round(val.dt * 12)}K`,
        domainAge: `${Math.max(3, Math.round(val.dt / 7))} yrs`,
        firstSeen: val.firstSeen,
      }));
    }
    return [
      { domain: 'medium.com', dt: 88, domainTraffic: '28.4M', backlinks: 14, keywords: '1.2M', domainAge: '12 yrs', firstSeen: '12 Jan 2024' },
      { domain: 'producthunt.com', dt: 84, domainTraffic: '4.1M', backlinks: 9, keywords: '450K', domainAge: '10 yrs', firstSeen: '05 Feb 2024' },
      { domain: 'techcrunch.com', dt: 91, domainTraffic: '15.8M', backlinks: 6, keywords: '890K', domainAge: '19 yrs', firstSeen: '18 Mar 2024' },
      { domain: 'github.com', dt: 96, domainTraffic: '92.3M', backlinks: 5, keywords: '4.6M', domainAge: '16 yrs', firstSeen: '02 Apr 2024' },
      { domain: 'forbes.com', dt: 93, domainTraffic: '55.2M', backlinks: 4, keywords: '2.8M', domainAge: '26 yrs', firstSeen: '11 May 2024' },
      { domain: 'crunchbase.com', dt: 86, domainTraffic: '8.7M', backlinks: 3, keywords: '620K', domainAge: '17 yrs', firstSeen: '24 Jun 2024' },
      { domain: 'economictimes.indiatimes.com', dt: 89, domainTraffic: '32.1M', backlinks: 3, keywords: '1.9M', domainAge: '24 yrs', firstSeen: '14 Jul 2024' },
    ];
  }, [backlinksData]);

  const filteredAnchors = useMemo(() => {
    let list = [...domainAnchors];
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
  }, [domainAnchors, anchorFilterPill, anchorSearch]);

  const filteredPages = useMemo(() => {
    let list = [...domainPages];
    if (pageSearch.trim()) {
      const q = pageSearch.toLowerCase();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }
    return list;
  }, [domainPages, pageSearch]);

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
    let list = [...domainBacklinks];
    if (backlinkFilterPill === 'new') {
      list = list.slice(0, 4);
    } else if (backlinkFilterPill === 'lost') {
      list = list.filter(b => b.nofollow);
    }
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
  }, [domainBacklinks, backlinkFilterPill, backlinkSearch]);

  const filteredRefDomains = useMemo(() => {
    let list = [...domainReferringDomains];
    if (refDomainFilterPill === 'new') {
      list = list.slice(0, 3);
    } else if (refDomainFilterPill === 'lost') {
      list = list.slice(-2);
    }
    return list;
  }, [domainReferringDomains, refDomainFilterPill]);

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
          {/* TAB 1: OVERVIEW (MATCHING REAL SCREENSHOTS & HIGHCHARTS DUMP) */}
          {/* ======================================================== */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Row 1: 4 Top Metric Cards (Exact match to SE Ranking myjio.com dump) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Domain Trust & Page Trust */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span>Domain Trust</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {backlinksData?.domainTrust ?? 11} <span className="text-xs text-gray-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <span>Page Trust</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {backlinksData?.pageTrust ?? 3} <span className="text-xs text-gray-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Referring Domains */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span>Referring Domains</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                  </div>
                  <div className="text-3xl font-black text-[#1976D2]">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('referring-domains')}
                      className="hover:underline cursor-pointer"
                    >
                      {backlinksData?.referringDomains ?? 60}
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <span>Referring domains analyzed: {backlinksData?.referringDomains ?? 60}</span>
                      <span className="text-gray-400">ⓘ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New in last 30 days:</span>
                      <span className="text-gray-400 font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lost in last 30 days:</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('referring-domains')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        3
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Broken:</span>
                      <span className="text-gray-400 font-medium">0</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Backlinks */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span>Backlinks</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                  </div>
                  <div className="text-3xl font-black text-[#1976D2]">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('backlinks')}
                      className="hover:underline cursor-pointer"
                    >
                      {backlinksData?.totalBacklinks ?? 85}
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <span>Backlinks analyzed: {backlinksData?.totalBacklinks ?? 85}</span>
                      <span className="text-gray-400">ⓘ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New in last 30 days:</span>
                      <span className="text-gray-400 font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lost in last 30 days:</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('backlinks')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        4
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Broken:</span>
                      <span className="text-gray-400 font-medium">0</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Backlinks Toxicity Score (Exact match to real dump) */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span>Backlinks Toxicity Score</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'rgb(231, 76, 60)' }}>
                    High toxicity
                  </div>
                  <div className="text-[11px] pt-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">High</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('backlinks')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        1
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Medium</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('backlinks')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        55
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Low</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('backlinks')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        26
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Non-toxic</span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('backlinks')}
                        className="text-[#1976D2] font-semibold hover:underline cursor-pointer"
                      >
                        3
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Highcharts Spline Overall Dynamics Chart with Crosshair & Tooltips */}
              <SeRankingBacklinksOverallChart data={OVERALL_CHART_DATA} />

              {/* Row 3: Two Side-by-Side Dual-Bar Charts with Change Line */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SeRankingNewLostBarChart
                  title="New & lost referring domains"
                  data={NEW_LOST_DOMAINS_DATA}
                  defaultHoverIndex={11}
                />
                <SeRankingNewLostBarChart
                  title="New & lost backlinks"
                  data={NEW_LOST_BACKLINKS_DATA}
                  defaultHoverIndex={10}
                />
              </div>

              {/* Row 4: 3 Summary Rating Tables (Exact match to real dump) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Table 1: Top backlink anchors */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[395px]">
                  <div>
                    <div className="text-xs font-bold text-[#2E2E30] mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>Top backlink anchors</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                      </div>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-2 font-semibold text-left" style={{ width: '55.5%' }}>Anchor text</th>
                          <th className="pb-2 text-right font-semibold" style={{ width: '27%' }}>Backlinks</th>
                          <th className="pb-2 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {getTopAnchorsForDomain(cleanProjectDomain).map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                            <td
                              className={`py-2 truncate max-w-[150px] ${
                                r.isNoText ? 'text-[#7C7D7E]' : 'text-[#2E2E30] font-medium'
                              }`}
                            >
                              {r.anchor}
                            </td>
                            <td className="py-2 text-right font-semibold">
                              <button
                                type="button"
                                onClick={() => setActiveSubTab('anchor-texts')}
                                className="text-[#1976D2] hover:underline cursor-pointer"
                              >
                                {r.backlinks}
                              </button>
                            </td>
                            <td
                              className={`py-2 text-right ${
                                r.isNoText ? 'text-[#7C7D7E]' : 'text-[#2E2E30]'
                              }`}
                            >
                              {r.percent.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('anchor-texts')}
                      className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View full report</span>
                      <span className="material-icons notranslate text-[16px]">keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>

                {/* Table 2: Domains by Domain Trust */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[395px]">
                  <div>
                    <div className="text-xs font-bold text-[#2E2E30] mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>Domains by Domain Trust</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                      </div>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-2 font-semibold text-left" style={{ width: '55.5%' }}>Domain Trust</th>
                          <th className="pb-2 text-right font-semibold" style={{ width: '27%' }}>Ref.domains</th>
                          <th className="pb-2 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {OVERVIEW_DOMAINS_BY_DT.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-2 text-[#2E2E30] font-medium">
                              {r.range}
                            </td>
                            <td className="py-2 text-right font-semibold">
                              <button
                                type="button"
                                onClick={() => setActiveSubTab('referring-domains')}
                                className="text-[#1976D2] hover:underline cursor-pointer"
                              >
                                {r.refDomains}
                              </button>
                            </td>
                            <td className="py-2 text-right text-[#2E2E30]">
                              {r.percent.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('referring-domains')}
                      className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View full report</span>
                      <span className="material-icons notranslate text-[16px]">keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>

                {/* Table 3: Countries */}
                <div className="bg-white border border-[#E3E6EE] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[395px]">
                  <div>
                    <div className="text-xs font-bold text-[#2E2E30] mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>Countries</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-serif italic">i</span>
                      </div>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                        <tr>
                          <th className="pb-2 font-semibold text-left" style={{ width: '55.5%' }}>Country</th>
                          <th className="pb-2 text-right font-semibold" style={{ width: '27%' }}>Ref.domains</th>
                          <th className="pb-2 text-right font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {OVERVIEW_COUNTRIES.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-2 text-[#2E2E30] font-medium flex items-center gap-2">
                              <CountryFlag name={r.country} />
                              <span className="truncate max-w-[120px]">{r.country}</span>
                            </td>
                            <td className="py-2 text-right font-semibold">
                              <button
                                type="button"
                                onClick={() => setActiveSubTab('referring-domains')}
                                className="text-[#1976D2] hover:underline cursor-pointer"
                              >
                                {r.refDomains}
                              </button>
                            </td>
                            <td className="py-2 text-right text-[#2E2E30]">
                              {r.percent.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ips')}
                      className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View full report</span>
                      <span className="material-icons notranslate text-[16px]">keyboard_arrow_down</span>
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
                    {filteredBacklinks.length} backlinks
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
                    {filteredRefDomains.length} referring domains
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
                    {filteredRefDomains.map((row, idx) => (
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
