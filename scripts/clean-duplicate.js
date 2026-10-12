const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allProjects = await prisma.project.findMany({
    select: { id: true, name: true, domain: true, deletedAt: true }
  });
  console.log('All projects:', allProjects);

  // If workcomposer project cmuzkdafg000051lks85mq77l had deletedAt set, restore it:
  const p2 = await prisma.project.findUnique({
    where: { id: 'cmuzkdafg000051lks85mq77l' }
  });
  if (p2 && p2.deletedAt) {
    await prisma.project.update({
      where: { id: 'cmuzkdafg000051lks85mq77l' },
      data: { deletedAt: null }
    });
    console.log('Restored workcomposer project cmuzkdafg000051lks85mq77l');
  }

  const active = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, domain: true }
  });
  console.log('Active projects now:', active);
}

main().catch(console.error).finally(() => prisma.$disconnect());
