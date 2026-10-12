'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Plus,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  Search,
  ExternalLink,
  Building,
  Store,
  MessageSquare,
  PhoneCall,
  Navigation,
  Globe,
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Eye,
  EyeOff,
  Layers,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Share2,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  MoreVertical,
} from 'lucide-react';
import { AllLocationsView } from '@/components/local-marketing/AllLocationsView';
import { LocalRankingsView } from '@/components/local-marketing/LocalRankingsView';
import { GbpInsightsView } from '@/components/local-marketing/GbpInsightsView';
import { GbpPostsView } from '@/components/local-marketing/GbpPostsView';
import { InsightsView } from '@/components/local-marketing/InsightsView';
import { OverviewExtras } from '@/components/local-marketing/OverviewExtras';
import { AddLocationGoogleModal, ConnectedLocation } from '@/components/local-marketing/AddLocationGoogleModal';
import { ExportDataModal } from '@/components/modals/ExportDataModal';

export type LocalMarketingTab =
  | 'all-locations'
  | 'overview'
  | 'rankings'
  | 'audit'
  | 'gbp-insights'
  | 'gbp-posts'
  | 'listings'
  | 'reviews'
  | 'analytics'
  | 'insights';

interface ReviewItem {
  id: string;
  source: string;
  sourceIcon: string;
  rating: number | null; // null for not rated
  date: string;
  text: string;
  author: string;
  status: 'Read' | 'Answered' | 'Needs attention' | 'Not read';
  language: 'EN' | 'ES' | 'FR' | 'DE';
  reply?: string;
}

interface DirectoryListing {
  id: string;
  name: string;
  icon: string;
  type: 'Local Directory' | 'Social Media' | 'Map' | 'Digital Assistant' | 'Navigation System';
  syncStatus: 'Synced' | 'Submitted' | 'Sync unavailable' | 'Sync not started' | 'Updating';
  presence: 'Listed' | 'Not listed' | 'Not monitored';
  errors: {
    name?: boolean;
    address?: boolean;
    phone?: boolean;
    url?: boolean;
  };
}

function LocalMarketingContent({ initialTab = 'all-locations' }: { initialTab?: LocalMarketingTab }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? (searchParams.get('tab') as LocalMarketingTab) : null;
  const [activeTab, setActiveTab] = useState<LocalMarketingTab>(tabParam || initialTab);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [locationSearch, setLocationSearch] = useState('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isConnectBannerDismissed, setIsConnectBannerDismissed] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Switchers & Dropdowns
  const [locationsList, setLocationsList] = useState([
    { id: 'loc-1', flag: '🇺🇸', name: 'Folk Osteria & Bar, Highland Dr., UT', category: 'Italian Restaurant', isDemo: false },
    { id: 'loc-2', flag: '🇺🇸', name: 'Blue Bottle Coffee, Market St, CA', category: 'Coffee Shop & Cafe', isDemo: false },
    { id: 'loc-3', flag: '🇪🇸', name: 'Salón Nova, Carrer de San Mateu, Barcelona', category: 'Hair Salon & Spa', isDemo: false },
    { id: 'loc-4', flag: '🇬🇧', name: 'Sakura Contemporary Sushi, London', category: 'Japanese Restaurant', isDemo: false },
  ]);
  const [activeLocation, setActiveLocation] = useState(locationsList[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('All dates');
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<{
    title: string;
    filenamePrefix: string;
    columns: string[];
    rows: (string | number)[][];
  }>({
    title: 'All Locations',
    filenamePrefix: 'local_marketing_all_locations',
    columns: ['Company', 'Address', 'Service Area', 'Phone', 'Score', 'Listings Found', 'Total Listings', 'Status'],
    rows: [
      ['Folk Osteria', 'Highland Dr., Holladay NY, 84117 USA', '—', '1 801-845-9817', '85/100', 37, 60, 'Demo'],
      ['Sol de Nieve', "Carrer de San Martí, 83, L'Eixample, Valencia, 46004 Spain", '—', '963 31 14 07', '90/100', 39, 60, 'Demo'],
    ],
  });

  const openExportModal = (
    title: string,
    filenamePrefix: string,
    columns: string[],
    rows: (string | number)[][]
  ) => {
    setExportConfig({ title, filenamePrefix, columns, rows });
    setIsExportModalOpen(true);
  };

  const handleGlobalLocationAdded = (newLoc: any) => {
    const item = {
      id: newLoc.id,
      flag: newLoc.flag || newLoc.countryCode || 'in',
      name: newLoc.name || 'New Location',
      category: newLoc.category || 'Business Location',
      isDemo: false,
    };
    setLocationsList([item, ...locationsList]);
    setActiveLocation(item);
    setIsAddLocationModalOpen(false);
  };

  // Business Listings State
  const [listingsSearch, setListingsSearch] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [listingsPerPage, setListingsPerPage] = useState('100');

  // Review Scatter Matrix Filter (Overview)
  const [scatterTimelineFilter, setScatterTimelineFilter] = useState<'ALL' | '7D' | '1M' | '3M' | '6M' | '1Y'>('ALL');
  const [selectedKeywordsPeriod, setSelectedKeywordsPeriod] = useState<'3M' | '6M' | '1Y'>('3M');
  const [selectedActivityPeriod, setSelectedActivityPeriod] = useState<'ALL' | '7D' | '1M' | '3M' | '6M' | '1Y'>('ALL');

  // Analytics State (Screenshot 1 / 5:38)
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<'MONTHS' | 'WEEKS' | 'DAYS'>('MONTHS');
  const [stackedChartFilter, setStackedChartFilter] = useState('All Sources Selected');
  const [activeRatingsInFilter, setActiveRatingsInFilter] = useState<Record<string, boolean>>({
    '5': true,
    '4': true,
    '3': true,
    '2': true,
    '1': true,
    rec: true,
    not_rec: true,
    not_rated: true,
  });

  // Audit View State (Screenshot 1 & 3)
  const [selectedAuditSection, setSelectedAuditSection] = useState<'gbp' | 'listings' | 'reviews'>('gbp');
  const [auditFilter, setAuditFilter] = useState<'all' | 'errors' | 'warnings' | 'notices' | 'passed' | 'unchecked'>('all');
  const [expandedChecklistItems, setExpandedChecklistItems] = useState<Record<string, boolean>>({
    'gbp-service-area': true,
    'listings-not-all-active': true,
    'listings-name-errors': false,
    'listings-address-errors': false,
    'listings-phone-errors': false,
    'listings-url-errors': false,
    'reviews-unmonitored': true,
    'reviews-disabled': false,
    'reviews-negative-reply': true,
    'reviews-neutral-old': false,
    'reviews-neutral-new': true,
    'reviews-rating-unsatisfactory': false,
    'reviews-30-days': false,
  });

  // Review List State (Screenshot 2)
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All sources');
  const [activeReviewModal, setActiveReviewModal] = useState<ReviewItem | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [reviewListSearch, setReviewListSearch] = useState('');

  // 10 Exact Reviews matching Screenshot 2
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'I loved the place so much. The owner greets you with a smile which makes the overall atmosphere wonderful and welcoming. Definitely coming back soon!',
      author: 'Ben A.',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-2',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'It was absolutely incredible. There was amazing service, absolutely delicious food, and wonderful wines to pair.',
      author: 'Sabrina Taylor',
      status: 'Answered',
      language: 'EN',
      reply: 'Thank you Sabrina! We look forward to hosting you again for your next celebration.',
    },
    {
      id: 'rev-3',
      source: "Judy's Book",
      sourceIcon: '📖',
      rating: 2,
      date: 'Sep 23 2026',
      text: 'The atmosphere was great. Location seemed convenient. The Philly sandwich I ordered, however, was quite greasy and cold when brought out.',
      author: 'George Kent',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-4',
      source: 'FindOpen',
      sourceIcon: '📍',
      rating: 4,
      date: 'Sep 23 2026',
      text: 'Super popular place. We even had to stand in the line to get in. Food was great overall, especially the handmade pasta.',
      author: 'Minka Lawson',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-5',
      source: 'EZlocal',
      sourceIcon: '🌐',
      rating: 3,
      date: 'Sep 21 2026',
      text: "First time here. Tried the pasta on pasta Friday. It was okay... didn't taste much like true Italian seasoning.",
      author: 'Emma Conte',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-6',
      source: 'Tripadvisor',
      sourceIcon: '🦉',
      rating: 5,
      date: 'Sep 20 2026',
      text: 'Genuine Italian food. Tasty and looks great. Nice wine too. Waiters are pleasant and fast.',
      author: 'Jerry_213',
      status: 'Not read',
      language: 'EN',
    },
    {
      id: 'rev-7',
      source: 'City squares',
      sourceIcon: '🏙️',
      rating: 5,
      date: 'Sep 19 2026',
      text: 'The food is delicious and full of flavor. The only complaint I have this time around that it was a bit loud inside.',
      author: 'Alan Pascot',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-8',
      source: "Judy's Book",
      sourceIcon: '📖',
      rating: null, // Not rated in screenshot
      date: 'Sep 18 2026',
      text: 'Es el tipico asador castellano, donde puedes degustar un delicioso cordero. Y claro, sin olvidar las tapas tradicionales.',
      author: 'spain_girl',
      status: 'Read',
      language: 'ES',
    },
    {
      id: 'rev-9',
      source: 'FindOpen',
      sourceIcon: '📍',
      rating: 3,
      date: 'Sep 14 2026',
      text: 'The food was average overall. The mac and cheese tasted artificial. However, the wings were quite tasty.',
      author: 'Mark Steiner',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-10',
      source: 'ShowMeLocal',
      sourceIcon: '🏷️',
      rating: 5,
      date: 'Sep 12 2026',
      text: 'Reasonable prices, amazing food, fast service. Very clean, friendly staff, a chill vibe all around.',
      author: 'Monica Dalton',
      status: 'Read',
      language: 'EN',
    },
  ]);

  // Full 56+ Directories Matching Screenshot 3 & 4
  const directoryListings: DirectoryListing[] = [
    { id: 'd-1', name: 'Google', icon: '🔍', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-2', name: 'Facebook', icon: '📘', type: 'Social Media', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-3', name: 'Yelp', icon: '🔴', type: 'Local Directory', syncStatus: 'Sync unavailable', presence: 'Listed', errors: { address: true, phone: true } },
    { id: 'd-4', name: 'Foursquare', icon: '📍', type: 'Local Directory', syncStatus: 'Submitted', presence: 'Listed', errors: {} },
    { id: 'd-5', name: 'Here', icon: '🗺️', type: 'Map', syncStatus: 'Submitted', presence: 'Not monitored', errors: {} },
    { id: 'd-6', name: 'Bing', icon: '🅱️', type: 'Map', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-7', name: 'Apple Maps', icon: '🍎', type: 'Map', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-8', name: 'TomTom', icon: '🧭', type: 'Map', syncStatus: 'Submitted', presence: 'Listed', errors: {} },
    { id: 'd-9', name: 'Hotfrog', icon: '🐸', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-10', name: 'MapQuest', icon: '🗺️', type: 'Map', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-11', name: 'Better Business Bureau', icon: '🏛️', type: 'Local Directory', syncStatus: 'Submitted', presence: 'Not monitored', errors: {} },
    { id: 'd-12', name: 'Tripadvisor', icon: '🦉', type: 'Local Directory', syncStatus: 'Sync unavailable', presence: 'Listed', errors: { name: true, url: true } },
    { id: 'd-13', name: 'Uber Eats', icon: '🍔', type: 'Local Directory', syncStatus: 'Sync unavailable', presence: 'Not listed', errors: {} },
    { id: 'd-14', name: 'Just Landed', icon: '🛬', type: 'Local Directory', syncStatus: 'Sync unavailable', presence: 'Not listed', errors: {} },
    { id: 'd-15', name: 'Yellow Pages', icon: '📒', type: 'Local Directory', syncStatus: 'Sync not started', presence: 'Not listed', errors: {} },
    { id: 'd-16', name: 'Waze', icon: '🚗', type: 'Map', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-17', name: 'ShowMeLocal', icon: '🏷️', type: 'Local Directory', syncStatus: 'Updating', presence: 'Not monitored', errors: {} },
    { id: 'd-18', name: 'Nextdoor', icon: '🏡', type: 'Social Media', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-19', name: 'FindOpen', icon: '📍', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-20', name: 'Siri', icon: '🎙️', type: 'Digital Assistant', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-21', name: 'Navmii', icon: '📍', type: 'Map', syncStatus: 'Updating', presence: 'Listed', errors: { name: true, address: true, phone: true } },
    { id: 'd-22', name: 'WhereTo', icon: '🧭', type: 'Map', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-23', name: 'Acompio', icon: '🏢', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-24', name: 'Tupalo', icon: '🏢', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-25', name: 'Cylex', icon: '🏢', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-26', name: 'iGlobal', icon: '🌐', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-27', name: 'Google Assistant', icon: '🤖', type: 'Digital Assistant', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-28', name: 'Melocal services', icon: '🔧', type: 'Local Directory', syncStatus: 'Updating', presence: 'Listed', errors: {} },
    { id: 'd-29', name: 'Microsoft Cortana', icon: '⭕', type: 'Digital Assistant', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-30', name: 'N49', icon: '🍁', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-31', name: 'Pages24', icon: '📄', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-32', name: 'Ezlocal', icon: '🌐', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-33', name: "Judy's Book", icon: '📖', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-34', name: 'USCity', icon: '🏙️', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-35', name: 'City squares', icon: '🏙️', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-36', name: 'Elocal', icon: '🌐', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-37', name: 'Us info com', icon: 'ℹ️', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-38', name: 'Insider pages', icon: '📑', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-39', name: 'Citysearch', icon: '🔍', type: 'Local Directory', syncStatus: 'Submitted', presence: 'Not monitored', errors: {} },
    { id: 'd-40', name: 'Dex knows', icon: '📖', type: 'Local Directory', syncStatus: 'Submitted', presence: 'Not monitored', errors: {} },
    { id: 'd-41', name: 'Super pages', icon: '📄', type: 'Local Directory', syncStatus: 'Submitted', presence: 'Not monitored', errors: {} },
    { id: 'd-42', name: 'Apple apps', icon: '📱', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-43', name: 'Audi', icon: '🚗', type: 'Navigation System', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-44', name: 'BMW', icon: '🚙', type: 'Navigation System', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-45', name: 'Chamber of commerce', icon: '🏛️', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-46', name: 'Consumer affairs', icon: '⚖️', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-47', name: 'Credit karma', icon: '💳', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-48', name: 'Delivery', icon: '📦', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-49', name: 'Fiat', icon: '🚗', type: 'Navigation System', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-50', name: 'Ford', icon: '🚙', type: 'Navigation System', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-51', name: 'Glassdoor', icon: '🚪', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-52', name: 'GM', icon: '🚗', type: 'Navigation System', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-53', name: 'Grubhub', icon: '🍔', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-54', name: 'Indeed', icon: '💼', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-55', name: 'Lending tree', icon: '🌲', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
    { id: 'd-56', name: 'Manta', icon: '🐟', type: 'Local Directory', syncStatus: 'Synced', presence: 'Listed', errors: {} },
  ];

  const filteredDirectories = directoryListings.filter(
    (d) =>
      d.name.toLowerCase().includes(listingsSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(listingsSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen font-sans">
      {/* Top Notice Banner (Exact match to Screenshots) */}
      {!isBannerDismissed && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2.5 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0B69FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              i
            </span>
            <span className="leading-snug">
              This tool manages local business data. It provides local grid rank tracking, listings &amp; reviews management, GBP posting, and real-time multi-location monitoring. To connect a new location,{' '}
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="text-[#0B69FF] underline font-semibold cursor-pointer"
              >
                add your own locations
              </button>
            </span>
          </div>
          <button
            onClick={() => setIsBannerDismissed(true)}
            className="text-gray-400 hover:text-gray-700 ml-4 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/local-marketing" className="hover:text-gray-900 cursor-pointer">
            Local Marketing
          </Link>
          <span>›</span>
          {activeTab === 'all-locations' ? (
            <span className="text-[#8C98A9]">All Locations</span>
          ) : activeTab === 'rankings' ? (
              <span className="text-gray-900 font-semibold">Local Rankings</span>
            ) : activeTab === 'audit' ? (
              <span className="text-gray-900 font-semibold">Local Marketing Audit</span>
            ) : activeTab === 'gbp-insights' ? (
              <>
                <button onClick={() => setActiveTab('gbp-insights')} className="hover:text-gray-900 cursor-pointer">
                  Google Business Profile
                </button>
                <span>›</span>
                <span className="text-gray-900 font-semibold">GBP Insights</span>
              </>
            ) : activeTab === 'gbp-posts' ? (
              <>
                <span className="text-gray-500 font-medium">Folk Osteria, Highland Dr., Hol...</span>
                <span>›</span>
                <span className="text-gray-900 font-semibold">GBP Posts</span>
              </>
            ) : activeTab === 'listings' ? (
              <span className="text-gray-900 font-semibold">Business Listings</span>
            ) : activeTab === 'analytics' ? (
              <>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-gray-900 cursor-pointer">
                  Reviews
                </button>
                <span>›</span>
                <span className="text-gray-900 font-semibold">Analytics</span>
              </>
            ) : activeTab === 'reviews' ? (
              <>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-gray-900 cursor-pointer">
                  Reviews
                </button>
                <span>›</span>
                <span className="text-gray-900 font-semibold">Review List</span>
              </>
            ) : activeTab === 'insights' ? (
              <>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-gray-900 cursor-pointer">
                  Reviews
                </button>
                <span>›</span>
                <span className="text-gray-900 font-semibold">Insights</span>
              </>
            ) : (
              <span className="text-gray-900 font-semibold">Overview</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-[#0B69FF] hover:underline font-medium cursor-pointer"
              >
                Feedback
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-[#334155] text-white text-[11px] rounded py-1.5 px-3 whitespace-nowrap shadow-xl z-30">
                To reopen the feedback form, you can always select &quot;Feedback&quot;.
              </div>
            </div>

            {activeTab === 'gbp-posts' ? (
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                <span>Location updates limit 0 / 1</span>
                <span className="text-gray-400 cursor-pointer">ⓘ</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#F1F5F9] border border-[#CBD5E1] px-2.5 py-1 rounded text-xs font-semibold text-[#1E293B]">
                <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Locations 0 / 3</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </div>
            )}
          </div>
        </div>

      {/* Sub-Header Row: Dynamic Heading, Tabs & Action Controls */}
      {activeTab !== 'all-locations' && activeTab !== 'gbp-posts' && (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview'
                  ? 'Overview'
                  : activeTab === 'rankings'
                  ? 'Local Rankings'
                  : activeTab === 'audit'
                  ? 'Local Marketing Audit'
                  : activeTab === 'gbp-insights'
                  ? 'GBP Insights'
                  : activeTab === 'listings'
                  ? 'Business Listings'
                  : activeTab === 'reviews'
                  ? 'Review List'
                  : activeTab === 'analytics'
                  ? 'Reviews Analytics'
                  : activeTab === 'insights'
                  ? 'Insights'
                  : 'Overview'}
              </h1>

              {/* Suite View Switcher Tabs */}
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-xs flex-wrap">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'all-locations', label: 'Locations' },
                  { id: 'rankings', label: 'Rankings' },
                  { id: 'audit', label: 'Audit' },
                  { id: 'gbp-insights', label: 'GBP Insights' },
                  { id: 'gbp-posts', label: 'Posts' },
                  { id: 'listings', label: 'Listings (57)' },
                  { id: 'reviews', label: 'Reviews (60)' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'insights', label: 'Insights' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as LocalMarketingTab)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0B69FF] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4 flex-wrap">
              <span>Location updated on: Sep 26 2026</span>
              {(activeTab === 'reviews' || activeTab === 'analytics') && (
                <span>Reviews updated on: Sep 26 2026</span>
              )}
              {activeTab === 'audit' && <span>Audit updated on: Sep 26 2026</span>}
            </div>

            {/* Location Switcher & Date Range Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-2 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  <span>{activeLocation.flag}</span>
                  <span className="max-w-[200px] truncate">{activeLocation.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs divide-y divide-gray-100">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Locations
                    </div>
                    <div className="py-1">
                      {locationsList.map((loc) => {
                        const isSelected = activeLocation.id === loc.id;
                        return (
                          <div
                            key={loc.id}
                            onClick={() => {
                              setActiveLocation(loc);
                              setIsLocationDropdownOpen(false);
                            }}
                            className={`p-2.5 flex justify-between items-center cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/70 font-semibold text-[#0B69FF]' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{loc.flag}</span>
                              <div>
                                <p className="truncate">{loc.name}</p>
                                <p className="text-[10px] text-gray-400 font-normal">{loc.category}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#0B69FF]" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-1 px-3 py-2">
                      <button
                        onClick={() => {
                          setIsLocationDropdownOpen(false);
                          setIsAddLocationModalOpen(true);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-[#0B69FF] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add location</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-1.5 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedDateRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
                </button>

                {isDateDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
                    {['All dates', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setIsDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                          range === selectedDateRange ? 'bg-blue-50 text-[#0B69FF] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-sync Switch on Business Listings */}
              {activeTab === 'listings' && (
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-xs text-gray-600 font-medium">Auto-sync</span>
                  <button
                    onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                    className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      autoSyncEnabled ? 'bg-[#0B69FF]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                        autoSyncEnabled ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Social Source Indicators on Reviews & Analytics */}
              {(activeTab === 'reviews' || activeTab === 'analytics') && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#1E293B] text-white px-2 py-1 rounded text-[11px] font-semibold">
                    <span>G</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-1 bg-[#3B5998] text-white px-2 py-1 rounded text-[11px] font-semibold">
                    <span>f</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-gray-500 hidden sm:inline">
                    • We check reviews on a daily basis
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD LOCATION</span>
            </button>

            {activeTab !== 'analytics' && (
              <button
                onClick={() => {
                  setIsUpdating(true);
                  setTimeout(() => setIsUpdating(false), 1200);
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin text-[#0B69FF]' : ''}`} />
                <span>UPDATE</span>
                <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
              </button>
            )}

            <button
              onClick={() =>
                openExportModal(
                  'Local Marketing Overview',
                  'local_marketing_overview',
                  ['Metric', 'Value', 'Status', 'Date'],
                  [
                    ['Total Locations', '2', 'Active', new Date().toLocaleDateString()],
                    ['Average Score', '88/100', 'Good', new Date().toLocaleDateString()],
                    ['Listings Synced', '76/120', 'Synced', new Date().toLocaleDateString()],
                    ['Total Reviews', '284', 'Monitored', new Date().toLocaleDateString()],
                  ]
                )
              }
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW DASHBOARD                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top Rankings & Audit Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Local Rankings (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-gray-900">Local Rankings</h3>
                  <span className="text-gray-400 text-xs cursor-pointer">ⓘ</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-gray-900">Overall Avg Position:</span>
                  <span className="text-base font-extrabold text-gray-900">12.2</span>
                  <span className="text-emerald-600 font-semibold flex items-center text-[11px]">
                    ▲ 0.3
                  </span>
                </div>
              </div>

              {/* 6 Rank Distribution Tiles */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: 'TOP 1-3', count: 45, change: '+6', up: true, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  { label: 'TOP 4-6', count: 46, change: '-8', up: false, bg: 'bg-teal-50 text-teal-800 border-teal-200' },
                  { label: 'TOP 7-10', count: 50, change: '+2', up: true, bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                  { label: 'TOP 11-15', count: 78, change: '+14', up: true, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                  { label: 'TOP 16-19', count: 70, change: '+2', up: true, bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                  { label: 'TOP 20+', count: 66, change: '-18', up: false, bg: 'bg-rose-50 text-rose-800 border-rose-200' },
                ].map((item, idx) => (
                  <div key={idx} className={`p-2.5 rounded border text-center ${item.bg}`}>
                    <div className="text-[10px] font-bold opacity-75">{item.label}</div>
                    <div className="text-lg font-black">{item.count}</div>
                    <div className={`text-[10px] font-bold ${item.up ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inverted Position Chart */}
              <div className="h-28 w-full bg-gray-50/50 rounded border border-gray-100 p-2 flex items-end justify-between gap-1">
                {[15, 14.8, 14.2, 13.9, 13.5, 13.8, 13.2, 12.9, 12.6, 12.4, 12.2].map((pos, i) => {
                  const h = ((20 - pos) / 10) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-[#0B69FF]/80 group-hover:bg-[#0B69FF] rounded-t transition-all" style={{ height: `${Math.max(15, h)}%` }} />
                      <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {pos}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Local Marketing Audit Score (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-gray-900">Local Marketing Audit</h3>
                  <span className="text-gray-400 text-xs cursor-pointer">ⓘ</span>
                </div>
                <button onClick={() => setActiveTab('audit')} className="text-xs text-[#0B69FF] font-semibold hover:underline">
                  View full audit →
                </button>
              </div>

              <div className="flex items-center justify-around py-3">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="85, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-gray-900">85</span>
                    <span className="text-[8px] font-bold text-emerald-700 tracking-wider">HEALTHY</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-gray-700 mb-1">Issues Breakdown:</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Errors: 18</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Warnings: 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Notices: 50</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 text-center border-t border-gray-100 pt-2">
                Last checked today • 9 checks passed cleanly
              </div>
            </div>
          </div>

          {/* Connect A Real Location Notice (Exact match to Screenshot 1 & 4) */}
          {!isConnectBannerDismissed && (
            <div className="bg-white border-2 border-dashed border-[#CCE0F8] rounded-xl p-5 shadow-xs relative">
              <button
                onClick={() => setIsConnectBannerDismissed(true)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Connect a real location</h3>
              <p className="text-xs text-gray-600 max-w-3xl leading-relaxed mb-3">
                You're viewing data for a demo, imaginary business. Add a real local business (e.g., restaurant, car wash, locksmith) to view and manage its data. Start by connecting its Google Business Profile.
              </p>
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD LOCATION</span>
              </button>
            </div>
          )}

          {/* Google Business Profile Performance & Views (Screenshot 1 / 5:35) */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-5" id="gbp-stats">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Google Business Profile Performance</h3>
                <p className="text-xs text-gray-500">Impressions, keyword searches, and customer actions</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mobile search</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Mobile maps</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Desktop search</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Desktop maps</span>
              </div>
            </div>

            {/* Searches by keywords + Line Chart (Screenshot 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="gbp-keywords">
              {/* Left Keyword Table */}
              <div className="lg:col-span-6 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Searches by keywords</h4>
                    <div className="text-lg font-black text-gray-900">163,761</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex border border-gray-200 rounded text-[11px] font-semibold bg-gray-50 p-0.5">
                      {(['3M', '6M', '1Y'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setSelectedKeywordsPeriod(p)}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            selectedKeywordsPeriod === p ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        openExportModal(
                          'Local Keywords',
                          'local_marketing_keywords',
                          ['Rank', 'Keyword', 'Search Volume / Count'],
                          [
                            [1, 'food', '12301'],
                            [2, 'pasta', '11818'],
                            [3, 'italian', '9659'],
                            [4, 'restaurant', '8619'],
                            [5, 'pizza', '7346'],
                          ]
                        )
                      }
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-gray-400" />
                      <span>EXPORT</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                  {[
                    { rank: 1, kw: 'food', count: '12301' },
                    { rank: 2, kw: 'pasta', count: '11818' },
                    { rank: 3, kw: 'italian', count: '9659' },
                    { rank: 4, kw: 'restaurant', count: '8619' },
                    { rank: 5, kw: 'pizza', count: '7346' },
                  ].map((row) => (
                    <div key={row.rank} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-mono w-4">{row.rank}.</span>
                        <span className="font-semibold text-gray-900">{row.kw}</span>
                      </div>
                      <span className="font-mono text-gray-600 font-medium">{row.count}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => alert('Opening full 150 keywords list')}
                  className="w-full py-1.5 text-center text-xs font-bold text-[#0B69FF] hover:bg-blue-50/50 rounded transition-colors cursor-pointer"
                >
                  VIEW ALL KEYWORDS →
                </button>
              </div>

              {/* Right Line Chart */}
              <div className="lg:col-span-6 border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Searches</h4>
                    <div className="text-lg font-black text-gray-900">163,761</div>
                  </div>
                  <div className="flex border border-gray-200 rounded text-[11px] font-semibold bg-gray-50 p-0.5">
                    {(['3M', '6M', '1Y'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedKeywordsPeriod(p)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          selectedKeywordsPeriod === p ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-36 w-full flex items-end justify-between pt-4 px-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                    <polyline
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      points="10,60 40,50 70,35 100,55 130,60 160,50 190,65 220,52 250,48 280,50"
                    />
                    {[
                      { cx: 10, cy: 60 },
                      { cx: 40, cy: 50 },
                      { cx: 70, cy: 35 },
                      { cx: 100, cy: 55 },
                      { cx: 130, cy: 60 },
                      { cx: 160, cy: 50 },
                      { cx: 190, cy: 65 },
                      { cx: 220, cy: 52 },
                      { cx: 250, cy: 48 },
                      { cx: 280, cy: 50 },
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#0D9488" />
                    ))}
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-100">
                  <span>Oct 01 2025</span>
                  <span>Jan 01 2026</span>
                  <span>Apr 01 2026</span>
                  <span>Jul 01 2026</span>
                </div>
              </div>
            </div>

            {/* 4 Activity Cards (Screenshot 1) */}
            <div className="space-y-4 pt-2">
              {[
                { title: 'Website visits', count: '5,571', color: '#84CC16', stroke: 'stroke-lime-500' },
                { title: 'Direction requests', count: '1,148', color: '#EC4899', stroke: 'stroke-pink-500' },
                { title: 'Phone calls', count: '746', color: '#334155', stroke: 'stroke-slate-600' },
                { title: 'Messages', count: '1,352', color: '#F97316', stroke: 'stroke-orange-500' },
              ].map((act, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-700">{act.title}</div>
                      <div className="text-base font-extrabold text-gray-900">{act.count}</div>
                    </div>
                    <div className="flex border border-gray-200 rounded text-[10px] font-semibold bg-gray-50 p-0.5">
                      {(['ALL', '7D', '1M', '3M', '6M', '1Y'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedActivityPeriod(t)}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            selectedActivityPeriod === t ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seismograph / Sparkline */}
                  <div className="h-16 w-full flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 500 50" preserveAspectRatio="none">
                      <path
                        d="M0,35 Q20,10 40,32 T80,30 T120,40 T160,15 T200,32 T240,30 T280,35 T320,28 T360,33 T400,20 T440,35 T480,25 L500,30"
                        fill="none"
                        stroke={act.color}
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                    <span>Oct 01 2025</span>
                    <span>Dec 01 2025</span>
                    <span>Feb 01 2026</span>
                    <span>Apr 01 2026</span>
                    <span>Jun 01 2026</span>
                    <span>Aug 01 2026</span>
                    <span>Sep 01 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overview Lower Half Extras & Scatter Plot from Page 2 */}
          <OverviewExtras onNavigateTab={(t) => setActiveTab(t)} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESS LISTINGS (Screenshots 3 & 4)                              */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top Metric Boxes: Overview & NAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: OVERVIEW */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>OVERVIEW</span>
                <span className="cursor-pointer text-gray-400">ⓘ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1">FOUND</div>
                  <div className="text-2xl font-black text-[#0B69FF] flex items-center gap-1.5">
                    <Eye className="w-5 h-5 opacity-70" />
                    <span>57</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1">NOT FOUND</div>
                  <div className="text-2xl font-black text-[#0B69FF] flex items-center gap-1.5">
                    <EyeOff className="w-5 h-5 opacity-70" />
                    <span>3</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1">CORRECT</div>
                  <div className="text-2xl font-black text-[#0B69FF] flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 opacity-70" />
                    <span>54</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1">WITH MISTAKES</div>
                  <div className="text-2xl font-black text-[#0B69FF] flex items-center gap-1.5">
                    <X className="w-5 h-5 opacity-70" />
                    <span>3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: NAP */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>NAP</span>
                <span className="cursor-pointer text-gray-400">ⓘ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <span>NAME</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      ✔ 55
                    </span>
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      ⛔ 2
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <span>ADDRESS</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      ✔ 55
                    </span>
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      ⛔ 2
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <span>PHONE</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      ✔ 55
                    </span>
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      ⛔ 2
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <span>URL</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      ✔ 56
                    </span>
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      ⛔ 1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect real location banner */}
          <div className="bg-white border-2 border-dashed border-[#CCE0F8] rounded-xl p-5 shadow-xs relative">
            <h3 className="font-bold text-sm text-gray-900 mb-1">Connect a real location</h3>
            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed mb-3">
              Connect your verified Google Business Profile to view real-time local search analytics, customer actions, and direct search queries.
            </p>
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD LOCATION</span>
              </button>
          </div>

          {/* Business Listings Search, Filters & Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">Business Listings</h2>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={listingsSearch}
                    onChange={(e) => setListingsSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0B69FF] bg-white w-48"
                  />
                </div>

                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <span>FILTERS (0)</span>
                </button>

                <button
                  onClick={() => setIsAddLocationModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                  <span>SUGGEST DIRECTORY</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="px-5 py-3">DIRECTORY</th>
                      <th className="px-5 py-3">TYPE</th>
                      <th className="px-5 py-3">SYNC STATUS</th>
                      <th className="px-5 py-3">PRESENCE</th>
                      <th className="px-5 py-3">ERRORS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredDirectories.map((dir) => (
                      <tr key={dir.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{dir.icon}</span>
                            <span>{dir.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{dir.type}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                              dir.syncStatus === 'Synced'
                                ? 'text-emerald-700 bg-emerald-50'
                                : dir.syncStatus === 'Submitted'
                                ? 'text-blue-700 bg-blue-50'
                                : dir.syncStatus === 'Updating'
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-gray-500 bg-gray-100'
                            }`}
                          >
                            {dir.syncStatus === 'Synced' && '✔'}
                            {dir.syncStatus === 'Submitted' && '✔'}
                            {dir.syncStatus === 'Updating' && '⚠️'}
                            {dir.syncStatus.includes('unavailable') && '⟳'}
                            {dir.syncStatus.includes('not started') && '○'}
                            <span>{dir.syncStatus}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              dir.presence === 'Listed'
                                ? 'text-emerald-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {dir.presence}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-red-500 text-sm">
                            {dir.errors.name && <span title="Name error">🔤</span>}
                            {dir.errors.address && <span title="Address error">📍</span>}
                            {dir.errors.phone && <span title="Phone error">📞</span>}
                            {dir.errors.url && <span title="URL error">🔗</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                {/* Pagination footer */}
                <div className="bg-[#F8FAFC] border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {filteredDirectories.length} directories</span>
                  <div className="flex items-center gap-2">
                    <span>View on page:</span>
                    <select
                      value={listingsPerPage}
                      onChange={(e) => setListingsPerPage(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 bg-white font-semibold"
                    >
                      <option>50</option>
                      <option>100</option>
                      <option>200</option>
                    </select>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT CHECKLIST (Screenshots 1 & 3)                                */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top Audit Summary Metrics (Screenshot 3 / 5:35) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* Errors (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                <span>ERRORS</span>
                <span>ⓘ</span>
              </div>
              <div className="text-3xl font-black text-gray-900">22</div>
              <div className="h-16 w-full flex items-end justify-center pt-2">
                <div className="w-1.5 h-12 bg-red-500 rounded-t" />
              </div>
            </div>

            {/* Warnings (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                <span>WARNINGS</span>
                <span>ⓘ</span>
              </div>
              <div className="text-3xl font-black text-gray-900">1</div>
              <div className="h-16 w-full flex items-end justify-center pt-2">
                <div className="w-1.5 h-10 bg-amber-400 rounded-t" />
              </div>
            </div>

            {/* Score Donut (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs flex flex-col items-center justify-center text-center">
              <div className="text-xs text-gray-500 font-bold uppercase mb-2">SCORE ⓘ</div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="85, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-gray-900">85</span>
                  <span className="text-[8px] font-bold text-emerald-700">HEALTHY</span>
                </div>
              </div>
            </div>

            {/* Top Issues (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-4 shadow-2xs space-y-1.5 text-xs">
              <div className="font-bold text-gray-500 uppercase text-[11px] mb-1">TOP ISSUES ⓘ</div>
              {[
                'Company name contains errors',
                'Company address contains errors',
                'Company phone number contains errors',
                'Company website URL contains errors',
                "You didn't reply to all negative user reviews",
                'Company is not added to all active directories',
              ].map((issue, idx) => (
                <div key={idx} className="flex items-center justify-between text-gray-800 hover:text-red-600 cursor-pointer py-0.5">
                  <span className="truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="truncate">{issue}</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Area (Left Category Rail + Filter Chips + Accordions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-3">
              <div
                onClick={() => setSelectedAuditSection('gbp')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'gbp'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>Google Business Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 1
                  </span>
                </div>
              </div>

              <div
                onClick={() => setSelectedAuditSection('listings')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'listings'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Business Listings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 10
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 0
                  </span>
                </div>
              </div>

              <div
                onClick={() => setSelectedAuditSection('reviews')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'reviews'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Reviews</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 8
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 1
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 44
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Filter Tabs matching Screenshot 1 */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600 border-b border-gray-200 pb-3">
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`flex items-center gap-1.5 cursor-pointer pb-1 ${
                    auditFilter === 'all' ? 'text-[#0B69FF] border-b-2 border-[#0B69FF]' : 'hover:text-gray-900'
                  }`}
                >
                  <span>✔ ALL (71)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('errors')}
                  className={`flex items-center gap-1.5 cursor-pointer pb-1 text-red-600 ${
                    auditFilter === 'errors' ? 'font-bold border-b-2 border-red-600' : 'hover:text-red-800'
                  }`}
                >
                  <span>⛔ ERRORS (18)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('warnings')}
                  className={`flex items-center gap-1.5 cursor-pointer pb-1 text-amber-600 ${
                    auditFilter === 'warnings' ? 'font-bold border-b-2 border-amber-600' : 'hover:text-amber-800'
                  }`}
                >
                  <span>⚠️ WARNINGS (1)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('notices')}
                  className={`flex items-center gap-1.5 cursor-pointer pb-1 text-blue-600 ${
                    auditFilter === 'notices' ? 'font-bold border-b-2 border-blue-600' : 'hover:text-blue-800'
                  }`}
                >
                  <span>ℹ NOTICES (51)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('passed')}
                  className={`flex items-center gap-1.5 cursor-pointer pb-1 text-emerald-600 ${
                    auditFilter === 'passed' ? 'font-bold border-b-2 border-emerald-600' : 'hover:text-emerald-800'
                  }`}
                >
                  <span>✅ PASSED CHECKS (9)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('unchecked')}
                  className="flex items-center gap-1.5 text-gray-400 cursor-pointer pb-1"
                >
                  <span>UNDEFINED (0)</span>
                </button>
              </div>

              {/* Accordion lists */}
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-2xs">
                {/* 1. GBP Section */}
                <div className="p-4 bg-gray-50/70 font-bold text-sm text-gray-900 flex items-center justify-between">
                  <span>Google Business Profile</span>
                </div>
                <div className="p-3 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company category added</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company address added</span>
                  </div>
                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'gbp-service-area': !p['gbp-service-area'] }))
                      }
                      className="flex items-center justify-between text-blue-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Service area not added</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['gbp-service-area'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['gbp-service-area'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        Specify the areas in which you deliver goods or provide services to the customer's address. You can add multiple service areas.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company hours of operation added</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company phone number added</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company website URL added</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Company description added</span>
                  </div>
                </div>

                {/* 2. Business Listings Section */}
                <div className="p-4 bg-gray-50/70 font-bold text-sm text-gray-900 flex items-center justify-between">
                  <span>Business Listings</span>
                </div>
                <div className="p-3 text-xs space-y-2">
                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'listings-not-all-active': !p['listings-not-all-active'] }))
                      }
                      className="flex items-center justify-between text-red-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Company is not added to all active directories</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['listings-not-all-active'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['listings-not-all-active'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        Being listed in various business directories serves as an additional source of traffic for a business, improves its rankings in local search, and increases its brand awareness.
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'listings-name-errors': !p['listings-name-errors'] }))
                      }
                      className="flex items-center justify-between text-red-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Company name contains errors</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['listings-name-errors'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['listings-name-errors'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        The company's name has to be the same in all business listings. This makes a company more attractive to clients and search engines.
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'listings-address-errors': !p['listings-address-errors'] }))
                      }
                      className="flex items-center justify-between text-red-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Company address contains errors</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['listings-address-errors'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['listings-address-errors'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        The company's address, including the postal code, has to be real and the same among all business listings.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Reviews Section */}
                <div className="p-4 bg-gray-50/70 font-bold text-sm text-gray-900 flex items-center justify-between">
                  <span>Reviews</span>
                </div>
                <div className="p-3 text-xs space-y-2">
                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'reviews-unmonitored': !p['reviews-unmonitored'] }))
                      }
                      className="flex items-center justify-between text-blue-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>User reviews are not found at least in one monitored review source</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['reviews-unmonitored'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['reviews-unmonitored'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        Business reviews build trust with customers and help businesses rank better in search engines. If your business listing doesn't have reviews, ask your customers to leave an honest review about your services.
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <div
                      onClick={() =>
                        setExpandedChecklistItems((p) => ({ ...p, 'reviews-negative-reply': !p['reviews-negative-reply'] }))
                      }
                      className="flex items-center justify-between text-red-700 font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>You didn't reply to all negative user reviews</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedChecklistItems['reviews-negative-reply'] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedChecklistItems['reviews-negative-reply'] && (
                      <p className="mt-1.5 ml-4 text-gray-500 text-[11px] leading-relaxed">
                        It is important to respond to all negative reviews. Respond to them patiently and professionally, clarify the details and understand the reasons.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REVIEWS LIST (Screenshot 2)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Source Tabs Matching Screenshot 2 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSourceFilter('All sources')}
              className={`px-3 py-1.5 rounded-md font-medium border cursor-pointer whitespace-nowrap ${
                selectedSourceFilter === 'All sources'
                  ? 'bg-[#3B4252] text-white border-transparent shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All sources
            </button>

            <button
              onClick={() => setSelectedSourceFilter('Google')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                selectedSourceFilter === 'Google'
                  ? 'bg-[#3B4252] text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold text-blue-600">G</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.56</span>
              <span className="text-gray-400">16</span>
            </button>

            <button
              onClick={() => setSelectedSourceFilter('Facebook')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                selectedSourceFilter === 'Facebook'
                  ? 'bg-[#3B4252] text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold text-blue-700">f</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 4.33</span>
              <span className="text-gray-400">9</span>
            </button>

            <button
              onClick={() => setSelectedSourceFilter('Tripadvisor')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                selectedSourceFilter === 'Tripadvisor'
                  ? 'bg-[#3B4252] text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>🦉</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.70</span>
              <span className="text-gray-400">16</span>
            </button>

            <button
              onClick={() => setSelectedSourceFilter('Yelp')}
              className="px-3 py-1.5 rounded-md font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="font-bold text-red-600">Y</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 4.00</span>
              <span className="text-gray-400">3</span>
            </button>

            <button
              onClick={() => setSelectedSourceFilter('Trustpilot')}
              className="px-3 py-1.5 rounded-md font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="font-bold text-emerald-600">★</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.67</span>
              <span className="text-gray-400">3</span>
            </button>
          </div>

          {/* Reviews Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Reviews</h2>
              <div className="text-xs text-gray-500">Showing 1-10 of 60</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Filter reviews')}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span>FILTERS (0)</span>
              </button>
              <button
                onClick={() =>
                  openExportModal(
                    'Local Reviews List',
                    'local_marketing_reviews',
                    ['Author', 'Rating', 'Platform', 'Review Text', 'Date'],
                    [
                      ['Marco Rossi', '5 Stars', 'Google Business', 'Fantastic authentic Italian cuisine! Best pasta in town.', 'Yesterday'],
                      ['Elena Gomez', '4 Stars', 'TripAdvisor', 'Great atmosphere and friendly staff. Will come back again.', '3 days ago'],
                      ['David Smith', '5 Stars', 'Yelp', 'Exceptional service and mouthwatering dishes.', '1 week ago'],
                    ]
                  )
                }
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>EXPORT</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">SOURCE</th>
                    <th className="px-5 py-3">RATING</th>
                    <th className="px-5 py-3">DATE ⌄</th>
                    <th className="px-5 py-3">REVIEW</th>
                    <th className="px-5 py-3">STATUS</th>
                    <th className="px-5 py-3">LANGUAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {reviewsList.map((rev) => (
                    <tr key={rev.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{rev.sourceIcon}</span>
                          <span>{rev.source}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {rev.rating !== null ? (
                          <div className="flex items-center gap-1 font-bold text-gray-900">
                            <span>{rev.rating}</span>
                            <span className="text-amber-400">★</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">☆ Not rated</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {rev.date}
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <p className="line-clamp-2 text-gray-700 leading-relaxed">{rev.text}</p>
                        <button
                          onClick={() => setActiveReviewModal(rev)}
                          className="text-[#0B69FF] font-semibold text-[11px] hover:underline mt-0.5 inline-block cursor-pointer"
                        >
                          Show more
                        </button>
                        <div className="text-[11px] text-gray-400 mt-1 font-medium">{rev.author}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              rev.status === 'Answered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rev.status === 'Needs attention'
                                ? 'bg-amber-100 text-amber-800'
                                : rev.status === 'Not read'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {rev.status}
                          </span>
                          <div>
                            <button
                              onClick={() => setActiveReviewModal(rev)}
                              className="text-gray-500 hover:text-gray-800 text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                            >
                              <Eye className="w-3 h-3 text-gray-400" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-600">
                        {rev.language}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-[#F8FAFC] border-t border-gray-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
                  &lt;
                </button>
                <button className="px-2.5 py-1 rounded bg-[#0B69FF] text-white font-bold">1</button>
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">2</button>
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">3</button>
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">4</button>
                <span>...</span>
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">6</button>
                <button className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
                  &gt;
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span>Go to page:</span>
                  <input type="number" defaultValue={1} className="w-12 px-2 py-1 border border-gray-300 rounded text-center bg-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>View on page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 bg-white font-semibold">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REVIEWS ANALYTICS (Screenshot 1 / 5:38)                            */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top Score & Count Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Average Rating Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>AVERAGE RATING SCORE</span>
                  <span className="cursor-pointer text-gray-400">ⓘ</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-gray-900">3.8</span>
                  <span className="text-amber-400 text-lg">★★★★☆</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Number of Reviews */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>TOTAL NUMBER OF REVIEWS</span>
                </div>
                <div className="text-4xl font-black text-gray-900">60</div>
              </div>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-bold text-[#0B69FF] hover:underline cursor-pointer"
              >
                VIEW ALL →
              </button>
            </div>
          </div>

          {/* Chart 1: Reviews Over Time Curve */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-gray-900">Reviews over time</h3>
                <span className="text-gray-400 text-xs">ⓘ</span>
                <span className="text-base font-extrabold text-gray-900 ml-2">60</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-semibold">GROUP BY:</span>
                <select
                  value={analyticsGroupBy}
                  onChange={(e) => setAnalyticsGroupBy(e.target.value as any)}
                  className="border border-gray-300 rounded px-2.5 py-1 text-xs font-bold text-gray-800 bg-white"
                >
                  <option value="MONTHS">MONTHS</option>
                  <option value="WEEKS">WEEKS</option>
                  <option value="DAYS">DAYS</option>
                </select>
              </div>
            </div>

            {/* Smooth SVG Area Curve */}
            <div className="h-48 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 150">
                <defs>
                  <linearGradient id="reviewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B69FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0B69FF" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                <line x1="0" y1="30" x2="700" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="75" x2="700" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="120" x2="700" y2="120" stroke="#F1F5F9" strokeWidth="1" />

                <path
                  d="M20,115 C70,120 120,128 170,128 C220,128 270,105 320,95 C370,88 420,90 470,98 C520,100 570,90 620,96 C650,96 670,40 680,25 L680,140 L20,140 Z"
                  fill="url(#reviewsAreaGrad)"
                />
                <path
                  d="M20,115 C70,120 120,128 170,128 C220,128 270,105 320,95 C370,88 420,90 470,98 C520,100 570,90 620,96 C650,96 670,40 680,25"
                  fill="none"
                  stroke="#0B69FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {[
                  { cx: 20, cy: 115 },
                  { cx: 80, cy: 122 },
                  { cx: 140, cy: 128 },
                  { cx: 200, cy: 110 },
                  { cx: 260, cy: 100 },
                  { cx: 320, cy: 95 },
                  { cx: 380, cy: 90 },
                  { cx: 440, cy: 98 },
                  { cx: 500, cy: 100 },
                  { cx: 560, cy: 92 },
                  { cx: 620, cy: 96 },
                  { cx: 680, cy: 25 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill="#0B69FF" stroke="#FFFFFF" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-100">
              <span>Oct 2025</span>
              <span>Nov 2025</span>
              <span>Dec 2025</span>
              <span>Jan 2026</span>
              <span>Feb 2026</span>
              <span>Mar 2026</span>
              <span>Apr 2026</span>
              <span>May 2026</span>
              <span>Jun 2026</span>
              <span>Jul 2026</span>
              <span>Aug 2026</span>
              <span>Sep 2026</span>
            </div>
          </div>

          {/* Chart 2: Reviews by Rating (Donut) & Reviews by Source (Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Reviews by rating */}
            <div className="lg:col-span-6 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">REVIEWS BY RATING</h3>
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                {/* Donut Chart */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                    {/* 5 Star */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="0" />
                    {/* 4 Star */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#14B8A6" strokeWidth="3" strokeDasharray="18.3 81.7" strokeDashoffset="-25" />
                    {/* 3 Star */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6.7 93.3" strokeDashoffset="-43.3" />
                    {/* 2 Star */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FB923C" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-50" />
                    {/* 1 Star */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray="6.7 93.3" strokeDashoffset="-60" />
                    {/* Recommended */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="11.7 88.3" strokeDashoffset="-66.7" />
                    {/* Not Rated */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#64748B" strokeWidth="3" strokeDasharray="18.3 81.7" strokeDashoffset="-81.7" />
                  </svg>
                </div>

                {/* Rating Breakdown Table (Screenshot 1) */}
                <div className="space-y-1 text-xs w-full sm:w-auto">
                  {[
                    { label: '5 ★★★★★', count: 15, pct: '25%', color: 'bg-emerald-500' },
                    { label: '4 ★★★★☆', count: 11, pct: '18.3%', color: 'bg-teal-500' },
                    { label: '3 ★★★☆☆', count: 4, pct: '6.7%', color: 'bg-amber-500' },
                    { label: '2 ★★☆☆☆', count: 6, pct: '10%', color: 'bg-orange-500' },
                    { label: '1 ★☆☆☆☆', count: 4, pct: '6.7%', color: 'bg-red-500' },
                    { label: 'RECOMMENDED', count: 7, pct: '11.7%', color: 'bg-blue-500' },
                    { label: 'NOT RECOMMENDED', count: 2, pct: '3.3%', color: 'bg-gray-800' },
                    { label: '☆ NOT RATED', count: 11, pct: '18.3%', color: 'bg-slate-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-semibold text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-gray-900">{item.count}</span>
                        <span className="text-gray-400 w-10 text-right">{item.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Reviews by source bar chart */}
            <div className="lg:col-span-6 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">REVIEWS BY SOURCE</h3>
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>

              {/* Bar Chart Matching Screenshot 1 */}
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { name: 'Google', pct: 26.7, icon: 'G' },
                  { name: 'Facebook', pct: 15, icon: 'f' },
                  { name: 'Tripadvisor', pct: 26.7, icon: '🦉' },
                  { name: 'ShowMeLocal', pct: 5, icon: '🏷️' },
                  { name: 'FindOpen', pct: 5, icon: '📍' },
                  { name: 'WhereTo', pct: 3.3, icon: '🧭' },
                  { name: 'N49', pct: 3.3, icon: '🍁' },
                  { name: 'Ezlocal', pct: 5, icon: '🌐' },
                  { name: 'Judy\'s Book', pct: 3.3, icon: '📖' },
                  { name: 'City squares', pct: 6.7, icon: '🏙️' },
                ].map((s, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-gray-500 font-bold">{s.pct}%</span>
                    <div
                      className="w-full bg-[#0B69FF] rounded-t transition-all group-hover:bg-[#0052D4]"
                      style={{ height: `${s.pct * 3.5}px` }}
                    />
                    <span className="text-xs pt-1">{s.icon}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span>1 - 10 from 10</span>
                <div className="flex gap-2">
                  <button className="cursor-pointer hover:text-gray-700">&lt;</button>
                  <button className="cursor-pointer hover:text-gray-700">&gt;</button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Reviews by source and rating (Stacked Bar Chart with Hover Tooltip) */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                  REVIEWS BY SOURCE AND RATING
                </h3>
                <span className="text-gray-400 text-xs">ⓘ</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="border border-gray-300 rounded px-2.5 py-1 text-xs font-semibold bg-white flex items-center gap-1 text-gray-700">
                  <span className="bg-gray-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    10
                  </span>
                  <span>All Sources Selected</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stacked Bars with Tooltip Example */}
            <div className="h-56 w-full flex items-end justify-around gap-4 pt-6 px-4 relative">
              {[
                { name: 'Google', icon: 'G', s5: 6, s4: 4, s3: 2, s2: 2, s1: 2, rec: 0, nrec: 0, nrat: 0 },
                { name: 'Facebook', icon: 'f', s5: 0, s4: 0, s3: 0, s2: 0, s1: 0, rec: 7, nrec: 2, nrat: 0 },
                { name: 'Tripadvisor', icon: '🦉', s5: 6, s4: 5, s3: 2, s2: 1, s1: 2, rec: 0, nrec: 0, nrat: 0 },
                { name: 'ShowMeLocal', icon: '🏷️', s5: 1, s4: 1, s3: 1, s2: 0, s1: 0, rec: 0, nrec: 0, nrat: 0 },
                { name: 'FindOpen', icon: '📍', s5: 0, s4: 1, s3: 1, s2: 0, s1: 1, rec: 0, nrec: 0, nrat: 0 },
                { name: 'WhereTo', icon: '🧭', s5: 0, s4: 0, s3: 0, s2: 0, s1: 2, rec: 0, nrec: 0, nrat: 0 },
                { name: 'N49', icon: '🍁', s5: 2, s4: 0, s3: 0, s2: 0, s1: 0, rec: 0, nrec: 0, nrat: 0 },
                { name: 'Ezlocal', icon: '🌐', s5: 0, s4: 1, s3: 2, s2: 0, s1: 0, rec: 0, nrec: 0, nrat: 0 },
                { name: 'Judy\'s Book', icon: '📖', s5: 0, s4: 0, s3: 0, s2: 1, s1: 0, rec: 0, nrec: 0, nrat: 1 },
                { name: 'City squares', icon: '🏙️', s5: 3, s4: 1, s3: 0, s2: 0, s1: 0, rec: 0, nrec: 0, nrat: 0 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on FindOpen / Tripadvisor */}
                  {item.name === 'FindOpen' && (
                    <div className="absolute -top-12 bg-white border border-gray-200 rounded shadow-lg p-2 text-[10px] z-20 whitespace-nowrap pointer-events-none">
                      <div className="font-bold text-gray-700">RATING / REVIEWS</div>
                      <div className="flex items-center gap-1 text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 1 ★☆☆☆☆: 1
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Not rated: 1
                      </div>
                    </div>
                  )}

                  {/* Stacked bar layers */}
                  <div className="w-6 flex flex-col-reverse rounded overflow-hidden">
                    {item.s5 > 0 && <div className="bg-emerald-500" style={{ height: `${item.s5 * 8}px` }} />}
                    {item.s4 > 0 && <div className="bg-teal-500" style={{ height: `${item.s4 * 8}px` }} />}
                    {item.s3 > 0 && <div className="bg-amber-400" style={{ height: `${item.s3 * 8}px` }} />}
                    {item.s2 > 0 && <div className="bg-orange-400" style={{ height: `${item.s2 * 8}px` }} />}
                    {item.s1 > 0 && <div className="bg-red-500" style={{ height: `${item.s1 * 8}px` }} />}
                    {item.rec > 0 && <div className="bg-blue-500" style={{ height: `${item.rec * 8}px` }} />}
                    {item.nrec > 0 && <div className="bg-gray-800" style={{ height: `${item.nrec * 8}px` }} />}
                    {item.nrat > 0 && <div className="bg-purple-500" style={{ height: `${item.nrat * 8}px` }} />}
                  </div>
                  <span className="text-xs pt-1">{item.icon}</span>
                </div>
              ))}
            </div>

            {/* Checkbox Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-3 border-t border-gray-100 font-semibold text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
                <span className="text-emerald-700">5 ★★★★★</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-teal-500" />
                <span className="text-teal-700">4 ★★★★☆</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span className="text-amber-700">3 ★★★☆☆</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-orange-500" />
                <span className="text-orange-700">2 ★★☆☆☆</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-red-500" />
                <span className="text-red-700">1 ★☆☆☆☆</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-500" />
                <span className="text-blue-700">Recommended</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gray-800" />
                <span className="text-gray-800">Not recommended</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-purple-500" />
                <span className="text-purple-700">Not rated ☆</span>
              </label>
            </div>
          </div>

          {/* Section: Reviews by source - detailed Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden" id="insights">
            <div className="p-4 border-b border-gray-200 font-bold text-sm text-gray-900">
              Reviews by source – detailed
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">SOURCE</th>
                    <th className="px-5 py-3">RATING</th>
                    <th className="px-5 py-3">TOTAL REVIEWS</th>
                    <th className="px-5 py-3">30 DAYS</th>
                    <th className="px-5 py-3">CURRENT MONTH</th>
                    <th className="px-5 py-3">LAST MONTH</th>
                    <th className="px-5 py-3">LAST 3 MONTHS</th>
                    <th className="px-5 py-3">LAST 6 MONTHS</th>
                    <th className="px-5 py-3">LAST YEAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-mono text-xs">
                  {[
                    { name: 'Google', icon: 'G', rating: '3.56 ★', total: 16, d30: 3, cur: 2, last: 0, m3: 5, m6: 12, y1: 16 },
                    { name: 'Facebook', icon: 'f', rating: '4.33 ★', total: 9, d30: 1, cur: 0, last: 1, m3: 3, m6: 6, y1: 9 },
                    { name: 'Tripadvisor', icon: '🦉', rating: '3.7 ★', total: 16, d30: 1, cur: 1, last: 1, m3: 5, m6: 9, y1: 16 },
                    { name: 'ShowMeLocal', icon: '🏷️', rating: '4 ★', total: 3, d30: 1, cur: 1, last: 0, m3: 1, m6: 1, y1: 3 },
                    { name: 'FindOpen', icon: '📍', rating: '3.67 ★', total: 3, d30: 2, cur: 2, last: 0, m3: 2, m6: 2, y1: 3 },
                    { name: 'WhereTo', icon: '🧭', rating: '1 ★', total: 2, d30: 0, cur: 0, last: 0, m3: 0, m6: 2, y1: 2 },
                    { name: 'N49', icon: '🍁', rating: '5 ★', total: 2, d30: 1, cur: 1, last: 0, m3: 1, m6: 1, y1: 2 },
                    { name: 'Ezlocal', icon: '🌐', rating: '3 ★', total: 3, d30: 1, cur: 1, last: 1, m3: 2, m6: 2, y1: 3 },
                    { name: "Judy's Book", icon: '📖', rating: '2 ★', total: 2, d30: 2, cur: 2, last: 0, m3: 2, m6: 2, y1: 2 },
                    { name: 'City squares', icon: '🏙️', rating: '4.75 ★', total: 4, d30: 2, cur: 2, last: 0, m3: 3, m6: 4, y1: 4 },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-900 font-sans flex items-center gap-2">
                        <span>{row.icon}</span>
                        <span>{row.name}</span>
                      </td>
                      <td className="px-5 py-3 text-amber-500 font-bold">{row.rating}</td>
                      <td className="px-5 py-3 font-bold text-gray-900">{row.total}</td>
                      <td className="px-5 py-3">{row.d30}</td>
                      <td className="px-5 py-3">{row.cur}</td>
                      <td className="px-5 py-3">{row.last}</td>
                      <td className="px-5 py-3">{row.m3}</td>
                      <td className="px-5 py-3">{row.m6}</td>
                      <td className="px-5 py-3">{row.y1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'all-locations' && (
        <AllLocationsView onAddLocation={() => setIsAddLocationModalOpen(true)} />
      )}

      {/* TAB: LOCAL RANKINGS (Interactive Local Grid Rank Tracker) */}
      {activeTab === 'rankings' && (
        <LocalRankingsView onAddLocation={() => setIsAddLocationModalOpen(true)} />
      )}

      {/* TAB: GBP INSIGHTS */}
      {activeTab === 'gbp-insights' && (
        <GbpInsightsView onAddLocation={() => setIsAddLocationModalOpen(true)} />
      )}

      {/* TAB: GBP POSTS */}
      {activeTab === 'gbp-posts' && (
        <GbpPostsView />
      )}

      {/* TAB: INSIGHTS */}
      {activeTab === 'insights' && (
        <InsightsView
          reviews={reviewsList}
          onSelectReview={(rev: any) => setActiveReviewModal(rev)}
        />
      )}



      {/* Review Detail Modal (`👁 View`) */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeReviewModal.sourceIcon}</span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{activeReviewModal.source} Review</h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {activeReviewModal.date} • {activeReviewModal.author} ({activeReviewModal.language})
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="text-amber-400 text-sm">
                  {activeReviewModal.rating !== null ? (
                    <span>{'★'.repeat(activeReviewModal.rating)}{'☆'.repeat(5 - activeReviewModal.rating)}</span>
                  ) : (
                    <span className="text-gray-400">☆ Not rated</span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                  {activeReviewModal.status}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 leading-relaxed italic">
                "{activeReviewModal.text}"
              </div>

              {activeReviewModal.reply && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-900 text-[11px]">Official Business Response:</div>
                  <p className="text-blue-800 text-xs">{activeReviewModal.reply}</p>
                </div>
              )}

              {/* Reply Box */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700">Write or Generate Response:</label>
                  <button
                    onClick={() => {
                      setReviewReplyText(
                        `Hi ${activeReviewModal.author}, thank you for dining with us at Folk Osteria! We deeply value your feedback and look forward to welcoming you back soon.`
                      );
                    }}
                    className="text-[11px] text-[#0B69FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#0B69FF]" />
                    <span>Auto-generate AI Reply</span>
                  </button>
                </div>
                <textarea
                  value={reviewReplyText}
                  onChange={(e) => setReviewReplyText(e.target.value)}
                  placeholder="Type your official reply to this customer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B69FF] text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveReviewModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Reply published to ' + activeReviewModal.source);
                  setActiveReviewModal(null);
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer"
              >
                Publish Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth & Business Profile Location Connection Modal */}
      <AddLocationGoogleModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onLocationAdded={handleGlobalLocationAdded}
      />

      {/* Universal Local Marketing Export Data Modal matching Screenshot 2 */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={exportConfig.title}
        filenamePrefix={exportConfig.filenamePrefix}
        columns={exportConfig.columns}
        rows={exportConfig.rows}
      />
    </div>
  );
}

export default function LocalMarketingSuitePage({ initialTab = 'all-locations' }: { initialTab?: LocalMarketingTab }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading Local Marketing...</div>}>
      <LocalMarketingContent initialTab={initialTab} />
    </Suspense>
  );
}

