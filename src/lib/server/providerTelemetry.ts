import { prisma } from '@/lib/db/prisma';

export interface ProviderLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface ProviderTelemetryRecord {
  lastTestedAt: string | null;
  lastLatencyMs: number | null;
  lastStatus: 'HEALTHY' | 'BLOCKED_CREDITS' | 'NOT_CONFIGURED' | 'ERROR';
  lastRequest: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    payloadSummary?: string;
  } | null;
  lastResponse: {
    status: number;
    message: string;
    payloadSummary?: string;
  } | null;
  redactedLogs: ProviderLogEntry[];
}

/**
 * Mask sensitive tokens and API keys, showing only the final 4 characters.
 */
export function redactSecret(secret: string | null | undefined): string {
  if (!secret || secret.trim().length === 0) return 'NOT_CONFIGURED';
  const clean = secret.trim();
  if (clean.length <= 6) return '••••••••';
  return `••••••••${clean.slice(-4)}`;
}

// In-memory telemetry cache across dev & server runs
const telemetryStore = new Map<string, ProviderTelemetryRecord>();

export function getProviderTelemetry(providerId: string): ProviderTelemetryRecord {
  if (!telemetryStore.has(providerId)) {
    telemetryStore.set(providerId, {
      lastTestedAt: null,
      lastLatencyMs: null,
      lastStatus: 'NOT_CONFIGURED',
      lastRequest: null,
      lastResponse: null,
      redactedLogs: [],
    });
  }
  return telemetryStore.get(providerId)!;
}

export function recordProviderTelemetry(
  providerId: string,
  update: Partial<ProviderTelemetryRecord> & { logEntry?: string; logLevel?: 'info' | 'warn' | 'error' }
) {
  const current = getProviderTelemetry(providerId);
  const updated: ProviderTelemetryRecord = {
    ...current,
    ...update,
    lastTestedAt: update.lastTestedAt ?? current.lastTestedAt,
    lastLatencyMs: update.lastLatencyMs ?? current.lastLatencyMs,
    lastStatus: update.lastStatus ?? current.lastStatus,
    lastRequest: update.lastRequest !== undefined ? update.lastRequest : current.lastRequest,
    lastResponse: update.lastResponse !== undefined ? update.lastResponse : current.lastResponse,
    redactedLogs: [...current.redactedLogs],
  };

  if (update.logEntry) {
    updated.redactedLogs.unshift({
      timestamp: new Date().toISOString(),
      level: update.logLevel || 'info',
      message: update.logEntry,
    });
    // Keep max 15 log entries per provider
    if (updated.redactedLogs.length > 15) {
      updated.redactedLogs = updated.redactedLogs.slice(0, 15);
    }
  }

  telemetryStore.set(providerId, updated);
  return updated;
}

/**
 * Executes a live, non-destructive connection test against the requested provider.
 */
export async function executeProviderConnectionTest(providerId: string): Promise<{
  success: boolean;
  status: 'HEALTHY' | 'BLOCKED_CREDITS' | 'NOT_CONFIGURED' | 'ERROR';
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}> {
  const startTime = Date.now();

  if (providerId === 'database') {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      recordProviderTelemetry('database', {
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: latency,
        lastStatus: 'HEALTHY',
        lastRequest: {
          method: 'INTERNAL',
          endpoint: 'Prisma Client -> PostgreSQL Pool (SELECT 1)',
          headers: { Connection: 'Pooler/Direct' },
          payloadSummary: 'SELECT 1',
        },
        lastResponse: {
          status: 200,
          message: 'PostgreSQL connection alive and responsive',
          payloadSummary: `Latency: ${latency}ms`,
        },
        logEntry: `[Database] Ping verified via SELECT 1 (${latency}ms). Pool operational.`,
        logLevel: 'info',
      });
      return {
        success: true,
        status: 'HEALTHY',
        latencyMs: latency,
        message: `Database connection verified (${latency}ms latency).`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database query failed';
      const latency = Date.now() - startTime;
      recordProviderTelemetry('database', {
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: latency,
        lastStatus: 'ERROR',
        lastResponse: { status: 500, message: msg },
        logEntry: `[Database] Query error: ${msg}`,
        logLevel: 'error',
      });
      return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
    }
  }

  if (providerId === 'serper') {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      recordProviderTelemetry('serper', {
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: 0,
        lastStatus: 'NOT_CONFIGURED',
        logEntry: '[Serper] Connection test skipped: SERPER_API_KEY missing.',
        logLevel: 'warn',
      });
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        latencyMs: 0,
        message: 'SERPER_API_KEY is not configured in server environment.',
      };
    }

    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: 'ping', num: 1 }),
      });
      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const remainingCredits = data.credits ?? 'Active';
        recordProviderTelemetry('serper', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'HEALTHY',
          lastRequest: {
            method: 'POST',
            endpoint: 'https://google.serper.dev/search',
            headers: { 'X-API-KEY': redactSecret(apiKey), 'Content-Type': 'application/json' },
            payloadSummary: JSON.stringify({ q: 'ping', num: 1 }),
          },
          lastResponse: {
            status: 200,
            message: `HTTP 200 OK — Serper operational. Credits: ${remainingCredits}`,
            payloadSummary: JSON.stringify({ credits: remainingCredits, organicResults: (data.organic || []).length }),
          },
          logEntry: `[Serper] Live test HTTP 200 OK (${latency}ms). Credits available: ${remainingCredits}.`,
          logLevel: 'info',
        });
        return {
          success: true,
          status: 'HEALTHY',
          latencyMs: latency,
          message: `Serper connection verified (HTTP 200 OK, Credits: ${remainingCredits}).`,
          details: { credits: remainingCredits },
        };
      } else {
        const errMsg = data.message || `HTTP ${res.status} ${res.statusText}`;
        recordProviderTelemetry('serper', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'ERROR',
          lastResponse: { status: res.status, message: errMsg },
          logEntry: `[Serper] Test rejected: ${errMsg}`,
          logLevel: 'error',
        });
        return { success: false, status: 'ERROR', latencyMs: latency, message: errMsg };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure contacting Serper';
      const latency = Date.now() - startTime;
      return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
    }
  }

  if (providerId === 'yepapi') {
    const apiKey = process.env.YEPAPI_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      recordProviderTelemetry('yepapi', {
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: 0,
        lastStatus: 'NOT_CONFIGURED',
        logEntry: '[YepAPI] Test skipped: YEPAPI_KEY not configured.',
        logLevel: 'warn',
      });
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        latencyMs: 0,
        message: 'YEPAPI_KEY is not configured in server environment.',
      };
    }

    try {
      const res = await fetch('https://api.yepapi.com/v1/keywords', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: 'seo' }),
      });
      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.status === 402) {
        const errorDetail = data.error?.message || 'Account balance is insufficient. Recharge at https://yepapi.com/billing';
        recordProviderTelemetry('yepapi', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'BLOCKED_CREDITS',
          lastRequest: {
            method: 'POST',
            endpoint: 'https://api.yepapi.com/v1/keywords',
            headers: { 'Authorization': `Bearer ${redactSecret(apiKey)}`, 'Content-Type': 'application/json' },
            payloadSummary: JSON.stringify({ keyword: 'seo' }),
          },
          lastResponse: {
            status: 402,
            message: `HTTP 402 Insufficient Funds: ${errorDetail}`,
            payloadSummary: JSON.stringify(data),
          },
          logEntry: `[YepAPI] Outbound call returned HTTP 402: ${errorDetail}`,
          logLevel: 'warn',
        });
        return {
          success: false,
          status: 'BLOCKED_CREDITS',
          latencyMs: latency,
          message: `YepAPI key is valid, but account balance is exhausted (HTTP 402: ${errorDetail}).`,
          details: { code: 'INSUFFICIENT_FUNDS', billingUrl: 'https://yepapi.com/billing' },
        };
      }

      if (res.ok) {
        recordProviderTelemetry('yepapi', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'HEALTHY',
          lastResponse: { status: 200, message: 'YepAPI keywords active' },
          logEntry: `[YepAPI] Live test HTTP 200 OK (${latency}ms).`,
          logLevel: 'info',
        });
        return { success: true, status: 'HEALTHY', latencyMs: latency, message: 'YepAPI is operational.' };
      }

      const msg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure contacting YepAPI';
      const latency = Date.now() - startTime;
      return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
    }
  }

  if (providerId === 'pagespeed') {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com${apiKey ? `&key=${apiKey}` : ''}`;

    try {
      const res = await fetch(url);
      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.lighthouseResult) {
        const perfScore = Math.round((data.lighthouseResult.categories?.performance?.score ?? 1) * 100);
        recordProviderTelemetry('pagespeed', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'HEALTHY',
          lastRequest: {
            method: 'GET',
            endpoint: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com',
            headers: apiKey ? { key: redactSecret(apiKey) } : { Mode: 'Public API quota' },
          },
          lastResponse: {
            status: 200,
            message: `HTTP 200 OK — Lighthouse test passed (Performance: ${perfScore}/100)`,
            payloadSummary: JSON.stringify({ score: perfScore, latencyMs: latency }),
          },
          logEntry: `[PageSpeed] Verified via Google Lighthouse API. Score: ${perfScore}/100 (${latency}ms).`,
          logLevel: 'info',
        });
        return {
          success: true,
          status: 'HEALTHY',
          latencyMs: latency,
          message: `Google PageSpeed Insights verified (Lighthouse score: ${perfScore}/100, ${latency}ms).`,
          details: { performanceScore: perfScore },
        };
      } else {
        const msg = data.error?.message || `HTTP ${res.status}`;
        return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'PageSpeed test failed';
      return { success: false, status: 'ERROR', latencyMs: Date.now() - startTime, message: msg };
    }
  }

  if (providerId === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        latencyMs: 0,
        message: 'OPENAI_API_KEY is not configured in server environment.',
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const count = (data.data || []).length;
        recordProviderTelemetry('openai', {
          lastTestedAt: new Date().toISOString(),
          lastLatencyMs: latency,
          lastStatus: 'HEALTHY',
          lastRequest: {
            method: 'GET',
            endpoint: 'https://api.openai.com/v1/models',
            headers: { Authorization: `Bearer ${redactSecret(apiKey)}` },
          },
          lastResponse: {
            status: 200,
            message: `HTTP 200 OK — OpenAI models verified (${count} models available)`,
          },
          logEntry: `[OpenAI] Test successful. ${count} models accessible (${latency}ms).`,
          logLevel: 'info',
        });
        return {
          success: true,
          status: 'HEALTHY',
          latencyMs: latency,
          message: `OpenAI connection active and authenticated (${count} models available).`,
          details: { modelCount: count },
        };
      } else {
        const msg = data.error?.message || `HTTP ${res.status}`;
        return { success: false, status: 'ERROR', latencyMs: latency, message: msg };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OpenAI test failed';
      return { success: false, status: 'ERROR', latencyMs: Date.now() - startTime, message: msg };
    }
  }

  if (providerId === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      recordProviderTelemetry('gemini', {
        lastTestedAt: new Date().toISOString(),
        lastLatencyMs: 0,
        lastStatus: 'NOT_CONFIGURED',
        logEntry: '[Gemini] Test skipped: GEMINI_API_KEY not configured.',
        logLevel: 'warn',
      });
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        latencyMs: 0,
        message: 'GEMINI_API_KEY is not configured (ENGINE_UNCONFIGURED).',
      };
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const latency = Date.now() - startTime;
      if (res.ok) {
        return { success: true, status: 'HEALTHY', latencyMs: latency, message: 'Gemini API verified.' };
      } else {
        return { success: false, status: 'ERROR', latencyMs: latency, message: `HTTP ${res.status}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gemini test failed';
      return { success: false, status: 'ERROR', latencyMs: Date.now() - startTime, message: msg };
    }
  }

  return {
    success: false,
    status: 'NOT_CONFIGURED',
    latencyMs: 0,
    message: `Unknown provider ID: ${providerId}`,
  };
}
