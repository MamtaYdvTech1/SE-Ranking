'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Globe2,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Layers,
  FileSearch,
  Building,
  Check,
  CreditCard,
  Bot,
  ExternalLink,
  Database,
  Code2,
  FileText,
  Megaphone,
  GraduationCap,
  Radio,
  Target,
  Key,
  Globe,
  Award,
  Sliders,
  CheckSquare,
  MapPin,
  Briefcase,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Compass,
  Smile,
  Tag,
  DollarSign,
  MousePointerClick,
  Wrench,
  Banknote,
  Shield,
  User,
  Square,
  Menu,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { PartnerLogos } from '@/components/landing/PartnerLogos';
import { HeroAvatarSlider } from '@/components/landing/HeroAvatarSlider';
import { getTranslation } from '@/lib/i18n/translations';
import { MarketingHeader } from '@/components/layout/MarketingHeader';

// 10 languages list matching official SE Ranking language-switcher-2025
const languages = [
  { code: 'en', label: 'English', href: '/' },
  { code: 'de', label: 'Deutsch', href: 'https://seranking.com/de/' },
  { code: 'fr', label: 'Français', href: 'https://seranking.com/fr/' },
  { code: 'es', label: 'Español', href: 'https://seranking.com/es/' },
  { code: 'nl', label: 'Nederlands', href: 'https://seranking.com/nl/' },
  { code: 'it', label: 'Italiano', href: 'https://seranking.com/it/' },
  { code: 'pt', label: 'Português', href: 'https://seranking.com/pt/' },
  { code: 'ua', label: 'Українська', href: 'https://seranking.com/ua/' },
  { code: 'ru', label: 'Русский', href: 'https://seranking.com/ru/' },
  { code: 'あ', label: '日本語', href: 'https://seranking.com/jp/' },
];

// Mock chart data for SEO Rankings - wavy curves matching reference screenshot
const mockRankingsTrend = [
  { date: 'Jun 24', pink: 72, blue: 70, teal: 35, purple: 28 },
  { date: 'Jun 25', pink: 98, blue: 45, teal: 68, purple: 64 },
  { date: 'Jun 26', pink: 82, blue: 68, teal: 52, purple: 56 },
  { date: 'Jun 27', pink: 88, blue: 85, teal: 80, purple: 70 },
  { date: 'Jun 28', pink: 62, blue: 60, teal: 45, purple: 40 },
  { date: 'Jun 29', pink: 78, blue: 88, teal: 84, purple: 75 },
];

// Case studies data (7 items) - Exact screenshot match
const caseStudies = [
  {
    company: 'Fractional Teams',
    meta: 'a UK-based digital marketing and product consulting agency, centralized reporting with SE Ranking',
    link: 'https://seranking.com/blog/fractional-teams-success-story/',
    metric1: '50% less',
    desc1: 'time spent on reporting',
    metric2: '30 minutes',
    desc2: 'needed for initial report setup',
  },
  {
    company: 'EYClick',
    meta: 'a Spanish digital marketing agency, tripled traffic for a local restaurant',
    link: 'https://seranking.com/blog/eyclick-success-story/',
    metric1: '#1 position',
    desc1: 'for competitive local terms',
    metric2: '20+ keywords',
    desc2: 'ranking in Google’s Top 10',
  },
  {
    company: 'Japan Ski Experience',
    meta: 'a UK-based company specializing in ski holidays, reduced dependence on PPC through SEO',
    link: 'https://seranking.com/blog/japan-ski-experience-case-study/',
    metric1: '59%',
    desc1: 'of target keywords in the top 5 positions',
    metric2: '61.2 overall',
    desc2: 'in search visibility',
  },
  {
    company: 'Cardeseo',
    meta: 'a Spanish-based SEO agency, helped several struggling clients get more visibility',
    link: 'https://seranking.com/blog/cardeseo-success-story/',
    metric1: '5.7M',
    desc1: 'impressions',
    metric2: '54.4K',
    desc2: 'clicks',
  },
  {
    company: 'hurra.com™',
    meta: "a German digital marketing agency, automated SEO and SEA workflows with SE Ranking's API",
    link: 'https://seranking.com/blog/hurra-com-success-story/',
    metric1: '+140%',
    desc1: 'in SEO revenue',
    metric2: '+21%',
    desc2: 'in SEA revenue',
  },
  {
    company: 'Pilote Consulting',
    meta: 'a French digital marketing agency, grew local hotel bookings by 38%',
    link: 'https://seranking.com/blog/pilote-consulting-success-story/',
    metric1: '9,500 visits',
    desc1: 'per month in 7 months',
    metric2: '30% decrease',
    desc2: 'in paid search budget',
  },
  {
    company: 'Votre Site Pro',
    meta: 'a Belgian website creation agency, automated reporting and SEO insights',
    link: 'https://seranking.com/blog/votre-site-pro-success-story/',
    metric1: '48% less',
    desc1: 'spending on SEO tools',
    metric2: '3 hours',
    desc2: 'per week saves on reporting',
  },
];

// Ecosystem SE Ranking multi-line curve data (Sep 23 - Sep 29)
const ecoRankingsData = [
  { date: 'Sep 23', rank1: 14, rank2: 17, rank3: 20, rank4: 25 },
  { date: 'Sep 24', rank1: 17, rank2: 21, rank3: 23, rank4: 27 },
  { date: 'Sep 25', rank1: 16, rank2: 23, rank3: 27, rank4: 31 },
  { date: 'Sep 26', rank1: 22, rank2: 24, rank3: 28, rank4: 31 },
  { date: 'Sep 27', rank1: 24, rank2: 27, rank3: 29, rank4: 29 },
  { date: 'Sep 28', rank1: 19, rank2: 23, rank3: 26, rank4: 28 },
  { date: 'Sep 29', rank1: 23, rank2: 25, rank3: 29, rank4: 31 },
];

// Ecosystem SE Visible multi-line curve data (Aug 24 - Aug 29)
const ecoVisibleData = [
  { date: 'Aug 24', you: 45, smx: 68, pubcon: 38, techSeo: 62, competitors: 50 },
  { date: 'Aug 25', you: 62, smx: 52, pubcon: 58, techSeo: 48, competitors: 54 },
  { date: 'Aug 26', you: 58, smx: 55, pubcon: 52, techSeo: 50, competitors: 58 },
  { date: 'Aug 27', you: 72, smx: 64, pubcon: 56, techSeo: 68, competitors: 62 },
  { date: 'Aug 28', you: 60, smx: 54, pubcon: 48, techSeo: 58, competitors: 56 },
  { date: 'Aug 29', you: 82, smx: 65, pubcon: 70, techSeo: 78, competitors: 68 },
];

// Ecosystem Planable stacked area data (Oct 7 - Oct 10)
const ecoPlanableData = [
  { date: 'Oct 7', ig: 18000, tiktok: 26000, fb: 19000, yt: 14000, linkedin: 12000 },
  { date: 'Oct 8', ig: 24000, tiktok: 34000, fb: 22000, yt: 18000, linkedin: 15000 },
  { date: 'Oct 9', ig: 42000, tiktok: 58000, fb: 38000, yt: 28000, linkedin: 22000 },
  { date: 'Oct 10', ig: 28000, tiktok: 39000, fb: 26000, yt: 21000, linkedin: 17000 },
];



// Testimonials data (7 items) - Exact screenshot match
const testimonials = [
  {
    quote:
      '“I’ve been using SE Ranking MCP server for months and it’s fantastic. My keyword research involves classifying keywords with a lot of ambiguity into families and locations. This MCP has saved me days of manual work — my research now takes a few hours instead of days”',
    name: 'Gus Pelogia',
    role: 'Senior SEO Product Manager (R&D) Indeed',
    avatar: '/images/testimonials/gus.png',
  },
  {
    quote:
      '“The AI Visibility and GEO tracking in SE Ranking gave us early clarity on LLM citations across ChatGPT and Perplexity. We turned AI answers into our #1 referral channel in under 6 months.”',
    name: 'Dana DiTomaso',
    role: 'Founder & Lead Instructor, Kick Point Playbook',
    avatar: '/images/testimonials/dana.png',
  },
  {
    quote:
      '“Accurate rank tracking across 188 country DBs and mobile SERPs without hidden fees makes SE Ranking our default recommendation for international enterprise audits.”',
    name: 'Aleyda Solis',
    role: 'International SEO Consultant & Founder, Orainti',
    avatar: '/images/testimonials/aleyda.png',
  },
  {
    quote:
      '“SE Ranking has outpaced traditional suites by building native MCP integrations and AI SEO monitoring directly into their platform. It’s what modern search practitioners actually need.”',
    name: 'Alex Moss',
    role: 'SEO Director, Yoast & FireCask',
    avatar: '/images/testimonials/alex.png',
  },
  {
    quote:
      '“The Agency Pack is a game changer for client retention. Automated white-label reporting and client seats shaved 15 hours off each team lead\'s week.”',
    name: 'John Doherty',
    role: 'CEO & Founder, Credo & EditorNinja',
    avatar: '/images/testimonials/john.png',
  },
  {
    quote:
      '“Combining rank intelligence with social publishing in Planable streamlined our cross-channel marketing. Our team executes twice as fast without switching apps.”',
    name: 'Giannis Karampatsos',
    role: 'Head of Growth, Productiv',
    avatar: '/images/testimonials/giannis.png',
  },
  {
    quote:
      '“We replaced three disparate tools with SE Ranking\'s unified studio. The depth of competitive gap analysis and API reliability is best-in-class.”',
    name: 'Erin Sparks',
    role: 'President, Site-Strategics & Edge of the Web Host',
    avatar: '/images/testimonials/erin.png',
  },
];

// Case studies official brand logos matching reference screenshots
const renderCaseStudyLogo = (idx: number) => {
  switch (idx) {
    case 0: // Fractional Teams
      return (
        <div className="flex items-center gap-2.5 text-[#67F87C] select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <rect x="3" y="3" width="7" height="18" rx="1.5" fill="#67F87C" />
            <rect x="12" y="3" width="9" height="6" rx="1.5" fill="#67F87C" />
            <rect x="12" y="11" width="6" height="5" rx="1.5" fill="#67F87C" />
          </svg>
          <span className="text-[17px] font-semibold tracking-tight text-[#67F87C]">fractional teams</span>
        </div>
      );
    case 1: // EYClick
      return (
        <div className="text-[22px] font-bold tracking-tight text-[#67F87C] select-none">
          EYClick
        </div>
      );
    case 2: // Japan Ski Experience
      return (
        <div className="flex items-center gap-2 text-[#67F87C] select-none">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="#67F87C" strokeWidth="1.8" />
            <path d="M12 5L8 11.5h8zM12 19l-4-6.5h8z" fill="#67F87C" />
          </svg>
          <div className="leading-tight text-left">
            <span className="text-[13px] font-bold tracking-wider text-[#67F87C] block uppercase">JAPAN SKI</span>
            <span className="text-[9px] font-medium tracking-widest text-[#67F87C] block uppercase -mt-0.5">EXPERIENCE</span>
          </div>
        </div>
      );
    case 3: // Cardeseo
      return (
        <div className="text-[28px] font-black tracking-tight text-[#67F87C] lowercase select-none">
          cardeseo
        </div>
      );
    case 4: // hurra.com™
      return (
        <div className="text-right leading-none text-[#67F87C] select-none">
          <div className="text-[28px] font-bold tracking-tight flex items-baseline gap-0.5 justify-end">
            hurra<span className="text-xs font-normal">™</span>
          </div>
          <div className="text-[20px] font-bold tracking-wider mt-0.5">com</div>
        </div>
      );
    case 5: // Pilote Consulting
      return (
        <div className="flex items-center gap-2 text-[#67F87C] select-none">
          <svg width="30" height="24" viewBox="0 0 30 24" fill="#67F87C" className="shrink-0">
            <path d="M2 20C4.5 17.5 7 17.5 9.5 20V4C7 1.5 4.5 1.5 2 4v16zM11 20C13.5 17.5 16 17.5 18.5 20V4C16 1.5 13.5 1.5 11 4v16zM20 20C22.5 17.5 25 17.5 27.5 20V4C25 1.5 22.5 1.5 20 4v16z" />
          </svg>
          <span className="text-[26px] font-bold tracking-tight text-[#67F87C]">Pilote</span>
        </div>
      );
    case 6: // Votre Site Pro
      return (
        <div className="flex items-center gap-2 text-[#67F87C] select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#67F87C" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-[18px] font-bold text-[#67F87C]">Votre Site Pro</span>
        </div>
      );
    default:
      return null;
  }
};

export default function LandingPage() {
  // Mobile drawer & language switcher states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const t = getTranslation(selectedLang);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('seranking_lang');
        if (saved) {
          setSelectedLang(saved);
          const found = languages.find((l) => l.code.toLowerCase() === saved.toLowerCase());
          if (found) setFooterLang(found.label);
        }
      } catch (e) {}
    };

    handleSync();
    window.addEventListener('seranking_lang_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seranking_lang_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleLanguageChange = (code: string) => {
    setSelectedLang(code);
    const found = languages.find((l) => l.code.toLowerCase() === code.toLowerCase());
    if (found) setFooterLang(found.label);
    try {
      localStorage.setItem('seranking_lang', code);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = code === 'あ' ? 'ja' : code;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seranking_lang_change', { detail: { lang: code } }));
      }
    } catch (e) {}
  };

  const router = useRouter();

  // Close navigation dropdowns when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveMenu(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  // Language-aware HelloBar banner config:
  // English keeps the green AI Visibility banner
  // All other languages use the official orange banner with MCP ChatGPT announcement
  const helloBarConfig = React.useMemo(() => {
    const code = (selectedLang || 'en').toLowerCase();
    if (code === 'en') {
      return {
        bg: 'bg-[#7C3AED]',
        textColor: 'text-white',
        closeColor: 'text-white/80 hover:text-white',
        text: 'Start doing more with your AI Visibility Data',
        link: 'https://visible.seranking.com/?utm_source=seranking&utm_medium=hellobar&utm_campaign=visible',
      };
    }

    const mcpMessages: Record<string, { text: string; link: string }> = {
      fr: {
        text: 'Nouveau connecteur MCP : accédez à vos données SEO et GEO à jour dans ChatGPT. En savoir plus',
        link: 'https://seranking.com/fr/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      de: {
        text: 'Neuer MCP-Konnektor: Greifen Sie in ChatGPT auf aktuelle SEO- und GEO-Daten zu. Mehr erfahren',
        link: 'https://seranking.com/de/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      es: {
        text: 'Nuevo conector MCP: accede a tus datos de SEO y GEO actualizados en ChatGPT. Más información',
        link: 'https://seranking.com/es/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      nl: {
        text: 'Nieuwe MCP-connector: krijg toegang tot actuele SEO- en GEO-gegevens in ChatGPT. Lees meer',
        link: 'https://seranking.com/nl/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      it: {
        text: 'Nuovo connettore MCP: accedi ai tuoi dati SEO e GEO aggiornati in ChatGPT. Scopri di più',
        link: 'https://seranking.com/it/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      pt: {
        text: 'Novo conector MCP: acesse seus dados de SEO e GEO atualizados no ChatGPT. Saiba mais',
        link: 'https://seranking.com/pt/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      ua: {
        text: 'Новий MCP-конектор: доступ до актуальних даних SEO та GEO у ChatGPT. Дізнатися більше',
        link: 'https://seranking.com/ua/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      ru: {
        text: 'Новый коннектор MCP: доступ к актуальным данным SEO и GEO в ChatGPT. Узнать больше',
        link: 'https://seranking.com/ru/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      ja: {
        text: '新しいMCPコネクタ：ChatGPTで最新のSEOおよびGEOデータにアクセス。詳細を見る',
        link: 'https://seranking.com/jp/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
      あ: {
        text: '新しいMCPコネクタ：ChatGPTで最新のSEOおよびGEOデータにアクセス。詳細を見る',
        link: 'https://seranking.com/jp/mcp.html?utm_source=seranking&utm_medium=hellobar&utm_campaign=mcp',
      },
    };

    const current = mcpMessages[code] || mcpMessages.fr;
    return {
      bg: 'bg-[#ff9c00]',
      textColor: 'text-gray-950 font-semibold',
      closeColor: 'text-gray-950/80 hover:text-black',
      text: current.text,
      link: current.link,
    };
  }, [selectedLang]);

  const handleProjectsNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/projects');
    } else {
      router.push('/login?redirect=/projects');
    }
  };

  // Active Dropdown state for Desktop Navigation
  const [activeMenu, setActiveMenu] = useState<
    'suite' | 'solutions' | 'tools' | 'resources' | 'pricing' | 'api-mcp' | 'lang' | null
  >(null);

  // Sub-tabs inside dropdowns
  const [solutionsSubTab, setSolutionsSubTab] = useState<'business-type' | 'migrate'>('business-type');
  const [toolsSubTab, setToolsSubTab] = useState<
    'core-seo' | 'ai-search' | 'other-seo' | 'agency-pack' | 'content-marketing'
  >('core-seo');
  const [resourcesSubTab, setResourcesSubTab] = useState<'education' | 'customer-hub'>('education');
  const [apiSubTab, setApiSubTab] = useState<'api' | 'mcp'>('api');

  // Platform tabs (Complete AI SEO platform)
  const [platformTab, setPlatformTab] = useState<
    'ai-visibility' | 'seo-research' | 'seo-monitoring' | 'content-marketing' | 'local-marketing' | 'agency-kit' | 'integrations'
  >('ai-visibility');

  // Case study pagination index (0 to 6 = 1 to 7)
  const [caseStudyIdx, setCaseStudyIdx] = useState(0);

  // Product tour modal
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Hello bar visibility
  const [showHelloBar, setShowHelloBar] = useState(true);

  // Ecosystem section states
  const [ecoRankingTimeTab, setEcoRankingTimeTab] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M'>('7D');
  const [ecoRankingView, setEcoRankingView] = useState<'ALL' | 'WEBSITES' | 'GROUPS'>('ALL');
  const [ecoRankingGroupBy, setEcoRankingGroupBy] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
  const [isEcoGroupByOpen, setIsEcoGroupByOpen] = useState(false);
  const [ecoVisibleMetric, setEcoVisibleMetric] = useState<'score' | 'avg_pos'>('score');
  const [ecoVisibleSourceTab, setEcoVisibleSourceTab] = useState<'domains' | 'urls'>('domains');
  const [ecoVisibleCategory, setEcoVisibleCategory] = useState('All');
  const [isEcoCategoryOpen, setIsEcoCategoryOpen] = useState(false);

  // Agency Pack tabs & interactive state
  const [agencyPackTab, setAgencyPackTab] = useState<
    'catalog' | 'reporting' | 'lead-gen' | 'white-label' | 'seats'
  >('catalog');
  const [whiteLabelColor, setWhiteLabelColor] = useState<string>('#BAF6BE');
  const [whiteLabelLogo, setWhiteLabelLogo] = useState<string>('My Logo');
  const [leadCheckboxes, setLeadCheckboxes] = useState<Record<string, boolean>>({
    'g2': false,
    'capterra': false,
    'getapp': false,
  });
  const [activeSeatRow, setActiveSeatRow] = useState<number>(0);

  // Testimonials carousel index (0 to 6 = 1 to 7)
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Dynamic Footer states matching seranking.com
  const [isFooterLangOpen, setIsFooterLangOpen] = useState(false);
  const [footerLang, setFooterLang] = useState('English');

  return (
    <div
      className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900"
      onClick={() => setActiveMenu(null)}
    >
      {/* 1. Dynamic HelloBar at Top (Green for EN, Orange with MCP for other languages) */}
      {showHelloBar && (
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-7xl mx-auto mt-2.5 mb-1">
          <div className={`${helloBarConfig.bg} ${helloBarConfig.textColor} py-2 px-6 rounded-xl text-center text-xs sm:text-sm tracking-wide flex items-center justify-between relative shadow-xs transition-colors duration-200`}>
            <div className="flex-1 text-center">
              <Link
                href={helloBarConfig.link}
                className="hover:underline font-semibold inline-flex items-center gap-1.5"
              >
                <span>{helloBarConfig.text}</span>
                <span className="font-bold">→</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHelloBar(false);
              }}
              className={`${helloBarConfig.closeColor} transition-opacity p-1 cursor-pointer shrink-0`}
              aria-label="Close Announcement"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Header */}
      <MarketingHeader
        currentLang={selectedLang}
        onLangChange={handleLanguageChange}
        onTourClick={() => setIsTourOpen(true)}
      />

      {/* 3. Hero Section (Exact visual match to Screenshot) */}
      <section className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-[36px] sm:text-[48px] md:text-[52px] lg:text-[54px] font-extrabold text-[#7C3AED] tracking-tight leading-[1.12]">
          {t.hero.title}
        </h1>

        <p className="mt-5 text-[#4b5563] text-base sm:text-[18px] max-w-[740px] mx-auto leading-relaxed font-normal">
          {t.hero.subtitle}
        </p>

        {/* Hero CTAs: Start free trial & See product tour */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-9 py-3.5 sm:px-10 sm:py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[16px] sm:text-[17px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all text-center cursor-pointer"
          >
            <span>Start free trial</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 text-[16px] sm:text-[17px] font-bold rounded-xl shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t.nav.productTour || 'See product tour'}</span>
          </button>
        </div>

        {/* Social Proof: 1-by-1 sliding avatars + Trusted by 40,000+ agencies */}
        <div className="mt-12">
          <HeroAvatarSlider />
        </div>

        {/* Static 6 Partner Logos row matching screenshot */}
        <div className="mt-12 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-11 md:gap-14 text-[#596372] select-none">
          {/* soapbox */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 26H29L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M16 9L8 23H24L16 9Z" fill="currentColor" opacity="0.3" />
            </svg>
            <span className="font-black text-base sm:text-lg tracking-tight lowercase text-[#4b5563]">soapbox</span>
          </div>

          {/* Nex Brand Marketing */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-extrabold text-[12px] tracking-wider uppercase block text-[#4b5563]">NEX BRAND</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">MARKETING</span>
            </div>
          </div>

          {/* Tailor Brands */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a2 2 0 0 0-2 2c0 1.1.9 2 2 2v2L3 17a2 2 0 0 0 1 3h16a2 2 0 0 0 1-3L12 9" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-extrabold text-[12px] tracking-wider uppercase block text-[#4b5563]">TAILOR</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">BRANDS</span>
            </div>
          </div>

          {/* Wiser IT SEO Company */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6 1 1 0 0 1 2 0 6 6 0 0 0 6-6 1 1 0 0 1 2 0 8 8 0 0 1-6.93 6.93z" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-black text-[12px] tracking-wider uppercase block text-[#4b5563]">WISER IT</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">SEO COMPANY</span>
            </div>
          </div>

          {/* Kaida */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l8 6-8 6V6z" />
              <path d="M20 6l-8 6 8 6V6z" />
            </svg>
            <span className="font-black text-[14px] tracking-widest uppercase text-[#4b5563]">KAIDA</span>
          </div>

          {/* Neary Hayes */}
          <div className="text-left leading-none hover:text-gray-900 transition-colors">
            <span className="font-serif italic font-bold text-[13px] block text-[#4b5563]">neary</span>
            <span className="font-serif italic font-bold text-[13px] block pl-2 text-[#4b5563]">hayes</span>
          </div>
        </div>
      </section>

      {/* 4. Complete AI SEO platform for every challenge (Exact Match to User Reference Screenshots) */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-24 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#7C3AED] tracking-tight leading-tight">
              {t.platform.title}
            </h2>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-sm">
            {[
              { id: 'ai-visibility', label: t.platform.tabs.aiVisibility },
              { id: 'seo-research', label: t.platform.tabs.seoResearch },
              { id: 'seo-monitoring', label: t.platform.tabs.seoMonitoring },
              { id: 'content-marketing', label: t.platform.tabs.contentMarketing },
              { id: 'local-marketing', label: t.platform.tabs.localMarketing },
              { id: 'agency-kit', label: t.platform.tabs.agencyKit },
              { id: 'integrations', label: t.platform.tabs.integrations },
            ].map((tab) => {
              const isActive = platformTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPlatformTab(tab.id as any)}
                  className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-[15px] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#101423] text-white font-normal shadow-xs'
                      : 'text-[#667085] hover:text-[#101423] font-normal hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Section Layout matching Screenshots */}

          {/* TAB 1: AI Visibility (Exact Screenshot Match: uploaded_media_1790446897464.png) */}
          {platformTab === 'ai-visibility' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Interactive Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                {/* Header Bar with AI Engines */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                  <span className="text-base font-bold text-gray-900">AI Visibility</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-800">
                    <span className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                        ✦
                      </div>
                      ChatGPT
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                        G
                      </div>
                      AI Mode
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer">
                      <Sparkles className="w-4 h-4 text-purple-600" /> Gemini
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer">
                      <span className="text-teal-600 font-black text-sm leading-none">*</span> Perplexity
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer">
                      <Zap className="w-4 h-4 text-amber-600" /> Claude
                    </span>
                  </div>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Visibility (Mint Green Box with binoculars) */}
                  <div className="p-3.5 bg-[#C6F5E6] rounded-2xl border border-[#9BE3CE] relative overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-20 20 Q 30 60, 80 20 T 180 20 T 280 20" fill="none" stroke="#0D9488" strokeWidth="2" />
                    </svg>
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-800 relative z-10">
                      <span>Visibility</span>
                      <span className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-[10px]">
                        👓
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2 relative z-10">
                      <span className="text-2xl font-bold text-gray-900">99%</span>
                      <span className="text-[11px] text-teal-800 font-bold bg-[#A3EAD4] px-1.5 py-0.2 rounded">
                        ↗ 8,4
                      </span>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Rank</span>
                      <Award className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">#1</div>
                  </div>

                  {/* Avg. position */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Avg. position</span>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-bold text-gray-900">2.61</span>
                      <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                        ↘ 1,3
                      </span>
                    </div>
                  </div>

                  {/* Net sentiment */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Net sentiment</span>
                      <Smile className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-bold text-gray-900">+78</span>
                      <span className="text-[11px] text-pink-700 font-bold bg-pink-50 px-1.5 py-0.2 rounded border border-pink-100">
                        ↘ 1,5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lower Row: Chart & Competitors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Left: Visibility Chart */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">Visibility</span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-900 shadow-2xs">
                          Visibility score
                        </span>
                        <span className="text-gray-400 font-semibold px-1">Avg position</span>
                      </div>
                    </div>
                    <div className="h-40 w-full relative">
                      <div className="absolute left-0 top-0 bottom-4 text-[9px] text-gray-400 flex flex-col justify-between">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0</span>
                      </div>
                      <div className="ml-7 h-32">
                        <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
                          <line x1="0" y1="0" x2="160" y2="0" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="20" x2="160" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="40" x2="160" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="60" x2="160" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="160" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                          <path d="M 0 35 C 20 8, 40 10, 60 40 C 90 75, 120 40, 160 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                          <path d="M 0 45 C 30 15, 60 25, 90 45 C 120 18, 140 22, 160 15" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                          <path d="M 0 30 C 25 70, 50 65, 80 40 C 110 20, 130 50, 160 12" fill="none" stroke="#0D9488" strokeWidth="1.5" />
                          <path d="M 0 65 C 25 35, 50 35, 80 55 C 110 40, 135 60, 160 25" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 ml-7 pt-1">
                        <span>Jun 24</span>
                        <span>Jun 25</span>
                        <span>Jun 26</span>
                        <span>Jun 27</span>
                        <span>Jun 28</span>
                        <span>Jun 29</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Competitors Table */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-xs font-bold text-gray-900 block pb-1 border-b border-gray-100">
                      Competitors
                    </span>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-gray-400 border-b border-gray-100 pb-1">
                          <th className="font-bold py-1">#</th>
                          <th className="font-bold py-1">Visibility</th>
                          <th className="font-bold py-1">Avg position</th>
                          <th className="font-bold py-1 text-right">Net sentiment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>1</span>
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">b.</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">99%</td>
                          <td className="py-2 text-gray-600">2.61</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+78</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>2</span>
                            <span className="w-4 h-4 rounded bg-sky-50 text-sky-600 flex items-center justify-center text-[10px]">🔍</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">83%</td>
                          <td className="py-2 text-gray-600">2.75</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+44</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-purple-600">
                            <span>3</span>
                            <span className="w-4 h-4 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px]">🌐</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">80%</td>
                          <td className="py-2 text-gray-600">5.11</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+40</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-teal-600">
                            <span>4</span>
                            <span className="w-4 h-4 rounded bg-teal-50 text-teal-700 flex items-center justify-center text-[10px]">⚙️</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">72%</td>
                          <td className="py-2 text-gray-600">5.87</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+39</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Copy & CTA */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Track where your brand appears across ChatGPT, Gemini, Perplexity, and AI Overviews, see how it&apos;s described, and learn which sources matter most.
                </h3>

                <ul className="space-y-4 text-sm sm:text-[15px] text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">Brand mentions and sentiment tracking</strong> across the top 5 AI engines
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">Prompt intelligence</strong> that reveals the queries your audience is using
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">In-depth analysis</strong> of the prompts and sources behind AI answers
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <a
                    href="https://visible.seranking.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Try SE Visible
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO Research (Exact Screenshot Match) */}
          {platformTab === 'seo-research' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: SEO Research Card (Exact Screenshot Match) */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-2 sm:p-4 shadow-xs flex items-center justify-center overflow-hidden">
                <img
                  src="/images/mockups/seo-research.png"
                  alt="SEO Research"
                  className="w-full h-auto rounded-2xl shadow-xs object-contain"
                />
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Get the most accurate keyword and competitor data to uncover high-impact growth opportunities and outrank your rivals
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/research" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Competitive Research</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/research" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Keyword Research</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/backlinks" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Backlink Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/competitors" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>SERP Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO Monitoring (Exact Screenshot Match) */}
          {platformTab === 'seo-monitoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: 3 Top Sparkline Cards + 3 Bottom Cards */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: 3 Metric Cards with Blue Sparkline Curves */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">AVERAGE POSITION</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">34</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 51</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 18 Q 15 5, 30 14 T 60 8 T 85 16 T 100 6" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">TRAFIC FORECAST</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">520</span>
                      <span className="text-xs text-rose-500 font-bold">▼ 245</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 16 Q 20 8, 40 18 T 70 12 T 100 8" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">SEARCH VISIBILITY</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">0.66</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 0.34</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 16 Q 15 6, 30 18 T 60 10 T 85 16 T 100 4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Health Score, Backlinks Area, Page Quality Score Rose Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Health Score Speedometer */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left block">
                      HEALTH SCORE
                    </span>
                    <div className="py-2 flex items-center justify-center">
                      <div className="relative w-28 h-16 overflow-hidden">
                        <svg viewBox="0 0 100 55" className="w-full h-full">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 78 22" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-x-0 bottom-0 text-center leading-none">
                          <span className="text-2xl font-bold text-gray-900 block">87</span>
                          <span className="text-[10px] text-gray-500 font-bold">Strong</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1 text-left border-t border-gray-100 pt-2 font-medium">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Your website
                        </span>
                        <span className="font-bold text-gray-900">87 ▲ 4</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Recommended
                        </span>
                        <span className="font-bold text-gray-900">90+</span>
                      </div>
                    </div>
                  </div>

                  {/* Backlinks Trend Area */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-gray-500 uppercase tracking-wider">BACKLINKS</span>
                        <div className="flex items-center gap-1 font-bold text-gray-400">
                          <span className="text-[#1864FF] border-b border-[#1864FF]">3M</span>
                          <span>6M</span>
                          <span>12M</span>
                        </div>
                      </div>
                      <div className="h-24 w-full mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-3 text-[8px] text-gray-400 flex flex-col justify-between">
                          <span>30</span>
                          <span>20</span>
                          <span>10</span>
                        </div>
                        <div className="ml-5 h-20">
                          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                            <line x1="0" y1="35" x2="100" y2="35" stroke="#F1F5F9" strokeWidth="1" />
                            <line x1="0" y1="60" x2="100" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                            <path d="M 0 45 C 25 35, 45 40, 65 15 C 80 18, 90 35, 100 20 L 100 60 L 0 60 Z" fill="#2563EB" fillOpacity="0.15" />
                            <path d="M 0 45 C 25 35, 45 40, 65 15 C 80 18, 90 35, 100 20" fill="none" stroke="#2563EB" strokeWidth="2" />
                            <circle cx="0" cy="45" r="2" fill="#2563EB" />
                            <circle cx="25" cy="35" r="2" fill="#2563EB" />
                            <circle cx="45" cy="40" r="2" fill="#2563EB" />
                            <circle cx="65" cy="15" r="2" fill="#2563EB" />
                            <circle cx="100" cy="20" r="2" fill="#2563EB" />
                          </svg>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-400 ml-5">
                          <span>Apr 23</span>
                          <span>May 24</span>
                          <span>Jun 25</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Quality Score Rose Chart */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      PAGE QUALITY SCORE
                    </span>
                    <div className="py-2 flex items-center justify-center relative">
                      <div className="w-24 h-24 rounded-full border border-dashed border-gray-200 flex items-center justify-center relative">
                        {/* Segmented Petals */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Segment 1: Dark green top */}
                            <path d="M 50 50 L 50 15 A 35 35 0 0 1 75 25 Z" fill="#14532D" />
                            {/* Segment 2: Light lime green */}
                            <path d="M 50 50 L 75 25 A 35 35 0 0 1 85 50 Z" fill="#BBF7D0" />
                            {/* Segment 3: Light gray blue */}
                            <path d="M 50 50 L 85 50 A 35 35 0 0 1 75 75 Z" fill="#CBD5E1" />
                            {/* Segment 4: Vibrant purple */}
                            <path d="M 50 50 L 75 75 A 35 35 0 0 1 50 85 Z" fill="#A855F7" />
                            {/* Segment 5: Dark violet */}
                            <path d="M 50 50 L 50 85 A 35 35 0 0 1 35 80 Z" fill="#3B0764" />
                            {/* Segment 6: Light sky */}
                            <path d="M 50 50 L 35 80 A 35 35 0 0 1 20 60 Z" fill="#BAE6FD" />
                            {/* Segment 7: Blue */}
                            <path d="M 50 50 L 20 60 A 35 35 0 0 1 20 40 Z" fill="#2563EB" />
                            {/* Segment 8: Mint */}
                            <path d="M 50 50 L 20 40 A 35 35 0 0 1 50 15 Z" fill="#86EFAC" />
                            {/* Center circle */}
                            <circle cx="50" cy="50" r="16" fill="white" />
                          </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900 relative z-10">78</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-gray-400 flex flex-wrap justify-between pt-1 border-t border-gray-100 font-medium">
                      <span>External links</span>
                      <span>Page UX</span>
                      <span>Domain</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Track your SEO progress and make timely adjustments to your strategy based on actionable insights
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/rankings" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Rank Tracker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/website-audit" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Website Audit</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/backlinks" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Backlink Monitor</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/website-audit/on-page" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>On-Page SEO Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Content Marketing (Exact Screenshot Match) */}
          {platformTab === 'content-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Content Editor Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Left Column: Rich Text Document View */}
                  <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-2xs">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 text-gray-600 text-xs border-b border-gray-100 pb-2">
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↶</button>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↷</button>
                      <span className="text-gray-300">|</span>
                      <span className="font-semibold text-gray-800">Paragraph ▾</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-gray-900">B</span>
                      <span className="italic font-bold text-gray-800">I</span>
                      <span className="underline font-bold text-gray-800">U</span>
                      <span className="line-through text-gray-500">S</span>
                      <span className="text-gray-400">🖌</span>
                    </div>

                    {/* Article Content */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase shrink-0 mt-0.5">
                          H1
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">
                          Scientifically Tested Search Engine Optimization
                        </h4>
                      </div>

                      <div className="flex items-start gap-2 pt-1 text-gray-600 text-[11px] leading-relaxed">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase shrink-0 mt-0.5">
                          P
                        </span>
                        <div className="space-y-1.5">
                          <p>
                            Search engine optimization (SEO) is a highly effective method of attracting new customers and qualified leads to your website, but only when it&apos;s done right.
                          </p>
                          <p>
                            We don&apos;t guess, assume, or hope for the best with your SEO. We develop our SEO strategies around thorough research and scientifically-tested data. And we prove our results every time.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Readability bar at bottom of document */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">READABILITY</span>
                        <span className="font-bold text-blue-600 text-[11px]">Plain text</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-gray-900">62</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 1</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full w-[62%]" />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-semibold">
                        <span>Very difficult</span>
                        <span>Very easy</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Content Score, Brief Progress, Quality Score Radar */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Content Score Donut */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-gray-900">80</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">CONTENT SCORE</span>
                        <span className="text-[11px] text-gray-600 font-medium block">
                          Average score: 65 | TOP score: 80
                        </span>
                      </div>
                    </div>

                    {/* Brief Progress */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">BRIEF PROGRESS</span>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-700">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          70%
                        </span>
                        <span>Words: 595 ↑</span>
                        <span>Headings: 18 ✓</span>
                      </div>
                    </div>

                    {/* Quality Score Radar */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block text-left">QUALITY SCORE</span>
                      <div className="py-1 flex items-center justify-center">
                        <div className="relative w-20 h-20 rounded-full border border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">72</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span className="text-emerald-600">● Grammar</span>
                        <span className="text-amber-500">● Punctuation</span>
                        <span className="text-emerald-600">● Stop words</span>
                      </div>
                    </div>

                    {/* One Click Article Generation */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>One click article generation</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                        ✦
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Create new content faster and get AI-powered optimization tips to help your existing pages rock the SERP
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/content-marketing" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Content Marketing Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/content-marketing" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Content Editor</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/content-marketing/idea-finder" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>AI Writer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Local Marketing (Exact Screenshot Match: Map + Business Listings + Reviews + Avg Pos) */}
          {platformTab === 'local-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Local Marketing Detailed Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: Map (Left) + Business Listings (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Map Card */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                    {/* Filters Row */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium bg-white">
                        All keywords ▾
                      </span>
                      <span className="bg-[#101423] text-white px-2 py-1 rounded-md flex items-center gap-1 font-semibold text-[9px]">
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-700 flex items-center justify-center text-[8px]">49</span>
                        4517 Wash... ▾
                      </span>
                    </div>

                    {/* Geo-Grid Map Simulation */}
                    <div className="h-44 w-full bg-[#EBF3ED] rounded-xl relative overflow-hidden border border-emerald-100 flex items-center justify-center">
                      {/* Subtle map road grid */}
                      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 150">
                        <line x1="20" y1="0" x2="20" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="80" y1="0" x2="80" y2="150" stroke="#CBD5E1" strokeWidth="2" />
                        <line x1="140" y1="0" x2="140" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="0" y1="40" x2="200" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="0" y1="90" x2="200" y2="90" stroke="#CBD5E1" strokeWidth="2" />
                      </svg>

                      {/* Pins Matrix matching screenshot */}
                      <div className="relative z-10 grid grid-cols-4 gap-2 text-[8px] font-bold text-white text-center">
                        <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">4.3</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>

                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-600 ring-2 ring-white flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center shadow-xs text-[7px]">21+</span>

                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">7.5</span>
                      </div>

                      {/* Red Target Pin */}
                      <div className="absolute bottom-4 left-1/3 flex flex-col items-center">
                        <span className="w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-white shadow-md animate-pulse" />
                        <span className="text-[7px] font-bold text-gray-700 bg-white/90 px-1 rounded shadow-2xs mt-0.5">Woodinville</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Listings Card */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-xs font-bold text-gray-900 block pb-1 border-b border-gray-100">
                      Business Listings
                    </span>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-[9px] text-gray-400 border-b border-gray-100 pb-1">
                          <th className="font-bold py-1">DIRECTORY</th>
                          <th className="font-bold py-1">PRESENCE</th>
                          <th className="font-bold py-1 text-right">ISSUES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">🏪</span>
                            Google
                          </td>
                          <td className="py-2.5 text-emerald-600 font-semibold">Listed</td>
                          <td className="py-2.5 text-right text-gray-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black">f</span>
                            Facebook
                          </td>
                          <td className="py-2.5 text-emerald-600 font-semibold">Listed</td>
                          <td className="py-2.5 text-right text-rose-500 font-bold flex items-center justify-end gap-1">
                            <span>📍</span> <span>📞</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">F</span>
                            Foursquare
                          </td>
                          <td className="py-2.5 text-gray-900 font-semibold">Not Listed</td>
                          <td className="py-2.5 text-right text-gray-400">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Row: Reviews (Left) + Top 1-3 & 4-6 (Center) + Overall Avg Position (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Reviews Card */}
                  <div className="md:col-span-5 p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">REVIEWS</span>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-semibold block">OVERVIEW</span>
                        <span className="text-3xl font-bold text-gray-900 block leading-tight">4.8</span>
                        <div className="flex text-amber-500 text-xs">★★★★★</div>
                        <span className="text-[8px] text-gray-400 font-mono mt-0.5 block">301 REVIEWS</span>
                      </div>
                      <div className="flex-1 space-y-1 text-[8.5px] font-semibold text-gray-600">
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">POSITIVE</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[80%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">143</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NEUTRAL</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[45%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">75</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NEGATIVE</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full w-[15%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">21</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NOT RATED</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-300 h-full w-[35%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">62</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Top 1-3 & Top 4-6 */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">TOP 1-3</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-gray-900">49</span>
                        <span className="text-[10px] text-emerald-600 font-bold">▲ 10</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">TOP 4-6</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-gray-900">86</span>
                        <span className="text-[10px] text-emerald-600 font-bold">▲ 32</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Overall Avg Position */}
                  <div className="md:col-span-4 p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">OVERALL AVG. POSITION</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mt-1">
                        <span className="text-[#1864FF] border-b border-[#1864FF]">3M</span>
                        <span>6M</span>
                        <span>12M</span>
                      </div>
                      <div className="h-16 w-full mt-1 relative">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                          <line x1="0" y1="10" x2="100" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                          <path d="M 0 35 C 25 30, 45 35, 65 20 C 80 15, 90 10, 100 12 L 100 50 L 0 50 Z" fill="#2563EB" fillOpacity="0.15" />
                          <path d="M 0 35 C 25 30, 45 35, 65 20 C 80 15, 90 10, 100 12" fill="none" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="0" cy="35" r="1.5" fill="#2563EB" />
                          <circle cx="25" cy="30" r="1.5" fill="#2563EB" />
                          <circle cx="65" cy="20" r="1.5" fill="#2563EB" />
                          <circle cx="100" cy="12" r="1.5" fill="#2563EB" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[7px] text-gray-400 pt-0.5">
                        <span>Apr 23</span>
                        <span>May 24</span>
                        <span>Jun 25</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Exact User Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Take control of your online local presence and put your business on the map, attracting clients right to your doorstep
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <a href="https://seranking.com/local-marketing-tool.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Local Marketing Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a href="https://seranking.com/local-rank-tracker.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Local Rank Tracker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a href="https://online.seranking.com/admin.dashboard.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Projects</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Agency Success Kit (Exact Screenshot Match: My Logo + SEO Report + Circular Wheel) */}
          {platformTab === 'agency-kit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Agency Kit Card (Exact Screenshot Match) */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-2 sm:p-4 shadow-xs flex items-center justify-center overflow-hidden">
                <img
                  src="/images/mockups/agency-kit.png"
                  alt="Agency Success Kit"
                  className="w-full h-auto rounded-2xl shadow-xs object-contain"
                />
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Get support at every stage of the client management cycle: from lead gen to winning clients&apos; loyalty
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/reports" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Scheduled SEO reports</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/agency-pack" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>White Label</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/agency-pack" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Lead Generator</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Integrations (Exact Screenshot Match: 5 Category Boxes) */}
          {platformTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Integrations Mockup Card (Exact Screenshot Match) */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-2 sm:p-4 shadow-xs flex items-center justify-center overflow-hidden">
                <img
                  src="/images/mockups/integrations.png"
                  alt="Integrations"
                  className="w-full h-auto rounded-2xl shadow-xs object-contain"
                />
              </div>

              {/* Right Column: Title, Link & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#7C3AED] leading-[1.38]">
                  Connect SE Ranking to GA4, GSC, Data Studio, Make.com, n8n, and other tools your workflows run on
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/api-docs" className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer group">
                    <span>Integrations</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Power up your stack, workflows, and reporting with SE Ranking data (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-tight">
            Power up your stack, workflows, and reporting with SE Ranking data
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Pull search performance and AI visibility data directly into your own tools via API or query it live inside AI assistants via MCP
          </p>
        </div>

        {/* 2-Column Section Layout matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Official Diagram Image */}
          <div className="lg:col-span-6 flex items-center justify-center card-hover-left group animate-slide-left">
            <img
              src="/images/seranking/api-diagram.png"
              alt="SE Ranking API & Integrations Architecture"
              className="w-full h-auto rounded-3xl transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {/* Right Column: 4 Feature Points + Projects CTA */}
          <div className="lg:col-span-6 space-y-6 text-left card-hover-right group animate-slide-right">
            <div className="space-y-6 text-sm text-[#101423]">
              {/* Bullet 1 */}
              <div className="flex items-start gap-3">
                <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#7C3AED] heading-purple-hover">Data on your terms</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] para-purple-hover">
                    Access rankings, keywords, backlinks, and AI visibility insights directly via SE Ranking API. No manual exports.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-3">
                <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#7C3AED] heading-purple-hover">Reporting built around your logic</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] para-purple-hover">
                    Connect SE Ranking to Data Studio, Whatagraph, Agency Analytics, and more to build dashboards that reflect your workflows and client priorities.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-3">
                <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#7C3AED] heading-purple-hover">Workflows that run without you</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] para-purple-hover">
                    Automate complex processes across multiple client projects via Make.com, n8n, or Zapier without coding.
                  </p>
                </div>
              </div>

              {/* Bullet 4 */}
              <div className="flex items-start gap-3">
                <span className="text-[#7C3AED] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#7C3AED] heading-purple-hover">Live data inside your AI assistant</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] para-purple-hover">
                    Connect via MCP and get structured SE Ranking data inside Claude, ChatGPT, or any other AI chatbot by simply describing what you need.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Precise. Credible. AI-Ready. It's all about our unique data (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#7C3AED] tracking-tight leading-tight">
              Precise. Credible. AI-Ready. It&apos;s all about our unique data
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
              The SE Ranking AI SEO platform relies on advanced data processing algorithms to deliver unique insights. We regularly expand our databases and securely store them.
            </p>
          </div>

          {/* 5 Cards Row matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
            {/* 188 Country Databases */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#C4FFC4', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <path d="M75 26V30H53V26H75ZM75 4H53V30L52.7939 29.9951C50.7488 29.8913 49.1087 28.2512 49.0049 26.2061L49 26V4C49 1.79086 50.7909 1.12745e-07 53 0H75C77.2091 0 79 1.79086 79 4V26C79 28.14 77.3194 29.8879 75.2061 29.9951L75 30V4Z" fill="#101423" />
                  <path opacity="0.25" d="M75 61V65H53V61H75ZM75 39H53V65L52.7939 64.9951C50.7488 64.8913 49.1087 63.2512 49.0049 61.2061L49 61V39C49 36.7909 50.7909 35 53 35H75C77.2091 35 79 36.7909 79 39V61C79 63.14 77.3194 64.8879 75.2061 64.9951L75 65V39Z" fill="#101423" />
                  <circle cx="26" cy="48" r="20" stroke="#101423" strokeWidth="4.5" />
                  <path d="M26 28V68M6 48H46" stroke="#101423" strokeWidth="3.5" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">188</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Country databases</div>
              </div>
            </div>

            {/* AI Powered Algorithms */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#5F31EC', color: '#ffffff' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <rect x="25" y="25" width="30" height="30" rx="4" transform="rotate(45 40 40)" stroke="#ffffff" strokeWidth="4.5" />
                  <circle cx="40" cy="12" r="3.5" fill="#ffffff" />
                  <circle cx="40" cy="68" r="3.5" fill="#ffffff" />
                  <circle cx="12" cy="40" r="3.5" fill="#ffffff" />
                  <circle cx="68" cy="40" r="3.5" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">AI</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5 opacity-95">Powered algorithms</div>
              </div>
            </div>

            {/* 5.5B Keyword Database */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#240659', color: '#ffffff' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <rect x="18" y="28" width="22" height="34" rx="3" stroke="#ffffff" strokeWidth="4" />
                  <rect x="44" y="16" width="20" height="20" rx="3" stroke="#ffffff" strokeWidth="4" />
                  <rect x="44" y="44" width="20" height="20" rx="3" stroke="#ffffff" strokeWidth="4" opacity="0.35" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">5.5B</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5 opacity-95">Keyword database</div>
              </div>
            </div>

            {/* 2.2B Domain Profiles */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#ECF1F9', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="26" stroke="#101423" strokeWidth="3.5" opacity="0.25" />
                  <circle cx="40" cy="22" r="5.5" fill="#101423" />
                  <circle cx="40" cy="40" r="5.5" fill="#101423" />
                  <circle cx="40" cy="58" r="5.5" fill="#101423" />
                  <line x1="40" y1="22" x2="40" y2="58" stroke="#101423" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">2.2B</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Domain profiles</div>
              </div>
            </div>

            {/* 100% Accurate Keyword Rankings */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] col-span-2 sm:col-span-1 shadow-xs" style={{ backgroundColor: '#D8F7FF', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <path d="M22 22L36 36M22 22H34M22 22V34" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <path d="M58 22L44 36M58 22H46M58 22V34" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 58L36 44M22 58H34M22 58V46" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <path d="M58 58L44 44M58 58H46M58 58V46" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">100%</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Accurate keyword rankings</div>
              </div>
            </div>
          </div>

          {/* G2 Awards Box (Exact Screenshot Match) */}
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-9 border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black text-[#7C3AED] tracking-tight">
                Highly rated by large teams running SEO at scale
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                Don&apos;t just take our word for it, check out our latest awards from G2
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5].map((num) => (
                <img
                  key={num}
                  src={`/images/seranking/g2-${num}.svg`}
                  alt={`G2 Award ${num}`}
                  className="h-14 sm:h-18 w-auto object-contain hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Centered Purple Start Free Trial Button */}
          <div className="text-center pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-10 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
            >
              <span>Start free trial</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Brand visibility across the ecosystem (Exact Match to User Reference Screenshots) */}
      <section className="py-20 sm:py-28 bg-[#EBF8FE] border-t border-blue-100/50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3.5">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-tight">
              Brand visibility across the ecosystem
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Don&apos;t stop at SEO. Add AI search intelligence and social performance to see the full picture.
            </p>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
            {/* Card 1: SE Ranking (SEO & GEO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-[#0052FF]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75v7.85l-6 3.75-6-3.75V7.95l6-3.75z" />
                    </svg>
                    <span className="font-bold text-lg text-[#101423]">SE Ranking</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    SEO&amp;GEO
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Track rankings, research competitors, analyze brand mentions, and pull SEO and GEO data into your own workflows and reporting systems with API access.
                </p>

                {/* Card Mockup: SEO & GEO Analytics Exact Screenshot Match */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 text-xs">
                  {/* Top 4 Metric Pills */}
                  <div className="grid grid-cols-4 gap-2 text-left pb-2 border-b border-gray-100">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">AVERAGE POSITION</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        34 <span className="text-[10px] text-emerald-600 font-semibold">▲ 51</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 12 Q 12 0, 20 8 T 35 14 T 50 4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">TRAFIC FORECAST</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        520 <span className="text-[10px] text-rose-500 font-semibold">▼ 245</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 10 Q 15 5, 25 11 T 40 4 T 50 10" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">SEARCH VISIBILITY</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        0.66 <span className="text-[10px] text-emerald-600 font-semibold">▲ 0.34</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 11 Q 12 3, 22 12 T 38 6 T 50 12" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">SERP FEATURES</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        2 <span className="text-[10px] text-emerald-600 font-semibold">▲ 1</span>
                      </div>
                      <div className="flex items-end justify-center gap-0.5 h-4 mt-0.5">
                        <span className="w-1 h-2 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-3 bg-blue-300 rounded-2xs" />
                        <span className="w-1 h-4 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-2 bg-blue-300 rounded-2xs" />
                        <span className="w-1 h-3 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-5 bg-blue-300 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">CURRENT</span>
                      <span className="text-[#1864FF] border-b-2 border-[#1864FF] pb-0.5">7D</span>
                      <span>1M</span>
                      <span>3M</span>
                      <span>6M</span>
                      <span className="ml-1 text-gray-400">GROUP BY: <strong className="text-gray-800">DAYS ∨</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1864FF] border-b-2 border-[#1864FF] pb-0.5">ALL</span>
                      <span>WEBSITES</span>
                      <span>GROUPS</span>
                    </div>
                  </div>

                  {/* Multi-Line Chart with Y-axis and 5 lines */}
                  <div className="relative pt-2 pb-1">
                    <div className="h-32 w-full relative">
                      {/* Y-axis */}
                      <div className="absolute left-0 top-0 bottom-4 text-[8px] text-gray-400 flex flex-col justify-between items-start">
                        <span>30</span>
                        <span className="flex items-center gap-1">
                          <span>20</span>
                          <span className="text-[7px] text-gray-400 -rotate-90 origin-left uppercase tracking-tighter">AVERAGE RANK</span>
                        </span>
                        <span>10</span>
                      </div>

                      <div className="ml-8 h-28">
                        <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
                          {/* Grid lines */}
                          <line x1="0" y1="10" x2="280" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="50" x2="280" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="90" x2="280" y2="90" stroke="#F1F5F9" strokeWidth="1" />

                          {/* Line 1: Blue (Top) */}
                          <path
                            d="M 0 65 C 35 48, 70 38, 95 32 C 120 28, 140 25, 175 35 C 210 40, 240 38, 280 25"
                            fill="none"
                            stroke="#0052FF"
                            strokeWidth="2.5"
                          />
                          <circle cx="0" cy="65" r="2.5" fill="#0052FF" />
                          <circle cx="45" cy="52" r="2.5" fill="#0052FF" />
                          <circle cx="95" cy="32" r="2.5" fill="#0052FF" />
                          <circle cx="140" cy="25" r="2.5" fill="#0052FF" />
                          <circle cx="175" cy="35" r="2.5" fill="#0052FF" />
                          <circle cx="230" cy="38" r="2.5" fill="#0052FF" />
                          <circle cx="280" cy="25" r="2.5" fill="#0052FF" />

                          {/* Line 2: Purple */}
                          <path
                            d="M 0 72 C 35 58, 70 50, 95 48 C 120 42, 140 40, 175 42 C 210 50, 240 48, 280 35"
                            fill="none"
                            stroke="#9333EA"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="72" r="2" fill="#9333EA" />
                          <circle cx="45" cy="60" r="2" fill="#9333EA" />
                          <circle cx="95" cy="48" r="2" fill="#9333EA" />
                          <circle cx="140" cy="40" r="2" fill="#9333EA" />
                          <circle cx="175" cy="42" r="2" fill="#9333EA" />
                          <circle cx="230" cy="48" r="2" fill="#9333EA" />
                          <circle cx="280" cy="35" r="2" fill="#9333EA" />

                          {/* Line 3: Cyan */}
                          <path
                            d="M 0 78 C 35 68, 70 65, 95 62 C 120 52, 140 48, 175 52 C 210 65, 240 60, 280 45"
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="78" r="2" fill="#06B6D4" />
                          <circle cx="45" cy="68" r="2" fill="#06B6D4" />
                          <circle cx="95" cy="62" r="2" fill="#06B6D4" />
                          <circle cx="140" cy="48" r="2" fill="#06B6D4" />
                          <circle cx="175" cy="52" r="2" fill="#06B6D4" />
                          <circle cx="230" cy="62" r="2" fill="#06B6D4" />
                          <circle cx="280" cy="45" r="2" fill="#06B6D4" />

                          {/* Line 4: Dark Navy */}
                          <path
                            d="M 0 85 C 35 72, 70 75, 95 72 C 120 62, 140 55, 175 50 C 210 75, 240 70, 280 55"
                            fill="none"
                            stroke="#0F172A"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="85" r="2" fill="#0F172A" />
                          <circle cx="45" cy="72" r="2" fill="#0F172A" />
                          <circle cx="95" cy="72" r="2" fill="#0F172A" />
                          <circle cx="140" cy="55" r="2" fill="#0F172A" />
                          <circle cx="175" cy="50" r="2" fill="#0F172A" />
                          <circle cx="230" cy="70" r="2" fill="#0F172A" />
                          <circle cx="280" cy="55" r="2" fill="#0F172A" />

                          {/* Line 5: Light Lime Green */}
                          <path
                            d="M 0 92 C 35 82, 70 85, 95 85 C 120 70, 140 60, 175 55 C 210 82, 240 78, 280 62"
                            fill="none"
                            stroke="#4ADE80"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="92" r="2" fill="#4ADE80" />
                          <circle cx="45" cy="80" r="2" fill="#4ADE80" />
                          <circle cx="95" cy="85" r="2" fill="#4ADE80" />
                          <circle cx="140" cy="68" r="2" fill="#4ADE80" />
                          <circle cx="175" cy="55" r="2" fill="#4ADE80" />
                          <circle cx="230" cy="80" r="2" fill="#4ADE80" />
                          <circle cx="280" cy="62" r="2" fill="#4ADE80" />
                        </svg>
                      </div>

                      {/* X-axis dates */}
                      <div className="flex justify-between text-[8px] text-gray-400 ml-8 pt-1">
                        <span>Sep 23</span>
                        <span>Sep 24</span>
                        <span>Sep 25</span>
                        <span>Sep 26</span>
                        <span>Sep 27</span>
                        <span>Sep 28</span>
                        <span>Sep 29</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 1 Button */}
              <div className="pt-5">
                <a
                  href="https://seranking.com/sign-up.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore SE Ranking</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Card 2: SE Visible (AI VISIBILITY) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* SE Visible green wave logo */}
                    <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 14c2-4 4-6 6-6s4 8 6 8 4-5 6-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-bold text-lg text-[#101423]">SE Visible</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    AI VISIBILITY
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Monitor where your brand appears and how AI platforms describe it across ChatGPT, Gemini, Perplexity, AI Overviews, AI Mode, and other emerging search experiences.
                </p>

                {/* Card Mockup: 2x2 Grid Exact Match */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 text-xs">
                  {/* Top Row: Visibility Chart (Left) + Competitors Table (Right) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                    {/* Visibility Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Visibility</span>
                        <div className="flex items-center gap-1 text-[9px] bg-gray-100/80 p-0.5 rounded-md">
                          <span className="bg-white text-gray-900 font-semibold px-1.5 py-0.5 rounded shadow-2xs">Visibility score</span>
                          <span className="text-gray-500 px-1.5 py-0.5">Avg position</span>
                        </div>
                      </div>

                      {/* Line chart with axis */}
                      <div className="h-20 w-full relative">
                        <div className="absolute left-0 top-0 bottom-0 text-[8px] text-gray-400 flex flex-col justify-between">
                          <span>100%</span>
                          <span>75%</span>
                          <span>50%</span>
                          <span>25%</span>
                          <span>0</span>
                        </div>
                        <div className="ml-7 h-full">
                          <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
                            <line x1="0" y1="0" x2="160" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="20" x2="160" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="40" x2="160" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="60" x2="160" y2="60" stroke="#f1f5f9" strokeWidth="1" />

                            <path d="M 0 35 C 20 8, 40 10, 60 40 C 90 75, 120 40, 160 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                            <path d="M 0 45 C 30 15, 60 25, 90 45 C 120 18, 140 22, 160 15" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                            <path d="M 0 30 C 25 70, 50 65, 80 40 C 110 20, 130 50, 160 12" fill="none" stroke="#0D9488" strokeWidth="1.5" />
                            <path d="M 0 65 C 25 35, 50 35, 80 55 C 110 40, 135 60, 160 25" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex justify-between text-[8px] text-gray-400 ml-6">
                        <span>Aug 24</span>
                        <span>Aug 25</span>
                        <span>Aug 26</span>
                        <span>Aug 27</span>
                        <span>Aug 28</span>
                        <span>Aug 29</span>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[8px] pt-0.5">
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />You</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />Smx</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />Pubcon</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />Tech SEO</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">✓ Competitors</span>
                      </div>
                    </div>

                    {/* Competitors Table */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-900 text-xs block">Competitors</span>
                      <div className="overflow-hidden">
                        <table className="w-full text-left text-[9px]">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                              <th className="pb-1 font-normal">#</th>
                              <th className="pb-1 font-normal">Brand</th>
                              <th className="pb-1 font-normal">Visibility</th>
                              <th className="pb-1 font-normal">Avg pos</th>
                              <th className="pb-1 font-normal text-right">Net</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 font-medium">
                            <tr>
                              <td className="py-1 text-gray-400">1</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-black text-[7px] flex items-center justify-center">b.</span>
                                Brighto..
                              </td>
                              <td className="py-1 font-bold text-gray-900">99%</td>
                              <td className="py-1 text-gray-800">2.61</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+78</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">2</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-sky-500 text-white font-black text-[7px] flex items-center justify-center">🔍</span>
                                Smx
                              </td>
                              <td className="py-1 font-bold text-gray-900">83%</td>
                              <td className="py-1 text-gray-800">2.75</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+44</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">3</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-gray-500 text-white font-black text-[7px] flex items-center justify-center">🌐</span>
                                Pubcon
                              </td>
                              <td className="py-1 font-bold text-gray-900">80%</td>
                              <td className="py-1 text-gray-800">5.11</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+40</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">4</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-teal-500 text-white font-black text-[7px] flex items-center justify-center">⚙️</span>
                                Tech SE..
                              </td>
                              <td className="py-1 font-bold text-gray-900">72%</td>
                              <td className="py-1 text-gray-800">5.87</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+39</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Net Sentiment Donut (Left) + Sources Table (Right) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Net Sentiment */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-900 text-xs block">Net sentiment</span>
                      <div className="flex items-center gap-2.5">
                        {/* Donut Chart */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="3.5"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#0D9488"
                              strokeWidth="3.8"
                              strokeDasharray="79, 100"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute font-black text-xs text-gray-900">+79</span>
                        </div>

                        {/* Breakdown text */}
                        <div className="space-y-0.5 text-[8.5px]">
                          <div className="text-[8px] text-gray-400">Analyzed 71 mentions</div>
                          <div className="flex items-center gap-1 font-semibold text-gray-800">
                            <span className="w-1.5 h-1.5 rounded-xs bg-[#0D9488]" /> 79% Positive
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-xs bg-gray-300" /> 61% Neutral
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-xs bg-rose-500" /> 0% Negative
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sources Table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Sources</span>
                        <div className="flex items-center gap-1 text-[8px]">
                          <span className="bg-gray-100 text-gray-800 font-semibold px-1 rounded">Domains</span>
                          <span className="text-gray-400">URLs</span>
                          <span className="border border-gray-200 rounded px-1 text-gray-600">Cat: All ▾</span>
                        </div>
                      </div>
                      <table className="w-full text-left text-[8.5px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100">
                            <th className="pb-1 font-normal">Source</th>
                            <th className="pb-1 font-normal">Category</th>
                            <th className="pb-1 font-normal text-right">Used</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                          <tr>
                            <td className="py-1 text-gray-800 flex items-center gap-1">
                              <span className="text-xs">📰</span> Emryo.com
                            </td>
                            <td className="py-1">
                              <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-xs text-[7.5px]">SEO conf</span>
                            </td>
                            <td className="py-1 text-right text-gray-900 font-bold">100%</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-800 flex items-center gap-1">
                              <span className="text-xs">🤖</span> Writesonic
                            </td>
                            <td className="py-1">
                              <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-xs text-[7.5px]">SEO conf</span>
                            </td>
                            <td className="py-1 text-right text-gray-900 font-bold">88%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 Button */}
              <div className="pt-5">
                <a
                  href="https://visible.seranking.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore SE Visible</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Card 3: Planable (Social) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Planable multi-color flower logo */}
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5 rotate-45">
                        <span className="bg-emerald-400 rounded-xs" />
                        <span className="bg-amber-400 rounded-xs" />
                        <span className="bg-purple-500 rounded-xs" />
                        <span className="bg-pink-500 rounded-xs" />
                      </div>
                    </div>
                    <span className="font-bold text-lg text-[#101423]">planable</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    Social
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Plan, collaborate, publish, and track social performance in one workflow. Use automations and API access to keep scheduling, approvals, reporting, and integrations running.
                </p>

                {/* Card Mockup: Social Performance Stacked Waves & Metrics */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 text-xs">
                  {/* Social Channel Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[8.5px] text-gray-600 pb-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#FB923C]" /> Instagram</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#4ADE80]" /> TikTok</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#818CF8]" /> Facebook</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#60A5FA]" /> YouTube</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#F472B6]" /> LinkedIn</span>
                    <span className="text-gray-400">-- Incomplete data</span>
                  </div>

                  {/* 3 Metric Cards Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-white border-2 border-blue-500 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Followers</span>
                        <Users className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">150,716</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-emerald-100 text-emerald-700 text-[8px] font-semibold rounded">
                        ↑ 1,416
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Impressions</span>
                        <Eye className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">2,154,703</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-rose-100 text-rose-700 text-[8px] font-semibold rounded">
                        ↓ 27%
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Engagements</span>
                        <MousePointerClick className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">41,967</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-gray-100 text-gray-700 text-[8px] font-semibold rounded">
                        → 0
                      </div>
                    </div>
                  </div>

                  {/* Stacked Waves Chart with Jusco Juice Tooltip */}
                  <div className="relative pt-2">
                    <div className="h-28 w-full relative">
                      <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.4" />
                          </linearGradient>
                          <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.4" />
                          </linearGradient>
                          <linearGradient id="gradPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.65" />
                            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.35" />
                          </linearGradient>
                          <linearGradient id="gradPink" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#FBCFE8" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        {/* Layer 1: Orange Top Curve */}
                        <path
                          d="M 0 75 C 60 70, 110 30, 160 30 C 210 30, 240 70, 320 70 L 320 120 L 0 120 Z"
                          fill="url(#gradOrange)"
                        />
                        {/* Layer 2: Green Curve */}
                        <path
                          d="M 0 82 C 60 78, 110 50, 160 50 C 210 50, 240 80, 320 78 L 320 120 L 0 120 Z"
                          fill="url(#gradGreen)"
                        />
                        {/* Layer 3: Purple Curve */}
                        <path
                          d="M 0 92 C 60 88, 110 70, 160 70 C 210 70, 240 92, 320 90 L 320 120 L 0 120 Z"
                          fill="url(#gradPurple)"
                        />
                        {/* Layer 4: Pink Curve */}
                        <path
                          d="M 0 98 C 60 95, 110 82, 160 82 C 210 82, 240 98, 320 96 L 320 120 L 0 120 Z"
                          fill="url(#gradPink)"
                        />

                        {/* Top Wave Outlines */}
                        <path d="M 0 75 C 60 70, 110 30, 160 30 C 210 30, 240 70, 320 70" fill="none" stroke="#F97316" strokeWidth="1.5" />
                        <path d="M 0 82 C 60 78, 110 50, 160 50 C 210 50, 240 80, 320 78" fill="none" stroke="#22C55E" strokeWidth="1.5" />
                        <path d="M 0 92 C 60 88, 110 70, 160 70 C 210 70, 240 92, 320 90" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
                      </svg>

                      {/* Tooltip for Jusco Juice at Oct 11, 2025 */}
                      <div className="absolute right-4 top-4 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-xl p-2.5 shadow-lg text-[9px] z-10 space-y-1">
                        <div className="text-[8px] text-gray-400 font-medium">Oct 11, 2025</div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-black text-white flex items-center justify-center text-[6px]">♪</span>
                            Jusco Juice
                          </span>
                          <span className="font-bold text-gray-800">32,718</span>
                        </div>
                      </div>

                      {/* Mouse cursor pointer pointing at tooltip */}
                      <div className="absolute right-12 top-14 z-20 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-900 fill-white drop-shadow-md" viewBox="0 0 24 24">
                          <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* X-axis dates */}
                    <div className="flex justify-between text-[8px] text-gray-400 pt-1">
                      <span>Oct 7</span>
                      <span>Oct 8</span>
                      <span>Oct 9</span>
                      <span>Oct 10</span>
                      <span>Oct 11</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 Button */}
              <div className="pt-5">
                <a
                  href="https://planable.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore Planable</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Card: 3 Pillars with Cyan Checkmarks */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xs border border-blue-100/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#7C3AED] text-base sm:text-lg leading-snug">
                    More context for your visibility
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    See how your brand performs across organic search, LLMs, and social to get a fuller visibility picture.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#7C3AED] text-base sm:text-lg leading-snug">
                    AI workflows on real brand data
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Link search performance, GEO insights, and social analytics to Claude, Cursor, or any other AI tool via MCP and API.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#7C3AED] text-base sm:text-lg leading-snug">
                    Cross-channel performance
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Find connections between channels, analyze dependencies, and act on the right signals instead of isolated metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Brand, grow, and win more clients with the Agency Pack (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-100 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#7C3AED] tracking-tight leading-tight">
              Brand, grow, and win more clients with the Agency Pack
            </h2>
            <p className="text-[#475467] text-base sm:text-[17px] leading-relaxed max-w-3xl mx-auto font-normal">
              Take control of your agency’s client cycle with tools that help you attract prospects, deliver results, and build loyalty.
            </p>
          </div>

          {/* 5 Agency Pack Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm">
            {[
              { id: 'catalog', label: 'Agency Catalog' },
              { id: 'reporting', label: 'White Label Reporting' },
              { id: 'lead-gen', label: 'Lead Generator' },
              { id: 'white-label', label: 'White Label' },
              { id: 'seats', label: 'Client Seats' },
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setAgencyPackTab(tabItem.id as any)}
                className={`px-6 py-2.5 rounded-full text-[14px] transition-all cursor-pointer ${
                  agencyPackTab === tabItem.id
                    ? 'bg-[#1F2633] text-white font-medium shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F2633] font-medium hover:bg-gray-50'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* 1. Tab: Agency Catalog (Exact 100% match to official user screenshot) */}
          {agencyPackTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: Agency Catalog Official Image Mockup */}
              <div className="lg:col-span-7 xl:col-span-7 bg-[#F4F7FC] border border-[#DEECFD] rounded-[28px] sm:rounded-[32px] p-2 sm:p-4 overflow-hidden relative shadow-xs flex items-center justify-center card-hover-left group animate-slide-left">
                <img
                  src="/images/mockups/agency-success-kit.png"
                  alt="SE Ranking Agency Catalog"
                  className="w-full h-auto object-contain rounded-[20px] select-none transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {/* Right Column (Exact Screenshot Match) */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left card-hover-right group animate-slide-right">
                <h3 className="text-4xl sm:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-[1.15] heading-purple-hover">
                  Agency Catalog
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal para-purple-hover">
                  Jump into the spotlight with SE Ranking’s Agency Pack! Secure a spot in our expert Agency Catalog, where your services take center stage in front of new prospects. Watch your leads soar, trust surge, and your agency thrive and grow.
                </p>
                <div className="pt-1">
                  <Link
                    href="/agency-pack"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Browse catalog
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 2. Tab: White Label Reporting (Exact 100% match to user screenshot) */}
          {agencyPackTab === 'reporting' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: Full-width SEO Report Card with Gauge */}
              <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-8 sm:p-10 shadow-xs flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden w-full">
                <div className="w-full max-w-[460px] text-center space-y-4">
                  {/* Top Badge: * My Logo */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0F19] text-white rounded-xl text-[13px] font-semibold shadow-sm">
                    <span className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center text-xs font-black leading-none">
                      ✻
                    </span>
                    <span>My Logo</span>
                  </div>

                  <div>
                    <h4 className="text-[34px] sm:text-[38px] font-bold text-[#101423] tracking-tight leading-none mt-2">
                      SEO Report
                    </h4>
                    <p className="text-[12px] font-mono tracking-widest font-semibold text-[#64748B] uppercase mt-3">
                      JAN-19 2025 <span className="mx-2 text-[#CBD5E1]">|</span> JAN-25 2025
                    </p>
                  </div>

                  {/* Polar radial semi-circle gauge matching exact screenshot */}
                  <div className="pt-4 flex justify-center overflow-visible">
                    <svg
                      width="340"
                      height="170"
                      viewBox="0 0 340 170"
                      className="overflow-visible select-none"
                    >
                      {/* Concentric grid lines in faint blue */}
                      <path
                        d="M 20 170 A 150 150 0 0 1 320 170"
                        fill="none"
                        stroke="#D6E4F6"
                        strokeWidth="2"
                      />
                      <path
                        d="M 55 170 A 115 115 0 0 1 285 170"
                        fill="none"
                        stroke="#D6E4F6"
                        strokeWidth="2"
                      />

                      {/* Radial spokes in faint blue */}
                      <line x1="170" y1="170" x2="20" y2="170" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="42" y2="95" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="95" y2="42" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="170" y2="20" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="245" y2="42" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="298" y2="95" stroke="#D6E4F6" strokeWidth="2" />
                      <line x1="170" y1="170" x2="320" y2="170" stroke="#D6E4F6" strokeWidth="2" />

                      {/* Colored Radial Slices matching exact user reference image */}
                      {/* 1. Lime / Neon Green Slice (Leftmost) */}
                      <path
                        d="M 170 170 L 68 170 A 102 102 0 0 1 76 127 Z"
                        fill="#6EE7B7"
                      />

                      {/* 2. Deep Electric Blue Slice (Upper Left) */}
                      <path
                        d="M 170 170 L 52 104 A 142 142 0 0 1 104 52 Z"
                        fill="#0000C8"
                      />

                      {/* 3. Vivid Crimson / Hot Pink Slice (Center) */}
                      <path
                        d="M 170 170 L 115 59 A 119 119 0 0 1 225 59 Z"
                        fill="#E11D48"
                      />

                      {/* 4. Bright Royal Blue Slice (Upper Right) */}
                      <path
                        d="M 170 170 L 236 43 A 147 147 0 0 1 308 119 Z"
                        fill="#1D4ED8"
                      />

                      {/* 5. Deep Midnight Blue Slice (Far Right) */}
                      <path
                        d="M 170 170 L 293 125 A 130 130 0 0 1 301 170 Z"
                        fill="#0B1336"
                      />

                      {/* Inner semi-circle hub matching screenshot */}
                      <path
                        d="M 130 170 A 40 40 0 0 1 210 170 Z"
                        fill="#E2EDF8"
                      />
                      <path
                        d="M 150 170 A 20 20 0 0 1 190 170 Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-4xl sm:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-[1.15]">
                  White Label Reporting
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Keep your customer in the loop with compelling reporting. Design customizable automated reports to effortlessly showcase the value of your SEO services to clients.
                </p>
                <div className="pt-1">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Projects
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 3. Tab: Lead Generator (Exact 100% match to screenshot 2) */}
          {agencyPackTab === 'lead-gen' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: Leads Mockup Card Full Width */}
              <div className="lg:col-span-7 xl:col-span-7 bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 w-full">
                <h4 className="text-[22px] font-bold text-[#101423]">Leads</h4>

                  {/* 3 Stat Cards */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-3.5">
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        72
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        {t.agencyPack.todayStat}
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        1798
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        {t.agencyPack.perMonthStat}
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        58
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        {t.agencyPack.avgDayStat}
                      </div>
                    </div>
                  </div>

                  {/* Leads Table matching screenshot */}
                  <div className="rounded-[16px] border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
                    <div
                      onClick={() => {
                        const allSelected = leadCheckboxes['g2'] && leadCheckboxes['capterra'] && leadCheckboxes['getapp'];
                        setLeadCheckboxes({
                          g2: !allSelected,
                          capterra: !allSelected,
                          getapp: !allSelected,
                        });
                      }}
                      className="grid grid-cols-2 py-3 px-4 bg-white text-[11px] font-mono font-bold text-[#64748B] tracking-wider uppercase border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {leadCheckboxes['g2'] && leadCheckboxes['capterra'] && leadCheckboxes['getapp'] ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#1351D8] shrink-0" strokeWidth={2.2} />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                        )}
                        <span>AUDIT PAGE URL</span>
                      </div>
                      <div>LEAD INFO</div>
                    </div>

                    {[
                      { key: 'g2', url: 'https://www.g2.com/products/se-rankin...', name: 'Dianne Russell', email: 'dianne.russel@outlook.com' },
                      { key: 'capterra', url: 'https://www.capterra.com/p/142169/SE...', name: 'Megan Smith', email: 'megan.design@gmail.com' },
                      { key: 'getapp', url: 'https://www.getapp.com/marketing-soft...', name: 'Dianne Russell', email: 'dianne.russel@outlook.com' },
                    ].map((row) => (
                      <div
                        key={row.key}
                        onClick={() => setLeadCheckboxes((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
                        className={`grid grid-cols-2 py-3 px-4 items-center cursor-pointer transition-colors ${
                          leadCheckboxes[row.key] ? 'bg-[#EEF5FF]/70' : 'bg-white hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs min-w-0 pr-2">
                          {leadCheckboxes[row.key] ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#1351D8] shrink-0" strokeWidth={2.2} />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                          )}
                          <span className="text-[#0B69FF] font-medium truncate">
                            {row.url}
                          </span>
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-[#101423]">{row.name}</div>
                          <div className="text-[11px] text-[#64748B]">{row.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-4xl sm:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-[1.15]">
                  Lead Generator
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Expand your email list and generate new quality leads. Embed our customizable lead gen solutions to your website and convert visitors into new customers.
                </p>
                <div className="pt-1">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Projects
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 4. Tab: White Label */}
          {agencyPackTab === 'white-label' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: White Label Customization Mockup Card (100% Exact match to uploaded_media_1790502506396.png) */}
              <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs w-full">
                {/* Dynamic colored header bar */}
                <div
                  className="px-6 py-5 border-b border-gray-100 flex items-center transition-colors duration-300"
                  style={{ backgroundColor: whiteLabelColor }}
                >
                  <div className="px-4 py-2 bg-white text-[#101423] rounded-2xl text-[16px] font-bold inline-flex items-center gap-2.5 shadow-2xs">
                    <span className="text-xl leading-none font-black text-black">✻</span>
                    <span className="tracking-tight text-black font-bold">{whiteLabelLogo}</span>
                  </div>
                </div>

                {/* Settings Rows */}
                <div className="divide-y divide-gray-100">
                  {/* Row 1: UI Color */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-6">
                    <span className="font-mono text-[16px] text-[#1E293B] font-medium tracking-wide">UI Color</span>
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      {[
                        { color: '#BAF6BE', hasArrow: false },
                        { color: '#9300FD', hasArrow: false },
                        { color: '#F59E0B', hasArrow: true },
                        { color: '#0000C8', hasArrow: false },
                        { color: '#E11D48', hasArrow: false },
                      ].map((item) => (
                        <div
                          key={item.color}
                          onClick={() => setWhiteLabelColor(item.color)}
                          className="relative cursor-pointer transition-transform hover:scale-105"
                        >
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-2xs transition-all ${
                              whiteLabelColor === item.color
                                ? 'ring-2 ring-offset-2 ring-gray-900 border-2 border-white scale-105'
                                : 'border border-black/10'
                            }`}
                            style={{ backgroundColor: item.color }}
                          />
                          {item.hasArrow && (
                            <div className="absolute -bottom-2.5 -right-1.5 pointer-events-none z-10">
                              <svg className="w-5 h-5 text-black drop-shadow-sm fill-black stroke-white stroke-[0.5]" viewBox="0 0 24 24">
                                <path d="M4 2l16 11.5-7.5 1.5 4.5 7.5-3 1.5-4.5-7.5L4 20V2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Company logo */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-6">
                    <span className="font-mono text-[16px] text-[#1E293B] font-medium tracking-wide">Company logo</span>
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      {/* Current logo preview pill */}
                      <div className="px-4 py-2.5 bg-[#DBE4F0] text-[#0F172A] rounded-2xl text-[15px] font-bold inline-flex items-center gap-2.5 shadow-2xs">
                        <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-xs font-black text-black shadow-2xs">
                          ✻
                        </span>
                        <span className="tracking-tight text-[#0F172A] font-bold">{whiteLabelLogo}</span>
                      </div>
                      {/* Update logo button */}
                      <button
                        type="button"
                        onClick={() => {
                          const logos = ['My Logo', 'Zenith Agency', 'Horizon Digital', 'Pulse Marketing'];
                          const nextIdx = (logos.indexOf(whiteLabelLogo) + 1) % logos.length;
                          setWhiteLabelLogo(logos[nextIdx]);
                        }}
                        className="px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 active:bg-gray-100 rounded-2xl text-[15px] font-bold text-[#0F172A] flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="16" height="16" x="2" y="5" rx="2" />
                          <circle cx="8" cy="11" r="1.5" />
                          <path d="m2 17 5-5 4 4 5-5 2 2" />
                          <path d="M19 2v6m-3-3h6" />
                        </svg>
                        <span>Update logo</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Footer logo */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-6">
                    <span className="font-mono text-[16px] text-[#1E293B] font-medium tracking-wide">Footer logo</span>
                    <button
                      type="button"
                      onClick={() => {
                        const logos = ['Footer Logo', 'Agency Icon', 'Brand Stamp', 'My Logo'];
                        const nextIdx = (logos.indexOf(whiteLabelLogo) + 1) % logos.length;
                        setWhiteLabelLogo(logos[nextIdx]);
                      }}
                      className="px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 active:bg-gray-100 rounded-2xl text-[15px] font-bold text-[#0F172A] flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="16" height="16" x="2" y="5" rx="2" />
                        <circle cx="8" cy="11" r="1.5" />
                        <path d="m2 17 5-5 4 4 5-5 2 2" />
                        <path d="M19 2v6m-3-3h6" />
                      </svg>
                      <span>Upload logo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-4xl sm:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-[1.15]">
                  White Label
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Enhance credibility and strengthen customer trust. Create a seamless client experience by providing access to our SEO platform customized to your brand book and domain name.
                </p>
                <div className="pt-1">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Projects
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 5. Tab: Client Seats (Full width table, exact screenshot match) */}
          {agencyPackTab === 'seats' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Users Table Mockup Card Full Width */}
              <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden w-full">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                  <h4 className="text-[22px] font-bold text-[#101423]">Users</h4>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11.5px] font-mono tracking-wider text-[#94A3B8] uppercase font-bold">
                        <th className="py-3.5 px-6 sm:px-8">NAME</th>
                        <th className="py-3.5 px-6 sm:px-8">ACCOUNT TYPE</th>
                        <th className="py-3.5 px-6 sm:px-8">EMAIL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { num: 7, name: 'Devon Lane', role: 'Owner', icon: Shield, email: 'ewaters@comcast.net' },
                        { num: 51, name: 'Harry Leddington', role: 'Client', icon: User, email: 'yeedancer@gmail.c...' },
                        { num: 65, name: 'Mark Kleiner', role: 'Manager', icon: User, email: 'm.klnr@outlook.com' },
                      ].map((seatUser, idx) => {
                        const IconComponent = seatUser.icon;
                        const isSelected = activeSeatRow === idx;
                        return (
                          <tr
                            key={seatUser.name}
                            onClick={() => setActiveSeatRow(idx)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#E0F7FE] border-y border-[#38BDF8]'
                                : 'bg-white hover:bg-gray-50/70'
                            }`}
                          >
                            <td className="py-4 px-6 sm:px-8 flex items-center gap-2.5 text-gray-900">
                              <span className={`text-sm ${isSelected ? 'text-[#0284C7] font-bold' : 'text-gray-400'}`}>›</span>
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                  isSelected
                                    ? 'bg-white text-[#0369A1] border border-[#38BDF8] shadow-2xs'
                                    : 'bg-[#E2E8F0] text-[#475467]'
                                }`}
                              >
                                {seatUser.num}
                              </span>
                              <span className="font-bold text-[#0F172A] text-[15px]">{seatUser.name}</span>
                            </td>
                            <td className="py-4 px-6 sm:px-8 text-gray-800">
                              <span className="inline-flex items-center gap-2 font-medium">
                                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#0284C7]' : 'text-gray-500'}`} />
                                <span className={isSelected ? 'text-[#0F172A] font-bold' : 'text-[#334155]'}>
                                  {seatUser.role}
                                </span>
                              </span>
                            </td>
                            <td className={`py-4 px-6 sm:px-8 font-mono text-xs ${isSelected ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'}`}>
                              {seatUser.email}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-4xl sm:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-[1.15]">
                  Client Seats
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Get extra client seats to openly communicate your progress. Choose which SEO tools your clients will have access to and adjust access settings at any time.
                </p>
                <div className="pt-1">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Projects
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. Why SEO pros from 150+ countries choose us (Exact Screenshot Match) */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7C3AED] tracking-tight">
            {t.testimonials.title}
          </h2>

          {/* Interactive Pagination < 1 / 7 > matching screenshot */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
              }
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer transition-colors shadow-2xs"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-sm font-semibold text-gray-700 px-3">
              {testimonialIdx + 1} / {testimonials.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
              }
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer transition-colors shadow-2xs"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quote display */}
          <div className="min-h-[160px] flex flex-col justify-center px-4">
            <p className="text-xl sm:text-2xl lg:text-[26px] font-normal text-[#101423] leading-relaxed max-w-3xl mx-auto font-mono sm:font-sans">
              {testimonials[testimonialIdx].quote}
            </p>
          </div>

          {/* Author avatar & info */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <img
              src={testimonials[testimonialIdx].avatar}
              alt={testimonials[testimonialIdx].name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs"
            />
            <div className="text-base font-bold text-[#101423]">
              {testimonials[testimonialIdx].name}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              {testimonials[testimonialIdx].role}
            </div>
          </div>
        </div>
      </section>


      {/* 10. Pricing & Add-ons (Exact Screenshot Match with proper typographic balance) */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-gray-200 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7C3AED] tracking-tight leading-tight">
              Fair and flexible pricing that scales with you
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
              Choose a plan that grows with your goals. Packed with more than you&apos;d expect
            </p>
          </div>

          {/* 2 Featured Platform Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Plan 1: Core */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#101423]">Core</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Popular</span>
                </div>
                <div className="text-xs text-gray-400 font-normal mt-2">From</div>
                <div className="text-3xl sm:text-4xl font-bold text-[#101423] tracking-tight">
                  $103.20<span className="text-sm font-normal text-[#64748B]">/mo</span>
                </div>
                <div className="pt-4">
                  <Link
                    href="/signup"
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md hover:shadow-purple-200 block text-center cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-sm">
                <div className="font-semibold text-base text-[#101423]">Repeatable SEO + GEO delivery</div>
                <ul className="space-y-2 text-[#475467] font-normal">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>Rank tracking across engines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>Unlimited keyword &amp; comp. research</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>Data Studio / Matomo / GA / GSC</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan 2: Growth */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#101423]">Growth</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md">Scale</span>
                </div>
                <div className="text-xs text-gray-400 font-normal mt-2">From</div>
                <div className="text-3xl sm:text-4xl font-bold text-[#101423] tracking-tight">
                  $223.20<span className="text-sm font-normal text-[#64748B]">/mo</span>
                </div>
                <div className="pt-4">
                  <Link
                    href="/signup"
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md hover:shadow-purple-200 block text-center cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-sm">
                <div className="font-semibold text-base text-[#101423]">Multi-client SEO + GEO workflows</div>
                <ul className="space-y-2 text-[#475467] font-normal">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>All Core features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>Project Lifetime historical data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1351D8] shrink-0" />
                    <span>API access with 300k credits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Need more? Upgrade with add-ons! */}
          <div className="text-center space-y-6 pt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7C3AED] tracking-tight">
              Need more? Upgrade with add-ons!
            </h2>

            {/* 3 Add-ons Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Agency Pack</div>
                <div className="text-xs text-[#94A3B8] font-normal">From</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#101423] tracking-tight">
                  $69.00<span className="text-sm font-normal text-[#64748B]">/mo</span>
                </div>
              </div>

              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">AI Search</div>
                <div className="text-xs text-[#94A3B8] font-normal">From</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#101423] tracking-tight">
                  $71.20<span className="text-sm font-normal text-[#64748B]">/mo</span>
                </div>
              </div>

              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">API</div>
                <div className="text-xs text-[#94A3B8] font-normal">From</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#101423] tracking-tight">
                  $149.00<span className="text-sm font-normal text-[#64748B]">/mo</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <a href="#pricing" className="text-sm font-semibold text-[#101423] hover:text-[#1351D8] inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                <span>Explore pricing plans</span>
                <span className="font-bold">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Customer Success Stories (Exact Screenshot Match for all 7 slides) */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7C3AED] text-center leading-tight tracking-tight max-w-3xl mx-auto">
          How agencies, brands, and businesses worldwide win with SE Ranking
        </h2>

        {/* Dark Forest Green Box matching Screenshot 1 to 7 */}
        <div className="bg-[#0B2816] text-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-12 lg:p-14 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <h3 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-white max-w-2xl leading-[1.35]">
              {caseStudies[caseStudyIdx].company}, {caseStudies[caseStudyIdx].meta}
            </h3>
            <div className="shrink-0 pt-1">
              {renderCaseStudyLogo(caseStudyIdx)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div>
              <div className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#67F87C] tracking-tight leading-none">
                {caseStudies[caseStudyIdx].metric1}
              </div>
              <div className="text-sm sm:text-base text-gray-300 font-normal mt-3">
                {caseStudies[caseStudyIdx].desc1}
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#67F87C] tracking-tight leading-none">
                {caseStudies[caseStudyIdx].metric2}
              </div>
              <div className="text-sm sm:text-base text-gray-300 font-normal mt-3">
                {caseStudies[caseStudyIdx].desc2}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination & View all case studies */}
        <div className="flex items-center justify-between text-sm pt-2">
          <a
            href="https://seranking.com/blog/category-customer-stories/"
            target="_blank"
            rel="noreferrer"
            className="text-sm sm:text-base font-semibold text-[#101423] hover:text-[#1351D8] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View all case studies</span>
            <span className="font-bold">→</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCaseStudyIdx((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1))
              }
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer text-gray-700 shadow-2xs"
              aria-label="Previous case study"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-sm font-semibold text-gray-700 px-3">
              {caseStudyIdx + 1} / {caseStudies.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCaseStudyIdx((prev) => (prev + 1) % caseStudies.length)
              }
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer text-gray-700 shadow-2xs"
              aria-label="Next case study"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 12. Full Width Royal Blue CTA Banner with Speech Bubble & Chamfer (Exact Screenshot Match) */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="relative pt-6">
          {/* Top Speech bubble pointer tab */}
          <div className="absolute top-0 right-[18%] sm:right-[20%] w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-[#7C3AED] z-10" />

          {/* Main Purple Banner Container with Chamfered Bottom-Left Corner */}
          <div
            className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl relative"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 65px 100%, 0 calc(100% - 65px))',
            }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Get 14 days of full access to the SE Ranking platform!
            </h2>
            <div className="pt-2">
              <Link
                href="/signup"
                className="px-9 py-4 bg-white hover:bg-[#F5F3FF] text-[#7C3AED] font-extrabold text-[15px] sm:text-base rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 inline-block cursor-pointer"
              >
                Start free trial
              </Link>
            </div>
            <div className="text-xs sm:text-sm text-white/90 font-medium">
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* 13. Official 5-Column Footer (Centered, Fully Responsive with Purple Accents) */}
      <footer className="border-t border-gray-200 bg-white pt-16 pb-14 px-4 sm:px-8 text-xs text-gray-600 w-full flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 lg:gap-x-20 xl:gap-x-28 gap-y-12 text-center sm:text-left">
          {/* Column 1: Core SEO Tools & Performance & Reporting Tools */}
          <div className="space-y-12 sm:space-y-14">
            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Core SEO Tools
              </h4>
              <ul className="space-y-3">
                <li><Link href="/rankings" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Rank Tracker</Link></li>
                <li><Link href="/website-audit" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Website Audit</Link></li>
                <li><Link href="/website-audit" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">On-Page SEO Checker</Link></li>
                <li><Link href="/rankings" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SERP Tracker</Link></li>
                <li><Link href="/backlinks" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Backlink Checker</Link></li>
                <li><Link href="/keyword-manager" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Keyword Grouper</Link></li>
                <li><Link href="/research/keyword-research" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Keyword Tool</Link></li>
                <li><Link href="/research/competitive-research" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Website Competitor Analysis Tool</Link></li>
                <li><Link href="/research/ai-search" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">AI Overviews Tracker</Link></li>
                <li><Link href="/projects" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">All features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Performance &amp; Reporting Tools
              </h4>
              <ul className="space-y-3">
                <li><Link href="/page-changes" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Webpage Monitor</Link></li>
                <li><Link href="/reports" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SEO Report Generator</Link></li>
                <li><Link href="/projects" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SEO Dashboard</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Add-ons, Additional Services & Support & Partnership */}
          <div className="space-y-12 sm:space-y-14">
            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Add-ons
              </h4>
              <ul className="space-y-3">
                <li><Link href="/local-marketing" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Local Marketing Software</Link></li>
                <li><Link href="/content-marketing" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Content Marketing Tool</Link></li>
                <li><Link href="/agency-pack" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Agency Pack</Link></li>
                <li><Link href="/agency-pack" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">White Label</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Additional Services
              </h4>
              <ul className="space-y-3">
                <li><Link href="/api-docs" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SEO API</Link></li>
                <li><Link href="/research/keyword-research" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Free SEO tools</Link></li>
                <li><Link href="/marketing-plan" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SEO Task Manager</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Support &amp; Partnership
              </h4>
              <ul className="space-y-3">
                <li><Link href="/settings" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Contact</Link></li>
                <li><a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Help</a></li>
                <li><a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Affiliate</a></li>
                <li><a href="https://seranking.com/educational-program.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Educational Partnership Program</a></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Company & Resources, Legal & Technical & Download */}
          <div className="space-y-12 sm:space-y-14">
            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Company &amp; Resources
              </h4>
              <ul className="space-y-3">
                <li><a href="https://seranking.com/blog/" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">SEO Blog</a></li>
                <li><a href="https://seranking.com/about-us.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">About</a></li>
                <li>
                  <a href="https://seranking.com/stand-with-ukraine.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed flex items-center justify-center sm:justify-start gap-1.5">
                    <span>Stand with Ukraine</span>
                  </a>
                </li>
                <li><a href="https://seranking.com/careers.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Careers</a></li>
                <li><a href="https://seranking.com/whats-new.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">What&apos;s New</a></li>
                <li><a href="https://seranking.com/testimonials.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Testimonials</a></li>
                <li><a href="https://seranking.com/webinars.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Webinars</a></li>
                <li><a href="https://seranking.com/academy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Academy</a></li>
                <li><Link href="/competitors" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Competitors</Link></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Legal &amp; Technical
              </h4>
              <ul className="space-y-3">
                <li><a href="https://seranking.com/privacy-policy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Privacy Statement</a></li>
                <li><a href="https://seranking.com/cookie-policy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Cookie Policy</a></li>
                <li><a href="https://seranking.com/terms-of-use.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Legal Information</a></li>
                <li><a href="https://seranking.com/terms-of-use.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#7C3AED] transition-colors leading-relaxed block">Open Source Attributions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#7C3AED] text-base sm:text-[17px] mb-4 tracking-tight heading-purple-hover">
                Download
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                {/* App Store Badge */}
                <a
                  href="https://apps.apple.com/app/se-ranking-pro/id1111979313"
                  target="_blank"
                  rel="noreferrer"
                  className="w-44 bg-black text-white px-3.5 py-2.5 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer shadow-sm group"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 group-hover:scale-105 transition-transform">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.13 16.69C20.09 16.82 19.71 18.14 18.71 19.5ZM14.88 4.67C15.54 3.86 16 2.73 15.88 1.59C14.88 1.63 13.68 2.26 12.96 3.1C12.33 3.83 11.78 4.98 11.93 6.1C13.04 6.19 14.21 5.48 14.88 4.67Z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] text-gray-300 font-medium">Available on the</span>
                    <span className="font-bold text-xs sm:text-[13px] tracking-tight">App Store</span>
                  </div>
                </a>

                {/* Google Play Badge */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.seranking.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-44 bg-black text-white px-3.5 py-2.5 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer shadow-sm group"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 group-hover:scale-105 transition-transform">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.323-.559-.79-.559-1.341V3.155c0-.551.212-1.018.558-1.341z" fill="#00C4FF" />
                    <path d="M15.207 13.414l2.454 2.454-11.45 6.611 8.996-9.065z" fill="#FF3333" />
                    <path d="M15.207 10.586L6.211 1.521l11.45 6.611-2.454 2.454z" fill="#00E676" />
                    <path d="M17.661 14.028l3.197-1.846c.907-.524.907-1.382 0-1.906l-3.197-1.846-1.928 1.846 1.928 1.752z" fill="#FFD600" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] text-gray-300 font-medium">GET IT ON</span>
                    <span className="font-bold text-xs sm:text-[13px] tracking-tight">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo + EN English dropdown, Center Copyright, Right Socials */}
        <div className="w-full max-w-7xl mx-auto pt-10 mt-14 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative text-center md:text-left">
          {/* Left: Logo & Interactive Language Switcher */}
          <div className="flex items-center justify-center md:justify-start gap-5">
            <SeRankingLogo variant="brand" width={135} height={30} />
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFooterLangOpen(!isFooterLangOpen);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-purple-50 text-[#7C3AED] uppercase">{selectedLang}</span>
                <span>{footerLang}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isFooterLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dynamic Footer Language Dropdown */}
              {isFooterLangOpen && (
                <div
                  className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsFooterLangOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{lang.label}</span>
                      {footerLang === lang.label && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Copyright Notice */}
          <div className="text-xs text-gray-500 font-normal tracking-tight text-center">
            &copy; 2013 - 2026 SER Acquisition Inc. All Rights Reserved
          </div>

          {/* Right: Social Media Links */}
          <div className="flex items-center justify-center md:justify-end gap-6 text-gray-400">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] hover:scale-110 transition-all" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] hover:scale-110 transition-all" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] hover:scale-110 transition-all" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] hover:scale-110 transition-all" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Professional Interactive SE Ranking Product Tour Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] text-white flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">SE Ranking Product Tour</h3>
                  <p className="text-[11px] text-purple-200 font-medium">Interactive Walkthrough &bull; Unified SEO Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTourOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl font-bold transition-colors cursor-pointer"
                title="Close Tour"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Welcome Banner */}
              <div className="p-5 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 border border-purple-100 rounded-2xl shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#111827] text-lg tracking-tight">
                      Welcome to SE Ranking Studio
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      Unified visibility across SEO, Generative AI (GEO), backlinks, competitor intelligence, and multi-network publishing in one seamless platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-gray-200/90 bg-[#FAF8FF] hover:border-purple-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <Bot className="w-4 h-4" />
                    <span>AI Overview & Search Intelligence</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Track brand visibility, mentions, and source citations across ChatGPT, Gemini, Perplexity, and Claude.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200/90 bg-[#FAF8FF] hover:border-purple-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <TrendingUp className="w-4 h-4" />
                    <span>Keyword Rank Tracking</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    100% accurate position tracking across 188 country databases with instant SERP feature recognition.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200/90 bg-[#FAF8FF] hover:border-purple-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <FileSearch className="w-4 h-4" />
                    <span>Competitor Gap & Backlinks</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Access 5.5B keywords, 2.2B domain profiles, anchor profiles, and high-authority link discovery.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200/90 bg-[#FAF8FF] hover:border-purple-300 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <Layers className="w-4 h-4" />
                    <span>API, MCP & Automated Workflows</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Connect SE Ranking MCP server into Claude and ChatGPT or automate workflows via Zapier & Make.com.
                  </p>
                </div>
              </div>

              {/* Data Quality Guarantee Box */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>14-day full platform access &bull; Enterprise data pipelines &bull; No credit card required</span>
                </span>
                <span className="hidden sm:inline font-bold text-emerald-700">100% Real Data</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsTourOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                Close Tour
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/projects"
                  onClick={() => setIsTourOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-gray-800 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center"
                >
                  View Studio Live
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsTourOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:shadow-purple-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
