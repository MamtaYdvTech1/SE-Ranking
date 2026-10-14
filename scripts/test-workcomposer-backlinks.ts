import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { yepApiClient } from '../src/lib/yepapi';

async function main() {
  console.log('Checking workcomposer.com on YepAPI...');
  const res = await yepApiClient.getBacklinkSummary('workcomposer.com');
  console.log('workcomposer.com summary ok:', res.ok);
  if (res.ok) {
    console.log('Data:', res.data);
  } else {
    console.log('Error:', res.error);
  }

  const listRes = await yepApiClient.getBacklinksList({ target: 'workcomposer.com', limit: 10 });
  console.log('workcomposer.com list ok:', listRes.ok);
  if (listRes.ok) {
    console.log('Total list links:', listRes.data?.total, 'Backlinks count:', listRes.data?.backlinks?.length);
    if (listRes.data?.backlinks && listRes.data.backlinks.length > 0) {
      console.log('Sample link:', listRes.data.backlinks[0]);
    }
  } else {
    console.log('List error:', listRes.error);
  }

  const compRes = await yepApiClient.getCompetitorDomains({ domain: 'workcomposer.com' });
  console.log('Competitor domains ok:', compRes.ok);
  if (compRes.ok) {
    console.log('Competitors found:', compRes.data?.competitors?.length);
    if (compRes.data?.competitors && compRes.data.competitors.length > 0) {
      console.log('Sample competitor:', compRes.data.competitors[0]);
    }
  } else {
    console.log('Competitors error:', compRes.error);
  }
}

main().catch(console.error);
