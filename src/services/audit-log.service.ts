/**
 * Production Audit Log & Action Tracking Service
 * Immutable activity trail for security, governance, and user event tracking.
 */

import { prisma } from '@/lib/db/prisma';

export type AuditAction =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'keyword.added'
  | 'keyword.deleted'
  | 'competitor.added'
  | 'audit.started'
  | 'ranking.checked'
  | 'report.generated'
  | 'settings.updated';

export interface LogActionInput {
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Records an immutable audit log entry into the database
 */
export async function logAuditAction(input: LogActionInput) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: input.userId || undefined,
        userName: input.userName || 'System / Admin',
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || 'system',
        details: input.details ? JSON.stringify(input.details) : undefined,
        ipAddress: input.ipAddress || '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('Failed to write audit log entry:', err);
    return null;
  }
}

/**
 * Retrieves recent audit logs
 */
export async function listAuditLogs(limit = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
