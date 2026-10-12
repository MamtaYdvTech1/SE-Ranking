'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  X,
  ListFilter,
  Trash2,
  Tag,
  Download,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

interface KeywordList {
  id: string;
  name: string;
  keywords: string[];
  createdAt: string;
}

export default function KeywordManagerPage() {
  const [lists, setLists] = useState<KeywordList[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('se_ranking_keyword_lists');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listKeywordsChecked, setListKeywordsChecked] = useState(false);
  const [rawKeywords, setRawKeywords] = useState('');
  const [activeList, setActiveList] = useState<KeywordList | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('se_ranking_keyword_lists', JSON.stringify(lists));
      } catch {
        // ignore
      }
    }
  }, [lists]);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    const keywords = listKeywordsChecked
      ? rawKeywords
          .split(/[\r\n,]+/)
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const newList: KeywordList = {
      id: `list_${Date.now()}`,
      name: listName.trim(),
      keywords,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setLists((prev) => [newList, ...prev]);
    setListName('');
    setListKeywordsChecked(false);
    setRawKeywords('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  const handleExportCsv = (list: KeywordList) => {
    const headers = ['Keyword', 'List Name', 'Date Added'];
    const rows = (list.keywords.length > 0 ? list.keywords : ['(No keywords entered)']).map(
      (k) => [`"${k}"`, `"${list.name}"`, list.createdAt]
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${list.name.replace(/\s+/g, '_')}_keywords.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] flex flex-col justify-between text-gray-900 select-none relative overflow-x-hidden">

      {lists.length === 0 ? (
        /* Empty State / Start View matching Screenshot 1 exactly */
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-2xl mx-auto">
          {/* Isometric Illustration matching km-start.DFoihzyS.svg */}
          <div className="w-80 h-56 sm:w-96 sm:h-64 mb-6 relative flex items-center justify-center">
            <svg
              viewBox="0 0 400 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
            >
              {/* Ground Shadow & Isometric Platforms */}
              <ellipse cx="200" cy="220" rx="140" ry="35" fill="#E8EDF5" opacity="0.6" />
              
              {/* Back 3D Vertical Document Board */}
              <g transform="translate(140, 40)">
                {/* Back Board Isometric */}
                <polygon points="60,0 120,35 120,130 60,95" fill="#DCE7F7" />
                <polygon points="0,35 60,0 60,95 0,130" fill="#EBF2FC" />
                <polygon points="0,35 60,70 120,35 60,0" fill="#F4F8FD" />
                
                {/* Document Grid Lines */}
                <line x1="15" y1="55" x2="45" y2="38" stroke="#BFD3EE" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="15" y1="70" x2="48" y2="52" stroke="#BFD3EE" strokeWidth="2" strokeLinecap="round" />
                <line x1="15" y1="85" x2="42" y2="70" stroke="#BFD3EE" strokeWidth="2" strokeLinecap="round" />
                <line x1="15" y1="100" x2="45" y2="84" stroke="#BFD3EE" strokeWidth="2" strokeLinecap="round" />

                {/* Standing Chart Panel on Board */}
                <polygon points="25,45 85,15 85,75 25,105" fill="#FFFFFF" stroke="#D3E2F5" strokeWidth="1" />
                {/* Chart Line Trend in Pink */}
                <path
                  d="M32 90 Q 48 70, 58 78 T 78 40"
                  fill="none"
                  stroke="#FF6077"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Central Isometric Floating Cubes */}
              <g transform="translate(130, 140)">
                {/* Main 3D White Block */}
                <polygon points="70,0 140,40 70,80 0,40" fill="#FFFFFF" stroke="#E1EAF5" strokeWidth="1" />
                <polygon points="0,40 70,80 70,110 0,70" fill="#EBF1FA" />
                <polygon points="70,80 140,40 140,70 70,110" fill="#D7E3F3" />

                {/* Right Side Step Cube */}
                <polygon points="110,40 150,62 110,84 70,62" fill="#F7FAFE" />
                <polygon points="70,62 110,84 110,104 70,82" fill="#E5EDF8" />
                <polygon points="110,84 150,62 150,82 110,104" fill="#D3E0F1" />
              </g>

              {/* Character 1: Standing Female (pointing at chart in red/coral top, blue pants) */}
              <g transform="translate(150, 105)">
                {/* Head with ponytail */}
                <circle cx="20" cy="12" r="5.5" fill="#FFAA8A" />
                <path d="M16 10 C 14 5, 23 4, 25 10 C 26 14, 22 17, 18 16" fill="#C53939" />
                <path d="M15 11 Q 12 16, 13 22" fill="none" stroke="#C53939" strokeWidth="3" strokeLinecap="round" />
                {/* Coral/Red Top */}
                <path d="M15 18 L 25 18 L 27 34 L 14 34 Z" fill="#FF6077" />
                {/* Arm pointing */}
                <path d="M23 20 L 33 13" stroke="#FFAA8A" strokeWidth="2.5" strokeLinecap="round" />
                {/* Blue Pants */}
                <path d="M14 34 L 19 34 L 17 56 L 12 56 Z" fill="#2563EB" />
                <path d="M21 34 L 26 34 L 27 54 L 23 54 Z" fill="#1D4ED8" />
                {/* Shoes */}
                <ellipse cx="14" cy="57" rx="3.5" ry="1.8" fill="#1E293B" />
                <ellipse cx="26" cy="55" rx="3.5" ry="1.8" fill="#1E293B" />
              </g>

              {/* Character 2: Seated Person with laptop on the right block */}
              <g transform="translate(230, 110)">
                {/* Head */}
                <circle cx="16" cy="14" r="5" fill="#FFC9A5" />
                <path d="M12 13 C 12 8, 20 7, 21 12 Z" fill="#FBBF24" />
                {/* Light Blue Shirt */}
                <path d="M12 20 L 20 20 L 21 35 L 11 35 Z" fill="#93C5FD" />
                {/* Legs seated on cube */}
                <path d="M11 35 L 22 35 L 23 46 L 16 46 Z" fill="#1E40AF" />
                <path d="M21 44 L 25 44 L 25 54 L 22 54 Z" fill="#1E3A8A" />
                {/* Laptop on lap */}
                <polygon points="5,33 14,33 12,37 3,37" fill="#64748B" />
                <polygon points="5,33 8,24 16,24 14,33" fill="#94A3B8" />
              </g>

              {/* Small 3D Bar Columns on Left */}
              <g transform="translate(95, 160)">
                <polygon points="12,0 24,7 12,14 0,7" fill="#60A5FA" />
                <polygon points="0,7 12,14 12,32 0,25" fill="#3B82F6" />
                <polygon points="12,14 24,7 24,25 12,32" fill="#2563EB" />
              </g>
              <g transform="translate(115, 175)">
                <polygon points="10,0 20,6 10,12 0,6" fill="#93C5FD" />
                <polygon points="0,6 10,12 10,24 0,18" fill="#60A5FA" />
                <polygon points="10,12 20,6 20,18 10,24" fill="#3B82F6" />
              </g>
            </svg>
          </div>

          {/* Title & Subtitle matching Screenshot 1 */}
          <h2 className="text-[22px] font-bold text-gray-900 mb-2 tracking-tight">
            Keyword Manager
          </h2>
          <p className="text-[13px] text-gray-500 mb-7 max-w-md leading-relaxed">
            Create and manage keyword lists to monitor rankings and other data
          </p>

          {/* Green Action Button matching Screenshot 1 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#20B26C] hover:bg-[#1A965A] text-white rounded-md text-xs font-bold transition-all uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE A NEW LIST</span>
          </button>
        </div>
      ) : (
        /* Populated Lists View */
        <div className="max-w-6xl w-full mx-auto p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Keyword Manager</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {lists.length} keyword list{lists.length > 1 ? 's' : ''} available
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#20B26C] hover:bg-[#1A965A] text-white rounded-md text-xs font-bold transition-colors uppercase tracking-wider shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE A NEW LIST</span>
            </button>
          </div>

          {/* Lists Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">LIST NAME</th>
                  <th className="p-3.5">KEYWORDS COUNT</th>
                  <th className="p-3.5">CREATED AT</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lists.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F5F3FF] transition-colors">
                    <td className="p-3.5 font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                        <Tag className="w-3 h-3" />
                      </div>
                      <span className="text-sm">{l.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                        {l.keywords.length} keywords
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500">{l.createdAt}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleExportCsv(l)}
                        title="Export CSV"
                        className="p-1.5 text-gray-500 hover:text-[#7C3AED] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        title="Delete list"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New list Modal matching Screenshot 2 exactly */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden text-gray-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <h3 className="text-[17px] font-bold text-gray-900">New list</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="px-6 pb-6 pt-1 space-y-4 text-xs">
              <p className="text-gray-500 text-xs">Please create a new list</p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Name:
                </label>
                <input
                  type="text"
                  required
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-[#A78BFA] rounded-md text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]/20"
                  autoFocus
                />
              </div>

              {/* List keywords checkbox matching Screenshot 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="listKeywords"
                    checked={listKeywordsChecked}
                    onChange={(e) => setListKeywordsChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="listKeywords"
                    className="text-xs text-gray-700 font-medium cursor-pointer flex items-center gap-1"
                  >
                    <span>List keywords</span>
                    <span className="text-gray-400 text-[10px]">ℹ</span>
                  </label>
                </div>

                {listKeywordsChecked && (
                  <div className="pt-1 animate-in fade-in duration-150">
                    <textarea
                      rows={4}
                      value={rawKeywords}
                      onChange={(e) => setRawKeywords(e.target.value)}
                      placeholder={`seo tools\nrank tracking software\nbacklink checker`}
                      className="w-full p-2.5 text-xs border border-gray-300 rounded-md focus:outline-hidden focus:border-[#7C3AED] font-mono leading-relaxed"
                    />
                    <span className="text-[11px] text-gray-400">
                      Enter keywords separated by comma or one per line
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Buttons matching Screenshot 2 */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!listName.trim()}
                  className={`px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    listName.trim()
                      ? 'bg-[#20B26C] hover:bg-[#1A965A] text-white shadow-xs'
                      : 'bg-[#E0E2E7] text-[#9AA0AC] cursor-not-allowed'
                  }`}
                >
                  CREATE LIST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
