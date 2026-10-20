"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/clientAuth";
import type {
  AnchorData,
  BacklinkRecord,
  CountryDistributionData,
  ReferringDomainRecord,
  TimeSeriesPoint,
  TrustDistributionData,
  ZohoIpItem,
  ZohoPageItem,
} from "./types";

export interface BacklinkExplorerData {
  domain: string;
  totals: { backlinks: number; referringDomains: number; dofollow: number; lost: number };
  lastChecked: string | null;
  backlinks: BacklinkRecord[];
  referringDomains: ReferringDomainRecord[];
  anchors: AnchorData[];
  pages: ZohoPageItem[];
  ips: ZohoIpItem[];
  timeSeries: TimeSeriesPoint[];
  trustDistribution: TrustDistributionData[];
  countryDistribution: CountryDistributionData[];
}

const EMPTY: BacklinkExplorerData = {
  domain: "",
  totals: { backlinks: 0, referringDomains: 0, dofollow: 0, lost: 0 },
  lastChecked: null,
  backlinks: [],
  referringDomains: [],
  anchors: [],
  pages: [],
  ips: [],
  timeSeries: [],
  trustDistribution: [],
  countryDistribution: [],
};

// One request per project, shared by every tab mounted for it
const cache = new Map<string, Promise<BacklinkExplorerData>>();

function load(projectId: string): Promise<BacklinkExplorerData> {
  let pending = cache.get(projectId);
  if (!pending) {
    pending = authFetch(`/api/projects/${encodeURIComponent(projectId)}/backlinks/explorer`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error?.message || json?.error || "Failed to load backlinks");
        return { ...EMPTY, ...json } as BacklinkExplorerData;
      })
      .catch((err) => {
        cache.delete(projectId);
        throw err;
      });
    cache.set(projectId, pending);
  }
  return pending;
}

/** Formats the latest last-seen timestamp for the "Last check" label. */
export function formatLastChecked(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Stored backlink data for a project, shaped for the Backlink Checker tabs. */
export function useBacklinkExplorer(projectId?: string) {
  const [data, setData] = useState<BacklinkExplorerData>(EMPTY);
  const [loading, setLoading] = useState<boolean>(Boolean(projectId));
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    load(projectId)
      .then((d) => {
        if (active) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load backlinks");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, version]);

  /** Pulls fresh backlinks from the provider, then reloads. Resolves to a user-facing message. */
  const refresh = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (!projectId) return { ok: false, message: "No project selected." };
    try {
      const res = await authFetch(`/api/projects/${encodeURIComponent(projectId)}/backlinks`, { method: "POST" });
      const json = await res.json().catch(() => null);
      cache.delete(projectId);
      setVersion((v) => v + 1);
      if (!res.ok || !json?.success) {
        return { ok: false, message: json?.error?.message || json?.error || "Backlink sync failed." };
      }
      return { ok: true, message: json.message || "Backlinks synchronized." };
    } catch {
      return { ok: false, message: "Network error while syncing backlinks." };
    }
  }, [projectId]);

  return { data, loading, error, refresh };
}
