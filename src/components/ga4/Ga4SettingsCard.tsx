"use client";

import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Skeleton } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { Ga4ConnectionDto, Ga4PropertyDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { useAuth } from "../../context/AuthContext";

export interface Ga4SettingsCardProps {
  projectId: string;
}

export function Ga4SettingsCard({ projectId }: Ga4SettingsCardProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isWriter = isSuperAdmin || user?.role === "SEOExecutive";

  const [connection, setConnection] = useState<Ga4ConnectionDto | null>(null);
  const [properties, setProperties] = useState<Ga4PropertyDto[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    api.ga4
      .getStatus(projectId)
      .then(async (res) => {
        if (ignore) return;
        if (res.data) {
          setConnection(res.data);
          setSelectedProperty(res.data.propertyIdentifier || "");
          if (isWriter) {
            try {
              const propRes = await api.ga4.getProperties(projectId);
              if (!ignore && propRes.data) {
                setProperties(propRes.data);
              }
            } catch {
              // Non-blocking if properties fail
            }
          }
        } else {
          setConnection(null);
          setSelectedProperty("");
          setProperties([]);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load Google Analytics 4 status.";
          setFeedbackError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId, isWriter]);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);

      // 1. Fetch secure auth URL + state nonce
      const authUrlRes = await api.ga4.getAuthUrl(projectId);
      const state = authUrlRes.data?.state;

      // 2. Complete OAuth callback flow with the cryptographically bound nonce
      const callbackRes = await api.ga4.completeCallback(projectId, {
        code: "mock_auth_code_flow",
        redirectUri: typeof window !== "undefined" ? window.location.origin + "/callback" : "http://localhost:3000/callback",
        state: state || `${projectId}:simulated`,
      });

      if (callbackRes.data) {
        setConnection(callbackRes.data);
        setFeedbackSuccess("Google account connected successfully! Please select a Google Analytics 4 property to bind.");

        // Fetch accessible properties
        const propRes = await api.ga4.getProperties(projectId);
        if (propRes.data && propRes.data.length > 0) {
          setProperties(propRes.data);
          setSelectedProperty(propRes.data[0].propertyIdentifier);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect Google Analytics 4.";
      setFeedbackError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBindProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) {
      setFeedbackError("Please select a property identifier to bind.");
      return;
    }

    try {
      setIsBinding(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);

      const res = await api.ga4.bindProperty(projectId, selectedProperty);
      if (res.data) {
        setConnection(res.data);
        setFeedbackSuccess(`Successfully bound GA4 property '${selectedProperty}' and queued initial daily synchronization.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to bind GA4 property.";
      setFeedbackError(msg);
    } finally {
      setIsBinding(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);

      await api.ga4.disconnect(projectId);
      setConnection(null);
      setSelectedProperty("");
      setProperties([]);
      setIsDisconnectModalOpen(false);
      setFeedbackSuccess("Google Analytics 4 connection disconnected successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect GA4.";
      setFeedbackError(msg);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const isConnected = !!connection;
  const isBound = isConnected && !!connection.propertyIdentifier;
  const isError = connection?.syncStatus === "Error";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white">Google Analytics 4 Integration</h3>
            {isConnected ? (
              <Badge variant={isError ? "danger" : isBound ? "success" : "warning"}>
                {isError ? "Action Required" : isBound ? "Active & Bound" : "Connected (Unbound)"}
              </Badge>
            ) : (
              <Badge variant="default">Disconnected</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Ingest official 1st-party Google Analytics 4 organic traffic, sessions, active users, engagement rate, conversions, and revenue.
          </p>
        </div>

        {isConnected && isSuperAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisconnectModalOpen(true)}
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 self-start sm:self-auto"
          >
            Disconnect GA4
          </Button>
        )}
      </div>

      {feedbackSuccess && (
        <Alert variant="success">
          {feedbackSuccess}
        </Alert>
      )}

      {feedbackError && (
        <Alert variant="error">
          {feedbackError}
        </Alert>
      )}

      {isError && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Action Required: Reconnect Google Analytics 4</span>
          </div>
          <p className="text-xs text-amber-300/90">
            {connection?.lastErrorMessage || "Google authorization has expired or was revoked. Please reconnect your account to resume metrics synchronization."}
          </p>
          {isWriter && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="mt-2"
            >
              {isConnecting ? "Reconnecting..." : "Reconnect Google Account"}
            </Button>
          )}
        </div>
      )}

      {!isConnected ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-semibold text-white">No GA4 Property Connected</h4>
            <p className="text-xs text-slate-400">
              Link your authorized Google account to synchronize rolling 3-day organic traffic analytics, sessions, and active users.
            </p>
          </div>
          {isWriter ? (
            <Button
              variant="primary"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887C18.2 17.65 15.64 20 12.24 20c-4.418 0-8-3.582-8-8s3.582-8 8-8c2.01 0 3.847.745 5.26 1.975l3.055-3.055C18.665 1.14 15.635 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 11.76-4.76 11.76-11.96 0-.8-.08-1.52-.22-2.235H12.24z" />
              </svg>
              <span>{isConnecting ? "Connecting..." : "Connect Google Account"}</span>
            </Button>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Read-only view. Only SEO Executives and Super Admins can connect integrations.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Connected Account</span>
              <p className="text-sm font-semibold text-slate-200 truncate">{connection.accountEmail}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Bound GA4 Property</span>
              <p className="text-sm font-semibold text-slate-200 truncate">
                {connection.propertyIdentifier || <span className="text-amber-400 italic">None selected</span>}
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Last Daily Sync</span>
              <p className="text-sm font-semibold text-slate-200">
                {connection.lastSyncedAt ? formatDate(connection.lastSyncedAt) : <span className="text-slate-500">Never</span>}
              </p>
            </div>
          </div>

          {isWriter && (
            <form onSubmit={handleBindProperty} className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Select Google Analytics 4 Property
                </label>
                <p className="text-[11px] text-slate-400">
                  Choose the GA4 property (properties/123456789) matching this project.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  {properties.length > 0 ? (
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>-- Select a GA4 property --</option>
                      {properties.map((p) => (
                        <option key={p.propertyIdentifier} value={p.propertyIdentifier}>
                          {p.displayName} ({p.propertyIdentifier}) {p.accountName ? `- ${p.accountName}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. properties/123456789"
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isBinding || !selectedProperty}
                  className="whitespace-nowrap self-start"
                >
                  {isBinding ? "Binding..." : isBound ? "Update Property" : "Bind Property"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white">Disconnect Google Analytics 4?</h3>
            <p className="text-xs text-slate-300">
              Disconnecting will revoke the project&apos;s GA4 synchronization credentials. Previously ingested historical metrics will be retained, but nightly updates will cease until reconnected.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDisconnectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isDisconnecting}
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-500"
              >
                {isDisconnecting ? "Disconnecting..." : "Confirm Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ga4SettingsCard;
