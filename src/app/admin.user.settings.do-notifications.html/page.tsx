'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminUserSettingsNotificationsPage() {
  const [notifications, setNotifications] = useState({
    serviceEmails: true,
    backlinks: true,
    educational: true,
    announcements: true,
    productUpdates: true,
    discounts: true,
    recommendations: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Subscription settings saved successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-[#171A1F] select-none">
      


      <div className="max-w-4xl p-8 sm:p-10 space-y-6">
        
        <h2 className="text-xl font-bold text-[#171A1F]">
          Subscription settings
        </h2>

        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200 max-w-xl">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        <form onSubmit={handleApplyChanges} className="space-y-4 max-w-xl text-xs">
          
          {[
            { key: 'serviceEmails' as const, label: 'Important service emails' },
            { key: 'backlinks' as const, label: 'Backlinks update' },
            { key: 'educational' as const, label: 'Educational materials' },
            { key: 'announcements' as const, label: 'Announcements on new and upcoming events' },
            { key: 'productUpdates' as const, label: 'Product updates and news' },
            { key: 'discounts' as const, label: 'Discounts and special offers' },
            { key: 'recommendations' as const, label: 'Personalized SEO recommendations' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() => toggleNotification(item.key)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#2870ED] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-[#171A1F]">{item.label}</span>
            </label>
          ))}

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
