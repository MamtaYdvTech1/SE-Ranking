"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../../lib/api";
import { NotificationsDrawer } from "./NotificationsDrawer";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.notifications.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.count);
        setHasError(false);
      }
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialTimer = setTimeout(() => {
      if (mounted) {
        fetchUnreadCount();
      }
    }, 0);

    // 60-second lightweight polling for unread count
    timerRef.current = setInterval(() => {
      if (mounted) {
        fetchUnreadCount();
      }
    }, 60000);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchUnreadCount]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Refresh count on close in case user marked notifications as read
    fetchUnreadCount();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenDrawer}
        aria-label="Open notifications"
        data-testid="notification-bell-button"
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {hasError && unreadCount === 0 && (
          <span
            data-testid="bell-error-dot"
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"
            title="Unable to fetch notifications"
          />
        )}
      </button>

      <NotificationsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onCountChange={setUnreadCount}
      />
    </>
  );
}
