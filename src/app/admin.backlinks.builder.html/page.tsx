'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/AppProviders';

interface CompetitorRow {
  id: string;
  type: '*.domain.com/*' | 'URL' | 'domain.com/*';
  url: string;
}

interface GapItem {
  domain: string;
  domainTrust: number;
  pageTrust: number;
  mainCount: number;
  compCounts: Record<string, number>;
  opportunityScore: 'High' | 'Medium' | 'Low';
  anchor: string;
  linkType: 'follow' | 'nofollow';
}

const TYPE_OPTIONS = [
  {
    value: '*.domain.com/*',
    label: '*.domain.com/*',
    sublabel: 'Domain with subdomains',
  },
  {
    value: 'URL',
    label: 'URL',
    sublabel: 'Exact URL',
  },
  {
    value: 'domain.com/*',
    label: 'domain.com/*',
    sublabel: 'Domain without subdomains',
  },
] as const;

export default function BacklinkGapAnalyzerPage() {
  const { activeProject } = useApp();

  // Dismissible notice
  const [showTopNotice, setShowTopNotice] = useState(true);

  // Main domain input & type
  const [mainType, setMainType] = useState<'*.domain.com/*' | 'URL' | 'domain.com/*'>(
    '*.domain.com/*'
  );
  const [isMainTypeDropdownOpen, setIsMainTypeDropdownOpen] = useState(false);
  const [mainDomain, setMainDomain] = useState(
    activeProject?.domain
      ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      : 'workcomposer.com'
  );

  // Competitor inputs
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([
    { id: 'comp-1', type: '*.domain.com/*', url: 'timecamp.com' },
  ]);
  const [openCompTypeDropdownId, setOpenCompTypeDropdownId] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'opportunities' | 'common' | 'all'>(
    'opportunities'
  );
  const [filterQuery, setFilterQuery] = useState('');

  const addCompetitor = () => {
    if (competitors.length >= 5) return;
    setCompetitors([
      ...competitors,
      {
        id: `comp-${Date.now()}`,
        type: '*.domain.com/*',
        url: competitors.length === 1 ? 'workco.com' : '',
      },
    ]);
  };

  const removeCompetitor = (id: string) => {
    if (competitors.length <= 1) return;
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id: string, field: 'type' | 'url', val: any) => {
    setCompetitors(
      competitors.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Mock Gap dataset based on real SEO competitive research
  const [gapData, setGapData] = useState<GapItem[]>([]);

  const handleRunAnalysis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mainDomain.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const comp1 = competitors[0]?.url || 'competitor.com';
      const comp2 = competitors[1]?.url || 'competitor2.com';

      const mockList: GapItem[] = [
        {
          domain: 'techcrunch.com',
          domainTrust: 93,
          pageTrust: 82,
          mainCount: 0,
          compCounts: { [comp1]: 4, [comp2]: 2 },
          opportunityScore: 'High',
          anchor: 'best remote team productivity tools',
          linkType: 'follow',
        },
        {
          domain: 'forbes.com',
          domainTrust: 91,
          pageTrust: 79,
          mainCount: 0,
          compCounts: { [comp1]: 6, [comp2]: 5 },
          opportunityScore: 'High',
          anchor: 'enterprise time tracking solution',
          linkType: 'follow',
        },
        {
          domain: 'g2.com',
          domainTrust: 89,
          pageTrust: 88,
          mainCount: 1,
          compCounts: { [comp1]: 14, [comp2]: 11 },
          opportunityScore: 'Medium',
          anchor: 'workcomposer reviews and alternatives',
          linkType: 'follow',
        },
        {
          domain: 'capterra.com',
          domainTrust: 88,
          pageTrust: 85,
          mainCount: 1,
          compCounts: { [comp1]: 9, [comp2]: 8 },
          opportunityScore: 'Medium',
          anchor: 'top rated screenshot tracker',
          linkType: 'follow',
        },
        {
          domain: 'hubspot.com',
          domainTrust: 92,
          pageTrust: 84,
          mainCount: 0,
          compCounts: { [comp1]: 3, [comp2]: 1 },
          opportunityScore: 'High',
          anchor: 'employee workflow automation',
          linkType: 'follow',
        },
        {
          domain: 'zapier.com',
          domainTrust: 90,
          pageTrust: 83,
          mainCount: 0,
          compCounts: { [comp1]: 5, [comp2]: 4 },
          opportunityScore: 'High',
          anchor: 'automatic activity recorder apps',
          linkType: 'follow',
        },
        {
          domain: 'pcmag.com',
          domainTrust: 87,
          pageTrust: 76,
          mainCount: 0,
          compCounts: { [comp1]: 2, [comp2]: 3 },
          opportunityScore: 'High',
          anchor: 'windows mac employee monitor',
          linkType: 'follow',
        },
        {
          domain: 'producthunt.com',
          domainTrust: 86,
          pageTrust: 81,
          mainCount: 1,
          compCounts: { [comp1]: 8, [comp2]: 6 },
          opportunityScore: 'Medium',
          anchor: 'workcomposer launch and features',
          linkType: 'nofollow',
        },
        {
          domain: 'medium.com',
          domainTrust: 84,
          pageTrust: 71,
          mainCount: 0,
          compCounts: { [comp1]: 7, [comp2]: 0 },
          opportunityScore: 'High',
          anchor: 'how we track remote developers',
          linkType: 'follow',
        },
      ];

      setGapData(mockList);
      setIsAnalyzing(false);
      setHasRunAnalysis(true);
    }, 600);
  };

  const filteredGapData = gapData.filter((item) => {
    if (filterQuery.trim() && !item.domain.toLowerCase().includes(filterQuery.toLowerCase())) {
      return false;
    }
    if (activeResultTab === 'opportunities') {
      return item.mainCount === 0;
    }
    if (activeResultTab === 'common') {
      return item.mainCount > 0;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#171B24] font-sans flex flex-col justify-between">
      <div>
        {/* ===================== TOP BLUE NOTICE BANNER (Matching Screenshot) ===================== */}
        {showTopNotice && (
          <div className="bg-[#EDF5FF] border-b border-[#BBD7FF] px-6 py-2.5 text-xs text-[#1E3A8A] flex items-center justify-between select-none shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 pr-6 leading-relaxed">
              <div className="w-4 h-4 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                i
              </div>
              <span>
                Backlink Gap Analyzer discovers domains/URLs that are already linking to your competitors but not to the main domain/URL, and finds backlinks that you have in common. It will help you build high-quality links, rank better in search engines, and drive more traffic to your website.
              </span>
            </div>
            <button
              onClick={() => setShowTopNotice(false)}
              className="text-[#1976D2]/70 hover:text-[#1976D2] p-1 cursor-pointer shrink-0 transition-colors"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* ===================== SUB-HEADER BAR (Matching Screenshot) ===================== */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-[#8C95A6]">
            Backlink Gap Analyzer
          </div>

          {/* Account Limit Badge (Matching Screenshot: yellow pill with clock icon) */}
          <div className="bg-[#FFF9E6] border border-[#FFE699] rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-[#92400E] shadow-2xs select-none">
            <svg className="w-3.5 h-3.5 text-[#B78103]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
            </svg>
            <span>Account limit 1 / 10</span>
            <span className="text-[#8C95A6] cursor-help font-bold text-[11px]" title="1 analysis per comparison">
              i
            </span>
          </div>
        </div>

        {/* ===================== MAIN CENTER FORM (Matching Screenshot) ===================== */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#171B24] tracking-tight">
              Backlink Gap Analyzer
            </h1>
          </div>

          <form onSubmit={handleRunAnalysis} className="space-y-4">
            
            {/* ROW 1: MAIN DOMAIN INPUT */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Type Dropdown */}
                <div className="sm:col-span-4 relative">
                  <label className="block text-xs font-medium text-[#344054] mb-1.5">
                    Type
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMainTypeDropdownOpen(!isMainTypeDropdownOpen);
                      setOpenCompTypeDropdownId(null);
                    }}
                    className="w-full bg-[#E5E9F0] hover:bg-[#DDE2EA] border border-[#D0D5DD] rounded-[6px] px-3 py-2 text-xs font-semibold text-[#171B24] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>{mainType}</span>
                    <svg
                      className={`w-3.5 h-3.5 text-[#667085] transition-transform ${
                        isMainTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu (Exact match to Screenshot 3) */}
                  {isMainTypeDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white border border-[#E2E8F0] rounded-[8px] shadow-xl py-1 z-30 text-xs">
                      {TYPE_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setMainType(opt.value);
                            setIsMainTypeDropdownOpen(false);
                          }}
                          className={`px-3 py-2 hover:bg-[#F2F5F8] cursor-pointer transition-colors ${
                            mainType === opt.value ? 'bg-[#F0F7FF]' : ''
                          }`}
                        >
                          <div className="font-bold text-[#171B24]">{opt.label}</div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">{opt.sublabel}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Domain Text Input */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-medium text-[#344054] mb-1.5">
                    The main domain/URL for comparison
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Domain/URL"
                    value={mainDomain}
                    onChange={(e) => setMainDomain(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#2870ED] bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: COMPETITORS INPUTS */}
            {competitors.map((comp, idx) => (
              <div key={comp.id}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Type Dropdown */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-xs font-medium text-[#344054] mb-1.5">
                      Type
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCompTypeDropdownId(
                          openCompTypeDropdownId === comp.id ? null : comp.id
                        );
                        setIsMainTypeDropdownOpen(false);
                      }}
                      className="w-full bg-[#E5E9F0] hover:bg-[#DDE2EA] border border-[#D0D5DD] rounded-[6px] px-3 py-2 text-xs font-semibold text-[#171B24] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>{comp.type}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-[#667085] transition-transform ${
                          openCompTypeDropdownId === comp.id ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openCompTypeDropdownId === comp.id && (
                      <div className="absolute left-0 mt-1 w-56 bg-white border border-[#E2E8F0] rounded-[8px] shadow-xl py-1 z-30 text-xs">
                        {TYPE_OPTIONS.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => {
                              updateCompetitor(comp.id, 'type', opt.value);
                              setOpenCompTypeDropdownId(null);
                            }}
                            className={`px-3 py-2 hover:bg-[#F2F5F8] cursor-pointer transition-colors ${
                              comp.type === opt.value ? 'bg-[#F0F7FF]' : ''
                            }`}
                          >
                            <div className="font-bold text-[#171B24]">{opt.label}</div>
                            <div className="text-[11px] text-[#64748B] mt-0.5">{opt.sublabel}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Competitor Domain Input */}
                  <div className="sm:col-span-8 relative">
                    <label className="block text-xs font-medium text-[#344054] mb-1.5">
                      Competitor&apos;s domain/URL {competitors.length > 1 ? `#${idx + 1}` : ''}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Domain/URL"
                        value={comp.url}
                        onChange={(e) => updateCompetitor(comp.id, 'url', e.target.value)}
                        className="w-full px-3.5 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#2870ED] bg-white transition-colors"
                      />
                      {competitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompetitor(comp.id)}
                          className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                          title="Remove competitor"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ACTION ROW: + Add competitor & limit text */}
            <div className="flex items-center justify-between pt-1">
              {competitors.length < 5 ? (
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="text-xs font-bold text-[#2870ED] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-bold leading-none">+</span>
                  <span>Add competitor</span>
                </button>
              ) : (
                <div />
              )}
              <span className="text-xs text-[#8C95A6]">
                You can add up to 5 competitors
              </span>
            </div>

            {/* ===================== SUBSCRIPTION INFO CARD (Matching Screenshot) ===================== */}
            <div className="bg-[#EDF5FF] border border-[#BBD7FF] rounded-[8px] p-3.5 sm:p-4 flex items-start gap-3 my-6 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                i
              </div>
              <div className="text-xs text-[#1E3A8A] leading-relaxed">
                Your subscription plan allows checking up to 10 domains/URLs per day. 1 domain/URL analysis equals 1 limit. Limits are shared between Backlink Checker and Backlink Gap Analyzer. Adding a domain/URL over the limit will cost you $1.
              </div>
            </div>

            {/* ===================== FOOTER SUBMIT ROW (Matching Screenshot) ===================== */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-semibold text-[#8C95A6]">
                Account limit <span className="font-bold text-[#171B24]">1 / 10</span>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-[#1976D2] hover:bg-[#1565C0] active:bg-[#0D47A1] text-white font-bold text-xs rounded-[6px] uppercase tracking-wider cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
              </button>
            </div>

          </form>

          {/* ===================== RESULTS TABLE SECTION ===================== */}
          {hasRunAnalysis && (
            <div className="mt-10 bg-white border border-[#E2E8F0] rounded-[8px] shadow-2xs overflow-hidden animate-in fade-in duration-300">
              
              {/* Results Top Bar */}
              <div className="p-4 border-b border-[#F0F2F5] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveResultTab('opportunities')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                      activeResultTab === 'opportunities'
                        ? 'bg-[#1976D2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Opportunities ({gapData.filter((i) => i.mainCount === 0).length})
                  </button>
                  <button
                    onClick={() => setActiveResultTab('common')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                      activeResultTab === 'common'
                        ? 'bg-[#1976D2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Common ({gapData.filter((i) => i.mainCount > 0).length})
                  </button>
                  <button
                    onClick={() => setActiveResultTab('all')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                      activeResultTab === 'all'
                        ? 'bg-[#1976D2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({gapData.length})
                  </button>
                </div>

                {/* Filter search */}
                <div className="relative w-48 sm:w-56">
                  <input
                    type="text"
                    placeholder="Filter domains..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] placeholder-gray-400 focus:outline-hidden focus:border-[#1976D2]"
                  />
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#667085] font-bold text-[11px] tracking-wide select-none">
                      <th className="py-2.5 px-4">REFERRING DOMAIN</th>
                      <th className="py-2.5 px-3 text-center">DOMAIN TRUST</th>
                      <th className="py-2.5 px-3 text-center">PAGE TRUST</th>
                      <th className="py-2.5 px-3 text-center truncate max-w-[130px]">
                        {mainDomain}
                      </th>
                      {competitors.map((c, i) => (
                        <th key={c.id} className="py-2.5 px-3 text-center truncate max-w-[130px]">
                          {c.url || `Competitor ${i + 1}`}
                        </th>
                      ))}
                      <th className="py-2.5 px-4">OPPORTUNITY</th>
                      <th className="py-2.5 px-4">COMMON ANCHOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {filteredGapData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#171B24]">
                          {row.domain}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#1976D2]">
                          {row.domainTrust}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600">
                          {row.pageTrust}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {row.mainCount === 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[10px]">
                              0 (Gap)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                              {row.mainCount} link
                            </span>
                          )}
                        </td>
                        {competitors.map((c) => (
                          <td key={c.id} className="py-3 px-3 text-center font-bold text-gray-800">
                            {row.compCounts[c.url] || row.compCounts['competitor.com'] || 2}
                          </td>
                        ))}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                              row.opportunityScore === 'High'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {row.opportunityScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-[180px]">
                          {row.anchor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3 border-t border-[#F0F2F5] flex items-center justify-between text-xs text-[#667085]">
                <span>Showing {filteredGapData.length} opportunities</span>
                <button
                  onClick={() => alert('Exporting Backlink Gap data to CSV...')}
                  className="px-3 py-1 border border-[#D0D5DD] hover:bg-gray-50 rounded-[6px] text-xs font-semibold text-[#344054] cursor-pointer"
                >
                  Export CSV
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer Utility padding */}
      <div className="py-4" />
    </div>
  );
}
