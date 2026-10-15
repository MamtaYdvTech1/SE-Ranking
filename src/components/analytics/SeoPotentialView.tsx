'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/components/providers/AppProviders';
import { Check, X, ChevronDown, Download, Info } from 'lucide-react';

interface EngineCalculation {
  id: string;
  engine: string;
  country: string;
  countryCode: string;
  currentTrafficForecast: number;
  currentTrafficCost: number;
  currentNumberOfClients: number;
  currentEstimatedIncome: number;
  estimatedTrafficForecast: number;
  estimatedTrafficCost: number;
  estimatedNumberOfClients: number;
  estimatedIncome: number;
}

export function SeoPotentialView() {
  const { activeProject } = useApp();
  const currentProject = activeProject || null;
  const projectId = currentProject?.id;

  // Conversion into sales (e.g. 1:100)
  const [conversionDenominator, setConversionDenominator] = useState<string>('100');
  const [isEditingConversion, setIsEditingConversion] = useState(false);
  const [tempConversion, setTempConversion] = useState('100');

  // Average revenue per customer (e.g. 50)
  const [avgRevenue, setAvgRevenue] = useState<string>('50');
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [tempRevenue, setTempRevenue] = useState('50');

  // Estimated top (default 10)
  const [estimatedTop, setEstimatedTop] = useState<number>(10);
  const [isEditingTop, setIsEditingTop] = useState(false);
  const [tempTop, setTempTop] = useState('10');

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Engine calculations list
  const [engines, setEngines] = useState<EngineCalculation[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 1. Fetch real SEO potential data from backend
  const fetchData = async () => {
    if (!projectId) {
      setEngines([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = `/api/analytics/seo-potential?projectId=${encodeURIComponent(projectId)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (data.conversionDenominator) {
          setConversionDenominator(String(data.conversionDenominator));
          setTempConversion(String(data.conversionDenominator));
        }
        if (data.avgRevenue != null) {
          setAvgRevenue(String(data.avgRevenue));
          setTempRevenue(String(data.avgRevenue));
        }
        if (data.estimatedTop != null) {
          setEstimatedTop(data.estimatedTop);
          setTempTop(String(data.estimatedTop));
        }
        setEngines(Array.isArray(data.engines) ? data.engines : []);
      } else {
        setEngines([]);
      }
    } catch (err: any) {
      console.warn('Error fetching SEO potential backend:', err);
      setEngines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Recalculate tables locally whenever conversion, revenue, or top changes
  const recalculateMetrics = (denom: number, rev: number, topVal: number) => {
    setEngines((prev) =>
      prev.map((e) => {
        const curTraffic = e.currentTrafficForecast || 26;
        const curClients = Math.floor(curTraffic / denom);
        const curIncome = curClients * rev;

        // Scale expected traffic based on estimated top (e.g. top 10 = 58, top 5 = 85, top 3 = 110, top 1 = 160)
        let expTraffic = e.estimatedTrafficForecast || 58;
        if (topVal <= 1) expTraffic = Math.round(curTraffic * 5.5);
        else if (topVal <= 3) expTraffic = Math.round(curTraffic * 3.8);
        else if (topVal <= 5) expTraffic = Math.round(curTraffic * 2.8);
        else if (topVal <= 10) expTraffic = Math.round(curTraffic * 2.2);
        else expTraffic = Math.round(curTraffic * 1.5);

        const expClients = Math.max(1, Math.round(expTraffic / denom));
        const expIncome = expClients * rev;

        return {
          ...e,
          currentNumberOfClients: curClients,
          currentEstimatedIncome: curIncome,
          estimatedTrafficForecast: expTraffic,
          estimatedNumberOfClients: expClients,
          estimatedIncome: expIncome,
        };
      })
    );
  };

  // 2. Save settings to backend
  const handleSaveSettings = async (newDenomStr: string, newRevStr: string, newTopNum: number) => {
    const denom = Number(newDenomStr) || 100;
    const rev = Number(newRevStr) || 50;
    const topVal = Number(newTopNum) || 10;

    recalculateMetrics(denom, rev, topVal);

    try {
      await fetch('/api/analytics/seo-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          conversionRatio: `1:${denom}`,
          avgRevenue: rev,
          estimatedTop: topVal,
        }),
      });
      showToast('Calculations updated and saved to project');
    } catch {
      // ignore
    }
  };

  // Apply Conversion
  const handleApplyConversion = () => {
    const clean = tempConversion.trim().replace(/^1:/, '');
    setConversionDenominator(clean);
    setIsEditingConversion(false);
    handleSaveSettings(clean, avgRevenue, estimatedTop);
  };

  // Apply Revenue
  const handleApplyRevenue = () => {
    const clean = tempRevenue.trim().replace(/^\$/, '');
    setAvgRevenue(clean);
    setIsEditingRevenue(false);
    handleSaveSettings(conversionDenominator, clean, estimatedTop);
  };

  // Apply Estimated Top
  const handleApplyTop = (newVal: string) => {
    const num = Math.max(1, Math.min(100, Number(newVal) || 10));
    setEstimatedTop(num);
    setTempTop(String(num));
    setIsEditingTop(false);
    handleSaveSettings(conversionDenominator, avgRevenue, num);
  };

  // Export Handler
  const handleExport = (format: 'CSV' | 'PDF' | 'XLSX') => {
    setIsExportOpen(false);
    showToast(`Exporting SEO potential report (${format})...`);

    // Generate CSV content
    const headers = [
      'Search Engine',
      'Country',
      'Current Traffic Forecast',
      'Current Traffic Cost ($)',
      'Current Number of Clients',
      'Current Estimated Income ($)',
      'Top ' + estimatedTop + ' Traffic Forecast',
      'Top ' + estimatedTop + ' Traffic Cost ($)',
      'Top ' + estimatedTop + ' Number of Clients',
      'Top ' + estimatedTop + ' Estimated Income ($)',
    ];

    const rows = engines.map((e) => [
      e.engine,
      e.country,
      e.currentTrafficForecast,
      e.currentTrafficCost,
      e.currentNumberOfClients,
      e.currentEstimatedIncome,
      e.estimatedTrafficForecast,
      e.estimatedTrafficCost,
      e.estimatedNumberOfClients,
      e.estimatedIncome,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `seo_potential_${currentProject?.domain || 'project'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">No project selected</p>
        <p className="text-xs text-gray-500 mt-1">Please select an active project to view SEO potential forecasts.</p>
      </div>
    );
  }

  return (
    <div className="section-panel traffic-opportunity bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 font-sans select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP SECTION: TITLE & EXPORT BUTTON */}
      <div className="top-page-section">
        <div className="top-page-section__box top-page-section__top flex items-center justify-between pb-2">
          <h2 className="top-page-section__title top-page-section__top-left text-xl sm:text-2xl font-bold text-[#1A202C] tracking-tight">
            SEO potential
          </h2>

          <div className="top-page-section__top-right relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="se-button-2_size-l se-button-2 se-button-2_table h-9 px-3.5 bg-white hover:bg-gray-50 border border-[#D8DCE6] text-[#4A5568] hover:text-[#1A202C] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="se-button-2__wrapper flex items-center gap-2">
                <i
                  className="se-button-2__icon-custom w-4 h-4 bg-contain bg-no-repeat bg-center inline-block shrink-0"
                  style={{
                    backgroundImage: 'url("/frontend-dist/AnalyticsAndTraffic/img/export.XFVoJdTz.svg")',
                  }}
                />
                <span className="se-button-2__text">Export</span>
                <span className="se-button-2__arrow">
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </span>
              </span>
            </button>

            {/* Export Dropdown Menu */}
            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => handleExport('CSV')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('XLSX')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('PDF')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-rose-500" />
                  <span>Export as PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP TABLE CONTROLS: 2 COLORED METRIC CARDS MATCHING SCREENSHOT EXACTLY */}
      <div className="traffic-opportunity__top-table-controls grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: BLUE CARD - Conversion into sales */}
        <div
          className="input-block rounded-xl p-5 text-white flex items-center justify-between shadow-xs transition-shadow"
          style={{ backgroundColor: 'rgb(78, 113, 251)' }}
        >
          <div className="input-block__description flex items-center gap-3.5">
            <div className="input-block__description-icon icon-conversion w-9 h-9 rounded-full border-2 border-white/90 flex items-center justify-center font-bold text-lg text-white shrink-0">
              $
            </div>
            <div className="input-block__description-text text-sm sm:text-[15px] font-semibold tracking-wide text-white">
              Сonversion into sales
            </div>
          </div>

          <div className="input-block__input-area">
            <div className="confirm-box bg-white/20 hover:bg-white/25 border border-white/30 rounded-lg px-3.5 py-1.5 flex items-center gap-2 transition-colors">
              <div className="confirm-box__label text-xl sm:text-2xl font-bold text-white tracking-tight select-none">
                1:
              </div>

              <input
                data-locator="traffic_opportunity.table.confirm_box.input"
                type="text"
                value={isEditingConversion ? tempConversion : conversionDenominator}
                onFocus={() => {
                  setIsEditingConversion(true);
                  setTempConversion(conversionDenominator);
                }}
                onChange={(e) => setTempConversion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyConversion();
                  if (e.key === 'Escape') setIsEditingConversion(false);
                }}
                className="confirm-box__input input-block__input-area-field w-16 sm:w-20 text-xl sm:text-2xl font-bold text-white bg-transparent outline-none border-none p-0 focus:ring-0"
              />

              <div className="confirm-box__icon">
                <span className="se-icon-2 flex items-center">
                  <span
                    className="se-icon-2__body w-4 h-4 bg-contain bg-no-repeat bg-center inline-block opacity-80 hover:opacity-100 cursor-pointer"
                    style={{
                      backgroundImage:
                        'url("/frontend-dist/AnalyticsAndTraffic/img/icon-edit-2.CkuoLWL5.svg")',
                    }}
                    onClick={() => {
                      setIsEditingConversion(true);
                      setTempConversion(conversionDenominator);
                    }}
                  />
                </span>
              </div>

              {/* Confirm / Cancel Buttons when active */}
              {isEditingConversion && (
                <div className="confirm-box__buttons flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={handleApplyConversion}
                    className="se-button-small-2 confirm-box__buttons-btn w-6 h-6 rounded bg-white text-[#4E71FB] hover:bg-gray-100 flex items-center justify-center cursor-pointer shadow-xs transition"
                    title="Apply conversion"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingConversion(false)}
                    className="se-button-small-2 confirm-box__buttons-btn w-6 h-6 rounded bg-white/20 text-white hover:bg-white/30 flex items-center justify-center cursor-pointer transition"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: GREEN CARD - Average revenue per customer */}
        <div
          className="input-block rounded-xl p-5 text-white flex items-center justify-between shadow-xs transition-shadow"
          style={{ backgroundColor: 'rgb(54, 179, 126)' }}
        >
          <div className="input-block__description flex items-center gap-3.5">
            <div className="input-block__description-icon icon-lead w-9 h-9 rounded-lg border-2 border-white/90 flex flex-col justify-center px-1.5 gap-0.5 shrink-0">
              <span className="w-full h-1 bg-white/90 rounded-xs" />
              <span className="w-3/4 h-1 bg-white/90 rounded-xs" />
            </div>
            <div className="input-block__description-text text-sm sm:text-[15px] font-semibold tracking-wide text-white">
              Average revenue per customer
            </div>
          </div>

          <div className="input-block__input-area">
            <div className="confirm-box bg-white/20 hover:bg-white/25 border border-white/30 rounded-lg px-3.5 py-1.5 flex items-center gap-2 transition-colors">
              <input
                data-locator="traffic_opportunity.table.confirm_box.input"
                type="text"
                value={isEditingRevenue ? tempRevenue : avgRevenue}
                onFocus={() => {
                  setIsEditingRevenue(true);
                  setTempRevenue(avgRevenue);
                }}
                onChange={(e) => setTempRevenue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyRevenue();
                  if (e.key === 'Escape') setIsEditingRevenue(false);
                }}
                className="confirm-box__input input-block__input-area-field w-16 sm:w-20 text-xl sm:text-2xl font-bold text-white bg-transparent outline-none border-none p-0 focus:ring-0 text-right sm:text-left"
              />

              <div className="confirm-box__icon">
                <span className="se-icon-2 flex items-center">
                  <span
                    className="se-icon-2__body w-4 h-4 bg-contain bg-no-repeat bg-center inline-block opacity-80 hover:opacity-100 cursor-pointer"
                    style={{
                      backgroundImage:
                        'url("/frontend-dist/AnalyticsAndTraffic/img/icon-edit-2.CkuoLWL5.svg")',
                    }}
                    onClick={() => {
                      setIsEditingRevenue(true);
                      setTempRevenue(avgRevenue);
                    }}
                  />
                </span>
              </div>

              {/* Confirm / Cancel Buttons when active */}
              {isEditingRevenue && (
                <div className="confirm-box__buttons flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={handleApplyRevenue}
                    className="se-button-small-2 confirm-box__buttons-btn w-6 h-6 rounded bg-white text-[#36B37E] hover:bg-gray-100 flex items-center justify-center cursor-pointer shadow-xs transition"
                    title="Apply revenue"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingRevenue(false)}
                    className="se-button-small-2 confirm-box__buttons-btn w-6 h-6 rounded bg-white/20 text-white hover:bg-white/30 flex items-center justify-center cursor-pointer transition"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CURRENT TRAFFIC ESTIMATE */}
      <div className="data-table-wrapper pt-4 space-y-3">
        <div className="data-table-wrapper__heading text-sm text-[#2D3748] font-normal tracking-tight">
          Current traffic estimate for all added keywords.
        </div>

        <div className="overflow-x-auto border-b border-gray-100">
          <table className="se-table-2 se-table-2_interactive data-table w-full text-left" cellPadding="0" cellSpacing="0">
            <thead>
              <tr className="se-table-row-2 border-b border-gray-200/80 text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold">
                  <div className="se-table-head-item-2__wrapper flex items-center gap-1">
                    <span>Search engine</span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Current traffic forecast</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Traffic estimate based on current rankings and estimated CTR">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Current traffic cost in $</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Estimated cost of equivalent traffic from Google Ads">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Current number of clients</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Calculated from traffic forecast multiplied by conversion into sales">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Estimated income</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Number of clients multiplied by average revenue per customer">
                      i
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {engines.map((item) => (
                <tr key={item.id} className="se-table-row-2 hover:bg-[#F8FAFC] transition-colors text-sm text-[#2D3748]">
                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 font-medium text-gray-900">
                    <div className="se-table-data-2__wrapper flex items-center gap-2">
                      <span className="se-icon-2 data-table__se-icon flex items-center shrink-0">
                        <span
                          className="se-icon-2__body w-4 h-4 bg-contain bg-no-repeat bg-center inline-block"
                          style={{
                            backgroundImage:
                              'url("/frontend-dist/AnalyticsAndTraffic/img/google.BtYk6Ig3.svg")',
                          }}
                        />
                      </span>

                      <div className="se-flag data-table__country-icon flex items-center shrink-0">
                        <span className="se-icon-2">
                          <span
                            className="se-icon-2__body w-[18px] h-[12px] bg-contain bg-no-repeat bg-center inline-block rounded-xs shadow-2xs"
                            style={{
                              backgroundImage:
                                'url("/frontend-dist/AnalyticsAndTraffic/img/IN.-Mlkyfup.svg")',
                            }}
                          />
                        </span>
                      </div>

                      <p title={item.country} className="se-p-2 data-table__value-wrap font-medium">
                        {item.country}
                      </p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">{item.currentTrafficForecast}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">${item.currentTrafficCost}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">{item.currentNumberOfClients}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">${item.currentEstimatedIncome}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: EXPECTED TRAFFIC VOLUME TOP 10 */}
      <div className="data-table-wrapper pt-6 space-y-3">
        <div className="data-table-wrapper__heading flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#2D3748]">
          <div className="flex items-center gap-1.5 font-normal tracking-tight">
            <span>
              Expected traffic volume provided that every keyword ranks among the top {estimatedTop} in search results.
            </span>
            <span
              className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help"
              title="Forecast calculated assuming all tracked keywords advance into top positions"
            >
              i
            </span>
          </div>

          <div className="seo-potential-table-wrap-heading-inputarea flex items-center gap-2">
            <p className="seo-potential-table-wrap-heading-inputarea__label text-xs font-medium text-gray-500">
              Estimated top:
            </p>
            <div className="confirm-box flex items-center gap-1">
              <input
                data-locator="traffic_opportunity.table.confirm_box.input"
                type="text"
                value={isEditingTop ? tempTop : estimatedTop}
                onFocus={() => {
                  setIsEditingTop(true);
                  setTempTop(String(estimatedTop));
                }}
                onChange={(e) => setTempTop(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyTop(tempTop);
                  if (e.key === 'Escape') setIsEditingTop(false);
                }}
                onBlur={() => handleApplyTop(tempTop)}
                className="confirm-box__input seo-potential-table-wrap-heading-inputarea__field w-14 h-8 px-2 text-center text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-md focus:border-[#4E71FB] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-b border-gray-100">
          <table className="se-table-2 se-table-2_interactive data-table w-full text-left" cellPadding="0" cellSpacing="0">
            <thead>
              <tr className="se-table-row-2 border-b border-gray-200/80 text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold">
                  <div className="se-table-head-item-2__wrapper flex items-center gap-1">
                    <span>Search engine</span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Estimated traffic forecast</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Potential traffic volume if all keywords achieve target rank">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Estimated traffic cost in $</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Value of expected organic traffic compared to paid search">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Estimated number of clients</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Expected clients with target rankings and conversion rate">
                      i
                    </span>
                  </div>
                </th>

                <th className="se-table-head-item-2 se-table-head-item-2_no-align data-table__heading-item py-3 px-4 font-bold text-center">
                  <div className="se-table-head-item-2__wrapper flex items-center justify-center gap-1">
                    <span>Estimated income</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help" title="Projected revenue from estimated new client acquisitions">
                      i
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {engines.map((item) => (
                <tr key={item.id} className="se-table-row-2 hover:bg-[#F8FAFC] transition-colors text-sm text-[#2D3748]">
                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 font-medium text-gray-900">
                    <div className="se-table-data-2__wrapper flex items-center gap-2">
                      <span className="se-icon-2 data-table__se-icon flex items-center shrink-0">
                        <span
                          className="se-icon-2__body w-4 h-4 bg-contain bg-no-repeat bg-center inline-block"
                          style={{
                            backgroundImage:
                              'url("/frontend-dist/AnalyticsAndTraffic/img/google.BtYk6Ig3.svg")',
                          }}
                        />
                      </span>

                      <div className="se-flag data-table__country-icon flex items-center shrink-0">
                        <span className="se-icon-2">
                          <span
                            className="se-icon-2__body w-[18px] h-[12px] bg-contain bg-no-repeat bg-center inline-block rounded-xs shadow-2xs"
                            style={{
                              backgroundImage:
                                'url("/frontend-dist/AnalyticsAndTraffic/img/IN.-Mlkyfup.svg")',
                            }}
                          />
                        </span>
                      </div>

                      <p title={item.country} className="se-p-2 data-table__value-wrap font-medium">
                        {item.country}
                      </p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">{item.estimatedTrafficForecast}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">${item.estimatedTrafficCost}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">{item.estimatedNumberOfClients}</p>
                    </div>
                  </td>

                  <td className="se-table-data-2 se-table-data-2_align-middle py-3.5 px-4 text-center font-normal">
                    <div className="se-table-data-2__wrapper">
                      <p className="se-p-2 data-table__value-wrap">${item.estimatedIncome}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
