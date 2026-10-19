/**
 * Enterprise SEO SaaS Permission & Quota Engine
 * Handles per-user SEO tool authorization, plan tiers, and usage quotas.
 */

import { prisma } from '@/lib/db/prisma';

export interface ToolPermissions {
  audits: boolean;
  rankings: boolean;
  keywords: boolean;
  backlinks: boolean;
  ai_visibility: boolean;
  competitor_research: boolean;
  reports: boolean;
}

export type ToolKey = keyof ToolPermissions;

export interface PlanUsageLimits {
  maxProjects: number;
  monthlyKeywords: number;
  monthlyAuditPages: number;
  monthlyBacklinkQueries: number;
  monthlyAiQueries: number;
}

export interface UserUsageCurrent {
  keywordsUsed: number;
  auditPagesUsed: number;
  backlinkQueriesUsed: number;
  aiQueriesUsed: number;
  periodStart: string; // ISO date string (YYYY-MM-01)
}

export const ALL_TOOLS_ENABLED: ToolPermissions = {
  audits: true,
  rankings: true,
  keywords: true,
  backlinks: true,
  ai_visibility: true,
  competitor_research: true,
  reports: true,
};

export const PLAN_CONFIGS: Record<
  string,
  { name: string; limits: PlanUsageLimits; defaultPermissions: ToolPermissions }
> = {
  FREE_TRIAL: {
    name: 'Free Trial',
    limits: {
      maxProjects: 1,
      monthlyKeywords: 25,
      monthlyAuditPages: 50,
      monthlyBacklinkQueries: 10,
      monthlyAiQueries: 10,
    },
    defaultPermissions: {
      audits: true,
      rankings: true,
      keywords: true,
      backlinks: false,
      ai_visibility: false,
      competitor_research: true,
      reports: false,
    },
  },
  STARTER: {
    name: 'Starter Plan',
    limits: {
      maxProjects: 5,
      monthlyKeywords: 250,
      monthlyAuditPages: 500,
      monthlyBacklinkQueries: 100,
      monthlyAiQueries: 50,
    },
    defaultPermissions: {
      audits: true,
      rankings: true,
      keywords: true,
      backlinks: true,
      ai_visibility: true,
      competitor_research: true,
      reports: false,
    },
  },
  PRO: {
    name: 'Pro Professional',
    limits: {
      maxProjects: 20,
      monthlyKeywords: 1000,
      monthlyAuditPages: 5000,
      monthlyBacklinkQueries: 1000,
      monthlyAiQueries: 250,
    },
    defaultPermissions: {
      audits: true,
      rankings: true,
      keywords: true,
      backlinks: true,
      ai_visibility: true,
      competitor_research: true,
      reports: true,
    },
  },
  AGENCY: {
    name: 'Agency Pack',
    limits: {
      maxProjects: 100,
      monthlyKeywords: 5000,
      monthlyAuditPages: 25000,
      monthlyBacklinkQueries: 10000,
      monthlyAiQueries: 1000,
    },
    defaultPermissions: {
      audits: true,
      rankings: true,
      keywords: true,
      backlinks: true,
      ai_visibility: true,
      competitor_research: true,
      reports: true,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise Unlimited',
    limits: {
      maxProjects: 9999,
      monthlyKeywords: 999999,
      monthlyAuditPages: 999999,
      monthlyBacklinkQueries: 999999,
      monthlyAiQueries: 999999,
    },
    defaultPermissions: ALL_TOOLS_ENABLED,
  },
};

/**
 * Resolves active ToolPermissions for a user.
 * SUPERADMIN and OWNER roles have full permissions unconditionally.
 */
export function resolveUserToolPermissions(user: {
  role: string;
  planTier?: string | null;
  toolPermissions?: string | null;
}): ToolPermissions {
  const role = (user.role || '').toUpperCase();
  if (role === 'SUPERADMIN' || role === 'OWNER') {
    return { ...ALL_TOOLS_ENABLED };
  }

  // Parse explicit custom tool permissions if set
  if (user.toolPermissions) {
    try {
      const parsed = JSON.parse(user.toolPermissions);
      return {
        audits: Boolean(parsed.audits),
        rankings: Boolean(parsed.rankings),
        keywords: Boolean(parsed.keywords),
        backlinks: Boolean(parsed.backlinks),
        ai_visibility: Boolean(parsed.ai_visibility),
        competitor_research: Boolean(parsed.competitor_research),
        reports: Boolean(parsed.reports),
      };
    } catch {
      // fallback
    }
  }

  const plan = PLAN_CONFIGS[user.planTier || 'FREE_TRIAL'] || PLAN_CONFIGS.FREE_TRIAL;
  return { ...plan.defaultPermissions };
}

/**
 * Resolves current plan limits for a user.
 */
export function resolveUserPlanLimits(user: {
  role: string;
  planTier?: string | null;
  usageLimits?: string | null;
}): PlanUsageLimits {
  const role = (user.role || '').toUpperCase();
  if (role === 'SUPERADMIN' || role === 'OWNER') {
    return { ...PLAN_CONFIGS.ENTERPRISE.limits };
  }

  if (user.usageLimits) {
    try {
      const parsed = JSON.parse(user.usageLimits);
      return {
        maxProjects: Number(parsed.maxProjects) || 1,
        monthlyKeywords: Number(parsed.monthlyKeywords) || 25,
        monthlyAuditPages: Number(parsed.monthlyAuditPages) || 50,
        monthlyBacklinkQueries: Number(parsed.monthlyBacklinkQueries) || 10,
        monthlyAiQueries: Number(parsed.monthlyAiQueries) || 10,
      };
    } catch {
      // fallback
    }
  }

  const plan = PLAN_CONFIGS[user.planTier || 'FREE_TRIAL'] || PLAN_CONFIGS.FREE_TRIAL;
  return { ...plan.limits };
}

/**
 * Returns current period ISO string for monthly tracking: "YYYY-MM-01"
 */
function getCurrentPeriodStart(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Resolves current usage counts for a user, automatically resetting if a new calendar month started.
 */
export function resolveUserCurrentUsage(user: { usageCurrent?: string | null }): UserUsageCurrent {
  const currentPeriod = getCurrentPeriodStart();
  const defaultUsage: UserUsageCurrent = {
    keywordsUsed: 0,
    auditPagesUsed: 0,
    backlinkQueriesUsed: 0,
    aiQueriesUsed: 0,
    periodStart: currentPeriod,
  };

  if (!user.usageCurrent) {
    return defaultUsage;
  }

  try {
    const parsed = JSON.parse(user.usageCurrent);
    if (parsed.periodStart !== currentPeriod) {
      // Monthly reset
      return defaultUsage;
    }
    return {
      keywordsUsed: Number(parsed.keywordsUsed) || 0,
      auditPagesUsed: Number(parsed.auditPagesUsed) || 0,
      backlinkQueriesUsed: Number(parsed.backlinkQueriesUsed) || 0,
      aiQueriesUsed: Number(parsed.aiQueriesUsed) || 0,
      periodStart: currentPeriod,
    };
  } catch {
    return defaultUsage;
  }
}

export type QuotaMetric = 'keywords' | 'auditPages' | 'backlinks' | 'ai';

/**
 * Enforces usage quota. Returns allowed=true or throws/returns 402 error details.
 */
export async function checkAndIncrementQuota(
  userId: string,
  metric: QuotaMetric,
  incrementBy = 1
): Promise<{ allowed: boolean; used: number; limit: number; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      planTier: true,
      usageLimits: true,
      usageCurrent: true,
    },
  });

  if (!user) {
    return { allowed: false, used: 0, limit: 0, error: 'User not found' };
  }

  const role = (user.role || '').toUpperCase();
  if (role === 'SUPERADMIN' || role === 'OWNER') {
    return { allowed: true, used: 0, limit: 999999 };
  }

  const limits = resolveUserPlanLimits(user);
  const usage = resolveUserCurrentUsage(user);

  let limit = limits.monthlyKeywords;
  let currentUsed = usage.keywordsUsed;
  let metricKey: keyof UserUsageCurrent = 'keywordsUsed';

  if (metric === 'auditPages') {
    limit = limits.monthlyAuditPages;
    currentUsed = usage.auditPagesUsed;
    metricKey = 'auditPagesUsed';
  } else if (metric === 'backlinks') {
    limit = limits.monthlyBacklinkQueries;
    currentUsed = usage.backlinkQueriesUsed;
    metricKey = 'backlinkQueriesUsed';
  } else if (metric === 'ai') {
    limit = limits.monthlyAiQueries;
    currentUsed = usage.aiQueriesUsed;
    metricKey = 'aiQueriesUsed';
  }

  if (currentUsed + incrementBy > limit) {
    return {
      allowed: false,
      used: currentUsed,
      limit,
      error: `Monthly quota exceeded: Your plan allows ${limit} ${metric} operations. Currently used: ${currentUsed}. Please upgrade your plan.`,
    };
  }

  // Atomically persist incremented usage
  const updatedUsage: UserUsageCurrent = {
    ...usage,
    [metricKey]: currentUsed + incrementBy,
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      usageCurrent: JSON.stringify(updatedUsage),
    },
  });

  return {
    allowed: true,
    used: currentUsed + incrementBy,
    limit,
  };
}

/**
 * Verifies that the user has approval to access tools.
 * Throws an error or returns false if status is pending, rejected, or suspended.
 */
export function isUserApproved(user: { status: string }): boolean {
  return user.status === 'active' || user.status === 'approved';
}
