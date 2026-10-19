import { prisma } from '@/lib/db/prisma';

export type JobType =
  | 'RANK_CHECK'
  | 'SITE_AUDIT'
  | 'BACKLINK_SYNC'
  | 'AI_PROMPT_CHECK'
  | 'REPORT_GENERATION'
  | 'KEYWORD_RESEARCH';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface EnqueueJobOptions {
  type: JobType;
  projectId?: string | null;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  allowDuplicate?: boolean;
}

/**
 * Redacts any sensitive secrets (tokens, keys, passwords) from a payload before DB storage or display.
 */
export function redactSecrets(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(redactSecrets);

  const sensitiveKeys = ['password', 'secret', 'token', 'apikey', 'api_key', 'authorization', 'cookie'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSecrets(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Enqueues a job in the database. Protects against duplicate concurrent jobs for the same project/type.
 */
export async function enqueueJob(options: EnqueueJobOptions) {
  const { type, projectId = null, payload = {}, maxAttempts = 3, allowDuplicate = false } = options;

  // Duplicate job block: Prevent duplicate active jobs for the same project & type
  if (!allowDuplicate && projectId) {
    const existingActive = await prisma.job.findFirst({
      where: {
        type,
        projectId,
        status: { in: ['queued', 'running'] },
      },
      select: { id: true, status: true, createdAt: true },
    });

    if (existingActive) {
      return {
        job: existingActive,
        alreadyQueued: true,
      };
    }
  }

  const sanitizedPayload = JSON.stringify(redactSecrets(payload));

  const job = await prisma.job.create({
    data: {
      type,
      projectId,
      payload: sanitizedPayload,
      status: 'queued',
      maxAttempts,
      attempts: 0,
    },
  });

  // Log creation event
  await prisma.jobLog.create({
    data: {
      jobId: job.id,
      level: 'info',
      message: `Job ${type} enqueued successfully.`,
      metadata: JSON.stringify({ maxAttempts }),
    },
  });

  return { job, alreadyQueued: false };
}

/**
 * Appends a log entry to a job.
 */
export async function appendJobLog(jobId: string, level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) {
  try {
    return await prisma.jobLog.create({
      data: {
        jobId,
        level,
        message,
        metadata: metadata ? JSON.stringify(redactSecrets(metadata)) : null,
      },
    });
  } catch (err) {
    console.error(`Failed to write job log for job ${jobId}:`, err);
    return null;
  }
}

/**
 * Idempotently retries a failed or cancelled job.
 */
export async function retryJob(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status === 'running') {
    throw new Error('Job is currently executing and cannot be restarted.');
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'queued',
      error: null,
      startedAt: null,
      completedAt: null,
      attempts: 0, // Reset attempt counter for administrative retry
    },
  });

  await appendJobLog(jobId, 'info', 'Job restarted via Admin Panel.');
  return updated;
}

/**
 * Administratively cancels a queued or running job.
 */
export async function cancelJob(jobId: string, reason?: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    return job;
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'cancelled',
      completedAt: new Date(),
      error: reason ? `Cancelled by admin: ${reason}` : 'Cancelled by administrator',
    },
  });

  await appendJobLog(jobId, 'warn', `Job cancelled: ${reason || 'Administrative action'}`);
  return updated;
}
