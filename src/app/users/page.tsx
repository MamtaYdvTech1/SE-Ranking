'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MoreHorizontal, Edit2, Trash2, Mail, CheckCircle2 } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  accountType: 'Owner' | 'Manager' | 'Client' | 'Admin';
  language?: string;
  allowManageNotifications?: boolean;
  notifications?: Record<string, boolean>;
  createdAt?: string;
}

function UsersPageContent() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: '1',
      name: 'Account Owner',
      email: 'owner@seranking.com',
      accountType: 'Owner',
      language: 'English',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPerPage, setViewPerPage] = useState('10');
  const [isViewPerPageOpen, setIsViewPerPageOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Fullscreen Add/Edit User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'account' | 'permissions' | 'projects' | 'notifications'>('account');
  const [accountType, setAccountType] = useState<'MANAGER' | 'CLIENT'>('MANAGER');
  const [language, setLanguage] = useState('English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sendNotificationEmail, setSendNotificationEmail] = useState(false);

  // Notification tab state
  const [allowManageNotifications, setAllowManageNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<Record<string, boolean>>({
    backlinks: false,
    educational: false,
    announcements: false,
    productUpdates: false,
    discounts: false,
    serviceEmails: false,
    seoRecommendations: false,
  });

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  // Fetch initial users from API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users').then((r) => r.json());
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchUsers();
    }
  }, [authUser]);

  useEffect(() => {
    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : '';
    const localName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : '';
    const activeEmail = authUser?.email || localEmail;
    const activeName = authUser?.fullName || (authUser?.firstName ? `${authUser.firstName} ${authUser.lastName || ''}`.trim() : localName);

    if (activeEmail) {
      setUsers((prev) => {
        const ownerIdx = prev.findIndex((u) => u.accountType === 'Owner');
        if (ownerIdx >= 0) {
          const next = [...prev];
          next[ownerIdx] = {
            ...next[ownerIdx],
            name: activeName || next[ownerIdx].name || activeEmail.split('@')[0],
            email: activeEmail,
          };
          return next;
        }
        return prev;
      });
    }
  }, [authUser]);

  // Keyboard shortcut: close fullscreen modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddUserModalOpen) {
        setIsAddUserModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddUserModalOpen]);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let pass = '';
    const array = new Uint32Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < 16; i++) {
        pass += chars.charAt(array[i] % chars.length);
      }
    } else {
      for (let i = 0; i < 16; i++) {
        pass += chars.charAt((Date.now() + i * 7) % chars.length);
      }
    }
    setPassword(pass);
  };

  const handleToggleNotification = (key: string) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Sync real user from AuthContext
  useEffect(() => {
    if (authUser) {
      const ownerName = authUser.fullName || (authUser.firstName ? `${authUser.firstName} ${authUser.lastName || ''}`.trim() : (authUser as any).name || 'Account Owner');
      const ownerEmail = authUser.email || 'owner@seranking.com';
      setUsers((prev) => prev.map((u) => (u.id === '1' ? { ...u, name: ownerName, email: ownerEmail } : u)));
    }
  }, [authUser]);

  // Close row actions menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleEditUser = (u: UserRecord) => {
    setEditingUserId(u.id);
    const parts = u.name.split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setEmail(u.email);
    setAccountType(u.accountType === 'Client' ? 'CLIENT' : 'MANAGER');
    setLanguage(u.language || 'English');
    setAllowManageNotifications(Boolean(u.allowManageNotifications));
    if (u.notifications) {
      setNotificationPreferences(u.notifications);
    }
    setOpenActionMenuId(null);
    setIsAddUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === '1') {
      alert('The Owner account cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || users.filter((u) => u.id !== id));
        setFeedbackToast(`User ${name} has been removed.`);
        setTimeout(() => setFeedbackToast(null), 3500);
      }
    } catch {
      setUsers(users.filter((u) => u.id !== id));
      setFeedbackToast(`User ${name} has been removed.`);
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  const handleResendInvitation = (userEmail: string) => {
    setOpenActionMenuId(null);
    setFeedbackToast(`Invitation email successfully resent to ${userEmail}.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      if (editingUserId) {
        // Update existing user
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUserId,
            firstName,
            lastName,
            email,
            accountType,
            language,
            allowManageNotifications,
            notifications: notificationPreferences,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setFeedbackToast(`User ${data.user.name} updated successfully.`);
          setTimeout(() => setFeedbackToast(null), 3500);
          setIsAddUserModalOpen(false);
          setEditingUserId(null);
        }
      } else {
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            accountType,
            language,
            allowManageNotifications,
            notifications: notificationPreferences,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setUsers(data.users || [...users, data.user]);
          setFeedbackToast(`User ${data.user.name} added successfully.`);
          setTimeout(() => setFeedbackToast(null), 3500);
          setIsAddUserModalOpen(false);
          // Reset form
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setSendNotificationEmail(false);
          setActiveModalTab('account');
        }
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      alert('Failed to save user. Please try again.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="admin-users-page w-full min-h-screen bg-[#F4F6F9] font-sans text-[#171A1F] select-none">

      <div className="max-w-7xl mx-auto p-5 sm:p-6 space-y-4">
        
        {/* ===================== BREADCRUMBS & USER SEATS ===================== */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Link href="/admin.user.settings.html" className="hover:text-gray-900 transition-colors">
              Settings
            </Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold">Users</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => alert('Feedback submitted! Thank you.')}
              className="text-[#2870ED] hover:underline font-semibold cursor-pointer"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded text-xs font-bold border border-[#FDE68A] shadow-2xs select-none">
              <span>👤</span>
              <span>User seats {users.length} / 3</span>
              <span className="text-gray-400 font-normal cursor-help">i</span>
            </div>
          </div>
        </div>

        {/* Feedback notification toast */}
        {feedbackToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>✓ {feedbackToast}</span>
            <button onClick={() => setFeedbackToast(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* ===================== ACTION BUTTON: + ADD USER ===================== */}
        <div>
          <button
            type="button"
            onClick={() => {
              handleGeneratePassword();
              setIsAddUserModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>ADD USER</span>
          </button>
        </div>

        {/* ===================== SEARCH BAR ===================== */}
        <div className="bg-white border border-[#E1E6EB] rounded-[10px] p-2.5 shadow-2xs flex items-center gap-2 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full text-xs text-[#171A1F] bg-transparent focus:outline-hidden"
          />
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* ===================== USERS TABLE ===================== */}
        <div className="bg-white border border-[#E1E6EB] rounded-[12px] shadow-xs overflow-visible">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E6EB] bg-[#F8FAFC] text-[#7A8391] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-6 w-1/3">NAME</th>
                <th className="py-3 px-6 w-1/3">EMAIL</th>
                <th className="py-3 px-6">ACCOUNT TYPE</th>
                <th className="py-3 px-6 w-20 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr
                  key={u.id}
                  className="border-b border-[#F0F2F5] hover:bg-[#F8FAFC] transition-colors relative"
                >
                  <td className="py-4 px-6 font-semibold text-[#171A1F]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">›</span>
                      <span className="text-gray-500 font-mono text-[11px]">{idx + 1}</span>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#5B6370]">
                    {u.email}
                  </td>
                  <td className="py-4 px-6 text-[#171A1F]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5 text-[#2870ED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>{u.accountType}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId(openActionMenuId === u.id ? null : u.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openActionMenuId === u.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#CBD5E1] rounded-lg shadow-xl z-50 py-1 text-xs divide-y divide-gray-100 animate-in fade-in duration-100"
                        >
                          <button
                            type="button"
                            onClick={() => handleEditUser(u)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#EBF3FF] hover:text-[#0B69FF] font-medium transition-colors text-left cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>Edit settings</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResendInvitation(u.email)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#EBF3FF] hover:text-[#0B69FF] font-medium transition-colors text-left cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>Resend invitation</span>
                          </button>

                          {u.id !== '1' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete user</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================== VIEW ON PAGE DROPDOWN ===================== */}
        <div className="flex justify-end pt-2">
          <div className="relative inline-block text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <span>View on page:</span>
              <button
                type="button"
                onClick={() => setIsViewPerPageOpen(!isViewPerPageOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-[#171A1F] font-semibold hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span>{viewPerPage}</span>
                <span className="text-[10px] text-gray-400">▴</span>
              </button>
            </div>

            {isViewPerPageOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-24 bg-white border border-[#CBD5E1] rounded shadow-lg z-20 py-1 text-center font-medium divide-y divide-gray-100">
                {['10', '25', '50', '100', '200'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setViewPerPage(opt);
                      setIsViewPerPageOpen(false);
                    }}
                    className={`w-full py-1.5 hover:bg-[#EBF3FF] hover:text-[#0B69FF] transition-colors cursor-pointer ${
                      viewPerPage === opt ? 'bg-gray-100 font-bold' : ''
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ===================== FULLSCREEN ADD USER MODAL (1:1) =================== */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fullscreen-modal__wrapper fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto flex flex-col animate-in fade-in duration-150">
          
          {/* HEADER */}
          <div className="fullscreen-modal__header bg-white border-b border-[#E1E6EB] px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="se-title-2 fullscreen-modal-title fullscreen-modal__title">
              <div className="se-title-2__wrapper">
                <div className="se-title-2__item">
                  <div className="se-h-2 se-h-2_lev-3 text-lg font-medium text-[#171A1F]">
                    {editingUserId ? 'Edit user' : 'Add user'}
                  </div>
                </div>
              </div>
            </div>

            <div className="fullscreen-modal-close-button fullscreen-modal__close-control">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="fullscreen-modal-close-button__button flex items-center gap-1.5 text-gray-500 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors"
                title="Close modal (Esc)"
              >
                <span className="text-xl font-bold leading-none">✕</span>
                <span className="fullscreen-modal-close-button__text text-[11px] font-bold text-gray-400">
                  ESC
                </span>
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="fullscreen-modal__body flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full">
            <div className="user-editor__body flex flex-col md:flex-row gap-6 items-start">
              
              {/* SIDE MENU */}
              <div className="fullscreen-modal-side-menu user-editor__side-menu w-full md:w-56 shrink-0 bg-white border border-[#E1E6EB] rounded-[12px] p-2 shadow-xs">
                <div className="fullscreen-modal-side-menu__list space-y-1">
                  
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('account')}
                    className={`fullscreen-modal-side-menu__item w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                      activeModalTab === 'account'
                        ? 'bg-[#EBF3FF] text-[#2870ED]'
                        : 'text-[#5B6370] hover:text-[#171A1F] hover:bg-gray-50'
                    }`}
                  >
                    <span className="fullscreen-modal-side-menu__item-title">Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('permissions')}
                    className={`fullscreen-modal-side-menu__item w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                      activeModalTab === 'permissions'
                        ? 'bg-[#EBF3FF] text-[#2870ED]'
                        : 'text-[#5B6370] hover:text-[#171A1F] hover:bg-gray-50'
                    }`}
                  >
                    <span className="fullscreen-modal-side-menu__item-title">User Permissions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('projects')}
                    className={`fullscreen-modal-side-menu__item w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                      activeModalTab === 'projects'
                        ? 'bg-[#EBF3FF] text-[#2870ED]'
                        : 'text-[#5B6370] hover:text-[#171A1F] hover:bg-gray-50'
                    }`}
                  >
                    <span className="fullscreen-modal-side-menu__item-title">Access to projects</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('notifications')}
                    className={`fullscreen-modal-side-menu__item w-full text-left px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                      activeModalTab === 'notifications'
                        ? 'fullscreen-modal-side-menu__item_selected bg-[#EBF3FF] text-[#2870ED]'
                        : 'text-[#5B6370] hover:text-[#171A1F] hover:bg-gray-50'
                    }`}
                  >
                    <span className="fullscreen-modal-side-menu__item-title">Notifications</span>
                  </button>

                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 w-full bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-8 shadow-xs">
                
                {/* 1. ACCOUNT SETTINGS TAB */}
                {activeModalTab === 'account' && (
                  <form onSubmit={handleCreateUserSubmit} className="space-y-6">
                    <div className="border-b border-[#F0F2F5] pb-3 flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-[#171A1F]">Account Settings</h3>
                      <span className="text-xs text-gray-400 cursor-help" title="Configure account access level and credentials">i</span>
                    </div>

                    {/* ACCOUNT TYPE TOGGLE */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#7A8391] uppercase tracking-wider">
                        ACCOUNT TYPE
                      </div>
                      <p className="text-xs text-[#5B6370] leading-relaxed">
                        Manager is able to create their own projects and edit or delete the projects assigned to them. Client is able to view the projects they have access to but can't edit or delete them.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setAccountType('MANAGER')}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            accountType === 'MANAGER'
                              ? 'bg-[#3A3D52] text-white shadow-xs'
                              : 'bg-[#F4F6F9] text-[#5B6370] hover:bg-gray-200'
                          }`}
                        >
                          <span>💬</span>
                          <span>MANAGER</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAccountType('CLIENT')}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            accountType === 'CLIENT'
                              ? 'bg-[#3A3D52] text-white shadow-xs'
                              : 'bg-[#F4F6F9] text-[#5B6370] hover:bg-gray-200'
                          }`}
                        >
                          <span>👤</span>
                          <span>CLIENT</span>
                        </button>
                      </div>
                    </div>

                    {/* PERSONAL INFORMATION */}
                    <div className="space-y-4 pt-2">
                      <div className="text-[11px] font-bold text-[#7A8391] uppercase tracking-wider">
                        PERSONAL INFORMATION
                      </div>

                      {/* Language Select */}
                      <div className="space-y-1.5 max-w-sm">
                        <label className="block text-xs font-semibold text-[#171A1F]">Account's language:</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[8px] bg-white flex items-center justify-between text-xs text-[#171A1F] cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span>{languageOptions.find((l) => l.name === language)?.flag}</span>
                              <span>{language}</span>
                            </span>
                            <span className="text-[10px] text-gray-400">▾</span>
                          </button>

                          {isLanguageDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#CBD5E1] rounded-[8px] shadow-lg z-20 py-1 divide-y divide-gray-100">
                              {languageOptions.map((opt) => (
                                <button
                                  key={opt.code}
                                  type="button"
                                  onClick={() => {
                                    setLanguage(opt.name);
                                    setIsLanguageDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#EBF3FF] hover:text-[#0B69FF] transition-colors cursor-pointer"
                                >
                                  <span>{opt.flag}</span>
                                  <span>{opt.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* First name & Last name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171A1F]">First name:</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[8px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171A1F]">Last name:</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[8px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
                          />
                        </div>
                      </div>

                      {/* Email & Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-xs font-semibold text-[#171A1F]">
                            <span>Email:</span>
                            <span className="text-gray-400 cursor-help" title="Invitation will be sent to this email">i</span>
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-2 px-3 border border-[#CBD5E1] rounded-[8px] text-xs text-[#171A1F] focus:outline-hidden focus:border-[#2870ED]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#171A1F]">Password:</label>
                          <div className="flex items-center border border-[#CBD5E1] rounded-[8px] overflow-hidden bg-white">
                            <input
                              type="text"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full py-2 px-3 text-xs text-[#171A1F] focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={handleGeneratePassword}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer shrink-0 border-l border-[#CBD5E1]"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Send notification email checkbox */}
                      <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171A1F]">
                          <input
                            type="checkbox"
                            checked={sendNotificationEmail}
                            onChange={(e) => setSendNotificationEmail(e.target.checked)}
                            className="rounded border-[#CBD5E1] text-[#2870ED] focus:ring-0 cursor-pointer"
                          />
                          <span>Send a notification email</span>
                        </label>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#F0F2F5]">
                      <button
                        type="button"
                        onClick={() => setIsAddUserModalOpen(false)}
                        className="px-5 py-2 border border-[#CBD5E1] hover:bg-gray-50 rounded-[8px] text-xs font-bold text-[#171A1F] transition-colors cursor-pointer uppercase"
                      >
                        CANCEL
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-6 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-[8px] text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        <span>✓</span>
                        <span>APPLY</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. USER PERMISSIONS TAB */}
                {activeModalTab === 'permissions' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#F0F2F5] pb-3">
                      <h3 className="text-base font-bold text-[#171A1F]">User Permissions</h3>
                      <p className="text-xs text-[#7A8391]">Manage which modules and tools this user can access.</p>
                    </div>

                    <div className="space-y-3 text-xs">
                      {[
                        { title: 'Project Management', desc: 'Create, edit, or archive assigned projects' },
                        { title: 'Rank Tracker & SERP Checker', desc: 'Check keyword positions and historical trends' },
                        { title: 'Backlink Analytics', desc: 'Inspect referring domains and backlink profile' },
                        { title: 'Website Audit & Crawling', desc: 'Run site health audits and check technical errors' },
                        { title: 'API & MCP Keys Access', desc: 'Generate and use data API keys' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E1E6EB] rounded-lg">
                          <div>
                            <div className="font-bold text-[#171A1F]">{item.title}</div>
                            <div className="text-[#7A8391] text-[11px]">{item.desc}</div>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded text-[#2870ED]" />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#F0F2F5]">
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('projects')}
                        className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-[8px] text-xs font-bold cursor-pointer"
                      >
                        Next: Access to projects →
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. ACCESS TO PROJECTS TAB */}
                {activeModalTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#F0F2F5] pb-3">
                      <h3 className="text-base font-bold text-[#171A1F]">Access to projects</h3>
                      <p className="text-xs text-[#7A8391]">Select which client projects this user should have visibility over.</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2 p-3 bg-[#EBF3FF] border border-[#BFDBFE] rounded-lg cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#2870ED]" />
                        <span className="font-bold text-[#1E3A8A]">All current and future projects</span>
                      </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#F0F2F5]">
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('notifications')}
                        className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-[8px] text-xs font-bold cursor-pointer"
                      >
                        Next: Notifications →
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. NOTIFICATIONS TAB (MATCHING USER EXACT PROVIDED HTML) */}
                {activeModalTab === 'notifications' && (
                  <div className="section-wrap notifications-settings-section user-editor__section space-y-6">
                    <div className="tile-base">
                      <div className="tile-base__main-content space-y-4">
                        <div className="tile-base__header border-b border-[#F0F2F5] pb-3">
                          <div className="se-title-2">
                            <div className="se-title-2__wrapper">
                              <div className="se-title-2__item">
                                <h3 className="se-h-2 text-base font-bold text-[#171A1F]">
                                  Notifications
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="tile-base__body tile-base__body_bordered">
                          <div className="tile-base__content">
                            <div className="section-wrap__body space-y-4">
                              <div className="notifications-settings-section__subsection space-y-3">
                                
                                {/* Allow user to manage notifications switch */}
                                <div
                                  onClick={() => setAllowManageNotifications(!allowManageNotifications)}
                                  className="se-switch-2 se-switch-2_clickable-label notifications-settings-section__item flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E1E6EB] rounded-lg cursor-pointer select-none"
                                >
                                  <div
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                                      allowManageNotifications ? 'bg-[#2870ED]' : 'bg-gray-300'
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                                        allowManageNotifications ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </div>
                                  <div className="se-switch-2__label-wrapper">
                                    <span className="se-switch-2__label text-xs font-semibold text-[#171A1F]">
                                      Allow the user to manage notifications
                                    </span>
                                  </div>
                                </div>

                                {/* 7 Checkboxes */}
                                {[
                                  { key: 'backlinks', label: 'Backlinks update' },
                                  { key: 'educational', label: 'Educational materials' },
                                  { key: 'announcements', label: 'Announcements on new and upcoming events' },
                                  { key: 'productUpdates', label: 'Product updates and news' },
                                  { key: 'discounts', label: 'Discounts and special offers' },
                                  { key: 'serviceEmails', label: 'Important service emails' },
                                  { key: 'seoRecommendations', label: 'Personalized SEO recommendations' },
                                ].map((item) => (
                                  <label
                                    key={item.key}
                                    className="se-checkbox-2 notifications-settings-section__item notifications-settings-section__item_checkbox flex items-center gap-2.5 py-1 text-xs text-[#171A1F] cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(notificationPreferences[item.key])}
                                      onChange={() => handleToggleNotification(item.key)}
                                      className="rounded border-[#CBD5E1] text-[#2870ED] focus:ring-0 cursor-pointer"
                                    />
                                    <span className="se-checkbox-2__label">{item.label}</span>
                                  </label>
                                ))}

                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#F0F2F5]">
                      <button
                        type="button"
                        onClick={() => setIsAddUserModalOpen(false)}
                        className="px-5 py-2 border border-[#CBD5E1] hover:bg-gray-50 rounded-[8px] text-xs font-bold text-[#171A1F] transition-colors cursor-pointer uppercase"
                      >
                        CANCEL
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateUserSubmit}
                        className="flex items-center gap-1.5 px-6 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-[8px] text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        <span>✓</span>
                        <span>APPLY</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersPageContent />
    </AuthGuard>
  );
}
