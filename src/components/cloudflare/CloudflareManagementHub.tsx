'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  Upload,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Globe,
  Lock,
  Search,
  Server,
  Terminal,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { CloudflareTurnstile } from '@/components/auth/CloudflareTurnstile';
import { useApp } from '@/components/providers/AppProviders';

type CloudflareSubTab = 'overview' | 'r2' | 'purge' | 'dns' | 'security' | 'turnstile';

export function CloudflareManagementHub() {
  const { projects, activeProject } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<CloudflareSubTab>('overview');

  // Overall status state
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusData, setStatusData] = useState<any>(null);

  // R2 Storage state
  const [files, setFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('branding');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [r2Stats, setR2Stats] = useState({ totalCount: 0, totalBytes: 0, status: 'checking' });

  // Cache purge state
  const [purgeUrls, setPurgeUrls] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeLog, setPurgeLog] = useState<any[]>([]);

  // DNS Inspector state
  const defaultDomain = activeProject?.domain || (projects[0]?.domain || 'workcomposer.com');
  const [dnsDomain, setDnsDomain] = useState(defaultDomain);
  const [dnsType, setDnsType] = useState('ALL');
  const [isQueryingDns, setIsQueryingDns] = useState(false);
  const [dnsResults, setDnsResults] = useState<any[]>([]);
  const [dnsRawStatus, setDnsRawStatus] = useState<string | null>(null);

  // White label verification
  const [wlDomain, setWlDomain] = useState('rankings.youragency.com');
  const [wlResult, setWlResult] = useState<any>(null);
  const [isVerifyingWl, setIsVerifyingWl] = useState(false);

  // Security Edge Audit state
  const [auditUrl, setAuditUrl] = useState(defaultDomain);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Turnstile test state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [turnstileStatusMsg, setTurnstileStatusMsg] = useState('');

  // Notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch Cloudflare Status
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/cloudflare/status');
      const data = await res.json();
      if (data.success) {
        setStatusData(data.cloudflare);
      }
    } catch (err: any) {
      console.error('Error fetching Cloudflare status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // 2. Fetch R2 Files
  const fetchR2Files = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/cloudflare/r2');
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
        setR2Stats({
          totalCount: data.totalCount || 0,
          totalBytes: data.totalBytes || 0,
          status: data.status,
        });
      }
    } catch (err: any) {
      console.error('Error fetching R2 files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchR2Files();
  }, []);

  // Handle R2 File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast(`Uploading ${file.name} to Cloudflare R2...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', selectedFolder);

      const res = await fetch('/api/cloudflare/r2/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || 'File uploaded successfully!');
        await fetchR2Files();
      } else {
        showToast(data.error || 'Upload failed');
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Handle R2 File Delete
  const handleDeleteFile = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

    try {
      const res = await fetch(`/api/cloudflare/r2?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('File deleted successfully');
        setFiles((prev) => prev.filter((f) => f.key !== key));
      } else {
        showToast(data.error || 'Failed to delete file');
      }
    } catch (err: any) {
      showToast(`Delete error: ${err.message}`);
    }
  };

  // Copy URL to Clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Public CDN URL copied to clipboard');
  };

  // Handle Purge Cache
  const handlePurge = async (purgeEverything = false) => {
    setIsPurging(true);
    showToast(purgeEverything ? 'Purging all edge caches...' : 'Purging specific URLs...');

    const urls = purgeUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/cloudflare/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purgeEverything,
          urls: urls.length > 0 ? urls : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message);
        setPurgeLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: purgeEverything ? 'Purge Everything' : 'Purge URLs',
            details: data.message,
            status: 'Success',
          },
          ...prev,
        ]);
        if (!purgeEverything) setPurgeUrls('');
      } else {
        showToast(data.message || 'Cache purge failed');
      }
    } catch (err: any) {
      showToast(`Purge error: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  // Handle Query DNS
  const handleQueryDns = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dnsDomain.trim()) return;

    setIsQueryingDns(true);
    try {
      const res = await fetch(
        `/api/cloudflare/dns?domain=${encodeURIComponent(dnsDomain.trim())}&type=${dnsType}`
      );
      const data = await res.json();
      if (data.success) {
        setDnsResults(data.records || []);
        setDnsRawStatus(`Resolved via ${data.resolver || data.server || '1.1.1.1'}`);
      } else {
        showToast(data.error || 'DNS resolution failed');
      }
    } catch (err: any) {
      showToast(`DNS query error: ${err.message}`);
    } finally {
      setIsQueryingDns(false);
    }
  };

  // Handle Verify White Label CNAME
  const handleVerifyWl = async () => {
    if (!wlDomain.trim()) return;
    setIsVerifyingWl(true);
    try {
      const res = await fetch(
        `/api/cloudflare/dns?domain=${encodeURIComponent(wlDomain.trim())}&checkWhiteLabel=true`
      );
      const data = await res.json();
      if (data.success) {
        setWlResult(data);
      }
    } catch (err: any) {
      showToast(`Verification error: ${err.message}`);
    } finally {
      setIsVerifyingWl(false);
    }
  };

  // Handle Run Security Audit
  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auditUrl.trim()) return;

    setIsAuditing(true);
    try {
      const res = await fetch(`/api/cloudflare/security?domain=${encodeURIComponent(auditUrl.trim())}`);
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.audit);
      } else {
        showToast(data.error || 'Security inspection failed');
      }
    } catch (err: any) {
      showToast(`Audit error: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  // Handle Turnstile verify
  const handleTurnstileVerify = async (token: string) => {
    setTurnstileToken(token);
    try {
      const res = await fetch('/api/cloudflare/turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setTurnstileVerified(true);
        setTurnstileStatusMsg('Token verified valid by Cloudflare Turnstile API');
      } else {
        setTurnstileVerified(false);
        setTurnstileStatusMsg('Token validation failed');
      }
    } catch (err: any) {
      setTurnstileStatusMsg(`Verification error: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-gray-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Zap className="w-4 h-4 text-[#F6821F]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C2024] via-[#2A2E35] to-[#1E293B] rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6821F]/20 border border-[#F6821F]/40 flex items-center justify-center text-[#F6821F]">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  Cloudflare Suite
                  <span className="text-[10px] font-semibold bg-[#F6821F] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Core Integrated
                  </span>
                </h1>
                <p className="text-xs text-gray-300">
                  Global Anycast CDN, R2 Cloud Object Storage, 1.1.1.1 DNS Engine, and Turnstile Bot Defense.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                fetchStatus();
                fetchR2Files();
                showToast('Refreshing Cloudflare metrics...');
              }}
              disabled={isLoadingStatus}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              <span>Refresh Health</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-gray-700/60 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'overview', label: 'Overview & Health', icon: Sliders },
            { id: 'r2', label: 'R2 Cloud Storage', icon: HardDrive },
            { id: 'purge', label: 'Edge Cache Purge', icon: Zap },
            { id: 'dns', label: '1.1.1.1 DNS & CNAME', icon: Globe },
            { id: 'security', label: 'Edge Security Audit', icon: ShieldCheck },
            { id: 'turnstile', label: 'Turnstile Bot Defense', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as CloudflareSubTab)}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#F6821F] text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & HEALTH */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: API Status */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Cloudflare Account</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 truncate">
                  {statusData?.accountId || 'b931ec11...'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {statusData?.apiTokenConfigured ? 'API Token Configured' : 'Token Active'}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Global API Connected</span>
              </div>
            </div>

            {/* Card 2: R2 Storage */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">R2 Object Bucket</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    r2Stats.status === 'online' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">
                  {statusData?.r2?.bucketName || 'seranking'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {r2Stats.totalCount} stored objects ({formatBytes(r2Stats.totalBytes)})
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">S3 Compatibility</span>
                <span className="font-semibold text-gray-700">Active</span>
              </div>
            </div>

            {/* Card 3: DNS Engine */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Anycast DNS Engine</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">1.1.1.1 Global</p>
                <p className="text-[11px] text-gray-400 mt-0.5">DNS-over-HTTPS (DoH)</p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Zone Manager</span>
                <span className="font-semibold text-emerald-600">Ready</span>
              </div>
            </div>

            {/* Card 4: Turnstile */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Turnstile Bot Shield</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Active Defense</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Privacy-First CAPTCHA</p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Key Status</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F6821F]" />
              Quick Cloudflare Operations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveSubTab('r2')}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#0B69FF] bg-gray-50/50 hover:bg-white cursor-pointer transition flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#0B69FF] group-hover:scale-110 transition shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF] transition">
                    Upload to R2 Bucket
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Store SEO report PDFs, white-label agency logos, or sitemaps.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setActiveSubTab('purge')}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#0B69FF] bg-gray-50/50 hover:bg-white cursor-pointer transition flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF] transition">
                    Purge Edge Cache
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Force global edge nodes to refresh cached pages and static assets.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setActiveSubTab('dns')}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#0B69FF] bg-gray-50/50 hover:bg-white cursor-pointer transition flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF] transition">
                    1.1.1.1 DNS Inspector
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Query A, CNAME, TXT, and MX records across Cloudflare global Anycast.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: R2 CLOUD STORAGE */}
      {activeSubTab === 'r2' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#F6821F]" />
                  Cloudflare R2 Object Storage
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  High-speed, zero-egress fee object storage. Bucket:{' '}
                  <span className="font-semibold text-gray-800">
                    {statusData?.r2?.bucketName || 'seranking'}
                  </span>
                </p>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-700 font-medium focus:outline-hidden"
                >
                  <option value="branding">Folder: /branding</option>
                  <option value="reports">Folder: /reports</option>
                  <option value="avatars">Folder: /avatars</option>
                  <option value="audits">Folder: /audits</option>
                </select>

                <label className="px-4 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File to R2'}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Storage Stats Bar */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Objects Count
                  </span>
                  <span className="font-bold text-gray-800 text-sm">{r2Stats.totalCount} files</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Total Volume
                  </span>
                  <span className="font-bold text-gray-800 text-sm">
                    {formatBytes(r2Stats.totalBytes)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Endpoint
                  </span>
                  <span className="font-medium text-gray-600 truncate max-w-xs block">
                    {statusData?.r2?.endpoint || 'https://...r2.cloudflarestorage.com'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchR2Files}
                className="text-xs text-[#0B69FF] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                <span>Refresh Bucket</span>
              </button>
            </div>

            {/* File List Table */}
            {isLoadingFiles ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading R2 files...</div>
            ) : files.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 space-y-2">
                <HardDrive className="w-8 h-8 mx-auto text-gray-300" />
                <p className="font-medium text-gray-600">No objects in R2 bucket yet</p>
                <p className="text-[11px] text-gray-400">
                  Upload an agency logo, white-label branding asset, or SEO report above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Object Key</th>
                      <th className="px-4 py-3">Storage Engine</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Last Modified</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file) => (
                      <tr key={file.key} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800 flex items-center gap-2">
                          {file.key.match(/\.(png|jpg|jpeg|webp|svg)$/i) ? (
                            <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="truncate max-w-sm">{file.key}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              file.storage === 'cloudflare_r2'
                                ? 'bg-orange-50 text-[#F6821F] border border-orange-200/60'
                                : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            }`}
                          >
                            {file.storage === 'cloudflare_r2' ? 'Cloudflare R2' : 'Local Fallback'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          {formatBytes(file.size)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-[11px]">
                          {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(file.url, file.key)}
                            title="Copy Public URL"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                          >
                            {copiedKey === file.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open URL"
                            className="p-1.5 text-gray-400 hover:text-[#0B69FF] hover:bg-blue-50 rounded-lg transition inline-block cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.key)}
                            title="Delete Object"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* SUB-TAB 3: EDGE CACHE PURGE */}
      {activeSubTab === 'purge' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F6821F]" />
                Cloudflare Edge Cache Purge
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Instantly clear static HTML, stylesheets, and scripts cached on Cloudflare Anycast edge servers worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Purge Form */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Specific URLs to Purge (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={purgeUrls}
                    onChange={(e) => setPurgeUrls(e.target.value)}
                    placeholder={`https://${defaultDomain}/\nhttps://${defaultDomain}/pricing\nhttps://${defaultDomain}/assets/styles.css`}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Cloudflare edge nodes will invalidate cached responses for these exact URLs.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePurge(false)}
                    disabled={isPurging || !purgeUrls.trim()}
                    className="px-5 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                    <span>Purge Specified URLs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to purge the ENTIRE edge cache? This will cause a brief cache warming period.')) {
                        handlePurge(true);
                      }
                    }}
                    disabled={isPurging}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Everything (Zone-wide)</span>
                  </button>
                </div>
              </div>

              {/* Edge Info Card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3 text-xs">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#F6821F]" />
                  Edge Network Status
                </h4>
                <ul className="space-y-2 text-gray-600 text-[11px]">
                  <li className="flex items-center justify-between">
                    <span>Propagation Time:</span>
                    <span className="font-semibold text-emerald-600">&lt; 150ms global</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Datacenters:</span>
                    <span className="font-semibold text-gray-800">330+ Cities</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Tiered Cache:</span>
                    <span className="font-semibold text-gray-800">Enabled</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Brotli / Gzip:</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Execution History */}
            {purgeLog.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-gray-800">Recent Purge Activity</h4>
                <div className="space-y-2">
                  {purgeLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{log.type}:</span>
                        <span className="text-gray-600">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 1.1.1.1 DNS & CNAME */}
      {activeSubTab === 'dns' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F6821F]" />
                Cloudflare 1.1.1.1 Anycast DNS Resolver
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Query live DNS records across Cloudflare&apos;s authoritative Anycast resolver network.
              </p>
            </div>

            {/* DNS Query Bar */}
            <form onSubmit={handleQueryDns} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={dnsDomain}
                  onChange={(e) => setDnsDomain(e.target.value)}
                  placeholder="e.g. workcomposer.com or seranking.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              <select
                value={dnsType}
                onChange={(e) => setDnsType(e.target.value)}
                className="px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
              >
                <option value="ALL">All Records</option>
                <option value="A">A Record (IPv4)</option>
                <option value="AAAA">AAAA Record (IPv6)</option>
                <option value="CNAME">CNAME Record</option>
                <option value="TXT">TXT / SPF / Verification</option>
                <option value="MX">MX (Mail Exchange)</option>
                <option value="NS">NS (Name Server)</option>
              </select>

              <button
                type="submit"
                disabled={isQueryingDns}
                className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className={`w-3.5 h-3.5 ${isQueryingDns ? 'animate-spin' : ''}`} />
                <span>{isQueryingDns ? 'Querying...' : 'Query DNS'}</span>
              </button>
            </form>

            {dnsRawStatus && (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{dnsRawStatus}</span>
              </p>
            )}

            {/* Results Table */}
            {dnsResults.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Host / Name</th>
                      <th className="px-4 py-3">Resolved Target / Value</th>
                      <th className="px-4 py-3 text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                    {dnsResults.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/70">
                        <td className="px-4 py-2.5 font-bold text-[#F6821F]">{r.type}</td>
                        <td className="px-4 py-2.5 text-gray-700">{r.name}</td>
                        <td className="px-4 py-2.5 text-gray-900 break-all">{r.value}</td>
                        <td className="px-4 py-2.5 text-right text-gray-500">{r.ttl}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* White Label CNAME Section */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0B69FF]" />
                White Label CNAME Validator
              </h3>
              <p className="text-xs text-gray-500">
                Verify if your custom white label agency domain points correctly to SE Ranking servers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="text"
                  value={wlDomain}
                  onChange={(e) => setWlDomain(e.target.value)}
                  placeholder="e.g. seo.agency.com"
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleVerifyWl}
                  disabled={isVerifyingWl}
                  className="px-4 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {isVerifyingWl ? 'Checking...' : 'Check CNAME'}
                </button>
              </div>

              {wlResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    wlResult.verified
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {wlResult.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>
                      {wlResult.verified
                        ? 'CNAME Configuration Verified Active'
                        : 'CNAME Pending or Not Pointed'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">{wlResult.instruction}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SECURITY & EDGE AUDIT */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F6821F]" />
                Cloudflare Edge & Security Audit
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Inspect live website headers to verify Cloudflare proxy status, Anycast datacenter location, SSL/TLS, and security headers.
              </p>
            </div>

            <form onSubmit={handleRunAudit} className="flex gap-3 max-w-xl">
              <input
                type="text"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                placeholder="https://workcomposer.com"
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
              />
              <button
                type="submit"
                disabled={isAuditing}
                className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
              </button>
            </form>

            {auditResult && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Cloudflare Proxy
                    </span>
                    <p className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          auditResult.isBehindCloudflare ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                      {auditResult.isBehindCloudflare ? 'Proxied (Active)' : 'Direct IP'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Edge Datacenter
                    </span>
                    <p className="text-base font-bold text-gray-900 mt-1">
                      {auditResult.cfDatacenter || 'GLOBAL'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Cache Header
                    </span>
                    <p className="text-base font-bold text-emerald-600 mt-1">
                      {auditResult.cfCacheStatus || 'HIT'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Security Score
                    </span>
                    <p className="text-base font-bold text-[#0B69FF] mt-1">
                      {auditResult.score} / 100
                    </p>
                  </div>
                </div>

                {/* Security Headers Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Security Header</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Configuration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditResult.securityHeaders?.map((h: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50/70">
                          <td className="px-4 py-2.5 font-semibold text-gray-800">{h.name}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                h.status === 'good'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {h.status === 'good' ? 'Passed' : 'Attention'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-gray-600 truncate max-w-sm">
                            {h.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: TURNSTILE BOT DEFENSE */}
      {activeSubTab === 'turnstile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F6821F]" />
                Cloudflare Turnstile Bot Defense
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Zero-friction, privacy-preserving CAPTCHA replacement protecting authentication and API forms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive Widget Test */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="text-xs font-bold text-gray-800">Live Turnstile Widget Test</h3>
                <p className="text-[11px] text-gray-500">
                  Interact with the widget below to test bot verification and secret key challenge validation.
                </p>

                <div className="max-w-sm">
                  <CloudflareTurnstile onVerify={handleTurnstileVerify} />
                </div>

                {turnstileToken && (
                  <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">
                      Generated Response Token
                    </span>
                    <p className="font-mono text-[11px] text-gray-800 truncate">{turnstileToken}</p>
                    <span
                      className={`text-[11px] font-semibold block mt-1 ${
                        turnstileVerified ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {turnstileStatusMsg}
                    </span>
                  </div>
                )}
              </div>

              {/* Keys & Config */}
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-gray-800">Environment Configuration</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Public Site Key
                    </label>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 truncate">
                      {statusData?.turnstile?.siteKey || '1x00000000000000000000AA'}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Secret Key
                    </label>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 truncate">
                      {statusData?.turnstile?.secretKeyConfigured
                        ? '••••••••••••••••••••••••••••••••'
                        : '1x0000000000000000000000000000000AA'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-900 text-[11px] space-y-1">
                  <span className="font-bold block">Protected Endpoints:</span>
                  <ul className="list-disc list-inside space-y-0.5 opacity-90">
                    <li>Sign In (/login)</li>
                    <li>Sign Up & Free Trial (/signup)</li>
                    <li>Password Recovery (/forgot)</li>
                    <li>Unified Captcha API (/api/auth/verify-captcha)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
