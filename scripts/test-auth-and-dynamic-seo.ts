import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { prisma } from '../src/lib/db/prisma';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function run() {
  console.log(`Starting Auth & Dynamic SEO Verification against ${BASE_URL}...`);

  const uniqueId = Date.now();
  const testEmail = `tester_${uniqueId}@mygrowthagency.io`;
  const testPassword = 'Password123#Secure!';
  const testFirstName = 'Test';
  const testLastName = 'User';

  console.log(`\n1. Testing Signup API with email: ${testEmail}...`);
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: testFirstName,
      lastName: testLastName,
      name: `${testFirstName} ${testLastName}`,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
    }),
  });

  const signupCookie = signupRes.headers.get('set-cookie');
  const signupData = await signupRes.json();
  console.log(`Signup Status: ${signupRes.status}, Success: ${signupData.success}`);

  if (!signupRes.ok || !signupData.success) {
    console.error('Signup failed:', signupData);
    process.exit(1);
  }

  const sessionToken = signupData.token;
  console.log(`Created User ID: ${signupData.user.id}, Session Token: ${sessionToken ? 'Present' : 'Missing'}`);
  console.log(`Session Cookie Set: ${signupCookie ? 'Yes' : 'No'}`);

  console.log(`\n2. Testing /api/auth/me with session cookie & Bearer token...`);
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      cookie: signupCookie || '',
      authorization: `Bearer ${sessionToken}`,
    },
  });
  const meData = await meRes.json();
  console.log(`/api/auth/me Status: ${meRes.status}, Email: ${meData.user?.email}, Role: ${meData.user?.role}`);

  if (meData.user?.email !== testEmail) {
    console.error('Mismatch in /api/auth/me user:', meData);
    process.exit(1);
  }

  console.log(`\n3. Testing Login API with newly created user...`);
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  const loginCookie = loginRes.headers.get('set-cookie');
  console.log(`Login Status: ${loginRes.status}, User: ${loginData.user?.email}`);

  if (!loginRes.ok || loginData.user?.email !== testEmail) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }

  console.log(`\n4. Testing /api/projects for fresh user (should be empty array)...`);
  const projectsRes = await fetch(`${BASE_URL}/api/projects`, {
    headers: {
      cookie: loginCookie || '',
      authorization: `Bearer ${loginData.token}`,
    },
  });
  const projectsData = await projectsRes.json();
  console.log(`/api/projects Status: ${projectsRes.status}, Projects count: ${projectsData.projects?.length}`);

  console.log(`\n5. Testing Public Routes (/signup and /login) accessibility...`);
  const signupPageRes = await fetch(`${BASE_URL}/signup`, { redirect: 'manual' });
  console.log(`/signup Page Status: ${signupPageRes.status} (Expected: 200, Not 307/308 redirect)`);

  const loginPageRes = await fetch(`${BASE_URL}/login`, { redirect: 'manual' });
  console.log(`/login Page Status: ${loginPageRes.status} (Expected: 200)`);

  if (signupPageRes.status !== 200) {
    console.error('/signup page did not return 200!');
    process.exit(1);
  }

  // Cleanup test user
  console.log(`\n6. Cleaning up test user...`);
  await prisma.session.deleteMany({ where: { userId: signupData.user.id } });
  await prisma.user.delete({ where: { id: signupData.user.id } });
  console.log(`Test user ${testEmail} cleaned up successfully.`);

  console.log('\n✅ ALL AUTH & SIGNUP TESTS PASSED SUCCESSFULLY!');
}

run()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
