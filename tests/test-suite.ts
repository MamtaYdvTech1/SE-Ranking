import { normalizeDomain, AnalyzeRequestSchema, ProjectSchema, CompetitorSchema } from '../src/lib/validation/schemas';
import { MockSeoDataProvider, SeRankingProvider } from '../src/lib/seo/provider';

async function runTests() {
  process.env.NODE_ENV = 'test';
  console.log('--- RUNNING SE RANKING RESEARCH STUDIO TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. URL & Domain Normalization Tests
  assert(normalizeDomain('https://workco.com/') === 'workco.com', 'Normalize https://workco.com/');
  assert(normalizeDomain('http://www.google.com/path?query=1') === 'google.com', 'Normalize http://www.google.com/path');
  assert(normalizeDomain('   stripe.com/   ') === 'stripe.com', 'Normalize trailing spaces and slash');

  // 2. Schema Validation Tests
  const validAnalyze = AnalyzeRequestSchema.safeParse({
    domain: 'workco.com',
    scope: '*.domain.com/*',
    country: 'India',
    countryCode: 'in',
    brandName: 'WorkCo',
    searchType: 'ai-search',
  });
  assert(validAnalyze.success, 'Valid AnalyzeRequestSchema passes');

  const invalidAnalyze = AnalyzeRequestSchema.safeParse({
    domain: 'invalid..domain',
    country: 'India',
    countryCode: 'in',
  });
  assert(!invalidAnalyze.success, 'Invalid domain rejected by AnalyzeRequestSchema');

  // 3. Project Schema Tests
  const validProject = ProjectSchema.safeParse({
    name: 'WorkCo Digital',
    domain: 'https://workco.com/',
    brandName: 'WorkCo',
    country: 'India',
    countryCode: 'in',
  });
  assert(validProject.success && validProject.data.domain === 'workco.com', 'ProjectSchema transforms and normalizes domain');

  // 4. Competitor Schema Tests
  const validComp = CompetitorSchema.safeParse({
    domain: 'https://hootsuite.com',
    brandName: 'Hootsuite',
    analysisId: 'an_123',
  });
  assert(validComp.success && validComp.data.domain === 'hootsuite.com', 'CompetitorSchema transforms domain');

  // 5. Provider Abstraction Tests
  const mockProvider = new MockSeoDataProvider();
  const testConn = await mockProvider.testConnection();
  assert(testConn.success && testConn.status === 200, 'MockSeoDataProvider testConnection succeeds');

  const analysisRes = await mockProvider.analyze({
    domain: 'workco.com',
    scope: '*.domain.com/*',
    country: 'India',
    countryCode: 'in',
    brandName: 'WorkCo',
    searchType: 'ai-search',
  });
  assert(analysisRes.engines.length === 5, 'Analysis returns 5 supported AI engines');
  assert(analysisRes.prompts.length > 0, 'Analysis returns prompts with answers and citations');
  assert(analysisRes.citations.length > 0, 'Analysis returns citations with trust metrics');

  // 6. Real Provider Missing Key Handling
  delete process.env.SE_RANKING_API_TOKEN;
  const realProvider = new SeRankingProvider();
  const realConn = await realProvider.testConnection();
  assert(
    !realConn.success && realConn.message === 'SE Ranking API credentials are not configured.',
    'SeRankingProvider correctly reports unconfigured credentials'
  );

  // 7. Password Hashing & Verification Tests
  const { hashPassword, verifyPassword } = await import('../src/lib/server/auth');
  const testPw = 'SecureSecretPassword123#';
  const hashed = hashPassword(testPw);
  assert(typeof hashed === 'string' && hashed.startsWith('$argon2id$'), 'hashPassword produces salted Argon2id hash');
  assert(verifyPassword(testPw, hashed), 'verifyPassword matches valid password');
  assert(!verifyPassword('WrongPassword!', hashed), 'verifyPassword rejects wrong password');

  // 8. Auth Schemas Validation Tests
  const { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema } = await import('../src/lib/validation/schemas');
  const validLogin = LoginSchema.safeParse({ email: 'user@example.com', password: 'Password123#' });
  assert(validLogin.success, 'LoginSchema accepts valid email and password');

  const validSignup = SignupSchema.safeParse({ email: 'user@example.com', password: 'Password123#' });
  assert(validSignup.success, 'SignupSchema accepts valid email and password');

  const invalidLogin = LoginSchema.safeParse({ email: 'not-an-email', password: '' });
  assert(!invalidLogin.success, 'LoginSchema rejects invalid email and empty password');

  const validForgot = ForgotPasswordSchema.safeParse({ email: 'developer@domain.com' });
  assert(validForgot.success, 'ForgotPasswordSchema accepts valid email');

  const validReset = ResetPasswordSchema.safeParse({
    token: 'test.token.123',
    password: 'NewStrongPassword123#',
    confirmPassword: 'NewStrongPassword123#',
  });
  assert(validReset.success, 'ResetPasswordSchema accepts matching passwords');

  const invalidReset = ResetPasswordSchema.safeParse({
    token: 'test.token.123',
    password: 'NewStrongPassword123#',
    confirmPassword: 'MismatchPassword!',
  });
  assert(!invalidReset.success, 'ResetPasswordSchema rejects mismatched passwords');

  // 9. Visual Challenge Vehicle Dataset Tests
  const { REAL_VEHICLE_IMAGES } = await import('../src/components/verification/BusBicycleImageSelector');
  assert(REAL_VEHICLE_IMAGES.length === 8, 'Vehicle dataset has exactly 8 items');
  const buses = REAL_VEHICLE_IMAGES.filter((v) => v.category === 'bus');
  const bikes = REAL_VEHICLE_IMAGES.filter((v) => v.category === 'bicycle');
  assert(buses.length === 4, 'Vehicle dataset has 4 bus photos');
  assert(bikes.length === 4, 'Vehicle dataset has 4 bicycle photos');
  assert(REAL_VEHICLE_IMAGES.every((v) => v.src.startsWith('https://images.unsplash.com/')), 'All vehicles use Unsplash images');


  console.log(`\n==========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
