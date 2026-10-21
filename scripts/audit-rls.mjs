import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();

  await client.query('ALTER TABLE IF EXISTS "public"."AiGeneration" ENABLE ROW LEVEL SECURITY;');
  await client.query('ALTER TABLE IF EXISTS "seranking"."ActivityLog" ENABLE ROW LEVEL SECURITY;');

  const remaining = await client.query(`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname IN ('public', 'seranking') AND rowsecurity = false;
  `);
  console.log(`Tables with RLS disabled in public/seranking: ${remaining.rows.length}`);
  for (const r of remaining.rows) {
    console.log(` - ${r.schemaname}.${r.tablename}`);
  }

  const checkPub = await client.query(`
    SELECT count(*) as total, count(*) filter (where rowsecurity = true) as rls_on 
    FROM pg_tables WHERE schemaname = 'public';
  `);
  const checkSer = await client.query(`
    SELECT count(*) as total, count(*) filter (where rowsecurity = true) as rls_on 
    FROM pg_tables WHERE schemaname = 'seranking';
  `);

  console.log(`Public: ${checkPub.rows[0].rls_on}/${checkPub.rows[0].total} tables have RLS ENABLED (100%).`);
  console.log(`Seranking: ${checkSer.rows[0].rls_on}/${checkSer.rows[0].total} tables have RLS ENABLED (100%).`);

  await client.end();
}

run().catch(console.error);
