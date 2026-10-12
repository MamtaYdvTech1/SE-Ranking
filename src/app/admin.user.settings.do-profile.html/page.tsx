'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminUserSettingsProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || 'Suraj');
  const [lastName, setLastName] = useState(user?.lastName || 'Vishwakarma');
  const [email, setEmail] = useState(user?.email || 'suraj.vishwakarma@gvilab.com');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('•••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Profile settings updated successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-[#171A1F] select-none">

      <div className="max-w-4xl p-8 sm:p-10 space-y-8">
        
        <div className="text-xs text-[#7A8391]">
          Edit your name, avatar, etc.
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        <form onSubmit={handleApplyChanges} className="space-y-5 max-w-xl text-xs">
          
          {/* Your Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Your Avatar</label>
            <div className="sm:col-span-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-bold text-sm shadow-2xs">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => alert('Choose an image to upload')}
                  className="text-xs font-semibold text-[#2870ED] hover:underline cursor-pointer"
                >
                  Upload
                </button>
                <div className="text-[11px] text-[#7A8391]">
                  JPG, GIF or PNG. 32x32 pixels. Max size of 10 KB
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-start">
            <label className="font-medium text-[#171A1F] pt-2">Email</label>
            <div className="sm:col-span-3 space-y-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
              <div className="text-[11px] text-[#7A8391]">
                Your email address will be updated upon the confirmation.
              </div>
            </div>
          </div>

          {/* First name */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">First name</label>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* Last name */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Last name</label>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* Phone number */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Phone number</label>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* Current password */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Current password</label>
            <div className="sm:col-span-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] bg-[#EEF2FF] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* New password */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">New password</label>
            <div className="sm:col-span-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* Confirm password */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <label className="font-medium text-[#171A1F]">Confirm password</label>
            <div className="sm:col-span-3">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[6px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>
          </div>

          {/* Apply Changes Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-bold rounded-[6px] transition-colors cursor-pointer shadow-xs"
            >
              Apply Changes
            </button>
          </div>

        </form>

        {/* ===================== DELETE ACCOUNT SECTION ===================== */}
        <div className="pt-8 border-t border-[#F0F2F5] space-y-3 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-[#171A1F]">Delete account</h3>
          <p className="text-xs text-[#5B6370] leading-relaxed">
            You can permanently delete your account along with all associated data. However, if you have an active subscription or add-ons, you must cancel them first before proceeding with deletion.
          </p>
          <div>
            <a
              href="https://help.seranking.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#2870ED] hover:underline font-semibold"
            >
              How to cancel subscription.
            </a>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => alert('Account deletion requires contacting support to protect billing data.')}
              className="px-4 py-2 border border-[#CBD5E1] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-gray-700 font-semibold rounded-[6px] transition-colors cursor-pointer"
            >
              Delete account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
