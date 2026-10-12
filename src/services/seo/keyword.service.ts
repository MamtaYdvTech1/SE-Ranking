import { prisma } from '@/lib/db/prisma';

export async function addKeywordsToProject(
  projectId: string,
  rawKeywords: string[],
  config?: { searchEngine?: string; countryCode?: string; device?: string; groupName?: string }
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  const engine = config?.searchEngine || project.defaultSearchEngine || 'google';
  const country = config?.countryCode || project.countryCode || 'in';
  const device = config?.device || project.defaultDevice || 'desktop';
  const group = config?.groupName || 'General';

  const cleaned = rawKeywords
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const inserted: string[] = [];

  for (const text of cleaned) {
    const existing = await prisma.keyword.findFirst({
      where: {
        projectId,
        keywordText: text,
        deletedAt: null,
      },
    });

    if (!existing) {
      await prisma.keyword.create({
        data: {
          projectId,
          keywordText: text,
          searchEngine: engine,
          countryCode: country,
          device,
          groupName: group,
          isActive: true,
        },
      });
      inserted.push(text);
    }
  }

  return { addedCount: inserted.length, addedKeywords: inserted };
}

export async function getKeywordsForProject(projectId: string, search?: string) {
  return prisma.keyword.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(search ? { keywordText: { contains: search } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}
