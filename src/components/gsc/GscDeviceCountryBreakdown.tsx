"use client";

import React from "react";
import { GscCountryStatDto, GscDeviceStatDto } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/formatters";

interface GscDeviceCountryBreakdownProps {
  deviceStats: GscDeviceStatDto[];
  countryStats: GscCountryStatDto[];
}

export function GscDeviceCountryBreakdown({
  deviceStats,
  countryStats,
}: GscDeviceCountryBreakdownProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" data-testid="gsc-breakdown">
      {/* Device Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" data-testid="device-breakdown">
        <div className="border-b border-slate-800 pb-3">
          <h4 className="text-sm font-semibold text-white">Device Breakdown</h4>
          <p className="text-[11px] text-slate-400">Search performance split by user device type</p>
        </div>

        <div className="space-y-3">
          {deviceStats.map((dev) => (
            <div key={dev.device} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 capitalize">{dev.device.toLowerCase()}</span>
                <span className="text-slate-400 font-mono">{formatPercent(dev.clickShare)} click share</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(dev.clickShare * 100, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Clicks</span>
                  <p className="font-semibold text-white">{formatNumber(dev.clicks)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Impressions</span>
                  <p className="text-slate-300">{formatNumber(dev.impressions)}</p>
                </div>
                <div>
                  <span className="text-slate-500">CTR</span>
                  <p className="text-emerald-400 font-medium">{formatPercent(dev.ctr)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Avg. Pos</span>
                  <p className="text-amber-300 font-semibold">{dev.averagePosition.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ))}

          {deviceStats.length === 0 && (
            <p className="text-xs text-slate-500 py-6 text-center">No device breakdown data available.</p>
          )}
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" data-testid="country-breakdown">
        <div className="border-b border-slate-800 pb-3">
          <h4 className="text-sm font-semibold text-white">Top Geographic Markets</h4>
          <p className="text-[11px] text-slate-400">Search performance distributed across top countries</p>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Country</th>
                <th className="py-2.5 px-3 font-semibold text-right">Clicks</th>
                <th className="py-2.5 px-3 font-semibold text-right">Impressions</th>
                <th className="py-2.5 px-3 font-semibold text-right">CTR</th>
                <th className="py-2.5 px-3 font-semibold text-right">Avg. Pos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {countryStats.map((c) => (
                <tr key={c.countryCode} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-slate-200">
                    <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                      {c.countryCode}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-white">{formatNumber(c.clicks)}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{formatNumber(c.impressions)}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{formatPercent(c.ctr)}</td>
                  <td className="py-2 px-3 text-right text-amber-300 font-semibold">{c.averagePosition.toFixed(1)}</td>
                </tr>
              ))}
              {countryStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No country breakdown data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
