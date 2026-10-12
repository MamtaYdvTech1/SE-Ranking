'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  RefreshCw,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface LocalRankingsViewProps {
  onAddLocation: () => void;
}

interface LocationSummary {
  id: string;
  name: string;
  countryCode: string;
  city: string;
  address: string;
  googleVerified?: boolean;
}

export function LocalRankingsView({ onAddLocation }: LocalRankingsViewProps) {
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/local-marketing');
        if (res.ok) {
          const json = await res.json();
          const locs: LocationSummary[] = json.data?.locations || [];
          setLocations(locs);
          if (locs.length > 0) {
            setSelectedLocation(locs[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load local ranking locations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] min-h-screen font-sans">
      {/* Sub-Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Local Rankings</h1>

            {/* Location Selector */}
            {selectedLocation && (
              <div className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-2 shadow-2xs">
                <CountryFlag code={selectedLocation.countryCode} size="sm" />
                <span className="font-semibold text-gray-900 max-w-[200px] truncate">
                  {selectedLocation.name}
                </span>
                {selectedLocation.googleVerified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                    Verified
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddLocation}
              className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        {locations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto my-auto shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1054E2] flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                No Local Tracking Locations Connected
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Local rank tracking requires an active Google Business Profile connection or registered
                business locations to monitor local pack rankings and coordinate geo-grid visibility.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onAddLocation}
                className="px-5 py-2.5 bg-[#1054E2] hover:bg-[#0c44b8] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Location</span>
              </button>
              <a
                href="/api/auth/google"
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Connect Google Business Profile</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-2xl mx-auto my-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1054E2] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Geo-Grid Tracking for {selectedLocation?.name}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Geo-grid position monitoring tracks your ranking pin coordinates across local neighborhood
              search queries. Connect your Google Business Profile API integration to initiate live
              grid scans.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href="/api/auth/google"
                className="px-5 py-2 bg-[#1054E2] hover:bg-[#0c44b8] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Configure Live API Scan</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
