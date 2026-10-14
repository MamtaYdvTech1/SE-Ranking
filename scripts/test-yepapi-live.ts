import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { yepApiClient } from '../src/lib/yepapi';

async function main() {
  console.log('--- Testing YepAPI Backlinks Endpoint ---');
  const res = await yepApiClient.getBacklinkSummary('fototrendz.co.uk');
  console.log('Summary result ok:', res.ok);
  console.log('Summary result data/error:', res.ok ? res.data : res.error);
}

main().catch(console.error);
