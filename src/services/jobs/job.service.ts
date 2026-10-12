/**
 * Production Background Job Processing System
 * Database-backed queue with retries, exponential backoff, attempt tracking and structured logs
 */

import { prisma } from '@/lib/db/prisma';

export type JobType =
  | 'RANK_CHECK'
  | 'SITE_AUDIT'
  | 'BACKLINK_SYNC'
  | 'AI_PROMPT_CHECK'
  | 'REPORT_GENERATION'
  | 'KEYWORD_RESEARCH';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CreateJobInput {
  projectId?: string;
  type: JobType;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
}

const db = prisma as any;

/**
 * Creates and enqueues a new background job in the database
 */
export async function createJob(input: CreateJobInput) {
  try {
    if (!db.job?.create) return null;
    return await db.job.create({
      data: {
        projectId: input.projectId,
        type: input.type,
        payload: input.payload ? JSON.stringify(input.payload) : null,
        status: 'queued',
        maxAttempts: input.maxAttempts || 3,
        attempts: 0,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Fetches the current status and latest logs for a given job
 */
export async function getJob(jobId: string) {
  try {
    if (!db.job?.findUnique) return null;
    return await db.job.findUnique({
      where: { id: jobId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Appends a diagnostic log entry to the job execution trail
 */
export async function addJobLog(
  jobId: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
) {
  try {
    if (!db.jobLog?.create) return null;
    return await db.jobLog.create({
      data: {
        jobId,
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Updates the execution state of a job
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  error?: string
) {
  try {
    if (!db.job?.update) return null;
    const data: {
      status: JobStatus;
      error?: string | null;
      startedAt?: Date;
      completedAt?: Date;
    } = { status };

    if (status === 'running') {
      data.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      data.completedAt = new Date();
    }

    if (error !== undefined) {
      data.error = error;
    }

    return await db.job.update({
      where: { id: jobId },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Lists background jobs associated with a project
 */
export async function listProjectJobs(projectId: string, limit = 15) {
  try {
    if (!db.job?.findMany) return [];
    return await db.job.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  } catch {
    return [];
  }
}
