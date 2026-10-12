'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Key,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface NoteItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Google update' | 'Project note' | 'Keyword note' | 'Important update';
  section: string;
  shownInChart: boolean;
  link?: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: '1',
    title: 'May 2026 Google Core Update',
    description:
      'This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface high quality, authentic content.',
    date: 'May-21 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '2',
    title: 'March 2026 core update',
    description:
      'This is the first core update of 2026, launching just three days after the March 2026 spam update completed. It started on March 27, 2026, and finished approximately 12 days later on April 8, 2026. As with other core updates, it rewards helpful content.',
    date: 'Mar-27 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '3',
    title: 'March 2026 spam update',
    description:
      "This is the first spam update of 2026 and the first since August 2025. It launched on March 24, 2026, and completed the following day in under 24 hours, making it the fastest spam update ever recorded on Google's systems.",
    date: 'Mar-24 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '4',
    title: 'February 2026 Discover core update',
    description:
      "This is the first confirmed Google Search update of 2026 and the first core update in Google's history to target Google Discover exclusively. It started on February 5, 2026, and completed approximately 22 days later.",
    date: 'Feb-05 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '5',
    title: 'December 2025 core update',
    description:
      'The final broad core update of 2025. Targeted at assessing content quality across multi-modal queries, entity relationships, and conversational search answers.',
    date: 'Dec-11 2025',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '6',
    title: 'December 2024 Spam Update',
    description:
      'This is the third spam update in 2024. It was launched just a day after Google completed the December 2024 core update. While the specific type of spam targeted remains unclear, Google emphasizes that only manipulative practices are penalized.',
    date: 'Dec-19 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '7',
    title: 'December 2024 Google Core Update',
    description:
      'This core update started just one week after the complete rollout of the November Core Update. According to Google, the reason behind this timing is that this update addresses different systems within the core algorithm.',
    date: 'Dec-12 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '8',
    title: 'November 2024 Core Update',
    description:
      'The third core update of 2024 started rolling out on November 11 and ended on December 5. Like other recent core updates, it was designed to promote truly useful content instead of content created for SEO purposes.',
    date: 'Nov-11 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '9',
    title: 'August 2024 Core Update',
    description:
      'The purpose of this long-awaited core update is to promote useful content from smaller, independent publishers as opposed to established authoritative websites that dominated the SERPs after the September 2023 Core Update.',
    date: 'Aug-15 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '10',
    title: 'June 2024 Spam Update',
    description:
      'Much like the May Spam update, this spam update targeted websites that abused their reputation and relied only on manual actions. The update took 7 days to roll out, from June 20, 2024, to June 27, 2024.',
    date: 'Jul-01 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '11',
    title: 'May 2024 Site Reputation Abuse Update',
    description:
      'This update targets top-rated websites that host third-party content lacking close oversight and offering low value to readers. This content relies on the hosting domain’s strong ranking signals.',
    date: 'May-06 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '12',
    title: 'March 2024 Core Update',
    description:
      'This is the first core update of 2024. It will affect multiple core systems, making this update much more complex than the previous core algorithm updates. According to Google, the point was to refine ranking systems.',
    date: 'Mar-05 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '13',
    title: 'March 2024 Spam Update',
    description:
      'This update combines the following three key elements: scaled content abuse, expired domain abuse, and site reputation abuse. The first targets low-value content produced in bulk.',
    date: 'Mar-05 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '14',
    title: 'November 2023 Reviews Update',
    description:
      'This algorithm update was released shortly after the November Core Update. It further fine tunes Google’s ability to prioritize quality review-related content in search.',
    date: 'Nov-08 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '15',
    title: 'November 2023 Core Update',
    description:
      'This is the fourth broad core update of 2023. It was released less than a month after the previous core update. According to Google, this update is targeted at a different core ranking system.',
    date: 'Nov-02 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '16',
    title: 'October 2023 Core Update',
    description:
      'This is the third broad core update of 2023. The rollout may take up to two weeks to complete. Being a core update, it will affect all content types in all regions and languages.',
    date: 'Oct-05 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: '17',
    title: 'October 2023 Spam Algorithm Update',
    description:
      'This global spam update was designed to reduce the amount of visible spam that appears in search results, including cloaking, hacked, auto-generated, and scraped spam.',
    date: 'Oct-04 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [filterTab, setFilterTab] = useState<'ALL' | 'DISPLAYED' | 'HIDDEN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Create Note Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('Sep-27 2026');
  const [newCategory, setNewCategory] = useState<NoteItem['category']>('Project note');
  const [newSection, setNewSection] = useState('Rankings');

  // Toggle shown in chart
  const toggleShownInChart = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, shownInChart: !n.shownInChart } : n))
    );
  };

  // Toggle show more text
  const toggleExpanded = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle category checkbox
  const toggleCategoryFilter = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Create Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: NoteItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom user note.',
      date: newDate,
      category: newCategory,
      section: newSection,
      shownInChart: true,
    };

    setNotes([created, ...notes]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    // Tab filter
    if (filterTab === 'DISPLAYED' && !n.shownInChart) return false;
    if (filterTab === 'HIDDEN' && n.shownInChart) return false;

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(n.category)) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.section.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between font-sans select-none">
      <div className="w-full max-w-7xl mx-auto px-6 py-5 space-y-5">
        {/* Top Breadcrumb & Feedback Link matching screenshot */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Link href="/project-overview" className="hover:text-blue-600">
              https://www.workcomposer.com/
            </Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold">Notes</span>
          </div>

          <button
            type="button"
            onClick={() => alert('Feedback dialog opened')}
            className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* Action Header: CREATE A NOTE button and Search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#00B87C] hover:bg-[#009e6b] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE A NOTE</span>
          </button>

          {/* Search box matching screenshot */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3.5 pr-9 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#0B69FF]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Filter Bar: Notes title, ALL/DISPLAYED/HIDDEN tabs, Select Category dropdown */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notes</h2>

          {/* Tab buttons */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-[#474C65] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('DISPLAYED')}
              className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                filterTab === 'DISPLAYED'
                  ? 'bg-[#474C65] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              DISPLAYED
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('HIDDEN')}
              className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                filterTab === 'HIDDEN'
                  ? 'bg-[#474C65] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              HIDDEN
            </button>
          </div>

          {/* Select Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span>
                {selectedCategories.length === 0
                  ? 'Select category'
                  : `Categories (${selectedCategories.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 space-y-1 text-xs">
                {[
                  { id: 'Project note', label: 'Project note', icon: MessageSquare, color: 'text-gray-600' },
                  { id: 'Keyword note', label: 'Keyword note', icon: Key, color: 'text-amber-600' },
                  { id: 'Google update', label: 'Google update', icon: Check, color: 'text-[#4285F4]' },
                  { id: 'Important update', label: 'Important update', icon: AlertCircle, color: 'text-red-600' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(item.id)}
                      onChange={() => toggleCategoryFilter(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-gray-800 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes Data Table matching exact screenshot */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFD] border-b border-gray-200 text-gray-400 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-5 w-2/5">TITLE</th>
                <th className="py-3 px-4 w-28">DATE</th>
                <th className="py-3 px-4 w-36">CATEGORY</th>
                <th className="py-3 px-4 w-28">SECTION</th>
                <th className="py-3 px-5 text-right w-36">SHOWN IN CHART</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    No notes found.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => {
                  const isExpanded = !!expandedNotes[note.id];
                  return (
                    <tr key={note.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Title & Description with Show more toggle */}
                      <td className="py-4 px-5 align-top space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[13px]">
                          <span>{note.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
                        </div>
                        <p
                          className={`text-gray-600 text-xs leading-relaxed ${
                            isExpanded ? '' : 'line-clamp-2'
                          }`}
                        >
                          {note.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(note.id)}
                          className="text-[#0B69FF] hover:underline font-semibold text-[11px] block pt-0.5 cursor-pointer"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 align-top text-gray-700 font-medium whitespace-nowrap">
                        {note.date}
                      </td>

                      {/* Category with Google icon */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                          {note.category === 'Google update' ? (
                            <span className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-[#4285F4]">
                              G
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                          <span>{note.category}</span>
                        </div>
                      </td>

                      {/* Section */}
                      <td className="py-4 px-4 align-top text-gray-700 font-medium whitespace-nowrap">
                        {note.section}
                      </td>

                      {/* Shown In Chart Toggle Switch */}
                      <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShownInChart(note.id)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                              note.shownInChart ? 'bg-[#1B66FF]' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                note.shownInChart ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-[11px] font-semibold text-gray-700 w-6 text-left">
                            {note.shownInChart ? 'On' : 'Off'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 border-r border-gray-200 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="px-3 py-1.5 font-bold bg-[#474C65] text-white"
              >
                1
              </button>
              <button
                type="button"
                className="px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                className="px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                3
              </button>
              <button
                type="button"
                className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 border-l border-gray-200 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 ml-3">
              <span>Go to page:</span>
              <input
                type="number"
                defaultValue={1}
                className="w-12 px-2 py-1 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span>Notes per page:</span>
            <select
              defaultValue={20}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>



      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Create a Note</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Website redesign launched"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details about what changed or what Google update happened..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Project note">Project note</option>
                    <option value="Keyword note">Keyword note</option>
                    <option value="Google update">Google update</option>
                    <option value="Important update">Important update</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B87C] hover:bg-[#009e6b] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
