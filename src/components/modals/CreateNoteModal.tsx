'use client';

import React, { useState } from 'react';
import { X, Calendar, Info } from 'lucide-react';

export interface NotePayload {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  date: string;
  category: string;
  type: 'PROJECT NOTE' | 'KEYWORD NOTE';
  url?: string;
  keyword?: string;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: NotePayload) => void;
  availableKeywords?: string[];
  initialType?: 'PROJECT NOTE' | 'KEYWORD NOTE';
  initialKeyword?: string;
  initialDate?: string;
}

export function CreateNoteModal({
  isOpen,
  onClose,
  onSaveNote,
  availableKeywords = [
    'photobooth hire london',
    'magic mirror hire london',
    '360 photo booth london',
    'party photo booth rental',
  ],
  initialType = 'PROJECT NOTE',
  initialKeyword = '',
  initialDate = '8 Oct 2026',
}: CreateNoteModalProps) {
  const [noteType, setNoteType] = useState<'PROJECT NOTE' | 'KEYWORD NOTE'>(initialType);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [noteDate, setNoteDate] = useState(initialDate);
  const [selectedKeyword, setSelectedKeyword] = useState(
    initialKeyword || availableKeywords[0] || 'photobooth hire london'
  );

  // Calendar Date Picker State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(9); // October (0-indexed)
  const [selectedDay, setSelectedDay] = useState(8);
  const datePickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setNoteDate(initialDate);
      }
      if (initialType) {
        setNoteType(initialType);
      }
    }
  }, [isOpen, initialDate, initialType]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const changeMonth = (offset: number) => {
    let newMonth = calendarMonth + offset;
    let newYear = calendarYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const selectCalendarDate = (day: number) => {
    setSelectedDay(day);
    const formatted = `${day} ${shortMonthNames[calendarMonth]} ${calendarYear}`;
    setNoteDate(formatted);
    setIsDatePickerOpen(false);
  };

  const setToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    setSelectedDay(now.getDate());
    const formatted = `${now.getDate()} ${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`;
    setNoteDate(formatted);
    setIsDatePickerOpen(false);
  };

  // Close calendar popover on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteText.trim()) return;

    const title = noteTitle.trim() || (noteText.length > 45 ? noteText.slice(0, 45) + '...' : noteText);
    const full = noteText.trim() || noteTitle.trim();
    const short = full.length > 180 ? full.slice(0, 180) + '...' : full;

    const payload: NotePayload = {
      id: `note-${Date.now()}`,
      title,
      shortDesc: short,
      fullDesc: full,
      date: noteDate,
      category: noteType === 'PROJECT NOTE' ? 'Website changes' : `Keyword: ${selectedKeyword}`,
      type: noteType,
      url: externalUrl.trim() || undefined,
      keyword: noteType === 'KEYWORD NOTE' ? selectedKeyword : undefined,
    };

    onSaveNote(payload);
    // Reset form
    setNoteTitle('');
    setNoteText('');
    setExternalUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-gray-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Create a note</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Tab Bar (Exact match to screenshot: PROJECT NOTE / KEYWORD NOTE) */}
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setNoteType('PROJECT NOTE')}
              className={`px-5 py-2.5 transition-colors cursor-pointer ${
                noteType === 'PROJECT NOTE'
                  ? 'bg-[#524B76] text-white shadow-inner'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              PROJECT NOTE
            </button>
            <button
              type="button"
              onClick={() => setNoteType('KEYWORD NOTE')}
              className={`px-5 py-2.5 transition-colors border-l border-gray-300 cursor-pointer ${
                noteType === 'KEYWORD NOTE'
                  ? 'bg-[#524B76] text-white shadow-inner'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              KEYWORD NOTE
            </button>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-3.5">
            {/* If Keyword Note, show target keyword selector */}
            {noteType === 'KEYWORD NOTE' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target keyword:
                </label>
                <select
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                >
                  {availableKeywords.map((kw) => (
                    <option key={kw} value={kw}>
                      {kw}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Note title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Note title:
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                autoFocus
              />
            </div>

            {/* Note text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Note text:
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add text..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76] resize-y"
              />
            </div>

            {/* Two-column Row: External URL and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  External URL:
                </label>
                <input
                  type="text"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="e.g. https://www.example.org/angle/bath"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date:
                </label>
                <div
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-gray-400 focus-within:border-[#524B76] focus-within:ring-1 focus-within:ring-[#524B76] cursor-pointer select-none"
                >
                  <Calendar className="w-4 h-4 text-[#524B76] shrink-0" />
                  <span className="w-full text-xs font-medium text-gray-900">
                    {noteDate}
                  </span>
                </div>

                {/* Professional Interactive Calendar Popover */}
                {isDatePickerOpen && (
                  <div
                    ref={datePickerRef}
                    className="absolute right-0 sm:left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150 select-none text-gray-900"
                  >
                    {/* Month / Year header with navigation */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeMonth(-1);
                        }}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-600 cursor-pointer"
                      >
                        ◀
                      </button>
                      <span className="text-xs font-bold text-gray-900">
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeMonth(1);
                        }}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-600 cursor-pointer"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-bold text-gray-400">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const isSelected = selectedDay === dayNum;
                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectCalendarDate(dayNum);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#524B76] text-white font-bold shadow-xs'
                                : 'text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick shortcuts */}
                    <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setToday();
                        }}
                        className="text-[#0B69FF] font-semibold hover:underline cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDatePickerOpen(false);
                        }}
                        className="text-gray-500 hover:text-gray-800 cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info tooltip notice matching screenshot */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>This note will appear on the &quot;Detailed&quot; chart.</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteTitle.trim() && !noteText.trim()}
              className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Create note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
