"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
  Shield,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Broadcast modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "critical" | "success">("info");
  const [targetRole, setTargetRole] = useState<"ALL" | "ADMIN" | "SEO_USER" | "CLIENT">("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load notifications");
      }
      setNotifications(json.data);
    } catch (err: any) {
      setFetchError(err.message);
      error("Failed to load notifications: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      error("Title and message are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type, targetRole }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send notification");
      }
      success(json.message);
      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      fetchNotifications();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<NotificationItem>[] = [
    {
      header: "Alert & Message",
      accessor: "title",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                row.type === "warning" || row.type === "critical"
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                  : row.type === "success"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
                  : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700"
              }`}
            >
              {row.type}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{row.title}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl line-clamp-2 leading-relaxed">
            {row.message}
          </p>
        </div>
      ),
    },
    {
      header: "Recipient",
      accessor: "userEmail",
      cell: (row) => (
        <div>
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{row.userName}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.userEmail}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "read",
      cell: (row) => (
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            row.read
              ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
              : "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold"
          }`}
        >
          {row.read ? "Read" : "Unread"}
        </span>
      ),
    },
    {
      header: "Delivered",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  if (isLoading && notifications.length === 0) {
    return <SkeletonLoader type="table" />;
  }

  if (fetchError && notifications.length === 0) {
    return <ErrorState message={fetchError} onRetry={fetchNotifications} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-500" />
            <span>Platform Broadcasts & Notifications</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish system announcements, maintenance alerts, and automated threshold alerts across user roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered Alerts</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{notifications.length}</div>
          <div className="text-xs text-slate-400 mt-1">Indexed in PostgreSQL database</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unread Messages</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {notifications.filter((n) => !n.read).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Pending user review</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Channels</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">In-App + Email</div>
          <div className="text-xs text-slate-400 mt-1">Dual dispatch enabled</div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <DataTable
          columns={columns}
          data={notifications}
          searchField="title"
          pageSize={15}
          emptyMessage="No notifications on record."
        />
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-500" />
                <span>Dispatch Platform Broadcast</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Maintenance: Database Upgrade at 02:00 UTC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter notification details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alert Type
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e: any) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="ALL">All Active Users</option>
                    <option value="ADMIN">Administrators Only</option>
                    <option value="SEO_USER">SEO Operators Only</option>
                    <option value="CLIENT">Clients Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Dispatching..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
