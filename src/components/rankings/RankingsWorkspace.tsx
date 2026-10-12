"use client";

import React, { useState, useEffect } from "react";
import { ProjectDetailDto } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";
import {
  GroupBy,
  MetricType,
  RankingOverviewData,
  TimeRange,
  ViewFilter,
  ViewStateMode,
} from "../../lib/rankingsTypes";
import { rankingsRepository } from "../../lib/rankingsRepository";
import { WorkspaceActionBar } from "./WorkspaceActionBar";
import { DataFreshnessIndicator } from "./DataFreshnessIndicator";
import { RankingMetricTabs } from "./RankingMetricTabs";
import { RankingTimeRangeControls } from "./RankingTimeRangeControls";
import { RankingTrendChart } from "./RankingTrendChart";
import { WebsiteSearch } from "./WebsiteSearch";
import { WebsiteMetricsTable } from "./WebsiteMetricsTable";
import { Alert, Button } from "@internal-seo/ui";
import Link from "next/link";
import { RankingsSubnav } from "./RankingsSubnav";

interface RankingsWorkspaceProps {
  project: ProjectDetailDto;
}

export function RankingsWorkspace({ project }: RankingsWorkspaceProps) {
  const { isViewer, canManageProjects } = useAuth();

  // State
  const [fixtureMode, setFixtureMode] = useState<ViewStateMode>("populated");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [groupBy, setGroupBy] = useState<GroupBy>("days");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [activeMetric, setActiveMetric] = useState<MetricType>("average_position");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRechecking, setIsRechecking] = useState(false);

  // Data & Lifecycle
  const [data, setData] = useState<RankingOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [recheckCount, setRecheckCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    if (fixtureMode === "loading") {
      return;
    }

    rankingsRepository
      .getOverview(
        project.id,
        timeRange,
        activeMetric,
        project.primaryDomain,
        fixtureMode
      )
      .then((result) => {
        if (!ignore) {
          setData(result);
          setErrorMessage(null);
          setIsForbidden(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          if ((err as { status?: number })?.status === 403) {
            setIsForbidden(true);
          } else {
            setErrorMessage(
              err instanceof Error
                ? err.message
                : "An unexpected error occurred while loading rankings overview."
            );
          }
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
  }, [project.id, project.primaryDomain, timeRange, activeMetric, fixtureMode, recheckCount]);

  const loadData = () => {
    setRecheckCount((c) => c + 1);
  };

  // Handle live simulated recheck action
  const handleRecheck = () => {
    if (isViewer) return;
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      loadData();
    }, 600);
  };

  // Permission Restricted (403) State
  if (isForbidden || fixtureMode === "permission-restricted") {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="error">
          <div className="space-y-3">
            <h3 className="font-bold text-base text-red-900">
              Rankings Access Denied (403 Forbidden)
            </h3>
            <p className="text-sm text-red-800">
              Under our enterprise RBAC policy, you do not have permission to inspect rank tracking
              metrics for this project workspace. Contact your workspace administrator for access.
            </p>
            <div className="pt-2">
              <Link href="/projects">
                <Button variant="outline" size="sm">
                  Return to Accessible Projects
                </Button>
              </Link>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  // Active Metric Object & Label
  const currentMetricObj = data?.metrics.find((m) => m.id === activeMetric);
  const currentMetricName = currentMetricObj?.name || "AVERAGE POSITION";

  // Filter websites table by search query
  const filteredWebsites = (data?.websites || []).filter((w) =>
    w.domain.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-4 pb-12">
      <RankingsSubnav projectId={project.id} />

      {/* 1. Workspace Header & Actions */}
      <WorkspaceActionBar
        totalWebsites={data?.totalWebsites ?? 1}
        canManage={canManageProjects}
        isViewer={isViewer}
        isRechecking={isRechecking}
        onRecheck={handleRecheck}
        fixtureMode={fixtureMode}
        onFixtureChange={setFixtureMode}
      />

      {/* 2. Data Freshness Indicator */}
      <DataFreshnessIndicator
        lastChecked={data?.lastChecked || "Today, 02:00 UTC"}
        lastSynced={data?.lastSynced || "35 mins ago"}
        isStale={data?.isStale || fixtureMode === "stale"}
        staleNotice={data?.staleNotice}
        dataNotice={data?.dataNotice}
      />

      {/* 3. Metric Navigation Tabs */}
      {data && (
        <RankingMetricTabs
          metrics={data.metrics}
          activeMetric={activeMetric}
          onSelectMetric={setActiveMetric}
        />
      )}

      {/* 4. Time Range & Granularity Controls */}
      <RankingTimeRangeControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        viewFilter={viewFilter}
        onViewFilterChange={setViewFilter}
      />

      {/* 5. Trend Line Chart */}
      <RankingTrendChart
        data={data?.trend || []}
        metric={activeMetric}
        metricName={currentMetricName}
        domain={project.primaryDomain || "acme.example"}
        isLoading={isLoading || fixtureMode === "loading"}
        error={errorMessage}
        onRetry={loadData}
        projectId={project.id}
      />

      {/* 6. Website / Projects Search Input */}
      <WebsiteSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
        placeholder="Search"
      />

      {/* 7. Websites / Projects Data Table */}
      <WebsiteMetricsTable
        websites={filteredWebsites}
        isLoading={isLoading || fixtureMode === "loading"}
      />
    </div>
  );
}
