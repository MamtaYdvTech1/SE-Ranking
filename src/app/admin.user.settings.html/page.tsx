'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminUserSettingsGeneralPage() {
  const [language, setLanguage] = useState('English');
  const [numberFormat, setNumberFormat] = useState('1,234.10');
  const [dateFormat, setDateFormat] = useState('MM-DD YYYY');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user_locale_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.numberFormat) setNumberFormat(parsed.numberFormat);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
        if (parsed.firstDayOfWeek) setFirstDayOfWeek(parsed.firstDayOfWeek);
      }
    } catch {}
  }, []);

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settings = { language, numberFormat, dateFormat, firstDayOfWeek };
      localStorage.setItem('user_locale_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('user_locale_changed'));
    } catch {}
    setToastMessage('Changes applied successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-[#171A1F] select-none">
      


      <div className="max-w-4xl p-8 sm:p-10 space-y-8">
        
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        <form onSubmit={handleApplyChanges} className="space-y-6 max-w-xl text-xs">
          
          {/* Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Language:</label>
            <div className="sm:col-span-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] bg-white text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              >
                <option value="English">English</option>
                <option value="Deutsch">Deutsch</option>
                <option value="Nederlands">Nederlands</option>
                <option value="Français">Français</option>
                <option value="Italiano">Italiano</option>
                <option value="Português">Português</option>
              </select>
            </div>
          </div>

          {/* Number format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Number format:</label>
            <div className="sm:col-span-2">
              <select
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] bg-white text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              >
                <option value="1,234.10">1,234.10</option>
                <option value="1234,10">1234,10</option>
                <option value="1234.10">1234.10</option>
                <option value="1 234,10">1 234,10</option>
              </select>
            </div>
          </div>

          {/* Date format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Date format:</label>
            <div className="sm:col-span-2">
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] bg-white text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              >
                <option value="MM-DD YYYY">MM-DD YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {/* First day of week in the calendar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">First day of week in the calendar:</label>
            <div className="sm:col-span-2">
              <select
                value={firstDayOfWeek}
                onChange={(e) => setFirstDayOfWeek(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] bg-white text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-bold rounded-[6px] transition-colors cursor-pointer shadow-xs"
            >
              Apply Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
