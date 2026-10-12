'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Shield,
  Briefcase,
  FolderKanban,
  Bell,
  Puzzle,
  Check,
  AlertCircle,
  Key,
  Laptop,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Globe,
  Cloud,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SEWizardView } from './SEWizardView';
import { useApp } from '@/components/providers/AppProviders';
import { CloudflareManagementHub } from '@/components/cloudflare/CloudflareManagementHub';

export type SettingsTab =
  | 'account'
  | 'workspace'
  | 'project'
  | 'notifications'
  | 'security'
  | 'integrations'
  | 'cloudflare';

export function GlobalSettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { projects } = useApp();

  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const siteIdParam = searchParams.get('site_id');

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    siteIdParam ? 'project' : tabParam || 'account'
  );

  // ----------------------------------------------------------------
  // Account Tab State
  // ----------------------------------------------------------------
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (user) {
      setAccountName(user.fullName || user.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
      setAccountEmail(user.email || '');
    }
  }, [user]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    setAccountSuccess('');
    setAccountError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountName, avatarUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountSuccess('Account profile updated successfully.');
        await refreshUser();
        setTimeout(() => setAccountSuccess(''), 3500);
      } else {
        setAccountError(data.message || 'Failed to update account');
      }
    } catch (err: any) {
      setAccountError(err.message || 'Network error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  // ----------------------------------------------------------------
  // Security Tab State
  // ----------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionActionMsg, setSessionActionMsg] = useState('');

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch('/api/auth/sessions');
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
  }, [activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess('Password successfully changed.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3500);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Network error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revokeOthers: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionActionMsg('All other active sessions revoked.');
        await fetchSessions();
        setTimeout(() => setSessionActionMsg(''), 3500);
      }
    } catch {
      // ignore
    }
  };

  // ----------------------------------------------------------------
  // Workspace Tab State
  // ----------------------------------------------------------------
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [workspaceMsg, setWorkspaceMsg] = useState('');

  const fetchWorkspace = async () => {
    setIsLoadingWorkspace(true);
    try {
      const res = await fetch('/api/workspace');
      const data = await res.json();
      if (data.success && data.workspace) {
        setWorkspace(data.workspace);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'workspace') {
      fetchWorkspace();
    }
  }, [activeTab]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setWorkspaceMsg('');

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkspaceMsg(`Member ${inviteEmail} added successfully.`);
        setInviteEmail('');
        await fetchWorkspace();
        setTimeout(() => setWorkspaceMsg(''), 3500);
      } else {
        setWorkspaceMsg(data.message || 'Failed to add member.');
      }
    } catch {
      setWorkspaceMsg('Network error.');
    } finally {
      setIsInviting(false);
    }
  };

  // ----------------------------------------------------------------
  // Notifications Tab State
  // ----------------------------------------------------------------
  const [emailDigest, setEmailDigest] = useState(true);
  const [rankingAlerts, setRankingAlerts] = useState(true);
  const [crawlAlerts, setCrawlAlerts] = useState(true);
  const [backlinkAlerts, setBacklinkAlerts] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  // ----------------------------------------------------------------
  // Integrations Tab State
  // ----------------------------------------------------------------
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);

  const fetchIntegrations = async () => {
    setIsLoadingIntegrations(true);
    try {
      const res = await fetch('/api/integrations');
      const data = await res.json();
      if (data.availableProviders) {
        setIntegrations(data.availableProviders);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'integrations') {
      fetchIntegrations();
    }
  }, [activeTab]);

  // If user selected "project" tab or site_id is passed, render project wizard directly
  if (activeTab === 'project' && siteIdParam) {
    return <SEWizardView />;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#F4F6F9] flex flex-col font-sans select-none">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-gray-200 px-6 sm:px-10 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Settings & Organization
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your personal account, security credentials, workspace team, and connected services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#F5F3FF] text-[#7C3AED] font-semibold px-3 py-1 rounded-full border border-[#DDD6FE]">
              Role: {user?.role || 'Owner'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Layout with Left Nav and Right Content */}
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 py-8 flex-1 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Settings Sidebar */}
        <aside className="space-y-1.5 md:col-span-1">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Account Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Security & Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Workspace & Team</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'project'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            <span>Project Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <Puzzle className="w-4 h-4 shrink-0" />
            <span>Integrations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloudflare')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cloudflare'
                ? 'bg-[#F6821F] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60'
            }`}
          >
            <Cloud className="w-4 h-4 shrink-0" />
            <div className="flex items-center justify-between w-full">
              <span>Cloudflare Suite</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'cloudflare' ? 'bg-white/20 text-white' : 'bg-orange-50 text-[#F6821F]'}`}>
                R2 / DNS
              </span>
            </div>
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="md:col-span-3 space-y-6">
          {/* TAB 1: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Account Details</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Manage your display name, email address, and avatar image.
                </p>
              </div>

              {accountSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{accountSuccess}</span>
                </div>
              )}

              {accountError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{accountError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={accountEmail}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Contact workspace admin to modify your registered account email.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingAccount}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingAccount ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Change Password</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Ensure your account is using a strong, unique password of at least 8 characters.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] transition"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Active Login Sessions</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage devices that are currently logged in to your account.
                    </p>
                  </div>

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={handleRevokeOtherSessions}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Revoke Other Sessions
                    </button>
                  )}
                </div>

                {sessionActionMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{sessionActionMsg}</span>
                  </div>
                )}

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      {isLoadingSessions ? 'Loading active sessions...' : '1 active session (current browser)'}
                    </div>
                  ) : (
                    sessions.map((sess) => (
                      <div key={sess.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Laptop className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-800">
                                {sess.userAgent || 'Chrome / Windows Browser'}
                              </span>
                              {sess.isCurrent && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              IP: {sess.ipAddress || '127.0.0.1'} • Created: {new Date(sess.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE & TEAM */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Workspace Members</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage team permissions, invite collaborators, and assign roles.
                  </p>
                </div>

                {workspaceMsg && (
                  <div className="p-3 bg-[#F5F3FF] border border-[#DDD6FE] text-blue-900 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>{workspaceMsg}</span>
                  </div>
                )}

                {/* Invite Form */}
                <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    required
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="MEMBER">Member (Read/Write)</option>
                    <option value="ADMIN">Admin (Manage Projects)</option>
                    <option value="CLIENT">Client (View Only)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isInviting ? 'Inviting...' : 'Invite'}</span>
                  </button>
                </form>

                {/* Team List Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {workspace?.members?.map((m: any) => (
                        <tr key={m.id} className="hover:bg-gray-50/60">
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            <div>{m.name || m.email}</div>
                            <div className="text-[11px] text-gray-400 font-normal">{m.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-[#F5F3FF] text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {m.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-400">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT SETTINGS WIZARD LAUNCHER */}
          {activeTab === 'project' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Project Configuration Wizard</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Select a project to configure Search Engines, Keywords, AI Prompts, Competitors, and Integrations.
                </p>
              </div>

              {projects.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  No projects available. Create a project from the top navigation to configure settings.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/settings?site_id=${p.id}#/engines`)}
                        className="p-5 border border-gray-200 hover:border-[#7C3AED] rounded-xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between group bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center font-bold text-sm border border-[#DDD6FE]">
                            {p.domain?.slice(0, 2).toUpperCase() || 'PR'}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#7C3AED] transition">
                              {p.name || p.domain}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">{p.domain}</p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Email & Alert Preferences</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Select which automated alerts and digest summaries you receive.
                </p>
              </div>

              {notifSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Notification preferences saved.</span>
                </div>
              )}

              <form onSubmit={handleSaveNotifications} className="space-y-4 max-w-lg">
                <label className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="mt-0.5 rounded text-[#7C3AED] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Weekly Performance Digest</span>
                    <span className="text-[11px] text-gray-500">
                      Receive weekly summary emails covering keyword rank changes and audit health.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={rankingAlerts}
                    onChange={(e) => setRankingAlerts(e.target.checked)}
                    className="mt-0.5 rounded text-[#7C3AED] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Significant Position Drops</span>
                    <span className="text-[11px] text-gray-500">
                      Alert immediately if any high-volume tracked keyword drops more than 5 positions.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={crawlAlerts}
                    onChange={(e) => setCrawlAlerts(e.target.checked)}
                    className="mt-0.5 rounded text-[#7C3AED] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Technical Audit Crawl Errors</span>
                    <span className="text-[11px] text-gray-500">
                      Notify immediately when 5xx server errors or indexability blockers are detected.
                    </span>
                  </div>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Supported Integrations</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Connect third-party analytics and search engine data providers.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {integrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        item.id === 'cloudflare' 
                          ? 'bg-orange-50 text-[#F6821F]' 
                          : 'bg-[#F5F3FF] text-[#7C3AED]'
                      }`}>
                        {item.id === 'cloudflare' ? (
                          <Cloud className="w-5 h-5 text-[#F6821F]" />
                        ) : item.id.includes('search_console') ? (
                          'G'
                        ) : item.id.includes('analytics') ? (
                          'GA'
                        ) : (
                          'GBP'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-gray-900">{item.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.connected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {item.id === 'cloudflare' ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('cloudflare')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F6821F] hover:bg-[#E57317] text-white transition cursor-pointer"
                        >
                          Manage Cloudflare Suite
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (projects[0]?.id) {
                              fetch('/api/integrations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  projectId: projects[0].id,
                                  provider: item.id,
                                  isActive: !item.connected,
                                }),
                              }).then(() => fetchIntegrations());
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            item.connected
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                          }`}
                        >
                          {item.connected ? 'Disconnect' : 'Configure Integration'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CLOUDFLARE SUITE */}
          {activeTab === 'cloudflare' && (
            <CloudflareManagementHub />
          )}
        </main>
      </div>
    </div>
  );
}
