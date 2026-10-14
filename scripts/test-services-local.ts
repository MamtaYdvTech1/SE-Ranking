import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { getProjectBacklinks } from '../src/services/seo/backlink.service';
import { getRankingSummary } from '../src/services/seo/ranking.service';
import { prisma } from '../src/lib/db/prisma';

async function main() {
  console.log('Testing services for workcomposer.com project: cmv7xr3wd0002vjz88w8ivcvw...');
  
  const backlinks = await getProjectBacklinks('cmv7xr3wd0002vjz88w8ivcvw');
  console.log('--- BACKLINK SERVICE RESULTS ---');
  console.log('Domain:', backlinks.domain);
  console.log('Total Backlinks:', backlinks.totalBacklinks);
  console.log('Referring Domains:', backlinks.referringDomains);
  console.log('Domain Trust:', backlinks.domainTrust);
  console.log('Page Trust:', backlinks.pageTrust);
  console.log('DoFollow Ratio:', backlinks.dofollowRatio);
  console.log('TimeSeries Count:', backlinks.timeSeries?.length);
  console.log('NewLostDomains Count:', backlinks.newLostDomains?.length);
  console.log('NewLostBacklinks Count:', backlinks.newLostBacklinks?.length);
  console.log('Sample TimeSeries Point:', backlinks.timeSeries?.[0]);
  console.log('Sample Anchor:', backlinks.anchors?.[0]);

  const rankings = await getRankingSummary('cmv7xr3wd0002vjz88w8ivcvw', '30D');
  console.log('\n--- RANKINGS SERVICE RESULTS ---');
  console.log('Total Keywords:', rankings.summary.totalKeywords);
  console.log('Average Position:', rankings.summary.averagePosition);
  console.log('Visibility Score:', rankings.summary.visibilityScore);
  console.log('Trend Points Count:', rankings.trend.length);
  console.log('Competitors Count:', rankings.competitors.length);
  if (rankings.competitors.length > 0) {
    console.log('Sample Competitor:', rankings.competitors[0]);
  }
}

main().catch(console.error);
