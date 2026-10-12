'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Trash2, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface HistoryItem {
  id: string;
  domain: string;
  brandName?: string;
  country: string;
  countryCode: string;
  aiPresence?: number;
  status: string;
  createdAt: string;
}

export default function AnalysisHistoryPage() {
  const router = useRouter();
  const { setCurrentAnalysis } = useApp();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-search/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setHistory([json.data]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpen = async (item: HistoryItem) => {
    try {
      const res = await fetch(`/api/ai-search/overview?id=${item.id}`);
      if (res.ok) {
        const json = await res.json();
        setCurrentAnalysis(json.data);
        router.push('/research/ai-search');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] p-6 text-gray-900 select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Search Analysis History</h1>
            <p className="text-xs text-gray-500">View past runs and historical AI presence audits</p>
          </div>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            No analyses executed yet. Run an analysis from the AI Search start form.
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Domain</th>
                  <th className="p-3.5">Brand</th>
                  <th className="p-3.5">Target Location</th>
                  <th className="p-3.5">AI Presence</th>
                  <th className="p-3.5">Analyzed At</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>{item.domain}</span>
                    </td>
                    <td className="p-3.5 text-gray-600">{item.brandName || '--'}</td>
                    <td className="p-3.5 text-gray-700">{item.country}</td>
                    <td className="p-3.5 font-bold text-[#0B69FF]">
                      {item.aiPresence !== undefined && item.aiPresence !== null
                        ? `${item.aiPresence}%`
                        : '--'}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpen(item)}
                        className="px-3 py-1 bg-blue-50 text-[#0B69FF] font-semibold rounded hover:bg-blue-100 transition-colors mr-2"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
