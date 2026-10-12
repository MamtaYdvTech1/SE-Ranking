'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminSessionLockPage() {
  const [sessions, setSessions] = useState([
    { id: '1', os: 'Linux', browser: 'Chrome', location: 'Unknown Location', isCurrent: false },
    { id: '2', os: 'Windows', browser: 'Chrome', location: 'Unknown Location', isCurrent: true },
    { id: '3', os: 'Windows', browser: 'Chrome', location: 'Unknown Location', isCurrent: false },
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleContinueSession = () => {
    // Terminate all other sessions except current
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setFeedback('All other sessions have been successfully terminated.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-[#171A1F] flex flex-col justify-between select-none">
      <div className="max-w-4xl mx-auto w-full p-8 sm:p-12 text-center space-y-8">
        
        {/* Globe Device Illustration */}
        <div className="w-32 h-24 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
            <circle cx="60" cy="45" r="35" fill="#E0F2FE" />
            <path d="M35 45a25 25 0 0 1 50 0" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
            <rect x="42" y="25" width="36" height="24" rx="3" fill="#3B82F6" />
            <rect x="45" y="28" width="30" height="18" rx="2" fill="#FFFFFF" />
            <path d="M50 49h20l3 5H47l3-5z" fill="#94A3B8" />
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#171A1F]">
            You are logged in on multiple devices
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6370] max-w-lg mx-auto leading-relaxed">
            If you want to continue the current session, click &quot;Continue session&quot;. Note that all the other sessions from your account will be terminated.
          </p>
        </div>

        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg max-w-md mx-auto">
            ✓ {feedback}
          </div>
        )}

        {/* Active Sessions List */}
        <div className="border-t border-b border-[#F0F2F5] py-4 max-w-2xl mx-auto divide-y divide-[#F0F2F5] text-xs">
          {sessions.map((s) => (
            <div key={s.id} className="py-3 px-4 flex items-center justify-between text-[#171A1F]">
              <div className="flex items-center gap-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold">{s.os}</span>
                <span className="text-[#5B6370]">{s.browser}</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-[#7A8391] flex items-center gap-1">
                  <span>?</span>
                  <span>{s.location}</span>
                </span>
                {s.isCurrent && (
                  <span className="text-xs font-semibold text-[#171A1F]">
                    Current session
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Session Button */}
        <div>
          <button
            type="button"
            onClick={handleContinueSession}
            className="px-6 py-2.5 border border-[#CBD5E1] hover:bg-gray-50 text-xs font-bold text-[#171A1F] rounded-[6px] tracking-wider transition-colors cursor-pointer uppercase shadow-2xs"
          >
            CONTINUE SESSION
          </button>
        </div>

        {/* Collaborate section */}
        <div className="pt-10 border-t border-[#F0F2F5] space-y-4 max-w-lg mx-auto">
          <p className="text-xs sm:text-sm font-semibold text-[#171A1F]">
            Collaborate with colleagues on projects without interrupting current user sessions
          </p>
          <div>
            <Link
              href="/admin.users.html"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer shadow-xs uppercase tracking-wider"
            >
              <span>+</span>
              <span>ADD USERS</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
