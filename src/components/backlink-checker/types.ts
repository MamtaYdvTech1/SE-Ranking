// Record shapes rendered by the Backlink Checker tabs; filled from GET /api/projects/[id]/backlinks/explorer

export interface TimeSeriesPoint {
  date: string;
  referringDomains: number;
  backlinks: number;
  domainTrust: number;
  pageTrust: number;
  organicTraffic: number;
  newRefDomains: number;
  lostRefDomains: number;
  newBacklinks: number;
  lostBacklinks: number;
}

export interface AnchorData {
  id?: string;
  anchorText: string;
  backlinks: number;
  percent: number;
  referringDomains: number;
  dofollowCount?: number;
  dofollowPercent: number;
  firstSeen: string;
  lastSeen: string;
  wordCount?: number;
  sampleRefDomains?: { domain: string; dt: number; links: number }[];
  sampleBacklinks?: { sourceUrl: string; targetUrl: string; isDofollow: boolean }[];
}

export interface TrustDistributionData {
  range: string;
  refDomains: number;
  percent: number;
}

export interface CountryDistributionData {
  countryCode: string;
  countryName: string;
  flag: string;
  refDomains: number;
  percent: number;
}

export interface BacklinkRecord {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  targetUrl: string;
  anchorText: string;
  domainTraffic: string;
  domainTrafficNum: number;
  pageTraffic: string;
  pageTrafficNum: number;
  domainTrust: number;
  pageTrust: number;
  keywordsCount: number;
  firstSeen: string;
  lastSeen: string;
  status: "Active" | "New" | "Lost";
  linkType: "Text" | "Image" | "Redirect";
  isDofollow: boolean;
  isBestLink?: boolean;
}

export interface ReferringDomainRecord {
  id: string;
  domain: string;
  domainTrust: number;
  pageTrust?: number;
  domainTraffic: string;
  domainTrafficNum: number;
  linkTraffic?: string;
  linkTrafficNum?: number;
  backlinksCount: number;
  backlinkKeywords?: string;
  backlinkKeywordsNum?: number;
  keywords: string;
  keywordsNum: number;
  domainAge: string;
  firstSeen: string;
  lastSeen?: string;
  status: "Active" | "New" | "Lost";
  dofollowCount?: number;
  nofollowCount?: number;
  country?: string;
  countryCode?: string;
  flag?: string;
  ip?: string;
}

export interface PageRecord {
  id: string;
  url: string;
  backlinksCount: number;
  refDomainsCount: number;
  domainTrust: number;
  statusCode: number;
  title: string;
}

export interface IpRecord {
  id: string;
  ipAddress: string;
  subnet: string;
  country: string;
  countryCode: string;
  flag: string;
  refDomainsCount: number;
  backlinksCount: number;
}

export interface ZohoPageItem {
  id: string;
  url: string;
  protocol: "https" | "http";
  backlinksCount: number;
  refDomainsCount: number;
  brokenBacklinksCount?: number;
  domainTrust?: number;
  statusCode?: number;
  firstSeen?: string;
  lastSeen?: string;
  sampleRefDomains?: { domain: string; dt: number; links: number }[];
  sampleBacklinks?: { sourceUrl: string; targetUrl: string; anchor: string; isDofollow: boolean }[];
}

export interface ZohoIpItem {
  id: string;
  ipAddress: string;
  subnet: string;
  country: string;
  countryCode: string;
  flag: string;
  logoType?: string;
  ipCountInSubnet?: number;
  refDomainsCount: number;
  backlinksCount: number;
  sampleRefDomains?: { domain: string; dt: number; links: number }[];
  sampleBacklinks?: { sourceUrl: string; targetUrl: string; anchor: string; isDofollow: boolean }[];
}
