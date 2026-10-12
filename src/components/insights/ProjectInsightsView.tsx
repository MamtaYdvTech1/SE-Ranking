"use client";

import React, { useState, useEffect } from "react";

export interface ProjectInsightsViewProps {
  projectId: string;
  projectDomain?: string;
}

// Official 4-color Google G logo
export function GoogleGLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
        fill="#EA4335"
      />
    </svg>
  );
}

export type RecommendationType = 
  | "easy-to-improve"
  | "cannibalization"
  | "poor-quality"
  | "snippets-changes"
  | "competitor-jumps"
  | "competitor-new-keywords"
  | "gsc-impressions-clicks-increased"
  | "gsc-impressions-clicks-decreased"
  | "gsc-low-ctr"
  | "gsc-pages-increased"
  | "gsc-pages-decreased"
  | null;

interface GscRecommendationSection {
  paragraph: string;
  bullets: { title: string; description: string }[];
}

interface GscRecommendationEntry {
  intro: string | string[];
  bullets?: { title: string; description: string }[];
  sections?: GscRecommendationSection[];
  linkTopic?: string;
}

const GSC_RECOMMENDATIONS_CONFIG: Record<
  | "gsc-impressions-clicks-increased"
  | "gsc-impressions-clicks-decreased"
  | "gsc-low-ctr"
  | "gsc-pages-increased"
  | "gsc-pages-decreased",
  GscRecommendationEntry
> = {
  "gsc-impressions-clicks-increased": {
    intro:
      "When your clicks or impressions have increased, this is a sign that you need to pay extra attention to these queries (and the page of yours that’s ranking for them) to secure your success or help them perform even better.",
    sections: [
      {
        paragraph:
          "Increased impressions mean that Google started showing your page to people more often. It could be a result of changes made to your page, Google algorithm updates, or a query’s intent adjustment. Whatever the case, Google started considering your page as more relevant to certain queries. You can also build on this success. Here is what we suggest you do:",
        bullets: [
          {
            title: "Add the query to the Keyword Manager.",
            description: "This way, you won’t lose it and can come back to it later.",
          },
          {
            title: "Analyze the query in Keyword Research.",
            description: "If the query is new, try to understand its potential, intent, and whether it is interesting to you.",
          },
          {
            title: "Optimize your page for the most relevant queries.",
            description: "Use the On-Page SEO Checker to get improvement ideas based on an analysis of top-ranking players.",
          },
          {
            title: "Build relevant backlinks.",
            description: "This will help you support the authority over the queries you are interested in. Use the Backlink Gap Analyzer to compare your backlink profile with those of your better-performing competitors.",
          },
        ],
      },
      {
        paragraph:
          "An increased number of clicks is a signal that users consider your snippet relevant. Therefore, if the snippet promises to meet their needs, then you must ensure that the actual content does the same. You should secure your success in the SERP and try to expand on it in the future. Here is what we suggest you do:",
        bullets: [
          {
            title: "Continue monitoring the queries that interest you in Rank Tracker.",
            description: "You can also label these keywords (e.g., with a tag) and use notes to organize your work around them.",
          },
          {
            title: "Consider snippet optimization.",
            description: "If you already have a high position (in the top 3), it might be better not to risk it and abstain from changing the main elements of the page. You may just fine-tune the snippet a bit for a higher CTR.",
          },
          {
            title: "Optimize your page for the most relevant queries.",
            description: "Use the On-Page SEO Checker to get improvement ideas based on an analysis of the top-ranking players.",
          },
        ],
      },
    ],
    linkTopic: "tracking keyword trends and demand surges",
  },
  "gsc-impressions-clicks-decreased": {
    intro: [
      "If not related to seasonality, a decline in impressions signifies that Google started showing your page to people less often. This could be a result of changes made to your page, Google algorithm updates, or a query’s intent adjustment. Whatever the case, Google started considering your page as less relevant to a certain query.",
      "Declined clicks signify that your snippet could become less visible, either because of a position drop or other changes in the SERP (e.g., new ads above the organic results causing your organic snippet to drop down).",
      "Both cases are a sign that you need to pay extra attention to these queries (and the pages ranking for them) to help your pages perform better or maybe even pivot your strategy. Here is what we suggest you do:",
    ],
    bullets: [
      {
        title: "Compare SERP changes for the queries.",
        description:
          "This will help you figure out whether it is the keyword intent that has changed or whether more powerful competitors appeared. If you are already tracking the keyword, go to Project > My Competitors > SERP competitors. If it is not tracked yet, go to Keyword Research > Organic SERP History.",
      },
      {
        title: "Check live SERP results in the SERP Analyzer.",
        description:
          "The tool will also provide additional useful information on each URL.",
      },
      {
        title: "Run the On-Page SEO Audit.",
        description:
          "You will get various improvement suggestions based on an analysis of the top-ranking competitors. Also, suggestions can surface if any technical issues appear that could affect your page’s performance.",
      },
      {
        title: "Perform a content analysis in the Content Editor.",
        description:
          "It will tell you how to increase the quality of a page’s content.",
      },
      {
        title: "Check the backlinks to your declined page.",
        description:
          "Then compare them with your main competitors who have increased their positions for your target keyword.",
      },
    ],
  },
  "gsc-low-ctr": {
    intro: [
      "There are two conditions that must be met in order for keywords to appear in this insight: the page must be in the top search results, and they must have a CTR that is significantly lower than the average for these positions. If there are several of them, the insight only shows the one with the highest number of impressions.",
      "Being at the top of the SERP means that Google considers your page(s) authoritative and relevant to particular queries. However, having a low CTR is a sign that your snippets are not appealing to users. Also, it is possible that there are some additional SERP features or ads that decrease CTR. Here is what we suggest you do:",
    ],
    bullets: [
      {
        title: "Check whether you already target the keyword.",
        description:
          "Is it your aimed target or a potential new one for which Google considers your page relevant? Note that this insight shows only one keyword per page. Therefore, it is possible that you have another target that already performs well for that URL and has even more potential than this one.",
      },
      {
        title: "Analyze the query in Keyword Research.",
        description:
          "For a possible new target, you need to determine its traffic potential, competition, intent, and whether it is interesting to you.",
      },
      {
        title: "Check your snippet’s appearance.",
        description:
          "It must be relevant for the query, look clickworthy and trustworthy, and should contain the keyword in it.",
      },
      {
        title: "Check live SERP results for the keyword.",
        description:
          "Compare the top results and their snippets to yours. Make adjustments so your snippet stands out while being optimized for your target query. Also, check if Google automatically rewrote your title and meta description in SERPs. If it did, pay attention to what content on a page the search engine chose to highlight on the SERP. If you are considering a new target, use SERP Analyzer to review your competitors' high-ranking snippets as well as valuable information on each URL to support your further activities. Pay extra attention to snippets attracting the highest traffic and try to figure out how they differ from yours.",
      },
      {
        title: "Work on your snippet.",
        description:
          "Adjust your snippet so it corresponds better with the user intent for this query.",
      },
      {
        title: "Add the query to the Keyword Manager.",
        description:
          "This ensures that you won’t lose it and can come back to it later.",
      },
      {
        title: "Add the keyword in the Rank Tracker for monitoring.",
        description:
          "Continue monitoring your page’s CTR performance on the SERP. You can also label these keywords (e.g., with a tag) or use notes to organize your work around them.",
      },
    ],
  },
  "gsc-pages-increased": {
    intro:
      "When your clicks or impressions have increased, this is a sign that you need to pay extra attention to the associated pages to secure their continued success or help them perform even better.",
    sections: [
      {
        paragraph:
          "Increased impressions mean that Google started showing your page to people more often. It could be a result of changes made to your page, Google algorithm updates, or a query’s intent adjustment. Whatever the case, Google started considering your page to be more relevant to some queries. You can also build on this success. Here is what we suggest you do:",
        bullets: [
          {
            title: "Check what the queries are.",
            description:
              "Identify specific search terms for which your clicks and/or impressions increased.",
          },
          {
            title: "Analyze each query in Keyword Research.",
            description:
              "If a query is new, try to understand its potential, intent, and whether it is interesting to you.",
          },
          {
            title: "Optimize your page for the most relevant queries.",
            description:
              "Use the On-Page SEO Checker to get improvement ideas based on an analysis of the top-ranking players.",
          },
          {
            title: "Build relevant backlinks.",
            description:
              "This will help you support the authority over the queries you are interested in. Use the Backlink Gap Analyzer to compare your backlink profile with those of your better-performing competitors.",
          },
        ],
      },
      {
        paragraph:
          "An increased number of clicks is a signal that users find your snippet relevant. Therefore, if the snippet promises to meet their needs, then you must be sure that the actual content does the same. Secure your success in the SERP and try to expand on it in the future. Here is what we suggest you do:",
        bullets: [
          {
            title: "Continue monitoring the queries that interest you in Rank Tracker.",
            description:
              "You can also label these keywords (e.g., with a tag) and use notes to organize your work around them.",
          },
          {
            title: "Consider snippet optimization.",
            description:
              "If you already have a high position (in the top 3), it might be better not to risk it and abstain from changing the main elements on the page. You may just fine-tune the snippet a bit for a higher CTR.",
          },
          {
            title: "Optimize your page for the most relevant queries.",
            description:
              "Use the On-Page SEO Checker to get improvement ideas based on an analysis of the top-ranking players.",
          },
        ],
      },
    ],
  },
  "gsc-pages-decreased": {
    intro: [
      "If not related to seasonality, a decline in impressions signifies that Google started showing your page to people less often. This could be a result of changes made to your page, Google algorithm updates, or a query’s intent adjustment. Whatever the case, Google started considering your page as less relevant to a certain query.",
      "Declined clicks signify that your snippet could become less visible, either because of a position drop or other changes in the SERP (e.g., new ads above the organic results causing your organic snippet to drop down).",
      "Both cases are a sign that you need to pay extra attention to these queries (and pages ranking for them) to help your pages perform better or maybe even pivot your strategy. Here is what we suggest you do:",
    ],
    bullets: [
      {
        title: "Figure out what the queries are.",
        description:
          "Identify specific search terms for which your clicks and/or impressions declined.",
      },
      {
        title: "Analyze SERP changes for the queries.",
        description:
          "This will help you figure out whether it is the keyword intent that has changed or whether more powerful competitors appeared. If you are already tracking the keyword, go to Project > My Competitors > SERP competitors. If it is not tracked yet, go to Keyword Research > Organic SERP History.",
      },
      {
        title: "Check live SERP results in the SERP Analyzer.",
        description:
          "The tool will also provide additional useful information on each URL.",
      },
      {
        title: "Perform a content analysis in the Content Editor.",
        description:
          "It will tell you how to increase the quality of a page’s content.",
      },
      {
        title: "Check the backlinks to your declined page.",
        description:
          "Then compare them with your main competitors who have increased their positions for your target keyword.",
      },
    ],
  },
};

export function GoogleIndiaEngineBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0"
      title="Google India Search Engine"
    >
      <span role="img" aria-label="India flag">🇮🇳</span>
      <GoogleGLogo className="w-3 h-3" />
      <span>Google</span>
    </span>
  );
}

export function ProjectInsightsView({
  projectId,
  projectDomain = "workcomposer.com",
}: ProjectInsightsViewProps) {
  // Banner dismiss state
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Detection period dropdown
  const detectionPeriodOptions = ["Last day", "Last 3 days", "Last 7 days", "Last 30 days"];
  const [detectionPeriod, setDetectionPeriod] = useState<string>("Last day");
  const [isDetectionDropdownOpen, setIsDetectionDropdownOpen] = useState(false);

  // Google Search Console connection state
  const [isGscConnected, setIsGscConnected] = useState(false);
  const [isGscModalOpen, setIsGscModalOpen] = useState(false);

  // Active recommendations modal type
  const [activeRecommendationModal, setActiveRecommendationModal] = useState<RecommendationType>(null);

  // Easy-to-Improve Positions recommendation modal state
  const [isEasyImproveModalOpen, setIsEasyImproveModalOpen] = useState(false);

  // Keyword Cannibalization recommendation modal state
  const [isCannibalizationModalOpen, setIsCannibalizationModalOpen] = useState(false);

  // Pages with poor-quality content recommendation modal state
  const [isPoorContentModalOpen, setIsPoorContentModalOpen] = useState(false);

  // Keywords and pages with changes in snippets recommendation modal state
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);

  // Competitors who jumped to the Top 10 recommendation modal state
  const [isCompetitorJumpsModalOpen, setIsCompetitorJumpsModalOpen] = useState(false);

  // Competitors’ new keywords recommendation modal state
  const [isCompetitorNewKeywordsModalOpen, setIsCompetitorNewKeywordsModalOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeRecommendationModal || isCannibalizationModalOpen || isEasyImproveModalOpen || isPoorContentModalOpen || isSnippetsModalOpen || isCompetitorJumpsModalOpen || isCompetitorNewKeywordsModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeRecommendationModal, isCannibalizationModalOpen, isEasyImproveModalOpen, isPoorContentModalOpen, isSnippetsModalOpen, isCompetitorJumpsModalOpen, isCompetitorNewKeywordsModalOpen]);

  // Handle Escape key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveRecommendationModal(null);
        if (isCannibalizationModalOpen) setIsCannibalizationModalOpen(false);
        if (isEasyImproveModalOpen) setIsEasyImproveModalOpen(false);
        if (isPoorContentModalOpen) setIsPoorContentModalOpen(false);
        if (isSnippetsModalOpen) setIsSnippetsModalOpen(false);
        if (isCompetitorJumpsModalOpen) setIsCompetitorJumpsModalOpen(false);
        if (isCompetitorNewKeywordsModalOpen) setIsCompetitorNewKeywordsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeRecommendationModal, isCannibalizationModalOpen, isEasyImproveModalOpen, isPoorContentModalOpen, isSnippetsModalOpen, isCompetitorJumpsModalOpen, isCompetitorNewKeywordsModalOpen]);

  // Modals state
  const [recommendationModal, setRecommendationModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    recommendations: string[];
  } | null>(null);

  const [viewAllModal, setViewAllModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    itemsCount: number;
    description: string;
  } | null>(null);

  const [notesCount] = useState(46);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isIdeaBannerVisible, setIsIdeaBannerVisible] = useState(true);

  // Open recommendation helper
  const handleOpenRecommendations = (title: string, subtitle: string, recommendations: string[]) => {
    setRecommendationModal({
      isOpen: true,
      title,
      subtitle,
      recommendations,
    });
  };

  // Open view all helper
  const handleOpenViewAll = (title: string, subtitle: string, itemsCount: number, description: string) => {
    setViewAllModal({
      isOpen: true,
      title,
      subtitle,
      itemsCount,
      description,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 max-w-7xl mx-auto transition-colors" data-testid="project-insights-view">
      {/* 1. Top Notice Alert Banner */}
      {isBannerVisible && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex-shrink-0">
              ℹ
            </span>
            <span className="font-medium">
              In this section, you can learn helpful and non-obvious insights about your project or your competitors.
            </span>
          </div>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setIsBannerVisible(false)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 p-1 rounded-md transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs & Right Utility Actions */}
      <div className="flex items-center justify-between mb-2">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400">
          <span>{projectDomain}</span>
          <span className="mx-1.5">&gt;</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">Insights</span>
        </nav>
        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
          >
            Notes ({notesCount})
          </button>
        </div>
      </div>

      {/* 3. Title & Detection Period Controls */}
      <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Insights / {projectDomain}
      </h1>

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        {/* Left: Detection period dropdown */}
        <div>
          <span id="detection-period-label" className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">
            Detection period:
          </span>
          <div className="relative inline-block text-left">
            <button
              type="button"
              id="detection-period-btn"
              aria-haspopup="listbox"
              aria-expanded={isDetectionDropdownOpen}
              aria-label={`Detection period: ${detectionPeriod}`}
              onClick={() => setIsDetectionDropdownOpen(!isDetectionDropdownOpen)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer"
            >
              <span>📅</span>
              <span>{detectionPeriod}</span>
              <span className="text-slate-400">▾</span>
            </button>

            {isDetectionDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 mt-1 w-44 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-30 focus:outline-none"
              >
                {detectionPeriodOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={detectionPeriod === opt}
                    onClick={() => {
                      setDetectionPeriod(opt);
                      setIsDetectionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between transition hover:bg-blue-50 dark:hover:bg-slate-700/60 ${
                      detectionPeriod === opt
                        ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-slate-700/40"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{opt}</span>
                    {detectionPeriod === opt && <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Connect Google Search Console */}
        <div>
          <button
            type="button"
            onClick={() => setIsGscModalOpen(true)}
            className={`border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2 transition shadow-2xs cursor-pointer ${
              isGscConnected
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs"
            }`}
          >
            <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
            <span>{isGscConnected ? "Google Search Console Connected ✓" : "Connect Google Search Console"}</span>
          </button>
        </div>
      </div>

      {/* 4. Insights Sections & Cards Architecture */}
      <div className="space-y-6">
        {/* SECTION 1: Keywords and pages with easy-to-improve positions */}
        <section
          aria-labelledby="section-easy-positions"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-easy-positions" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Keywords and pages with easy-to-improve positions</span>
              <span className="text-slate-400 text-xs cursor-help" title="Positions 7 to 20 that can reach Top 3 with targeted on-page optimizations">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 15 Sep 2026 to 23 Sep 2026, we have found 11 keywords and pages that have the potential to reach higher positions in organic search.
          </p>

          {/* List of 5 items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                url: "https://www.workcomposer.com/features/web-and-app-tracking/",
                keyword: "work composer download",
                pos: 7,
              },
              {
                url: "https://www.workcomposer.com/sitemap/",
                keyword: "work composer download",
                pos: 8,
              },
              {
                url: "https://www.workcomposer.com/wc/time-and-screenshot-tracking-software/",
                keyword: "work composer download",
                pos: 9,
              },
              {
                url: "https://www.workcomposer.com/getting-started/organization-onboarding/",
                keyword: "work composer download",
                pos: 10,
              },
              {
                url: "https://www.workcomposer.com/features/work-time-tracking/",
                keyword: "work composer download",
                pos: 11,
              },
            ].map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
                <div className="flex-1 min-w-[280px]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono truncate block max-w-xl"
                  >
                    {item.url}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.keyword}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                      TRACKED
                    </span>
                    <span className="text-slate-500 font-medium">
                      Position: {item.pos}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <GoogleIndiaEngineBadge />
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEasyImproveModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Keywords and pages with easy-to-improve positions",
                  "All 11 detected opportunities for organic search acceleration",
                  11,
                  "These keywords are currently ranking in striking distance (positions 7-20). Optimizing content, internal links, and CTR can yield direct traffic gains."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 2: Keyword cannibalization */}
        <section
          aria-labelledby="section-cannibalization"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-cannibalization" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Keyword cannibalization</span>
              <span className="text-slate-400 text-xs cursor-help" title="Multiple URLs competing for the same search query">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, has been detected 2 keywords for which there may be problems with cannibalization.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Cannibalized item 1 */}
            <div className="py-3 flex items-start justify-between gap-4 flex-wrap text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  work tracks
                </div>
                <div className="pl-2 space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">↳</span>
                    <a href="https://www.workcomposer.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                      https://www.workcomposer.com/
                    </a>
                  </div>
                  <div className="pl-4">
                    <a href="https://www.workcomposer.com/features/work-time-tracking" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                      https://www.workcomposer.com/features/work-time-tracking
                    </a>
                  </div>
                  <div className="pl-4 text-slate-400 dark:text-slate-500 text-[11px] font-sans">
                    And +1 more
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 pt-1">
                <GoogleIndiaEngineBadge />
              </div>
            </div>

            {/* Cannibalized item 2 */}
            <div className="py-3 flex items-start justify-between gap-4 flex-wrap text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  work composer hack
                </div>
                <div className="pl-2 space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">↳</span>
                    <a href="https://www.workcomposer.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                      https://www.workcomposer.com/
                    </a>
                  </div>
                  <div className="pl-4">
                    <a href="https://www.workcomposer.com/features/work-time-tracking" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                      https://www.workcomposer.com/features/work-time-tracking
                    </a>
                  </div>
                  <div className="pl-4 text-slate-400 dark:text-slate-500 text-[11px] font-sans">
                    And +1 more
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 pt-1">
                <GoogleIndiaEngineBadge />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCannibalizationModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Keyword Cannibalization",
                  "Full report of competing URLs across identical queries",
                  2,
                  "Resolving cannibalization prevents Google from splitting page authority and fluctuating ranking signals between URLs."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 3: Pages with poor-quality content */}
        <section
          aria-labelledby="section-poor-content"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-poor-content" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Pages with poor-quality content</span>
              <span className="text-slate-400 text-xs cursor-help" title="Content quality score compared to top ranking competitors">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, has been detected 2 pages with content quality lower than the average value of competitors in the Top 10.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Item 1: Score 38 */}
            <div className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-3">
                <span className="bg-amber-400 text-white font-bold text-xs px-2 py-0.5 rounded-md flex-shrink-0">
                  38
                </span>
                <div>
                  <a
                    href="https://www.workcomposer.com/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    https://www.workcomposer.com/download
                  </a>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Keyword: <span className="text-slate-700 dark:text-slate-300 font-medium">composer download</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <GoogleIndiaEngineBadge />
              </div>
            </div>

            {/* Item 2: Score 60 */}
            <div className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-500 text-white font-bold text-xs px-2 py-0.5 rounded-md flex-shrink-0">
                  60
                </span>
                <div>
                  <a
                    href="https://www.workcomposer.com/wc/idle-time-tracking-software"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    https://www.workcomposer.com/wc/idle-time-tracking-software
                  </a>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Keyword: <span className="text-slate-700 dark:text-slate-300 font-medium">employee monitoring idle time</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <GoogleIndiaEngineBadge />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPoorContentModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Pages with poor-quality content",
                  "All pages below competitor quality thresholds",
                  2,
                  "Addressing content gaps on these pages is essential to sustaining high positions."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 4: Keywords for which impressions or clicks have significantly increased (GSC Empty State) */}
        <section
          aria-labelledby="section-impressions-increased"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-impressions-increased" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Keywords for which impressions or clicks have significantly increased</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, we have found 0 keywords for which the number of impressions or clicks has significantly increased...
          </p>

          <div className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              🔒
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">
              No access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 text-center leading-relaxed">
              Connect Google Search Console to your project to get additional insights and more ranking opportunities. We don&apos;t copy or share the data from your Google Search Console with anyone. It is used exclusively for generating insights.
            </p>
            <button
              type="button"
              onClick={() => setIsGscModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer uppercase"
            >
              <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
              <span>CONNECT GOOGLE SEARCH CONSOLE</span>
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRecommendationModal("gsc-impressions-clicks-increased")}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Keywords for which impressions or clicks have significantly increased",
                  "Keywords with notable gains in impressions or clicks",
                  0,
                  "Connect Google Search Console to unlock full impressions, clicks, CTR, and position data for surging keywords."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 5: Keywords for which impressions or clicks have significantly decreased */}
        <section
          aria-labelledby="section-impressions-decreased"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-impressions-decreased" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Keywords for which impressions or clicks have significantly decreased</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, we have found 0 keywords for which the number of impressions or clicks has significantly decreased...
          </p>

          <div className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              🔒
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">
              No access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 text-center leading-relaxed">
              Connect Google Search Console to your project to get additional insights and more ranking opportunities. We don&apos;t copy or share the data from your Google Search Console with anyone. It is used exclusively for generating insights.
            </p>
            <button
              type="button"
              onClick={() => setIsGscModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer uppercase"
            >
              <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
              <span>CONNECT GOOGLE SEARCH CONSOLE</span>
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRecommendationModal("gsc-impressions-clicks-decreased")}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Keywords for which impressions or clicks have significantly decreased",
                  "Keywords with declining search volume or visibility",
                  0,
                  "Connect Google Search Console to monitor impression and click losses across your target query portfolio."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 6: Low CTR top results */}
        <section
          aria-labelledby="section-low-ctr"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-low-ctr" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Low CTR top results</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, we have found 0 new keyword(s) with CTR that is lower than expected from pages in the top search results.
          </p>

          <div className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              🔒
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">
              No access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 text-center leading-relaxed">
              Connect Google Search Console to your project to get additional insights and more ranking opportunities. We don&apos;t copy or share the data from your Google Search Console with anyone. It is used exclusively for generating insights.
            </p>
            <button
              type="button"
              onClick={() => setIsGscModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer uppercase"
            >
              <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
              <span>CONNECT GOOGLE SEARCH CONSOLE</span>
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRecommendationModal("gsc-low-ctr")}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Low CTR top results",
                  "High-ranking search queries underperforming in click-through rates",
                  0,
                  "Connect Google Search Console to discover immediate click lift opportunities on positions 1-10."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 7A: Pages for which impressions or clicks have significantly increased */}
        <section
          aria-labelledby="section-pages-impressions-increased"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-pages-impressions-increased" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Pages for which impressions or clicks have significantly increased</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, we have found 0 pages for which the number of impressions or clicks has significantly increased...
          </p>

          <div className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              🔒
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">
              No access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 text-center leading-relaxed">
              Connect Google Search Console to your project to get additional insights and more ranking opportunities. We don&apos;t copy or share the data from your Google Search Console with anyone. It is used exclusively for generating insights.
            </p>
            <button
              type="button"
              onClick={() => setIsGscModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer uppercase"
            >
              <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
              <span>CONNECT GOOGLE SEARCH CONSOLE</span>
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRecommendationModal("gsc-pages-increased")}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Pages for which impressions or clicks have significantly increased",
                  "URLs gaining significant search impressions and visitor traffic",
                  0,
                  "Connect Google Search Console to see page-level impression growth and traffic acceleration."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 7B: Pages for which impressions or clicks have significantly decreased */}
        <section
          aria-labelledby="section-pages-impressions-decreased"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-pages-impressions-decreased" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Pages for which impressions or clicks have significantly decreased</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, we have found 0 pages for which the number of impressions or clicks has significantly decreased...
          </p>

          <div className="py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              🔒
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">
              No access
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5 text-center leading-relaxed">
              Connect Google Search Console to your project to get additional insights and more ranking opportunities. We don&apos;t copy or share the data from your Google Search Console with anyone. It is used exclusively for generating insights.
            </p>
            <button
              type="button"
              onClick={() => setIsGscModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer uppercase"
            >
              <GoogleGLogo className="w-4 h-4 flex-shrink-0" />
              <span>CONNECT GOOGLE SEARCH CONSOLE</span>
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveRecommendationModal("gsc-pages-decreased")}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Pages for which impressions or clicks have significantly decreased",
                  "URLs experiencing drops in impressions or organic visitor traffic",
                  0,
                  "Connect Google Search Console to identify declining URLs and diagnose content decay or indexing issues."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 8: Keywords and pages with changes in snippets */}
        <section
          aria-labelledby="section-snippets-changes"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-snippets-changes" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Keywords and pages with changes in snippets</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 9 Sep 2026 to 23 Sep 2026 we found 1 keywords and pages with changes in snippets
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div>
                <a
                  href="https://www.workcomposer.com/wc/idle-time-tracking-software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-mono block max-w-xl truncate"
                >
                  https://www.workcomposer.com/wc/idle-time-tracking-software
                </a>
                <div className="flex items-center gap-3 mt-1 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    track computer idle time
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                    Changes: 1
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Position: 23 → 17
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <GoogleIndiaEngineBadge />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSnippetsModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Keywords and pages with changes in snippets",
                  "Recent changes detected in Google SERP results",
                  1,
                  "Tracking snippet volatility helps identify why organic impressions and CTR fluctuate unexpectedly."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 9: Competitors who jumped to the Top 10 */}
        <section
          aria-labelledby="section-competitors-jumped"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-competitors-jumped" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Competitors who jumped to the Top 10</span>
              <span className="text-slate-400 text-xs cursor-help">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            From 09 Sep 2026 to 23 Sep 2026, has been detected 6 competitors who made a jump on 6 keywords. The traffic forecast of these competitors has increased by 7 on average.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                letter: "\\",
                bgColor: "bg-slate-700 text-white",
                url: "https://www.ionos.com/digitalguide/server/configuration/php-composer-installati...",
                keyword: "composer download",
                jump: "100+ Final position: 7",
                forecast: "G 67",
              },
              {
                letter: "B",
                bgColor: "bg-red-600 text-white",
                url: "https://www.bitdefender.com/...",
                keyword: "work composer hack",
                jump: "▲ 4 Final position: 7 → 3",
                forecast: "G 1 ▲ 1",
              },
              {
                letter: "A",
                bgColor: "bg-blue-600 text-white",
                url: "https://www.wanywhere.com/...",
                keyword: "system idle time tracker software",
                jump: "▲ 16 Final position: 26 → 10",
                forecast: "G 0",
              },
              {
                letter: "C",
                bgColor: "bg-red-500 text-white",
                url: "https://www.currentware.com/...",
                keyword: "idle time tracking",
                jump: "▲ 3 Final position: 10 → 7",
                forecast: "G 0",
              },
              {
                letter: "W",
                bgColor: "bg-emerald-600 text-white",
                url: "https://www.worktime.com/...",
                keyword: "employee monitoring idle time",
                jump: "▲ 14 Final position: 16 → 2",
                forecast: "G 2 ▲ 2",
              },
            ].map((comp, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-3 min-w-[280px] flex-1">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${comp.bgColor}`}
                  >
                    {comp.letter}
                  </span>
                  <div className="truncate">
                    <span className="text-blue-600 dark:text-blue-400 font-mono truncate block max-w-lg">
                      {comp.url}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-slate-500 dark:text-slate-400">
                      <span>
                        Keyword: <strong className="text-slate-700 dark:text-slate-200">{comp.keyword}</strong>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {comp.jump}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200 dark:border-slate-700">
                    {comp.forecast}
                  </span>
                  <GoogleIndiaEngineBadge />
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCompetitorJumpsModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Competitors who jumped to the Top 10",
                  "6 detected competitors across 6 keywords",
                  6,
                  "Rapid competitor rank jumps signal emergent search intent or algorithmic recalibrations."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* SECTION 10: Competitors’ new keywords */}
        <section
          aria-labelledby="section-competitors-new-keywords"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 id="section-competitors-new-keywords" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Competitors’ new keywords</span>
              <span className="text-slate-400 text-xs cursor-pointer" title="New keywords ranking in top 30">ℹ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-normal">
            From 15 Sep 2026 to 23 Sep 2026, we have found 40 new page(s) for which your competitors started ranking in the top 30 of search results.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                keyword: "efficiency at work",
                url: "https://www.activtrak.com/blog/work-efficiency/",
                pos: 1,
                forecast: "G 3",
              },
              {
                keyword: "to do list google sheet template",
                url: "https://clockify.me/to-do-list-templates",
                pos: 1,
                forecast: "G 1",
              },
              {
                keyword: "employee time clock app for ipad",
                url: "https://clockify.me/time-clock-app",
                pos: 1,
                forecast: "G 0",
              },
              {
                keyword: "workforce productivity analytics",
                url: "https://www.activtrak.com/blog/productivity-analytics-101/",
                pos: 1,
                forecast: "G 0",
              },
              {
                keyword: "employee field tracking software",
                url: "https://hubstaff.com/field-tracking-software",
                pos: 1,
                forecast: "G 0",
              },
            ].map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
                <div className="flex-1 min-w-[280px]">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.keyword}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block mt-0.5 max-w-xl font-mono"
                  >
                    {item.url}
                  </a>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Position: {item.pos}</span>
                    <span className="font-mono">{item.forecast}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <GoogleIndiaEngineBadge />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => setIsCompetitorNewKeywordsModalOpen(true)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase px-4 py-2 rounded-md transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              RECOMMENDATIONS
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenViewAll(
                  "Competitors’ new keywords",
                  "All 40 new competitor pages ranking in the top 30",
                  40,
                  "Monitoring newly ranking competitor pages allows you to counter emerging ranking moves before competitors solidify topical authority."
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase px-5 py-2 rounded-md transition shadow-xs cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </section>

        {/* "Do you have an idea for an insight?" Bottom Notice Banner */}
        {isIdeaBannerVisible && (
          <div className="bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-xl p-4 mt-6 mb-8 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                i
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Do you have an idea for an insight?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  If you spend a lot of time researching and looking for some particular data or events or would like to see specific additional insights in the Insights tool,{" "}
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(true)}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline cursor-pointer"
                  >
                    write to us!
                  </button>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsIdeaBannerVisible(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm leading-none cursor-pointer shrink-0"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Easy-to-Improve Positions Custom Recommendations Modal */}
      {isEasyImproveModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="easy-improve-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full shadow-2xl overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3
                id="easy-improve-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsEasyImproveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-base font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="font-normal text-slate-700 dark:text-slate-200">
                We recommend focusing on the quality of your content and doing thorough on-page optimization. Here is what we suggest you do:
              </p>

              <ul className="space-y-3 pl-4 list-disc marker:text-slate-400 text-slate-600 dark:text-slate-300">
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Check SERP competitors for your desired keyword(s).</strong> Use the Keyword Research tool (Organic Results section) or SERP Analyzer to build a list, then single out the most relevant keywords.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Analyze competitors’ primary content.</strong> This includes article structure, headings, word count, etc. You can check all of these in the Content Editor.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Run an audit in On-page SEO Checker.</strong> It will reveal the page’s current issues concerning layout, main on-page elements (like title, description, etc.), internal/external links, SERP features, and more.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Compare the results.</strong> After analyzing these pages, you can compare them to yours and create an optimization plan for your page.
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                After optimizing your content in your project, add a note or a tag to your target keywords to track the results.
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEasyImproveModalOpen(false)}
                className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Cannibalization Custom Recommendations Modal */}
      {isCannibalizationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cannibalization-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCannibalizationModalOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-[800px] w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-8 sm:pt-7 sm:pb-3 flex-shrink-0">
              <h3
                id="cannibalization-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsCannibalizationModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-6 py-3 sm:px-8 sm:py-4 overflow-y-auto flex-1 space-y-4 text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#475569_transparent]">
              <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                Keyword cannibalization occurs when content on different pages of your site ranks for the same keyword cluster and has the same search intent. Cannibalization weakens off-page optimization, diminishes internal linking weight, worsens user experience, wastes crawl budget, and makes it harder for search engines to assess your page. To fix keyword cannibalization, you can do the following:
              </p>

              <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Remove, merge, and redirect non-primary pages.</strong>{" "}
                  Evaluate each page’s performance and leave the most relevant. Once you have a clearer picture of your site’s architecture, delete weaker pages and redirect them to “stronger” pages using 301 redirects. Another viable option instead of deleting is to merge the pages that have cannibalization issues.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Canonicalize non-primary pages to the primary page.</strong>{" "}
                  If several pages look similar, the crawlers will decide which page has more value and will treat the others like duplicates. Use canonical tags to show the bots which is the main page and which pages are copies.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Blocking non-primary pages from indexing.</strong>{" "}
                  Use the noindex tag to fix cannibalization issues. It will block the page from indexing. The search bot will crawl the page but won’t index it, preventing it from appearing in the search results. You can apply this option to all pages that compete with the primary page. Implement noindex as a meta robots tag or as an X-Robots-Tag in an HTTP response header.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Rework internal linking.</strong>{" "}
                  This method must be used in conjunction with the previous ones to achieve results. If internal links lead to a cannibal page, forward users to your primary page instead. This way, the latter will get more weight, and the search engine will consider it more important. Also, check your anchor texts. Links using anchors with cannibalizing keywords can help the wrong page rank for that query.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Differentiate search intents.</strong>{" "}
                  It’s okay to optimize two pages for the same keyword if the pages fulfill different intents. However, if both pages have matching intent, they will start competing with one another on the SERP. You can merge similar pages to create one big page with a single intent, or you can find other uses for the cannibal pages.
                </li>
              </ul>

              <p className="text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 pt-2 pb-1">
                Read more on the topic{" "}
                <a
                  href="#cannibalization-guide"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#4c97e9] dark:text-blue-400 underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
                >
                  here
                </a>
                .
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsCannibalizationModalOpen(false)}
                className="bg-[#4c97e9] hover:bg-[#3b86d8] active:bg-[#2b76c8] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages with Poor-Quality Content Custom Recommendations Modal */}
      {isPoorContentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="poor-content-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPoorContentModalOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col relative transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-7 sm:pt-6 sm:pb-3 flex-shrink-0">
              <h3
                id="poor-content-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsPoorContentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-3 sm:px-7 sm:py-4 space-y-4 text-[13px] sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Content Score measures content quality and relevancy, which affect rankings in organic search results. It considers factors such as the number of characters, headings, paragraphs, and images; the use of keywords in the article in general and in the headings in particular; and many other metrics.
              </p>
              <p>
                To improve the content, go to the details of the insight and click on the Content Score. You will be able to run a detailed analysis of your article and get recommendations for improving the quality of content.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-7 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsPoorContentModalOpen(false)}
                className="bg-[#1976d2] hover:bg-[#1565c0] active:bg-[#0d47a1] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords and Pages with Changes in Snippets Custom Recommendations Modal */}
      {isSnippetsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="snippets-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSnippetsModalOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-[800px] w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-8 sm:pt-7 sm:pb-3 flex-shrink-0">
              <h3
                id="snippets-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsSnippetsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-6 py-3 sm:px-8 sm:py-4 overflow-y-auto flex-1 space-y-4 text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#475569_transparent]">
              <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                Google may rewrite snippets based on perceived relevance. However, if the new snippet reduces the appeal of the listing, it can lead to a lower click-through rate (CTR). A reduced CTR may signal lower user satisfaction to Google, which could further impact rankings. That’s why SEO specialists should closely monitor these changes and respond quickly when necessary. Here’s how we recommend approaching snippet change monitoring:
              </p>

              <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Compare snippet versions.</strong>{" "}
                  Identify the differences between the current and previous snippets. Focus on what has changed and how those changes might affect click-through rate and perceived relevance.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Review the title tag and meta description.</strong>{" "}
                  Ensure they remain optimized for target keywords, clearly convey the page’s purpose, and align with the user’s search intent.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Re-evaluate search intent.</strong>{" "}
                  Analyze whether the intent behind the keyword has changed. If necessary, conduct keyword research to identify better-aligned queries or update the content to match new user expectations.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Perform SERP analysis.</strong>{" "}
                  Review how other websites are ranking for the same keyword. Check their snippets, content, and authority metrics to identify patterns or gaps you can leverage.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Monitor SERP changes.</strong>{" "}
                  Look for shifts in competitors, featured snippets, or other rich elements. Use historical SERP data to track changes over time and identify trends.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Test and refine meta tags.</strong>{" "}
                  Rewrite titles and descriptions to better match user expectations and Google’s snippet display patterns. Monitor changes in rankings and CTR over time to evaluate the impact of your changes.
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsSnippetsModalOpen(false)}
                className="bg-[#1976d2] hover:bg-[#1565c0] active:bg-[#0d47a1] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitors who jumped to the Top 10 Custom Recommendations Modal */}
      {isCompetitorJumpsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="competitor-jumps-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCompetitorJumpsModalOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-[800px] w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-8 sm:pt-7 sm:pb-3 flex-shrink-0">
              <h3
                id="competitor-jumps-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsCompetitorJumpsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-6 py-3 sm:px-8 sm:py-4 overflow-y-auto flex-1 space-y-4 text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#475569_transparent]">
              <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                Keeping track of competitors who jumped is beneficial for detecting new techniques or growing trends that your competitors could be using. It is very likely that you will be able to use them as well to boost your rankings. Or, at the very least, you can use these insights to stay vigilant regarding competitors who may pose a bigger threat in SERPs. We recommend you do the following to keep an eye on competitors with abnormal ranking behavior:
              </p>

              <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Add to &ldquo;My competitors&rdquo;.</strong>{" "}
                  Add all competitors who have jumped to the Top 10 from outside or moved more than three positions within the Top 10 to a list in the My Competitors tool.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Evaluate the metrics of the jumped pages in the SERP Analyzer.</strong>{" "}
                  It will highlight the core on-page parameters and provide a list of recommendations that will help you make changes to your pages. More details will be shown in the Competitive Comparison of the SERP Analyzer (terms and related metrics, content elements such as title/description/headings, and technical metrics.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Analyze the backlink portfolio of each competitor who made a jump.</strong>{" "}
                  If there are no noticeable changes that could have led to the jump, it is likely that they added a few inbound and outbound links to the page. This could cause a quick jump in rankings.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Check the ads your competitors are running.</strong>{" "}
                  It is possible that the growth was secured with paid traffic. If that is the case, consider analyzing the price they are paying to achieve these results and decide whether it is worth doing the same.
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsCompetitorJumpsModalOpen(false)}
                className="bg-[#1976d2] hover:bg-[#1565c0] active:bg-[#0d47a1] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitors’ new keywords Custom Recommendations Modal */}
      {isCompetitorNewKeywordsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="competitor-new-keywords-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCompetitorNewKeywordsModalOpen(false);
            }
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-[800px] w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-8 sm:pt-7 sm:pb-3 flex-shrink-0">
              <h3
                id="competitor-new-keywords-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Recommendations
              </h3>
              <button
                type="button"
                aria-label="Close recommendations modal"
                onClick={() => setIsCompetitorNewKeywordsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-6 py-3 sm:px-8 sm:py-4 overflow-y-auto flex-1 space-y-4 text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#475569_transparent]">
              <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                The keywords your competitors now rank highly for in search results provide valuable information. They can provide insights into the direction your competitors are taking with their content and strategy. To get the most from it and ensure you are not missing any opportunities, here is what we suggest you do:
              </p>

              <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Add the query to the Keyword Manager.</strong>{" "}
                  This ensures you don’t lose it and can come back to it later.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Analyze the query in Keyword Research.</strong>{" "}
                  Figure out its potential, intent, and whether it is relevant to you.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Check live SERP results in the SERP Analyzer.</strong>{" "}
                  Get additional information on each URL to support your future activities.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Compare SERP changes for each query.</strong>{" "}
                  It will help you figure out how Google interprets each query’s intent. Analyze whomever the search engine now considers irrelevant, who has a stable presence, who is new to the SERP, and why they got there.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Create content for the most relevant queries.</strong>{" "}
                  Use the Content Editor to get suggestions for your brief based on an analysis of top-ranking competitors. Then, track your progress as you are writing the content.
                </li>
                <li className="leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">Add queries in Rank Tracker to monitor them.</strong>{" "}
                  Once your page goes live, make sure to track its performance on the SERP. You can also label queries (e.g., with a tag), use notes, or create a separate folder to organize your work around them.
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsCompetitorNewKeywordsModalOpen(false)}
                className="bg-[#1976d2] hover:bg-[#1565c0] active:bg-[#0d47a1] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSC Metric Recommendations Dialog */}
      {activeRecommendationModal && activeRecommendationModal.startsWith("gsc-") && (
        (() => {
          const config = GSC_RECOMMENDATIONS_CONFIG[activeRecommendationModal as keyof typeof GSC_RECOMMENDATIONS_CONFIG];
          if (!config) return null;
          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="gsc-recommendations-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveRecommendationModal(null);
                }
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl max-w-[800px] w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-3 sm:px-8 sm:pt-7 sm:pb-3 flex-shrink-0">
                  <h3
                    id="gsc-recommendations-title"
                    className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    Recommendations
                  </h3>
                  <button
                    type="button"
                    aria-label="Close recommendations modal"
                    onClick={() => setActiveRecommendationModal(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-lg sm:text-xl font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="px-6 py-3 sm:px-8 sm:py-4 overflow-y-auto flex-1 space-y-4 text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#475569_transparent]">
                  {Array.isArray(config.intro) ? (
                    config.intro.map((p, pIdx) => (
                      <p key={pIdx} className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                        {p}
                      </p>
                    ))
                  ) : config.intro ? (
                    <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                      {config.intro}
                    </p>
                  ) : null}

                  {config.sections && config.sections.length > 0 ? (
                    config.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-3.5 pt-1">
                        <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                          {sec.paragraph}
                        </p>
                        <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                          {sec.bullets.map((b, idx) => (
                            <li key={idx} className="leading-relaxed">
                              <strong className="font-bold text-slate-900 dark:text-white">{b.title}</strong>{" "}
                              {b.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <ul className="space-y-3.5 pl-5 list-disc marker:text-slate-800 dark:marker:text-slate-300">
                      {config.bullets?.map((b, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <strong className="font-bold text-slate-900 dark:text-white">{b.title}</strong>{" "}
                          {b.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 sm:px-8 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setActiveRecommendationModal(null)}
                    className="bg-[#1976d2] hover:bg-[#1565c0] active:bg-[#0d47a1] text-white px-7 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Recommendations Modal */}
      {recommendationModal?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rec-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  SEO Action Plan
                </span>
                <h3 id="rec-modal-title" className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {recommendationModal.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close recommendations"
                onClick={() => setRecommendationModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {recommendationModal.subtitle}
            </p>

            <div className="space-y-2.5 mb-6">
              {recommendationModal.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRecommendationModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase shadow-xs transition cursor-pointer"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Modal */}
      {viewAllModal?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-all-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Complete Insights Directory
                </span>
                <h3 id="view-all-modal-title" className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {viewAllModal.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close directory"
                onClick={() => setViewAllModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {viewAllModal.subtitle}
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {viewAllModal.description}
              <div className="mt-3 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span>Total records detected:</span>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                  {viewAllModal.itemsCount}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewAllModal(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Console Modal */}
      {isGscModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gsc-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <GoogleGLogo className="w-6 h-6" />
            </div>
            <h3 id="gsc-modal-title" className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Google Search Console Integration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Connect Google Search Console to unlock real-time clicks, impressions, average CTR, and high-precision query volume signals for <strong className="text-slate-800 dark:text-slate-200">{projectDomain}</strong>.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsGscConnected(!isGscConnected);
                  setIsGscModalOpen(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-semibold uppercase shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <GoogleGLogo className="w-4 h-4" />
                <span>{isGscConnected ? "Disconnect Search Console" : "Authorize Google Account"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGscModalOpen(false)}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 id="feedback-modal-title" className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Share Feedback on Insights
            </h3>
            {feedbackSubmitted ? (
              <div className="py-6 text-center">
                <span className="text-emerald-500 font-bold text-sm">✓ Thank you for your feedback!</span>
                <p className="text-xs text-slate-500 mt-2">We review all suggestions to improve the insights algorithms.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsFeedbackOpen(false);
                    setFeedbackSubmitted(false);
                    setFeedbackText("");
                  }}
                  className="mt-4 bg-slate-200 dark:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-3">
                  Have an idea for a new insight section or found a metric discrepancy?
                </p>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackSubmitted(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notes Drawer/Modal */}
      {isNotesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notes-modal-title"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <h3 id="notes-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Project Notes ({notesCount})
              </h3>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Historical activity and milestone annotations for {projectDomain}.
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Content refresh on time tracking hub</span>
                <p className="text-slate-500 text-[11px]">22 Sep 2026 • Updated meta description and added 3 internal links</p>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Google core algorithm volatility</span>
                <p className="text-slate-500 text-[11px]">18 Sep 2026 • Observed snippet alterations on idle time queries</p>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Added competitor tracking for WorkTime</span>
                <p className="text-slate-500 text-[11px]">10 Sep 2026 • Initiated automated SERP jump monitoring</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
