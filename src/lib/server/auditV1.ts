import { NextRequest, NextResponse } from "next/server";
import type { Project } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateSeoHealthScore, crawlAndAuditProject, DEFAULT_CRAWLER_USER_AGENT } from "@/services/seo/audit.service";
import type {
  AuditIssueDetailDto,
  AuditIssueDto,
  AuditOverviewDto,
  CrawlPageDto,
  CrawlRunDto,
  ProjectSettingsDto,
} from "@/lib/types";

/**
 * /api/v1/projects/:id/audit/* — site audit backed by the real crawler.
 * Crawl runs are stored as SITE_AUDIT jobs; crawl settings live in a "crawl_settings" ProjectIntegration row.
 */

const SETTINGS_PROVIDER = "crawl_settings";
const MAX_PAGES_CAP = 40; // crawler hard limit

interface CrawlSettings {
  crawlMaxPages: number;
  crawlMaxDepth: number;
  crawlConcurrency: number;
  crawlRateLimitMs: number;
  crawlRespectRobotsTxt: boolean;
  crawlUserAgent: string;
}

const DEFAULT_SETTINGS: CrawlSettings = {
  crawlMaxPages: 25,
  crawlMaxDepth: 2,
  crawlConcurrency: 1,
  crawlRateLimitMs: 0,
  crawlRespectRobotsTxt: true,
  crawlUserAgent: DEFAULT_CRAWLER_USER_AGENT,
};

function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data }, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json(
    { success: false, statusCode: status, timestamp: new Date().toISOString(), message, error: message },
    { status }
  );
}

function hashUrl(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

async function loadSettings(projectId: string): Promise<{ settings: CrawlSettings; updatedAt: Date | null }> {
  const row = await prisma.projectIntegration.findFirst({ where: { projectId, provider: SETTINGS_PROVIDER } });
  let stored: Partial<CrawlSettings> = {};
  try {
    if (row?.config) stored = JSON.parse(row.config);
  } catch {}
  return { settings: { ...DEFAULT_SETTINGS, ...stored }, updatedAt: row?.updatedAt ?? null };
}

function toSettingsDto(project: Project, settings: CrawlSettings, updatedAt: Date | null): ProjectSettingsDto {
  return {
    projectId: project.id,
    ...settings,
    rankTrackingFrequency: project.rankingFrequency,
    rankTrackingTime: "",
    updatedAt: (updatedAt ?? project.updatedAt).toISOString(),
  };
}

type JobRow = {
  id: string;
  projectId: string | null;
  status: string;
  payload: string | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

const JOB_STATUS: Record<string, CrawlRunDto["status"]> = {
  queued: "Queued",
  running: "Crawling",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

function toCrawlRun(job: JobRow): CrawlRunDto {
  let result: Partial<{ pagesCrawled: number; errors: number; warnings: number; notices: number; healthScore: number | null; trigger: string }> = {};
  try {
    if (job.payload) result = JSON.parse(job.payload);
  } catch {}
  return {
    id: job.id,
    projectId: job.projectId || "",
    status: JOB_STATUS[job.status] || "Queued",
    triggerSource: result.trigger || "Manual",
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    urlsDiscovered: result.pagesCrawled ?? 0,
    urlsCrawled: result.pagesCrawled ?? 0,
    errorsCount: result.errors ?? 0,
    warningsCount: result.warnings ?? 0,
    noticesCount: result.notices ?? 0,
    healthScore: result.healthScore ?? null,
    failureReason: job.error,
    createdAt: job.createdAt.toISOString(),
  };
}

function toIssueDto(issue: {
  id: string;
  projectId: string;
  ruleId: string;
  title: string;
  category: string;
  severity: string;
  url: string;
  status: string;
  foundAt: Date;
}, crawlRunId: string): AuditIssueDto {
  return {
    id: issue.id,
    crawlRunId,
    projectId: issue.projectId,
    ruleCode: issue.ruleId,
    ruleTitle: issue.title,
    ruleCategory: issue.category,
    severity: (["Error", "Warning", "Notice"].includes(issue.severity) ? issue.severity : "Notice") as AuditIssueDto["severity"],
    affectedUrl: issue.url,
    affectedUrlHash: hashUrl(issue.url),
    status: issue.status,
    firstSeenAt: issue.foundAt.toISOString(),
    lastSeenAt: issue.foundAt.toISOString(),
    createdAt: issue.foundAt.toISOString(),
    evidenceCount: 0,
  };
}

function paginate(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

async function latestRun(projectId: string): Promise<JobRow | null> {
  return prisma.job.findFirst({
    where: { projectId, type: "SITE_AUDIT" },
    orderBy: { createdAt: "desc" },
  });
}

/** Runs the crawl for a job and records the outcome on it. */
async function runCrawl(project: Project, jobId: string, settings: CrawlSettings, trigger: string) {
  await prisma.job.update({ where: { id: jobId }, data: { status: "running", startedAt: new Date(), attempts: 1 } });
  try {
    const start = project.websiteUrl || `https://${project.domain}`;
    const result = await crawlAndAuditProject(project.id, start, {
      maxPages: Math.min(MAX_PAGES_CAP, settings.crawlMaxPages),
      maxDepth: settings.crawlMaxDepth,
      userAgent: settings.crawlUserAgent,
    });
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "completed",
        completedAt: new Date(),
        payload: JSON.stringify({
          trigger,
          pagesCrawled: result.pagesCrawled,
          errors: result.criticalIssues,
          warnings: result.warnings,
          notices: result.notices,
          healthScore: result.healthScore,
        }),
      },
    });
  } catch (err: unknown) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: err instanceof Error ? err.message : "Crawl failed",
      },
    });
  }
}

export async function handleAuditV1(
  request: NextRequest,
  method: string,
  subPath: string,
  project: Project
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const projectId = project.id;
  const rest = subPath.replace(/^audit\/?/, "");

  // POST audit/crawl — start a crawl run
  if (rest === "crawl" && method === "POST") {
    const current = await latestRun(projectId);
    if (current && (current.status === "queued" || current.status === "running")) {
      return ok(current.id);
    }
    const { settings } = await loadSettings(projectId);
    const job = await prisma.job.create({
      data: { projectId, type: "SITE_AUDIT", status: "queued", maxAttempts: 1, payload: JSON.stringify({ trigger: "Manual" }) },
    });
    // Crawl continues after the response; clients poll audit/status
    void runCrawl(project, job.id, settings, "Manual");
    return ok(job.id, 202);
  }

  // GET audit/status[?crawlRunId=]
  if (rest === "status" && method === "GET") {
    const runId = searchParams.get("crawlRunId");
    const job = runId
      ? await prisma.job.findFirst({ where: { id: runId, projectId, type: "SITE_AUDIT" } })
      : await latestRun(projectId);
    return ok(job ? toCrawlRun(job) : null);
  }

  // GET audit/overview
  if (rest === "overview" && method === "GET") {
    const [pages, issues, runs] = await Promise.all([
      prisma.auditPage.findMany({ where: { projectId }, select: { statusCode: true } }),
      prisma.auditIssue.findMany({ where: { projectId, deletedAt: null }, orderBy: { foundAt: "desc" } }),
      prisma.job.findMany({ where: { projectId, type: "SITE_AUDIT" }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
    const runDtos = runs.map(toCrawlRun);
    const lastRunId = runDtos[0]?.id ?? "latest";
    const bySeverity: Record<string, number> = { Error: 0, Warning: 0, Notice: 0 };
    const byCategory: Record<string, number> = {};
    for (const i of issues) {
      bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
      byCategory[i.category] = (byCategory[i.category] || 0) + 1;
    }
    const severityRank: Record<string, number> = { Error: 0, Warning: 1, Notice: 2 };
    const overview: AuditOverviewDto = {
      lastCrawlRun: runDtos[0] ?? null,
      healthScore: calculateSeoHealthScore(issues, pages.length, pages.filter((p) => p.statusCode === 200).length),
      urlsCrawled: pages.length,
      errorsCount: bySeverity.Error,
      warningsCount: bySeverity.Warning,
      noticesCount: bySeverity.Notice,
      issuesByCategory: byCategory,
      issueCountsBySeverity: bySeverity,
      topIssues: [...issues]
        .sort((a, b) => (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3))
        .slice(0, 10)
        .map((i) => toIssueDto(i, lastRunId)),
      recentRuns: runDtos,
    };
    return ok(overview);
  }

  // GET audit/issues/:issueId
  const issueMatch = rest.match(/^issues\/([^/]+)$/);
  if (issueMatch && method === "GET") {
    const issue = await prisma.auditIssue.findFirst({ where: { id: issueMatch[1], projectId, deletedAt: null } });
    if (!issue) return fail("Issue not found", 404);
    const run = await latestRun(projectId);
    const detail: AuditIssueDetailDto = {
      ...toIssueDto(issue, run?.id ?? "latest"),
      description: issue.description,
      recommendation: issue.recommendation,
      evidence: [],
    };
    return ok(detail);
  }

  // GET audit/issues
  if (rest === "issues" && method === "GET") {
    const { page, pageSize, skip } = paginate(searchParams);
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const where = {
      projectId,
      deletedAt: null,
      ...(severity ? { severity } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { url: { contains: search, mode: "insensitive" as const } }] }
        : {}),
    };
    const [totalCount, rows, run] = await Promise.all([
      prisma.auditIssue.count({ where }),
      prisma.auditIssue.findMany({ where, orderBy: { foundAt: "desc" }, skip, take: pageSize }),
      latestRun(projectId),
    ]);
    return ok({
      items: rows.map((i) => toIssueDto(i, run?.id ?? "latest")),
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  }

  // GET audit/pages
  if (rest === "pages" && method === "GET") {
    const { page, pageSize, skip } = paginate(searchParams);
    const statusCode = searchParams.get("statusCode");
    const isIndexable = searchParams.get("isIndexable");
    const search = searchParams.get("search")?.trim();
    const where = {
      projectId,
      ...(statusCode ? { statusCode: parseInt(statusCode, 10) } : {}),
      ...(isIndexable != null ? { isIndexable: isIndexable === "true" } : {}),
      ...(search ? { url: { contains: search, mode: "insensitive" as const } } : {}),
    };
    const [totalCount, rows, run] = await Promise.all([
      prisma.auditPage.count({ where }),
      prisma.auditPage.findMany({ where, orderBy: [{ depth: "asc" }, { url: "asc" }], skip, take: pageSize }),
      latestRun(projectId),
    ]);
    const items: CrawlPageDto[] = rows.map((p, idx) => ({
      id: skip + idx + 1,
      crawlRunId: run?.id ?? "latest",
      url: p.url,
      httpStatusCode: p.statusCode,
      contentType: null,
      contentLengthBytes: null,
      loadTimeMs: p.loadTimeMs,
      crawlDepth: p.depth,
      title: p.title,
      titleLength: p.titleLength,
      metaDescription: p.metaDescription,
      h1: p.h1Text,
      h1Count: p.h1Count,
      canonicalUrl: p.canonicalUrl,
      isIndexable: p.isIndexable,
      indexabilityStatus: p.isIndexable ? "Indexable" : p.robotsDirectives?.includes("noindex") ? "Noindex" : "Non-indexable",
      inlinksCount: p.internalLinksCount,
      outlinksCount: p.externalLinksCount,
      crawledAt: p.crawledAt.toISOString(),
    }));
    return ok({ items, page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) });
  }

  // GET/PUT audit/settings
  if (rest === "settings") {
    if (method === "GET") {
      const { settings, updatedAt } = await loadSettings(projectId);
      return ok(toSettingsDto(project, settings, updatedAt));
    }
    if (method === "PUT") {
      const body = (await request.json().catch(() => ({}))) as Partial<CrawlSettings>;
      const { settings: current } = await loadSettings(projectId);
      const next: CrawlSettings = {
        crawlMaxPages: Math.min(MAX_PAGES_CAP, Math.max(1, Number(body.crawlMaxPages ?? current.crawlMaxPages) || current.crawlMaxPages)),
        crawlMaxDepth: Math.min(10, Math.max(0, Number(body.crawlMaxDepth ?? current.crawlMaxDepth) || 0)),
        crawlConcurrency: Math.max(1, Number(body.crawlConcurrency ?? current.crawlConcurrency) || 1),
        crawlRateLimitMs: Math.max(0, Number(body.crawlRateLimitMs ?? current.crawlRateLimitMs) || 0),
        crawlRespectRobotsTxt: body.crawlRespectRobotsTxt ?? current.crawlRespectRobotsTxt,
        crawlUserAgent: (body.crawlUserAgent || current.crawlUserAgent).slice(0, 200),
      };
      const existing = await prisma.projectIntegration.findFirst({ where: { projectId, provider: SETTINGS_PROVIDER } });
      const saved = existing
        ? await prisma.projectIntegration.update({ where: { id: existing.id }, data: { config: JSON.stringify(next) } })
        : await prisma.projectIntegration.create({
            data: { projectId, provider: SETTINGS_PROVIDER, status: "connected", config: JSON.stringify(next) },
          });
      return ok(toSettingsDto(project, next, saved.updatedAt));
    }
  }

  return fail(`Unsupported audit endpoint: ${method} ${subPath}`, 404);
}
