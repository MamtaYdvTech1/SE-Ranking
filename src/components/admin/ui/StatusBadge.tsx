'use client';

import React from 'react';

export type BadgeStatus =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'HEALTHY'
  | 'BLOCKED_CREDITS'
  | 'NOT_CONFIGURED'
  | 'Error'
  | 'Warning'
  | 'Notice'
  | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const norm = String(status).toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'active' || norm === 'completed' || norm === 'healthy' || norm === 'ready') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'running') {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    dotColor = 'bg-blue-400 animate-pulse';
  } else if (norm === 'queued' || norm === 'pending' || norm === 'warning' || norm === 'notice') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotColor = 'bg-amber-400';
  } else if (norm === 'failed' || norm === 'suspended' || norm === 'error' || norm === 'blocked_credits') {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dotColor = 'bg-rose-400';
  } else if (norm === 'cancelled' || norm === 'not_configured' || norm === 'archived') {
    styles = 'bg-slate-800 text-slate-400 border-slate-700/60';
    dotColor = 'bg-slate-400';
  }

  const displayLabel = label || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}
