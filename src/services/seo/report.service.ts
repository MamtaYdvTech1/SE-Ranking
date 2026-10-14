import { prisma } from '@/lib/db/prisma';
import { getRankingSummary } from './ranking.service';
import { calculateSeoHealthScore } from './audit.service';

export interface ProjectReportData {
  project: {
    id: string;
    name: string;
    domain: string;
    websiteUrl: string;
    country: string;
  };
  period: string;
  generatedAt: string;
  summary: {
    totalKeywords: number;
    averagePosition: number | null;
    visibilityScore: number;
    estimatedTraffic: number;
    seoHealthScore: number | null;
    criticalIssues: number;
    warnings: number;
  };
  rankingDistribution: Array<{ name: string; count: number; percentage: number }>;
  topKeywords: Array<{
    keyword: string;
    rank: number | null;
    prevRank: number | null;
    change: number;
    volume: number;
    url: string;
  }>;
  auditIssues: Array<{
    title: string;
    category: string;
    severity: string;
    url: string;
    recommendation: string;
  }>;
}

export async function getProjectReportData(
  projectId: string,
  periodLabel: string = 'Last 30 Days'
): Promise<ProjectReportData> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error('Project not found');

  const rankingSummary = await getRankingSummary(projectId, 'month');

  const [auditIssues, auditPages] = await Promise.all([
    prisma.auditIssue.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { foundAt: 'desc' },
      take: 10,
    }),
    prisma.auditPage.findMany({
      where: { projectId },
      select: { statusCode: true },
    }),
  ]);

  const passedPages = auditPages.filter((p) => p.statusCode === 200).length;
  const seoHealthScore = calculateSeoHealthScore(auditIssues, auditPages.length, passedPages);

  return {
    project: {
      id: project.id,
      name: project.name,
      domain: project.domain,
      websiteUrl: project.websiteUrl || `https://${project.domain}`,
      country: project.country,
    },
    period: periodLabel,
    generatedAt: new Date().toISOString(),
    summary: {
      totalKeywords: rankingSummary.summary.totalKeywords,
      averagePosition: rankingSummary.summary.averagePosition,
      visibilityScore: rankingSummary.summary.visibilityScore,
      estimatedTraffic: rankingSummary.summary.estimatedTraffic,
      seoHealthScore,
      criticalIssues: auditIssues.filter((i) => i.severity === 'Error').length,
      warnings: auditIssues.filter((i) => i.severity === 'Warning').length,
    },
    rankingDistribution: rankingSummary.keywordDistribution.map((d: any) => ({
      name: d.name || d.range || '',
      count: d.count,
      percentage: d.percentage,
    })),
    topKeywords: rankingSummary.keywords.slice(0, 15).map((k) => ({
      keyword: k.keyword,
      rank: k.rank,
      prevRank: k.prevRank,
      change: k.change,
      volume: k.volume,
      url: k.url,
    })),
    auditIssues: auditIssues.map((i) => ({
      title: i.title,
      category: i.category,
      severity: i.severity,
      url: i.url,
      recommendation: i.recommendation,
    })),
  };
}

export async function listProjectReports(projectId?: string) {
  return prisma.report.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      deletedAt: null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          domain: true,
          websiteUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProjectReport(
  projectId: string,
  data: {
    name: string;
    type?: string;
    schedule?: string | null;
    format?: string;
    recipients?: string;
  }
) {
  return prisma.report.create({
    data: {
      projectId,
      name: data.name,
      type: data.type || 'Overview',
      schedule: data.schedule || null,
      format: data.format || 'PDF',
      recipients: data.recipients || null,
      status: 'Ready',
      lastGeneratedAt: new Date(),
    },
  });
}
