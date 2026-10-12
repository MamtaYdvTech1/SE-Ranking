"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { NotificationDto } from "../../lib/types";
import { Button, Badge } from "@internal-seo/ui";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
  projectId?: string;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  onCountChange,
  projectId,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.notifications.list({
        page: 1,
        pageSize: 50,
        unreadOnly: filter === "unread" ? true : undefined,
        projectId: projectId,
      });

      if (res.success && res.data) {
        setNotifications(res.data.items);
      } else {
        setError(res.message || "Failed to load notifications.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error fetching notifications.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filter, projectId]);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      const timer = setTimeout(() => {
        if (mounted) {
          loadNotifications();
        }
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await api.notifications.markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        // Refresh unread count
        const countRes = await api.notifications.getUnreadCount();
        if (countRes.success && countRes.data && onCountChange) {
          onCountChange(countRes.data.count);
        }
      }
    } catch {
      // Ignored or logged
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await api.notifications.markAllRead(projectId);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        if (onCountChange) {
          onCountChange(0);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark all as read.";
      setError(message);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Badge variant="danger">Critical</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      data-testid="notifications-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        data-testid="notifications-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Alerts, audit results & tasks</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                data-testid="close-drawer-button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                data-testid="filter-all-button"
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  filter === "all"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                data-testid="filter-unread-button"
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  filter === "unread"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Unread
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || unreadCount === 0}
              data-testid="mark-all-read-button"
              className="text-xs h-7 px-2.5"
            >
              {isMarkingAll ? "Marking..." : "Mark all read"}
            </Button>
          </div>

          {/* Feed Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="notifications-list">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400" data-testid="notifications-loading">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                <span className="text-xs">Loading alerts...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700" data-testid="notifications-error">
                <p className="font-semibold">Unable to load notifications</p>
                <p className="mt-1">{error}</p>
                <button
                  type="button"
                  onClick={loadNotifications}
                  className="mt-2 font-medium text-red-800 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && notifications.length === 0 && (
              <div className="text-center py-16 px-4" data-testid="notifications-empty">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No notifications</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {filter === "unread"
                    ? "You're all caught up! No unread alerts."
                    : "No notifications have been recorded yet."}
                </p>
              </div>
            )}

            {!isLoading && !error && notifications.length > 0 && (
              notifications.map((item) => (
                <div
                  key={item.id}
                  data-testid={`notification-item-${item.id}`}
                  className={`p-3.5 rounded-lg border transition-all ${
                    item.isRead
                      ? "bg-white border-slate-200 text-slate-600"
                      : "bg-blue-50/50 border-blue-200/80 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getSeverityBadge(item.severity)}
                      <span className="text-[11px] font-medium text-slate-500">
                        {item.projectName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold ${item.isRead ? "text-slate-800" : "text-slate-900"}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    {item.targetUrl ? (
                      <Link
                        href={item.targetUrl}
                        onClick={onClose}
                        data-testid={`notification-link-${item.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View details
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : (
                      <span />
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        data-testid={`mark-read-button-${item.id}`}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer link to full page */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <Link
              href="/notifications"
              onClick={onClose}
              data-testid="view-all-notifications-link"
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Open Full Notifications Feed &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
