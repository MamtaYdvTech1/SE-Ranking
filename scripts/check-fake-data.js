const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    console.log('=== REAL DB TOTALS ===');
    console.log('Total Users:', totalUsers);
    console.log('Total Projects:', totalProjects);

    // Check users with example.com
    const exampleUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'user.alpha' } },
          { email: { contains: 'user.beta' } },
          { email: { contains: 'sec.test' } },
          { email: { contains: 'sec-user' } },
          { name: { in: ['User Alpha', 'User Beta', 'Security Test User', 'Regular SEO User'] } },
        ],
      },
      select: { id: true, email: true, name: true },
    });
    console.log('Fake / Example users found in seranking schema:', exampleUsers.length);
    if (exampleUsers.length > 0) {
      console.log('Sample fake users:', exampleUsers.slice(0, 5));
    }

    // Check projects with alpha-marketing, beta-tech, fresh-domain
    const fakeProjects = await prisma.project.findMany({
      where: {
        OR: [
          { domain: { in: ['alpha-marketing.com', 'beta-tech.com', 'fresh-domain.com', 'project-alpha-assigned.org', 'project-beta-unassigned.org'] } },
          { name: { in: ['Alpha Project', 'Beta Project', 'Fresh New Project'] } },
          { domain: { contains: 'example.org' } },
          { domain: { contains: 'example.com' } },
        ],
      },
      select: { id: true, name: true, domain: true },
    });
    console.log('Fake / Example projects found in seranking schema:', fakeProjects.length);
    if (fakeProjects.length > 0) {
      console.log('Sample fake projects:', fakeProjects.slice(0, 5));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
