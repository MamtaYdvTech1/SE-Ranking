'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  RefreshCw,
  Upload,
  MoreVertical,
  ChevronDown,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';
import { ExportDataModal } from '@/components/modals/ExportDataModal';

// ==============================================================================
// 1. AUTHENTIC VECTOR COUNTRY FLAGS (Pixel-perfect for SE Ranking)
// ==============================================================================

export function USFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[2px] shadow-xs border border-black/15 inline-block object-cover`}
      viewBox="0 0 640 480"
      aria-label="USA Flag"
    >
      <g fillRule="evenodd">
        {/* 13 Stripes */}
        <path fill="#bd3d44" d="M0 0h640v480H0z" />
        <path
          stroke="#fff"
          strokeWidth="37"
          d="M0 55.5h640M0 129h640M0 203h640M0 277h640M0 351h640M0 424.5h640"
        />
        {/* Canton */}
        <path fill="#192f5d" d="M0 0h260v259H0z" />
        {/* 50 Stars in staggered grid */}
        <g fill="#fff">
          {[
            [25, 20], [70, 20], [115, 20], [160, 20], [205, 20], [250, 20],
            [47, 46], [92, 46], [137, 46], [182, 46], [227, 46],
            [25, 72], [70, 72], [115, 72], [160, 72], [205, 72], [250, 72],
            [47, 98], [92, 98], [137, 98], [182, 98], [227, 98],
            [25, 124], [70, 124], [115, 124], [160, 124], [205, 124], [250, 124],
            [47, 150], [92, 150], [137, 150], [182, 150], [227, 150],
            [25, 176], [70, 176], [115, 176], [160, 176], [205, 176], [250, 176],
            [47, 202], [92, 202], [137, 202], [182, 202], [227, 202],
            [25, 228], [70, 228], [115, 228], [160, 228], [205, 228], [250, 228],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="6" />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function SpainFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[2px] shadow-xs border border-black/15 inline-block object-cover`}
      viewBox="0 0 750 500"
      aria-label="Spain Flag"
    >
      <g fillRule="evenodd">
        {/* Flag Stripes: Red - Gold - Red */}
        <rect width="750" height="500" fill="#AA151B" />
        <rect y="125" width="750" height="250" fill="#F1BF00" />
        {/* Authentic Spanish Coat of Arms */}
        <g transform="translate(170, 170) scale(0.72)">
          {/* Crown */}
          <path d="M 20,15 L 35,-5 L 50,15 L 65,-5 L 80,15 Z" fill="#AA151B" />
          <circle cx="35" cy="-5" r="4" fill="#F1BF00" />
          <circle cx="65" cy="-5" r="4" fill="#F1BF00" />
          <circle cx="50" cy="-10" r="5" fill="#F1BF00" />
          <rect x="15" y="15" width="70" height="8" rx="2" fill="#F1BF00" />
          {/* Pillars of Hercules */}
          <rect x="-8" y="25" width="10" height="95" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <rect x="98" y="25" width="10" height="95" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          {/* Shield */}
          <path d="M 15,25 L 85,25 L 85,75 Q 85,115 50,125 Q 15,115 15,75 Z" fill="#AA151B" />
          <path d="M 20,30 L 80,30 L 80,72 Q 80,108 50,118 Q 20,108 20,72 Z" fill="#F1BF00" />
          {/* Shield details */}
          <rect x="23" y="33" width="25" height="36" fill="#AA151B" />
          <rect x="52" y="71" width="25" height="36" fill="#AA151B" />
          <circle cx="50" cy="71" r="7" fill="#0038A8" stroke="#F1BF00" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}

// ==============================================================================
// 2. AUTHENTIC YELLOW STAR RATING (Exact SE Ranking #FFB800)
// ==============================================================================

function StarFull() {
  return (
    <svg className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800] shrink-0" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function StarHalf() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="yellowStarHalfGrad" x1="0" x2="100%" y1="0" y2="0">
          <stop offset="50%" stopColor="#FFB800" />
          <stop offset="50%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>
      <path
        fill="url(#yellowStarHalfGrad)"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}

function StarEmpty() {
  return (
    <svg className="w-3.5 h-3.5 text-[#CBD5E1] fill-[#CBD5E1] shrink-0" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export function RealYellowStars({ rating }: { rating: number }) {
  // Matches SE Ranking logic exactly:
  // e.g. 3.8: 3 full, 1 half, 1 empty
  // e.g. 4.3: 4 full, 1 half, 0 empty
  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;
  const showHalf = remainder >= 0.25 && remainder <= 0.8;
  const isFullRound = remainder > 0.8;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<StarFull key={i} />);
    } else if (i === fullStars) {
      if (showHalf) {
        stars.push(<StarHalf key={i} />);
      } else if (isFullRound) {
        stars.push(<StarFull key={i} />);
      } else {
        stars.push(<StarEmpty key={i} />);
      }
    } else {
      stars.push(<StarEmpty key={i} />);
    }
  }

  return <div className="flex items-center gap-[1.5px]">{stars}</div>;
}

// ==============================================================================
// 3. TYPES & DATA
// ==============================================================================

export interface LocationRecord {
  id: string;
  name: string;
  country: string;
  flag: 'US' | 'ES';
  address: string;
  serviceArea: string;
  phone: string;
  score: number;
  listings: string;
  rating: number;
  reviews: number;
  updated: string;
  isDemo: boolean;
}

interface AllLocationsViewProps {
  onAddLocation: () => void;
  externalExportOpen?: boolean;
  onExternalExportClose?: () => void;
}

export function AllLocationsView({
  onAddLocation,
  externalExportOpen = false,
  onExternalExportClose,
}: AllLocationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [locations, setLocations] = useState<LocationRecord[]>([
    {
      id: 'loc-1',
      name: 'Folk Osteria',
      country: 'USA',
      flag: 'US',
      address: 'Highland Dr., Holladay, NY, 84117 USA',
      serviceArea: '-',
      phone: '1 801-843-9517',
      score: 85,
      listings: '57/66',
      rating: 3.8,
      reviews: 60,
      updated: 'Sep-30 2026',
      isDemo: true,
    },
    {
      id: 'loc-2',
      name: 'Salón Nova',
      country: 'Spain',
      flag: 'ES',
      address: "Carrer de San Mateo, 83, L'Eixample, Valencia, Valencia, 46004 Spain",
      serviceArea: '-',
      phone: '963 39 14 07',
      score: 90,
      listings: '38/41',
      rating: 4.3,
      reviews: 30,
      updated: 'Sep-30 2026',
      isDemo: true,
    },
  ]);

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations.map((l) => l.id));
    }
  };

  const handleDeleteLocation = (id: string, name: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setOpenMenuId(null);
    showToast(`Location "${name}" removed successfully.`);
  };

  // Prepare data for universal real export (PDF, Excel .xls, CSV)
  const exportColumns = [
    'Company',
    'Country',
    'Address',
    'Service Area',
    'Phone',
    'Score',
    'Business Listings',
    'Rating',
    'Reviews',
    'Location updated on',
  ];

  const exportRows = filteredLocations.map((loc) => [
    loc.name,
    loc.country,
    loc.address,
    loc.serviceArea,
    loc.phone,
    `${loc.score}/100`,
    loc.listings,
    loc.rating,
    loc.reviews,
    loc.updated,
  ]);

  const modalOpen = isExportModalOpen || externalExportOpen;
  const handleCloseModal = () => {
    setIsExportModalOpen(false);
    if (onExternalExportClose) onExternalExportClose();
  };

  return (
    <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 space-y-4 font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOP CONTROLS: "All Locations" + [Add location | Update | Export] */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-[20px] font-bold text-[#1E293B] tracking-tight">All Locations</h2>

        <div className="flex items-center gap-2.5">
          {/* 1. Add Location (Solid Blue with Chevron) */}
          <button
            type="button"
            onClick={onAddLocation}
            className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ADD LOCATION</span>
            <ChevronDown className="w-3 h-3 text-white/80 ml-0.5" />
          </button>

          {/* 2. Update (Table Style with Chevron) */}
          <button
            type="button"
            onClick={() => showToast('Locations update initiated successfully.')}
            className="px-3.5 py-2 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-gray-100 text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>UPDATE</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] ml-0.5" />
          </button>

          {/* 3. Export (Table Style with Chevron) */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-[#1E293B] rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>EXPORT</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIFIED WHITE CARD: Search, Table, and Placeholder              */}
      {/* ============================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden">
        {/* Search Row */}
        <div className="p-4 pb-3.5">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B] placeholder:text-gray-400 focus:outline-hidden focus:border-[#0B69FF] bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Locations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBFD] text-[#8C9BA5] border-y border-[#E2E8F0] font-semibold text-[11px] uppercase tracking-wider select-none">
              <tr>
                {/* 1. Company */}
                <th className="p-3 pl-4 w-60 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLocations.length === locations.length && locations.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[#1E293B] font-bold">COMPANY</span>
                    <span className="text-[#8C9BA5] font-normal">({locations.length})</span>
                  </div>
                </th>

                {/* 2. Address */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">ADDRESS</th>

                {/* 3. Service Area */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">SERVICE AREA</th>

                {/* 4. Phone */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">PHONE</th>

                {/* 5. Score */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">
                  <div className="flex items-center gap-1">
                    <span>SCORE</span>
                    <span
                      title="Local audit health score out of 100"
                      className="w-3.5 h-3.5 rounded-full bg-gray-200 text-[#64748B] text-[9px] flex items-center justify-center font-serif italic cursor-help"
                    >
                      i
                    </span>
                  </div>
                </th>

                {/* 6. Business Listings */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">
                  <div className="flex items-center gap-1">
                    <span>BUSINESS LISTINGS</span>
                    <span
                      title="Active local listings over total available directories"
                      className="w-3.5 h-3.5 rounded-full bg-gray-200 text-[#64748B] text-[9px] flex items-center justify-center font-serif italic cursor-help"
                    >
                      i
                    </span>
                  </div>
                </th>

                {/* 7. Rating */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">
                  <div className="flex items-center gap-1">
                    <span>RATING</span>
                    <span
                      title="Aggregate customer star rating across connected profiles"
                      className="w-3.5 h-3.5 rounded-full bg-gray-200 text-[#64748B] text-[9px] flex items-center justify-center font-serif italic cursor-help"
                    >
                      i
                    </span>
                  </div>
                </th>

                {/* 8. Reviews */}
                <th className="p-3 whitespace-nowrap text-[#8C9BA5]">
                  <div className="flex items-center gap-1">
                    <span>REVIEWS</span>
                    <span
                      title="Total review count across connected directories"
                      className="w-3.5 h-3.5 rounded-full bg-gray-200 text-[#64748B] text-[9px] flex items-center justify-center font-serif italic cursor-help"
                    >
                      i
                    </span>
                  </div>
                </th>

                {/* 9. Location updated on */}
                <th className="p-3 pr-5 whitespace-nowrap text-[#8C9BA5]">LOCATION UPDATED ON</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocations.includes(loc.id);
                const isMenuOpen = openMenuId === loc.id;

                return (
                  <tr key={loc.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* 1. Company Cell */}
                    <td className="p-3 pl-4 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(loc.id)}
                            className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/local-marketing?tab=overview&id=${loc.id}`}
                                className="font-semibold text-[#0B69FF] hover:underline text-[13.5px]"
                              >
                                {loc.name}
                              </Link>
                            </div>
                            <div className="text-[11.5px] text-[#8C9BA5] mt-0.5">{loc.country}</div>
                          </div>
                        </div>

                        {/* Tools Menu Toggler (⋮) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(isMenuOpen ? null : loc.id)}
                            className="p-1 rounded border border-[#E2E8F0] text-[#8C9BA5] hover:text-[#1E293B] hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Actions menu"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu matching uploaded_media_1791177158571.png 1:1 */}
                          {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#CBD5E1] rounded-md shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  showToast(`Editing location info for ${loc.name}...`);
                                }}
                                className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-[#1E293B] cursor-pointer font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                                <span>Edit location info</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLocation(loc.id, loc.name)}
                                className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 hover:bg-red-50 text-[#DC2626] cursor-pointer font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                <span>Delete location</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Address Cell (Real Country Flag + Full Address) */}
                    <td className="p-3 whitespace-nowrap text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        {loc.flag === 'US' ? <USFlag /> : <SpainFlag />}
                        <span className="text-[13px]">{loc.address}</span>
                      </div>
                    </td>

                    {/* 3. Service Area Cell */}
                    <td className="p-3 whitespace-nowrap text-[#8C9BA5] text-center font-medium">
                      {loc.serviceArea}
                    </td>

                    {/* 4. Phone Cell */}
                    <td className="p-3 whitespace-nowrap font-mono text-[13px] text-[#1E293B]">
                      {loc.phone}
                    </td>

                    {/* 5. Score Cell (Blue Progress Bar + Score/100) */}
                    <td className="p-3 whitespace-nowrap">
                      <Link
                        href={`/local-marketing?tab=audit&id=${loc.id}`}
                        className="flex items-center gap-2.5 group-hover:opacity-90"
                      >
                        <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0B69FF] rounded-full transition-all duration-300"
                            style={{ width: `${loc.score}%` }}
                          />
                        </div>
                        <span className="text-xs">
                          <b className="text-[#1E293B] font-bold">{loc.score}</b>
                          <span className="text-[#8C9BA5]"> /100</span>
                        </span>
                      </Link>
                    </td>

                    {/* 6. Business Listings Cell */}
                    <td className="p-3 whitespace-nowrap text-right">
                      <Link
                        href="/local-marketing?tab=listings"
                        className="text-[13px] text-[#1E293B] hover:text-[#0B69FF] font-medium"
                      >
                        {loc.listings}
                      </Link>
                    </td>

                    {/* 7. Rating Cell (Decimal Value + Real Yellow Stars) */}
                    <td className="p-3 whitespace-nowrap">
                      <Link
                        href={`/local-marketing?tab=reviews&id=${loc.id}`}
                        className="flex items-center gap-2 hover:opacity-90"
                      >
                        <span className="font-bold text-[13px] text-[#1E293B]">{loc.rating}</span>
                        <RealYellowStars rating={loc.rating} />
                      </Link>
                    </td>

                    {/* 8. Reviews Cell */}
                    <td className="p-3 whitespace-nowrap text-right">
                      <Link
                        href="/local-marketing?tab=reviews"
                        className="text-[13px] text-[#1E293B] hover:text-[#0B69FF] font-medium"
                      >
                        {loc.reviews}
                      </Link>
                    </td>

                    {/* 9. Location Updated On Cell */}
                    <td className="p-3 pr-5 whitespace-nowrap text-[12.5px] text-[#64748B]">
                      {loc.updated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Horizontal Scroll Track Indicator */}
        <div className="h-1.5 bg-[#F8FAFC] border-t border-[#E2E8F0] w-full" />

        {/* ============================================================== */}
        {/* ADD YOUR LOCATIONS PLACEHOLDER SECTION (Clean 1:1 SE Ranking)  */}
        {/* ============================================================== */}
        <div className="py-12 px-6 text-center space-y-3 bg-white">
          <h3 className="font-bold text-[18px] text-[#1E293B] tracking-tight">Add your locations</h3>
          <p className="text-xs text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Connect your Google Business Profiles to the system to track the businesses’ local rankings, manage listings and reviews, get GBP stats, and make GBP posts.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onAddLocation}
              className="px-5 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD LOCATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIVERSAL REAL EXPORT MODAL (PDF 1.4, Excel .xls, CSV)          */}
      {/* ============================================================== */}
      <ExportDataModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="All Locations"
        filenamePrefix="local_marketing_all_locations"
        columns={exportColumns}
        rows={exportRows}
        onSuccess={(fmt) => {
          showToast(`Locations successfully exported as ${fmt.toUpperCase()}!`);
        }}
      />
    </div>
  );
}
