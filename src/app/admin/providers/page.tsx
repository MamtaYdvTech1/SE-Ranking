'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Server,
  Zap,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  CreditCard,
  Lock,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';

interface ProviderTelemetry {
  lastTestedAt: string | null;
  lastLatencyMs: number | null;
  lastStatus: string;
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
  redactedLogs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
  }>;
}

interface ProviderInfo {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  status: string;
  maskedKey: string | null;
  endpoints: { method: string; path: string; description: string }[];
  healthMessage: string;
  rateLimits: string;
  recoveryGuidance: string;
  telemetry?: ProviderTelemetry;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Testing status
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    status: string;
    latencyMs?: number;
    message: string;
  } | null>(null);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/providers');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch provider registry');
      }
      setProviders(json.data.providers || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading providers';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    fetch('/api/admin/providers')
      .then((res) => res.json())
      .then((json) => {
        if (!isSubscribed) return;
        if (json.success) {
          setProviders(json.data.providers || []);
        } else {
          setError(json.message || 'Failed to fetch provider registry');
        }
      })
      .catch((err: unknown) => {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Error loading providers';
        setError(msg);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const toggleExpand = (providerId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });
      const json = await res.json();

      setTestResult({
        id: providerId,
        success: Boolean(json.success && json.data?.status === 'HEALTHY'),
        status: json.data?.status || (json.success ? 'HEALTHY' : 'ERROR'),
        latencyMs: json.data?.latencyMs,
        message: json.data?.message || json.message || 'Test completed.',
      });

      // Update provider in state with fresh telemetry
      if (json.data?.telemetry) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  status: json.data.status,
                  telemetry: json.data.telemetry,
                }
              : p
          )
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setTestResult({
        id: providerId,
        success: false,
        status: 'ERROR',
        message: msg,
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Provider Registry & Integration Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side telemetry, non-destructive connection tests, credential security status, and billing blockers.
          </p>
        </div>

        <button
          onClick={fetchProviders}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold cursor-pointer self-start sm:self-auto"
          title="Refresh providers"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && <SkeletonLoader type="table" rows={6} />}

      {/* Error state */}
      {error && !isLoading && (
        <ErrorState title="Failed to load providers" message={error} onRetry={fetchProviders} />
      )}

      {/* Main Providers List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {providers.map((p) => {
            const isBlocked = p.status === 'BLOCKED_CREDITS';
            const isHealthy = p.status === 'HEALTHY';
            const isExpanded = Boolean(expandedLogs[p.id]);
            const telemetry = p.telemetry;

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4 hover:border-slate-700/80 transition shadow-sm"
              >
                {/* Top Row: Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isBlocked
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {p.id === 'database' ? (
                        <Server className="w-5 h-5" />
                      ) : p.id.includes('ai') || p.id === 'openai' || p.id === 'gemini' ? (
                        <Activity className="w-5 h-5" />
                      ) : (
                        <Radio className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                        <span>{p.healthMessage}</span>
                        {telemetry?.lastLatencyMs !== null && telemetry?.lastLatencyMs !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            ⚡ {telemetry.lastLatencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <StatusBadge status={p.status} />
                    <button
                      id={`test-provider-${p.id}`}
                      onClick={() => handleTestConnection(p.id)}
                      disabled={testingId === p.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          testingId === p.id ? 'animate-bounce text-amber-400' : 'text-blue-400'
                        }`}
                      />
                      <span>{testingId === p.id ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Test Result Banner */}
                {testResult && testResult.id === p.id && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : isBlocked || testResult.status === 'BLOCKED_CREDITS'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold">{testResult.message}</span>
                        {testResult.latencyMs !== undefined && (
                          <span className="ml-2 font-mono text-[11px] opacity-80">({testResult.latencyMs}ms)</span>
                        )}
                      </div>
                    </div>

                    {isBlocked && (
                      <a
                        href="https://yepapi.com/billing"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Recharge Credits</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Credential Security</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      {p.maskedKey ? p.maskedKey : p.configured ? 'Secured in Environment' : 'Not configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Rate Limits & Quota</span>
                    <span className="text-slate-300">{p.rateLimits}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Recovery Guidance</span>
                    <div className="text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{p.recoveryGuidance}</span>
                      {isBlocked && (
                        <a
                          href="https://yepapi.com/billing"
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-0.5"
                        >
                          yepapi.com/billing <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mapped Endpoints */}
                {p.endpoints.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/40">
                    <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Mapped Endpoints:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.endpoints.map((ep, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-300"
                          title={ep.description}
                        >
                          <span className="text-blue-400 font-bold">{ep.method}</span> {ep.path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accordion Toggle: Last Request & Redacted Logs */}
                <div className="pt-2 border-t border-slate-800/40">
                  <button
                    onClick={() => toggleExpand(p.id)}
                    className="flex items-center justify-between w-full text-left py-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span>Telemetry, Last Request Details & Redacted Logs</span>
                      {telemetry?.redactedLogs && telemetry.redactedLogs.length > 0 && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                          {telemetry.redactedLogs.length} events
                        </span>
                      )}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
                      {/* Last Request Snapshot */}
                      {telemetry?.lastRequest ? (
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-blue-400 font-bold">LATEST OUTBOUND REQUEST:</div>
                          <div className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                            <div>
                              <span className="text-emerald-400 font-bold">{telemetry.lastRequest.method}</span>{' '}
                              <span className="text-slate-200">{telemetry.lastRequest.endpoint}</span>
                            </div>
                            <div className="text-slate-500 mt-1">
                              Headers: {JSON.stringify(telemetry.lastRequest.headers)}
                            </div>
                            {telemetry.lastRequest.payloadSummary && (
                              <div className="text-slate-400 mt-1">
                                Payload: {telemetry.lastRequest.payloadSummary}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">No outbound requests dispatched yet. Click &quot;Test Connection&quot; to test.</div>
                      )}

                      {/* Last Response Snapshot */}
                      {telemetry?.lastResponse && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-emerald-400 font-bold">LATEST UPSTREAM RESPONSE:</div>
                          <div className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                            <div>
                              Status: <span className="text-amber-400 font-bold">{telemetry.lastResponse.status}</span> — {telemetry.lastResponse.message}
                            </div>
                            {telemetry.lastResponse.payloadSummary && (
                              <div className="text-slate-400 mt-1 text-[11px] break-all">
                                Summary: {telemetry.lastResponse.payloadSummary}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Redacted Audit Logs */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] text-slate-400 font-bold">REDACTED AUDIT LOG STREAM:</div>
                        {telemetry?.redactedLogs && telemetry.redactedLogs.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {telemetry.redactedLogs.map((log, lIdx) => (
                              <div key={lIdx} className="text-[11px] text-slate-300 flex items-start gap-2">
                                <span className="text-slate-600 shrink-0">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span
                                  className={`shrink-0 font-bold ${
                                    log.level === 'error'
                                      ? 'text-rose-400'
                                      : log.level === 'warn'
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                                  }`}
                                >
                                  [{log.level.toUpperCase()}]
                                </span>
                                <span className="text-slate-300">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-600 italic">No log entries recorded for this provider.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
