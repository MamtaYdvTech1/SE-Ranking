export type SearchType = 'ai-search' | 'google-search';

export type ScopeType = '*.domain.com/*' | 'domain.com/*' | 'Exact URL';

export type AiEngineId = 'ai-overview' | 'ai-mode' | 'chatgpt' | 'gemini' | 'perplexity';

export interface AiEngineConfig {
  id: AiEngineId;
  name: string;
  badge?: string;
  color: string;
  iconType: 'ai-overview' | 'ai-mode' | 'chatgpt' | 'gemini' | 'perplexity';
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  region: 'Worldwide' | 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa';
}

export interface ProjectData {
  id: string;
  name: string;
  domain: string;
  brandName?: string | null;
  country: string;
  countryCode: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  analysesCount?: number;
  logoUrl?: string;
}

export interface EngineMetric {
  id: string;
  engineId: AiEngineId;
  name: string;
  mentions: number;
  linkPresence: number;
  presence: number;
  status: string;
}

export interface PromptItem {
  id: string;
  prompt: string;
  topic: string;
  engine: AiEngineId;
  mention: boolean;
  link: boolean;
  ads: boolean;
  competitors: string[];
  fullAnswer?: string;
  answerDate?: string;
  visibility: 'Visible' | 'Not Visible' | 'Partial';
}

export interface CitationItem {
  id: string;
  domain: string;
  url: string;
  citationShare: number | null;
  visibility: number | null;
  topics: string;
  domainTrust: number | null;
  pageTrust: number | null;
  organicTraffic: number | null;
}

export interface CompetitorItem {
  id: string;
  domain: string;
  brandName?: string;
  aiPresence: number | null;
  domainPresence: number | null;
  brandPresence: number | null;
  avgPosition: number | null;
  shareOfVoice: number | null;
}

export interface TopicItem {
  id: string;
  topic: string;
  presence: number;
  competitorPresence: number;
  overlap: 'Shared' | 'Unique' | 'Missing';
  promptsCount: number;
}

export interface AnalysisOverview {
  id: string;
  projectId?: string;
  domain: string;
  scope: ScopeType;
  brandName?: string;
  country: string;
  countryCode: string;
  searchType: SearchType;
  aiPresence: number | null;
  brandPresence: number | null;
  domainPresence: number | null;
  avgPosition: number | null;
  traffic: number | null;
  mentions: number | null;
  links: number | null;
  citationShare: number | null;
  referringDomains?: number | null;
  organicKeywords?: number | null;
  organicTraffic?: number | null;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  engines: EngineMetric[];
  prompts: PromptItem[];
  citations: CitationItem[];
  competitors: CompetitorItem[];
  topics?: TopicItem[];
}

export interface ApiUsageStats {
  requests: number;
  creditsUsed: number;
  lastRequest: string | null;
  currentMonth: string;
  status: 'active' | 'exhausted' | 'unconfigured';
}

export type SystemRole = "SuperAdmin" | "SEOExecutive" | "Viewer";

export type ProjectStatus = "Active" | "Paused" | "Archived" | "active" | "paused" | "archived" | string | number;
export type ProjectAccessLevel = "Owner" | "Member" | "ReadOnly" | number;

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: SystemRole;
  isActive: boolean;
  lastLoginAt?: string;
  assignedProjectIds: string[];
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface ProjectDto {
  id: string;
  name: string;
  primaryDomain: string;
  protocol?: string;
  industry?: string;
  countryCode?: string;
  primaryLocation?: string;
  languageCode?: string;
  timezone?: string;
  defaultSearchEngine?: string;
  defaultDevice?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt?: string;
  memberCount?: number;
  userAccessLevel?: string;
  role?: string;
}

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessLevel: ProjectAccessLevel;
  assignedAt: string;
}

export interface ProjectDetailDto extends ProjectDto {
  createdBy?: string;
  creatorEmail?: string;
  members?: ProjectMemberDto[];
  role?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  page?: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
  timestamp?: string;
  meta?: {
    correlationId?: string;
    timestamp: string;
    lastSyncedAt?: string;
    lastCrawledAt?: string;
  };
}

export interface KeywordDto {
  id: string;
  projectId: string;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
  keywordText: string;
  searchEngine: string;
  countryCode: string;
  locationName?: string;
  languageCode: string;
  device: string;
  targetUrl?: string;
  searchIntent?: string;
  monthlySearchVolume?: number;
  keywordDifficulty?: number;
  cpcUsd?: number;
  isActive: boolean;
  lastCheckedAt?: string;
  createdAt: string;
  tags: string[];
}

export interface KeywordGroupDto {
  id: string;
  projectId: string;
  name: string;
  colorHex?: string;
  keywordCount: number;
  createdAt: string;
}

export interface TagDto {
  id: string;
  projectId: string;
  name: string;
  keywordCount: number;
  createdAt: string;
}

export interface ImportKeywordsResultDto {
  totalProcessed: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  failedCount: number;
  errors: string[];
}

export interface CreateKeywordRequest {
  keywordText: string;
  searchEngine?: string;
  countryCode?: string;
  locationName?: string;
  languageCode?: string;
  device?: string;
  targetUrl?: string;
  searchIntent?: string;
  groupId?: string;
  groupName?: string;
  tags?: string[];
  monthlySearchVolume?: number;
  keywordDifficulty?: number;
  cpcUsd?: number;
}

export interface UpdateKeywordRequest {
  targetUrl?: string;
  searchIntent?: string;
  groupId?: string;
  tags?: string[];
  isActive: boolean;
}

export interface KeywordFilters {
  search?: string;
  groupId?: string;
  tag?: string;
  device?: string;
  status?: string;
  searchIntent?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface RankingTrendPointDto {
  date: string;
  label: string;
  value?: number | null;
}

export interface KeywordRankSummaryDto {
  keyword: string;
  position: number;
  change: number;
}

export interface RankingsOverviewApiResponseDto {
  projectId: string;
  primaryDomain: string;
  totalTrackedKeywords: number;
  averagePosition?: number | null;
  previousAveragePosition?: number | null;
  averagePositionChange?: number | null;
  top5Count: number;
  top10Count: number;
  top30Count: number;
  top10Percentage: number;
  top10PercentageChange?: number | null;
  visibilityScore: number;
  visibilityScoreChange?: number | null;
  searchVisibility?: number;
  top5Keywords: KeywordRankSummaryDto[];
  trend: RankingTrendPointDto[];
  lastCheckedDate?: string | null;
  lastSyncTime?: string | null;
  isStale: boolean;
  staleNotice?: string | null;
  dataNotice: string;
}

export interface KeywordRankDto {
  keywordId: string;
  keywordText: string;
  device?: string | null;
  targetUrl?: string | null;
  currentPosition?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  rankedUrl?: string | null;
  isTargetUrlMatched: boolean;
  lastCheckedDate?: string | null;
  serpFeatures?: string | null;
  groupName?: string | null;
  searchEngine?: string;
  countryCode?: string;
  checkDate?: string | null;
  monthlySearchVolume?: number;
}

export interface RankObservationHistoryDto {
  date: string;
  position?: number | null;
  positionChange?: number | null;
  rankedUrl?: string | null;
  isTargetUrlMatched: boolean;
}

export interface KeywordRankingHistoryDto {
  keywordId: string;
  keywordText: string;
  history: RankObservationHistoryDto[];
}

export interface CrawlRunDto {
  id: string;
  projectId: string;
  status: "Queued" | "Crawling" | "Evaluating" | "Completed" | "Failed" | "Cancelled";
  triggerSource: string;
  startedAt?: string | null;
  completedAt?: string | null;
  urlsDiscovered: number;
  urlsCrawled: number;
  errorsCount: number;
  warningsCount: number;
  noticesCount: number;
  healthScore?: number | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface AuditOverviewDto {
  lastCrawlRun?: CrawlRunDto | null;
  healthScore?: number | null;
  urlsCrawled: number;
  errorsCount: number;
  warningsCount: number;
  noticesCount: number;
  issuesByCategory: Record<string, number>;
  issueCountsBySeverity: Record<string, number>;
  topIssues: AuditIssueDto[];
  recentRuns: CrawlRunDto[];
}

export interface AuditIssueDto {
  id: string;
  crawlRunId: string;
  projectId: string;
  ruleCode: string;
  ruleTitle: string;
  ruleCategory: string;
  severity: "Error" | "Warning" | "Notice";
  affectedUrl: string;
  affectedUrlHash: string;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  evidenceCount: number;
}

export interface IssueEvidenceDto {
  id: number;
  issueId: string;
  evidenceType: string;
  evidencePayload: string;
  createdAt: string;
}

export interface AuditIssueDetailDto extends AuditIssueDto {
  description: string;
  recommendation: string;
  evidence: IssueEvidenceDto[];
}

export interface CrawlPageDto {
  id: number;
  crawlRunId: string;
  url: string;
  httpStatusCode: number;
  contentType?: string | null;
  contentLengthBytes?: number | null;
  loadTimeMs?: number | null;
  crawlDepth: number;
  title?: string | null;
  titleLength?: number | null;
  metaDescription?: string | null;
  h1?: string | null;
  h1Count: number;
  canonicalUrl?: string | null;
  isIndexable: boolean;
  indexabilityStatus?: string | null;
  inlinksCount: number;
  outlinksCount: number;
  crawledAt: string;
}

export interface ProjectSettingsDto {
  projectId: string;
  crawlMaxPages: number;
  crawlMaxDepth: number;
  crawlConcurrency: number;
  crawlRateLimitMs: number;
  crawlRespectRobotsTxt: boolean;
  crawlUserAgent: string;
  rankTrackingFrequency: string;
  rankTrackingTime: string;
  updatedAt: string;
}

export interface UpdateCrawlSettingsRequest {
  crawlMaxPages: number;
  crawlMaxDepth: number;
  crawlConcurrency: number;
  crawlRateLimitMs: number;
  crawlRespectRobotsTxt: boolean;
  crawlUserAgent: string;
}

export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "Open" | "Assigned" | "InProgress" | "ReadyForVerification" | "Verified" | "Reopened" | "Closed";

export interface TaskDto {
  id: string;
  projectId: string;
  sourceIssueId?: string | null;
  sourceIssueRuleCode?: string | null;
  sourceIssueSeverity?: string | null;
  title: string;
  description?: string | null;
  affectedUrl?: string | null;
  priority: string;
  status: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  dueDate?: string | null;
  acceptanceCriteria?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  latestVerification?: TaskVerificationDto | null;
}

export interface TaskIssueEvidenceDto {
  id: number | string;
  evidenceType?: string;
  evidencePayload: string;
  createdAt?: string;
}

export type TaskEvidenceDto = TaskIssueEvidenceDto;

export interface TaskVerificationDto {
  id: number | string;
  taskId?: string;
  verifiedByRunId?: string | null;
  attemptedAt?: string;
  completedAt?: string | null;
  status: "Queued" | "Running" | "Passed" | "Failed" | "Error" | string;
  details?: string | null;
  verifiedByUserId?: string | null;
  verifiedByUserName?: string | null;
}

export interface TaskCommentDto {
  id: string | number;
  taskId?: string;
  userId?: string;
  authorName?: string;
  authorEmail?: string;
  commentText: string;
  createdAt: string;
}

export interface TaskDetailDto extends TaskDto {
  sourceIssueRuleTitle?: string | null;
  sourceIssueRecommendation?: string | null;
  verifications: TaskVerificationDto[];
  evidence: TaskIssueEvidenceDto[];
  comments?: TaskCommentDto[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  affectedUrl?: string | null;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  acceptanceCriteria?: string | null;
  sourceIssueId?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  affectedUrl?: string | null;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  acceptanceCriteria?: string | null;
}

export interface PatchTaskStatusRequest {
  status: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  projectCount: number;
  success?: boolean;
}

export interface UserProjectMembershipDto {
  projectId: string;
  projectName: string;
  primaryDomain: string;
  accessLevel: number;
  assignedAt: string;
}

export interface AdminUserDetailDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  projectMemberships: UserProjectMembershipDto[];
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface AssignUserProjectRequest {
  projectId: string;
  accessLevel: number;
}

// Google Search Console (GSC) Integration DTOs
export interface GscConnectionDto {
  id?: string;
  projectId?: string;
  serviceType?: string;
  propertyIdentifier?: string | null;
  accountEmail: string;
  syncStatus: string;
  lastSyncedAt?: string | null;
  lastErrorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GscPropertyDto {
  propertyIdentifier: string;
  permissionLevel?: string | null;
  siteUrl?: string | null;
}

export interface GscDailyPointDto {
  date: string;
  clicks: number;
  impressions: number;
  ctr?: number;
  averagePosition?: number;
}

export interface GscDeviceStatDto {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  clickShare: number;
}

export interface GscCountryStatDto {
  countryCode: string;
  countryName?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  clickShare?: number;
}

export interface GscPerformanceOverviewDto {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  startDate?: string;
  endDate?: string;
  dailySeries: GscDailyPointDto[];
  deviceBreakdown?: GscDeviceStatDto[];
  lastSyncedAt?: string | null;
  syncStatus: string;
}

export interface GscQueryRowDto {
  queryText?: string;
  query?: string;
  pageUrl?: string;
  countryCode?: string;
  device?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position?: number;
  averagePosition?: number;
}

export interface GscPageRowDto {
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  queryCount: number;
}

export interface GscQueryDailyPointDto {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryDetailDto {
  queryText?: string;
  query?: string;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  topPages: string[];
  history: GscQueryDailyPointDto[];
}

export interface GscAuthUrlDto {
  authUrl: string;
  state: string;
}

export interface BindGscPropertyRequest {
  propertyIdentifier: string;
}

export interface CompleteGscOAuthCallbackRequest {
  code: string;
  redirectUri: string;
  state?: string;
}

// -------------------------------------------------------------
// Dashboard DTOs (REQ-DSH-001)
// -------------------------------------------------------------

export interface DashboardHealthDto {
  healthScore?: number | null;
  totalUrlsCrawled: number;
  errorsCount: number;
  warningsCount: number;
  noticesCount?: number;
  lastCrawledAt?: string | null;
  status?: string | null;
}

export interface DashboardRankingsDto {
  totalKeywords: number;
  averagePosition?: number | null;
  previousAveragePosition?: number | null;
  averagePositionChange?: number | null;
  searchVisibility?: number | null;
  top3Count: number;
  top10Count: number;
  top20Count: number;
  top100Count: number;
  improvedCount: number;
  declinedCount: number;
  unchangedCount: number;
  lastRankCheckAt?: string | null;
  isStale?: boolean;
}

export interface DashboardGscDto {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  lastSyncedAt?: string | null;
  syncStatus: string;
  startDate: string;
  endDate: string;
  dailySeries: GscDailyPointDto[];
}

export interface DashboardCriticalIssueDto {
  id: string;
  crawlRunId?: string;
  ruleCode: string;
  severity?: string;
  affectedUrl: string;
  status?: string;
  firstSeenAt: string;
}

export interface DashboardTasksDto {
  openCount: number;
  inProgressCount: number;
  readyForVerificationCount: number;
  closedCount: number;
  overdueCount: number;
  totalCount: number;
}

export interface DashboardFreshnessDto {
  lastRankCheckAt?: string | null;
  isRankingsStale: boolean;
  lastAuditCrawlAt?: string | null;
  lastGscSyncAt?: string | null;
  gscSyncStatus: string;
}

export interface ProjectDashboardDto {
  projectId: string;
  projectName: string;
  primaryDomain: string;
  health: DashboardHealthDto;
  rankings: DashboardRankingsDto;
  gsc: DashboardGscDto;
  criticalIssues: DashboardCriticalIssueDto[];
  tasks: DashboardTasksDto;
  freshness: DashboardFreshnessDto;
}

export interface GlobalProjectSummaryDto {
  projectId: string;
  name: string;
  primaryDomain: string;
  healthScore?: number | null;
  trackedKeywords: number;
  openTasks: number;
  overdueTasks: number;
  lastCrawledAt?: string | null;
  lastSyncedAt?: string | null;
  gscSyncStatus: string;
}

export type GlobalDashboardProjectSummaryDto = GlobalProjectSummaryDto;

export interface GlobalDashboardDto {
  totalProjects: number;
  totalTrackedKeywords: number;
  averageHealthScore?: number | null;
  totalOpenTasks: number;
  totalOverdueTasks: number;
  projects: GlobalProjectSummaryDto[];
}

// ---------------------------------------------------------------------------
// Phase 4: Management Reporting (Reports) DTOs
// ---------------------------------------------------------------------------

export interface ReportSummaryDto {
  id: string;
  projectId: string;
  title: string;
  executiveSummary?: string | null;
  startDate: string;
  endDate: string;
  sections: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

export interface ReportDetailDto {
  id: string;
  projectId: string;
  title: string;
  executiveSummary?: string | null;
  startDate: string;
  endDate: string;
  sections: string;
  snapshotJson: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

export interface ReportKpiSummary {
  healthScore?: number | null;
  searchVisibility?: number | null;
  gscTotalClicks?: number | null;
  gscTotalImpressions?: number | null;
  completedTasksCount: number;
}

export interface ReportRankKeywordItem {
  keywordId: string;
  term: string;
  currentPosition?: number | null;
  previousPosition?: number | null;
  movement: number;
  bestUrl?: string | null;
}

export interface ReportRankingsSection {
  searchVisibility?: number | null;
  totalKeywords: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  improved: number;
  declined: number;
  unranked: number;
  topKeywords: ReportRankKeywordItem[];
}

export interface ReportGscTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ReportGscQueryItem {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ReportGscPageItem {
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ReportGscSection {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  hasData: boolean;
  dailyTrends: ReportGscTrendPoint[];
  topQueries: ReportGscQueryItem[];
  topPages: ReportGscPageItem[];
}

export interface ReportAuditIssueItem {
  issueId: string;
  ruleCode: string;
  ruleName: string;
  severity: string;
  category: string;
  affectedUrlsCount: number;
}

export interface ReportAuditSection {
  healthScore?: number | null;
  totalCrawledUrls: number;
  totalErrors: number;
  totalWarnings: number;
  totalNotices: number;
  hasCrawl: boolean;
  crawlCompletedAt?: string | null;
  topIssues: ReportAuditIssueItem[];
}

export interface ReportTaskItem {
  taskId: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  isOverdue: boolean;
}

export interface ReportTasksSection {
  completedCount: number;
  openCount: number;
  overdueCount: number;
  tasksSummary: ReportTaskItem[];
}

export interface ReportSnapshotData {
  reportId: string;
  projectId: string;
  projectName: string;
  projectDomain: string;
  title: string;
  executiveNotes?: string | null;
  generatedAtUtc: string;
  createdByUserName: string;
  startDateUtc: string;
  endDateUtc: string;
  sectionsIncluded: string[];
  kpiSummary?: ReportKpiSummary | null;
  rankings?: ReportRankingsSection | null;
  googleSearchConsole?: ReportGscSection | null;
  technicalAudit?: ReportAuditSection | null;
  tasks?: ReportTasksSection | null;
}

// ---------------------------------------------------------------------------
// Phase 4: Notifications (REQ-NOT-001) DTOs
// ---------------------------------------------------------------------------

export type NotificationSeverity = "Critical" | "Warning" | "Info";

export interface NotificationDto {
  id: number;
  userId?: string | null;
  projectId?: string;
  projectName: string;
  title: string;
  message: string;
  severity: NotificationSeverity | string;
  eventType?: string;
  targetUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface UnreadCountDto {
  count: number;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  projectId?: string;
}

// ---------------------------------------------------------------------------
// Phase 4: Activity Logs (REQ-ADM-001) DTOs
// ---------------------------------------------------------------------------

export interface ActivityLogDto {
  id: number;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  projectId?: string | null;
  projectName?: string | null;
  payloadJson?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ActivityLogFilterParams {
  projectId?: string;
  actorId?: string;
  entityType?: string;
  actionType?: string;
  fromUtc?: string;
  toUtc?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Phase 5: Google Analytics 4 (REQ-GA4-001) DTOs
// ---------------------------------------------------------------------------

export interface Ga4ConnectionDto {
  id?: string;
  projectId?: string;
  serviceType?: string;
  propertyIdentifier?: string | null;
  accountEmail?: string;
  syncStatus: string;
  lastSyncedAt?: string | null;
  lastErrorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ga4PropertyDto {
  propertyIdentifier: string;
  displayName: string;
  accountName?: string | null;
}

export interface Ga4AuthUrlDto {
  authUrl?: string;
  url?: string;
  state?: string;
}

export interface Ga4DailyPointDto {
  date: string;
  sessions: number;
  activeUsers: number;
  engagementRate?: number;
  conversions?: number;
  revenue?: number;
}

export interface Ga4OverviewDto {
  totalSessions: number;
  totalActiveUsers: number;
  averageEngagementRate: number;
  totalConversions: number;
  totalRevenue: number;
  startDate?: string;
  endDate?: string;
  dailySeries: Ga4DailyPointDto[];
  lastSyncedAt?: string | null;
  syncStatus?: string;
  propertyIdentifier?: string;
}

export interface Ga4PageRowDto {
  landingPage: string;
  sessions: number;
  activeUsers: number;
  engagementRate: number;
  conversions: number;
  revenue: number;
}

export interface BindGa4PropertyRequest {
  propertyIdentifier: string;
}

export interface CompleteGa4OAuthCallbackRequest {
  code: string;
  redirectUri: string;
  state?: string;
}

export interface CompetitorDto {
  id: string;
  projectId?: string;
  name: string;
  domain: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  lastCheckedAt?: string | null;
}

export interface CompetitorVisibilityPointDto {
  date: string;
  visibility: number;
  averagePosition?: number | null;
  rankedKeywordsCount: number;
}

export interface CompetitorVisibilitySummaryDto {
  competitorId?: string | null;
  domain: string;
  name: string;
  isTargetDomain: boolean;
  currentVisibility: number;
  currentAveragePosition?: number | null;
  currentRankedCount: number;
  top3Count: number;
  top10Count: number;
  top20Count: number;
  top30Count?: number;
  top100Count: number;
  unrankedCount: number;
  top20OverlapCount: number;
  top20OverlapPercentage: number;
  history?: CompetitorVisibilityPointDto[];
}

export interface CompetitorOverviewDto {
  projectId?: string;
  targetDomain?: string;
  totalKeywordsCount: number;
  lastCheckedAt?: string | null;
  latestCheckDate?: string | null;
  isStale: boolean;
  summaries: CompetitorVisibilitySummaryDto[];
}

export type CompetitorVisibilityResponseDto = CompetitorOverviewDto;

export interface CompetitorRankCellDto {
  competitorId?: string;
  position?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  rankedUrl?: string | null;
}

export interface CompetitorKeywordRankingDto {
  keywordId: string;
  keywordText: string;
  searchVolume?: number | null;
  targetPosition?: number | null;
  targetPreviousPosition?: number | null;
  targetPositionChange?: number | null;
  targetRankedUrl?: string | null;
  competitorRanks: Record<string, CompetitorRankCellDto>;
}

export interface CompetitorKeywordsResponseDto {
  items: CompetitorKeywordRankingDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  competitors: CompetitorDto[];
  lastCheckedAt?: string | null;
  isStale: boolean;
}

export interface AddCompetitorRequest {
  name: string;
  domain: string;
  notes?: string;
}

export interface UpdateCompetitorRequest {
  name: string;
  domain: string;
  notes?: string;
}

export interface CompetitorGapRankDto {
  competitorId: string;
  competitorName: string;
  competitorDomain: string;
  position?: number | null;
  rankedUrl?: string | null;
}

export interface CompetitorGapItemDto {
  keywordId: string;
  keywordText: string;
  isActive: boolean;
  searchVolume?: number | null;
  keywordDifficulty?: number | null;
  cpcUsd?: number | null;
  targetPosition?: number | null;
  targetRankedUrl?: string | null;
  bestCompetitorId: string;
  bestCompetitorName: string;
  bestCompetitorDomain: string;
  bestCompetitorPosition: number;
  bestCompetitorRankedUrl?: string | null;
  opportunityScore: number;
  competitorRanks?: CompetitorGapRankDto[];
  checkDate?: string;
}

export interface CompetitorGapResponseDto {
  items: CompetitorGapItemDto[];
  totalCount: number;
  pageNumber?: number;
  page?: number;
  pageSize: number;
  totalPages?: number;
  competitors?: CompetitorDto[];
  latestCheckDate?: string | null;
  lastCheckedAt?: string | null;
  isStale: boolean;
}

// -------------------------------------------------------------
// Rankings Summary DTOs (REQ-RNK-001)
// -------------------------------------------------------------

export interface PositionDistributionBucketsDto {
  top1: number;
  top2_3: number;
  top4_5: number;
  top6_10: number;
  top11_30: number;
  top31_100: number;
  greaterThan100: number;
}

export interface PositionDistributionTrendPointDto {
  date: string;
  top1: number;
  top2_3: number;
  top4_5: number;
  top6_10: number;
  top11_30: number;
  top31_100: number;
  greaterThan100: number;
}

export interface SerpMovementBucketBreakdownDto {
  top1_3: number;
  top4_10: number;
  top11_30: number;
  top31_100: number;
}

export interface SerpMovementSummaryDto {
  jumpedCount: number;
  jumpedPercentage: number;
  droppedCount: number;
  droppedPercentage: number;
  unchangedCount: number;
  unchangedPercentage: number;
  jumpedByBucket: SerpMovementBucketBreakdownDto;
  droppedByBucket: SerpMovementBucketBreakdownDto;
  unchangedByBucket: SerpMovementBucketBreakdownDto;
}

export interface RankingsKeywordPreviewDto {
  keywordId: string;
  keywordText: string;
  position?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  searchVolume?: number | null;
  rankedUrl?: string | null;
  serpFeatures?: string | null;
}

export interface RankingsPageSummaryDto {
  url: string;
  totalKeywords: number;
  averagePosition: number;
  top10Count: number;
  bestPosition?: number | null;
}

export interface RankingsCompetitorSnapshotDto {
  competitorId: string;
  name: string;
  domain: string;
  searchVisibility: number;
  averagePosition?: number | null;
  rankedCount?: number;
}

export interface AlgorithmNoteDto {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  severity: "info" | "warning" | "notice";
}

export interface RankingsSummaryDto {
  projectId?: string;
  primaryDomain?: string;
  lastCheckedAt?: string | null;
  isStale: boolean;
  searchVisibility: number;
  searchVisibilityChange: number;
  averagePosition?: number | null;
  averagePositionChange?: number | null;
  totalKeywordsInSerp: number;
  totalKeywordsTracked: number;
  distribution: PositionDistributionBucketsDto;
  distributionTrend?: PositionDistributionTrendPointDto[];
  movement: SerpMovementSummaryDto;
  topKeywords: RankingsKeywordPreviewDto[];
  jumpedKeywords: RankingsKeywordPreviewDto[];
  droppedKeywords: RankingsKeywordPreviewDto[];
  topPages: RankingsPageSummaryDto[];
  competitors: RankingsCompetitorSnapshotDto[];
  algorithmNotes: AlgorithmNoteDto[];
}

export interface PositionBucketMetricDto {
  count: number;
  percentage: number;
  delta: number;
}

export interface PositionDistributionHeaderDto {
  all: PositionBucketMetricDto;
  top1: PositionBucketMetricDto;
  top3: PositionBucketMetricDto;
  top5: PositionBucketMetricDto;
  top10: PositionBucketMetricDto;
  top30: PositionBucketMetricDto;
  over100: PositionBucketMetricDto;
  jumpedCount: number;
  jumpedPercentage: number;
  droppedCount: number;
  droppedPercentage: number;
  unchangedCount: number;
  unchangedPercentage: number;
}

export interface RankingsInsightDto {
  id: string;
  type: string;
  title: string;
  description: string;
  affectedKeywordIds: string[];
  severity: "info" | "warning" | "error";
  actionLabel: string;
}

export interface KeywordDailyPositionDto {
  date: string;
  formattedDate: string;
  position?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
}

export interface RankingsDetailedKeywordDto {
  keywordId: string;
  keywordText: string;
  groupId?: string | null;
  groupName?: string | null;
  targetUrl?: string | null;
  rankedUrl?: string | null;
  isTargetUrlMatched: boolean;
  monthlySearchVolume?: number | null;
  serpFeatures: string[];
  contentScore?: number | null;
  currentPosition?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  isCannibalized: boolean;
  dailyPositions: KeywordDailyPositionDto[];
  device: string;
  countryCode: string;
  searchEngine: string;
  lastCheckedDate?: string | null;
}

export interface RankingsDetailedResponseDto {
  header: PositionDistributionHeaderDto;
  insights: RankingsInsightDto[];
  overviewMetrics?: RankingsOverviewApiResponseDto | null;
  keywords: PaginatedList<RankingsDetailedKeywordDto>;
  historyDates: string[];
}

export interface HistoricalComparisonMetricDto {
  baselineValue: number;
  currentValue: number;
  change: number;
  isPositive: boolean;
}

export interface HistoricalMetricsSummaryDto {
  averagePosition: HistoricalComparisonMetricDto;
  trafficForecast: HistoricalComparisonMetricDto;
  searchVisibility: HistoricalComparisonMetricDto;
  percentInTop10: HistoricalComparisonMetricDto;
}

export interface HistoricalTrajectoryPointDto {
  date: string;
  formattedDate: string;
  averagePosition?: number | null;
  trafficForecast?: number | null;
  searchVisibility?: number | null;
  percentInTop10?: number | null;
}

export interface RankingsHistoricalKeywordDto {
  keywordId: string;
  keywordText: string;
  groupId?: string | null;
  groupName?: string | null;
  targetUrl?: string | null;
  rankedUrl?: string | null;
  monthlySearchVolume?: number | null;
  serpFeatures: string[];
  contentScore?: number | null;
  baselinePosition?: number | null;
  currentPosition?: number | null;
  positionChange?: number | null;
  isTargetUrlMatched: boolean;
  device: string;
  countryCode: string;
  searchEngine: string;
}

export interface RankingsHistoricalResponseDto {
  dateFrom: string;
  dateTo: string;
  availableDates: string[];
  header: PositionDistributionHeaderDto;
  metrics: HistoricalMetricsSummaryDto;
  trajectory: HistoricalTrajectoryPointDto[];
  keywords: PaginatedList<RankingsHistoricalKeywordDto>;
}

// Additional query helper types for backward compatibility
export type RankingsDetailedQuery = Record<string, unknown>;
export type RankingsHistoricalQuery = Record<string, unknown>;
export type CompetitorKeywordsQuery = Record<string, unknown>;
export type CompetitorGapQuery = Record<string, unknown>;
export type Ga4DateRangeQuery = { startDate?: string; endDate?: string };
export type Ga4PagesQuery = Ga4DateRangeQuery & { search?: string; page?: number; pageSize?: number };
export type GscDateRangeQuery = { startDate?: string; endDate?: string };
export type GscQueriesQuery = GscDateRangeQuery & { search?: string; page?: number; pageSize?: number };
export type GscPagesQuery = GscDateRangeQuery & { search?: string; page?: number; pageSize?: number };
export type GscCountryQuery = GscDateRangeQuery & { topCount?: number };
