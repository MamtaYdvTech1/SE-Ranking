"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CompetitorDto } from "@/lib/types";
import { CompetitorOverviewTab } from "./CompetitorOverviewTab";
import { CompetitorKeywordsTab } from "./CompetitorKeywordsTab";
import { CompetitorGapTab } from "./CompetitorGapTab";
import { AddedCompetitorsView } from "./AddedCompetitorsView";
import { SerpCompetitorsView } from "./SerpCompetitorsView";
import { ShareOfVoiceView } from "./ShareOfVoiceView";
import { VisibilityRatingView } from "./VisibilityRatingView";
import { AddCompetitorModal } from "./AddCompetitorModal";
import { EditCompetitorModal } from "./EditCompetitorModal";
import { DeleteCompetitorModal } from "./DeleteCompetitorModal";
import { GuestLinkModal } from "./GuestLinkModal";

interface CompetitorWorkspaceProps {
  projectId: string;
  initialTab?: "added" | "serp" | "share-of-voice" | "visibility-rating" | "visibility";
}

export function CompetitorWorkspace({ projectId, initialTab = "added" }: CompetitorWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [projectDomain, setProjectDomain] = useState<string>("workcomposer.com");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorDto | null>(null);
  const [deletingCompetitor, setDeletingCompetitor] = useState<CompetitorDto | null>(null);

  // Guest Link Modal States
  const [isGuestLinkModalOpen, setIsGuestLinkModalOpen] = useState(false);
  const [hideSearchVolume, setHideSearchVolume] = useState(false);
  const [includeFilterSort, setIncludeFilterSort] = useState(true);
  const [guestModules, setGuestModules] = useState<Record<string, boolean>>({
    overview: false,
    rankings: false,
    analytics: false,
    competitors: true,
    aiResults: false,
    audit: false,
    marketing: false,
  });

  const canEdit = user?.role === "SuperAdmin" || user?.role === "SEOExecutive";

  // Determine active tab based on pathname or initialTab
  const normalizedPath = pathname ? pathname.split("?")[0].replace(/\/$/, "") : "";
  let currentTab: "added" | "serp" | "overview" | "share-of-voice" | "keywords" | "visibility-rating" | "gap" =
    initialTab === "visibility" ? "visibility-rating" : initialTab;
  if (normalizedPath.endsWith("/serp")) {
    currentTab = "serp";
  } else if (normalizedPath.endsWith("/overview")) {
    currentTab = "overview";
  } else if (normalizedPath.endsWith("/share-of-voice")) {
    currentTab = "share-of-voice";
  } else if (normalizedPath.endsWith("/keywords")) {
    currentTab = "keywords";
  } else if (normalizedPath.endsWith("/gap")) {
    currentTab = "gap";
  } else if (
    normalizedPath.endsWith("/visibility-rating") ||
    normalizedPath.endsWith("/visibility")
  ) {
    currentTab = "visibility-rating";
  } else if (normalizedPath.endsWith("/added") || normalizedPath.endsWith("/competitors")) {
    currentTab = "added";
  }

  useEffect(() => {
    loadCompetitors();
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      if (api.projects?.get) {
        const res = await api.projects.get(projectId);
        if (res?.success && res.data) {
          setProjectDomain(res.data.primaryDomain || (res.data as any).domain || res.data.name || "workcomposer.com");
        }
      }
    } catch {
      // Fallback to default
    }
  };

  const loadCompetitors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.competitors.list(projectId);
      if (res.success && res.data) {
        setCompetitors(res.data);
      } else {
        setError(res.message || "Failed to load competitors.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load competitors.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompetitorAdded = (comp: CompetitorDto) => {
    setCompetitors((prev) => [...prev, comp]);
  };

  const handleCompetitorUpdated = (comp: CompetitorDto) => {
    setCompetitors((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
  };

  const handleCompetitorDeleted = (compId: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== compId));
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header (shown on overview tab only) */}
      {currentTab !== "added" && currentTab !== "serp" && currentTab !== "share-of-voice" && currentTab !== "visibility-rating" && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Competitor Intelligence & SERP Visibility
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track up to 5 competitor domains side-by-side with target search rankings and visibility share.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsGuestLinkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="Get access to guest links"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Guest link</span>
            </button>
            {canEdit && (
              <button
                onClick={() => router.push(`/projects/${projectId}/settings?tab=competitors`)}
                disabled={competitors.length >= 5}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                + Add Competitor ({competitors.length}/5)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link
          href={`/projects/${projectId}/competitors/added`}
          className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px ${
            currentTab === "added"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
          }`}
        >
          Added Competitors ({competitors.length}/5)
        </Link>
        <Link
          href={`/projects/${projectId}/competitors/serp`}
          className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px ${
            currentTab === "serp"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
          }`}
        >
          SERP Competitors
        </Link>
        <Link
          href={`/projects/${projectId}/competitors/share-of-voice`}
          className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px ${
            currentTab === "share-of-voice"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
          }`}
        >
          Share of Voice
        </Link>
        <Link
          href={`/projects/${projectId}/competitors/visibility`}
          className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 ${
            currentTab === "visibility-rating" || currentTab === "gap"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
          }`}
        >
          <span>Visibility Rating</span>
          <span className="text-xs text-slate-400 font-normal">Keyword Gap</span>
        </Link>
      </div>

      {/* Tab Content */}
      {currentTab === "added" && (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {error}
            </div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No competitors added</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Add up to 5 competitor domains to monitor their SERP positions and visibility against your tracked keywords.
              </p>
              {canEdit && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push(`/projects/${projectId}/settings?tab=competitors`)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Your First Competitor
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AddedCompetitorsView
              projectId={projectId}
              projectDomain={projectDomain}
              competitors={competitors}
              canEdit={canEdit}
              onAddCompetitor={() => router.push(`/projects/${projectId}/settings?tab=competitors`)}
              onEditCompetitor={(comp) => setEditingCompetitor(comp)}
              onDeleteCompetitor={(comp) => setDeletingCompetitor(comp)}
            />
          )}
        </div>
      )}

      {currentTab === "serp" && (
        <SerpCompetitorsView
          projectId={projectId}
          projectDomain={projectDomain}
          competitors={competitors}
        />
      )}
      {currentTab === "overview" && <CompetitorOverviewTab projectId={projectId} />}
      {currentTab === "keywords" && <CompetitorKeywordsTab projectId={projectId} />}
      {currentTab === "share-of-voice" && (
        <ShareOfVoiceView
          projectId={projectId}
          projectDomain={projectDomain}
          competitors={competitors}
        />
      )}
      {currentTab === "visibility-rating" && (
        <VisibilityRatingView
          projectId={projectId}
          projectDomain={projectDomain}
          competitors={competitors}
        />
      )}
      {currentTab === "gap" && <CompetitorGapTab projectId={projectId} competitors={competitors} />}

      {/* Modals */}
      <AddCompetitorModal
        projectId={projectId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleCompetitorAdded}
      />

      <EditCompetitorModal
        projectId={projectId}
        competitor={editingCompetitor}
        isOpen={!!editingCompetitor}
        onClose={() => setEditingCompetitor(null)}
        onSuccess={handleCompetitorUpdated}
      />

      <DeleteCompetitorModal
        projectId={projectId}
        competitor={deletingCompetitor}
        isOpen={!!deletingCompetitor}
        onClose={() => setDeletingCompetitor(null)}
        onSuccess={handleCompetitorDeleted}
      />

      <GuestLinkModal
        isOpen={isGuestLinkModalOpen}
        onClose={() => setIsGuestLinkModalOpen(false)}
        projectId={projectId}
        projectDomain={projectDomain}
        hideSearchVolume={hideSearchVolume}
        setHideSearchVolume={setHideSearchVolume}
        includeFilterSort={includeFilterSort}
        setIncludeFilterSort={setIncludeFilterSort}
        guestModules={guestModules}
        setGuestModules={setGuestModules}
      />
    </div>
  );
}
