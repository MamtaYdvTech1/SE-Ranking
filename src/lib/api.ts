import {
  ApiResponse,
  AuthResponseDto,
  CreateKeywordRequest,
  ImportKeywordsResultDto,
  KeywordDto,
  KeywordFilters,
  KeywordGroupDto,
  KeywordRankDto,
  KeywordRankingHistoryDto,
  PaginatedList,
  ProjectDetailDto,
  ProjectDto,
  ProjectMemberDto,
  RankingsOverviewApiResponseDto,
  TagDto,
  UpdateKeywordRequest,
  UserDto,
  AuditOverviewDto,
  CrawlRunDto,
  AuditIssueDto,
  AuditIssueDetailDto,
  CrawlPageDto,
  ProjectSettingsDto,
  UpdateCrawlSettingsRequest,
  TaskDto,
  TaskDetailDto,
  TaskCommentDto,
  TaskVerificationDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  AdminUserDto,
  AdminUserDetailDto,
  UserProjectMembershipDto,
  CreateAdminUserRequest,
  AssignUserProjectRequest,
  GscConnectionDto,
  GscAuthUrlDto,
  CompleteGscOAuthCallbackRequest,
  GscPropertyDto,
  GscPerformanceOverviewDto,
  GscQueryRowDto,
  GscQueryDetailDto,
  GscPageRowDto,
  GscDeviceStatDto,
  GscCountryStatDto,
  ProjectDashboardDto,
  GlobalDashboardDto,
  ReportSummaryDto,
  ReportDetailDto,
  NotificationDto,
  UnreadCountDto,
  NotificationFilters,
  ActivityLogDto,
  ActivityLogFilterParams,
  Ga4ConnectionDto,
  Ga4PropertyDto,
  Ga4AuthUrlDto,
  Ga4OverviewDto,
  Ga4PageRowDto,
  BindGa4PropertyRequest,
  CompleteGa4OAuthCallbackRequest,
  CompetitorDto,
  AddCompetitorRequest,
  UpdateCompetitorRequest,
  CompetitorOverviewDto,
  CompetitorKeywordsResponseDto,
  CompetitorGapResponseDto,
  RankingsSummaryDto,
  RankingsDetailedResponseDto,
  RankingsHistoricalResponseDto,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== "undefined"
    ? ""
    : (process.env.API_SERVER_URL || "http://localhost:5000");

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number = 400, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const correlationId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    "X-Correlation-ID": correlationId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // not json
    }

    const message = errorData?.detail || errorData?.title || errorData?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<AuthResponseDto>> => {
      return request<ApiResponse<AuthResponseDto>>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    me: async (): Promise<ApiResponse<UserDto>> => {
      return request<ApiResponse<UserDto>>("/api/v1/auth/me");
    },
  },
  projects: {
    list: async (search?: string, status?: string, page = 1, pageSize = 25): Promise<ApiResponse<PaginatedList<ProjectDto>>> => {
      const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      return request<ApiResponse<PaginatedList<ProjectDto>>>(`/api/v1/projects?${params.toString()}`);
    },
    get: async (id: string): Promise<ApiResponse<ProjectDetailDto>> => {
      return request<ApiResponse<ProjectDetailDto>>(`/api/v1/projects/${id}`);
    },
    create: async (data: Partial<ProjectDto>): Promise<ApiResponse<ProjectDto>> => {
      return request<ApiResponse<ProjectDto>>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<ProjectDto>): Promise<ApiResponse<ProjectDto>> => {
      return request<ApiResponse<ProjectDto>>(`/api/v1/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    getMembers: async (id: string): Promise<ApiResponse<ProjectMemberDto[]>> => {
      return request<ApiResponse<ProjectMemberDto[]>>(`/api/v1/projects/${id}/members`);
    },
    addMember: async (id: string, data: { userId: string; accessLevel: string | number }): Promise<ApiResponse<ProjectMemberDto>> => {
      return request<ApiResponse<ProjectMemberDto>>(`/api/v1/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    removeMember: async (id: string, userId: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${id}/members/${userId}`, {
        method: "DELETE",
      });
    },
  },
  keywords: {
    list: async (projectId: string, filters: KeywordFilters = {}): Promise<ApiResponse<PaginatedList<KeywordDto>>> => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.groupId) params.append("groupId", filters.groupId);
      if (filters.tag) params.append("tag", filters.tag);
      if (filters.device) params.append("device", filters.device);
      if (filters.status) params.append("status", filters.status);
      if (filters.searchIntent) params.append("searchIntent", filters.searchIntent);
      if (filters.sort) params.append("sort", filters.sort);

      return request<ApiResponse<PaginatedList<KeywordDto>>>(
        `/api/v1/projects/${projectId}/keywords?${params.toString()}`
      );
    },
    get: async (projectId: string, id: string): Promise<ApiResponse<KeywordDto>> => {
      return request<ApiResponse<KeywordDto>>(`/api/v1/projects/${projectId}/keywords/${id}`);
    },
    create: async (projectId: string, data: CreateKeywordRequest): Promise<ApiResponse<KeywordDto>> => {
      return request<ApiResponse<KeywordDto>>(`/api/v1/projects/${projectId}/keywords`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (projectId: string, id: string, data: UpdateKeywordRequest): Promise<ApiResponse<KeywordDto>> => {
      return request<ApiResponse<KeywordDto>>(`/api/v1/projects/${projectId}/keywords/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (projectId: string, id: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/keywords/${id}`, {
        method: "DELETE",
      });
    },
    bulk: async (projectId: string, rows: Array<Record<string, unknown>>): Promise<ApiResponse<ImportKeywordsResultDto>> => {
      return request<ApiResponse<ImportKeywordsResultDto>>(`/api/v1/projects/${projectId}/keywords/bulk`, {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
    },
    bulkStatus: async (projectId: string, keywordIds: string[], isActive: boolean): Promise<ApiResponse<number>> => {
      return request<ApiResponse<number>>(`/api/v1/projects/${projectId}/keywords/bulk-status`, {
        method: "POST",
        body: JSON.stringify({ keywordIds, isActive }),
      });
    },
    bulkGroup: async (projectId: string, keywordIds: string[], groupId: string | null): Promise<ApiResponse<number>> => {
      return request<ApiResponse<number>>(`/api/v1/projects/${projectId}/keywords/bulk-group`, {
        method: "POST",
        body: JSON.stringify({ keywordIds, groupId }),
      });
    },
    bulkDelete: async (projectId: string, keywordIds: string[]): Promise<ApiResponse<number>> => {
      return request<ApiResponse<number>>(`/api/v1/projects/${projectId}/keywords/bulk-delete`, {
        method: "POST",
        body: JSON.stringify({ keywordIds }),
      });
    },
    importCsv: async (projectId: string, file: File): Promise<ApiResponse<ImportKeywordsResultDto>> => {
      const formData = new FormData();
      formData.append("file", file);
      return request<ApiResponse<ImportKeywordsResultDto>>(`/api/v1/projects/${projectId}/keywords/import-csv`, {
        method: "POST",
        body: formData,
      });
    },
    exportCsvUrl: (projectId: string, filters: KeywordFilters = {}): string => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.groupId) params.append("groupId", filters.groupId);
      if (filters.device) params.append("device", filters.device);
      if (filters.status) params.append("status", filters.status);
      return `${API_BASE_URL}/api/v1/projects/${projectId}/keywords/export-csv?${params.toString()}`;
    },
  },
  keywordGroups: {
    list: async (projectId: string): Promise<ApiResponse<KeywordGroupDto[]>> => {
      return request<ApiResponse<KeywordGroupDto[]>>(`/api/v1/projects/${projectId}/keyword-groups`);
    },
    create: async (projectId: string, data: { name: string; colorHex?: string }): Promise<ApiResponse<KeywordGroupDto>> => {
      return request<ApiResponse<KeywordGroupDto>>(`/api/v1/projects/${projectId}/keyword-groups`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    delete: async (projectId: string, id: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/keyword-groups/${id}`, {
        method: "DELETE",
      });
    },
  },
  tags: {
    list: async (projectId: string): Promise<ApiResponse<TagDto[]>> => {
      return request<ApiResponse<TagDto[]>>(`/api/v1/projects/${projectId}/tags`);
    },
  },
  rankings: {
    getDetailed: async (
      projectId: string,
      params?: {
        positionFilter?: string;
        minPosition?: number;
        maxPosition?: number;
        changesOnly?: string;
        search?: string;
        cannibalizedOnly?: boolean;
        device?: string;
        metric?: string;
        timeRange?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<RankingsDetailedResponseDto>> => {
      const q = new URLSearchParams();
      if (params?.positionFilter) q.append("positionFilter", params.positionFilter);
      if (params?.minPosition != null) q.append("minPosition", String(params.minPosition));
      if (params?.maxPosition != null) q.append("maxPosition", String(params.maxPosition));
      if (params?.changesOnly) q.append("changesOnly", params.changesOnly);
      if (params?.search) q.append("search", params.search);
      if (params?.cannibalizedOnly != null) q.append("cannibalizedOnly", String(params.cannibalizedOnly));
      if (params?.device) q.append("device", params.device);
      if (params?.metric) q.append("metric", params.metric);
      if (params?.timeRange) q.append("timeRange", params.timeRange);
      if (params?.page != null) q.append("page", String(params.page));
      if (params?.pageSize != null) q.append("pageSize", String(params.pageSize));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<RankingsDetailedResponseDto>>(`/api/v1/projects/${projectId}/rankings/detailed${qs}`);
    },
    getHistorical: async (
      projectId: string,
      params?: {
        dateFrom?: string;
        dateTo?: string;
        positionFilter?: string;
        minPosition?: number;
        maxPosition?: number;
        changesOnly?: string;
        search?: string;
        device?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<RankingsHistoricalResponseDto>> => {
      const q = new URLSearchParams();
      if (params?.dateFrom) q.append("dateFrom", params.dateFrom);
      if (params?.dateTo) q.append("dateTo", params.dateTo);
      if (params?.positionFilter) q.append("positionFilter", params.positionFilter);
      if (params?.minPosition != null) q.append("minPosition", String(params.minPosition));
      if (params?.maxPosition != null) q.append("maxPosition", String(params.maxPosition));
      if (params?.changesOnly) q.append("changesOnly", params.changesOnly);
      if (params?.search) q.append("search", params.search);
      if (params?.device) q.append("device", params.device);
      if (params?.page != null) q.append("page", String(params.page));
      if (params?.pageSize != null) q.append("pageSize", String(params.pageSize));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<RankingsHistoricalResponseDto>>(`/api/v1/projects/${projectId}/rankings/historical${qs}`);
    },
    getSummary: async (projectId: string, days: number = 30): Promise<ApiResponse<RankingsSummaryDto>> => {
      return request<ApiResponse<RankingsSummaryDto>>(`/api/v1/projects/${projectId}/rankings/summary?days=${days}`);
    },
    getOverview: async (
      projectId: string,
      timeRange = "week"
    ): Promise<ApiResponse<RankingsOverviewApiResponseDto>> => {
      const params = new URLSearchParams({ timeRange });
      return request<ApiResponse<RankingsOverviewApiResponseDto>>(
        `/api/v1/projects/${projectId}/rankings/overview?${params.toString()}`
      );
    },
    getLatest: async (
      projectId: string,
      search?: string,
      device?: string,
      page = 1,
      pageSize = 25
    ): Promise<ApiResponse<PaginatedList<KeywordRankDto>>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (device) params.append("device", device);
      return request<ApiResponse<PaginatedList<KeywordRankDto>>>(
        `/api/v1/projects/${projectId}/rankings/latest?${params.toString()}`
      );
    },
    getHistory: async (
      projectId: string,
      keywordId: string,
      days = 30
    ): Promise<ApiResponse<KeywordRankingHistoryDto>> => {
      const params = new URLSearchParams({ days: days.toString() });
      return request<ApiResponse<KeywordRankingHistoryDto>>(
        `/api/v1/projects/${projectId}/rankings/history/${keywordId}?${params.toString()}`
      );
    },
  },
  audit: {
    getOverview: async (projectId: string): Promise<ApiResponse<AuditOverviewDto>> => {
      return request<ApiResponse<AuditOverviewDto>>(`/api/v1/projects/${projectId}/audit/overview`);
    },
    getStatus: async (projectId: string, crawlRunId?: string): Promise<ApiResponse<CrawlRunDto | null>> => {
      const params = new URLSearchParams();
      if (crawlRunId) params.append("crawlRunId", crawlRunId);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<ApiResponse<CrawlRunDto | null>>(`/api/v1/projects/${projectId}/audit/status${query}`);
    },
    startCrawl: async (projectId: string): Promise<ApiResponse<string>> => {
      return request<ApiResponse<string>>(`/api/v1/projects/${projectId}/audit/crawl`, {
        method: "POST",
      });
    },
    getIssues: async (
      projectId: string,
      filters?: {
        crawlRunId?: string;
        severity?: string;
        category?: string;
        search?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<PaginatedList<AuditIssueDto>>> => {
      const params = new URLSearchParams();
      if (filters?.crawlRunId) params.append("crawlRunId", filters.crawlRunId);
      if (filters?.severity) params.append("severity", filters.severity);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<ApiResponse<PaginatedList<AuditIssueDto>>>(`/api/v1/projects/${projectId}/audit/issues${query}`);
    },
    getIssueDetail: async (projectId: string, issueId: string): Promise<ApiResponse<AuditIssueDetailDto>> => {
      return request<ApiResponse<AuditIssueDetailDto>>(`/api/v1/projects/${projectId}/audit/issues/${issueId}`);
    },
    getPages: async (
      projectId: string,
      filters?: {
        crawlRunId?: string;
        statusCode?: number;
        isIndexable?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<PaginatedList<CrawlPageDto>>> => {
      const params = new URLSearchParams();
      if (filters?.crawlRunId) params.append("crawlRunId", filters.crawlRunId);
      if (filters?.statusCode) params.append("statusCode", filters.statusCode.toString());
      if (filters?.isIndexable !== undefined) params.append("isIndexable", filters.isIndexable.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<ApiResponse<PaginatedList<CrawlPageDto>>>(`/api/v1/projects/${projectId}/audit/pages${query}`);
    },
    getSettings: async (projectId: string): Promise<ApiResponse<ProjectSettingsDto>> => {
      return request<ApiResponse<ProjectSettingsDto>>(`/api/v1/projects/${projectId}/audit/settings`);
    },
    updateSettings: async (projectId: string, data: UpdateCrawlSettingsRequest): Promise<ApiResponse<ProjectSettingsDto>> => {
      return request<ApiResponse<ProjectSettingsDto>>(`/api/v1/projects/${projectId}/audit/settings`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },
  tasks: {
    list: async (
      projectId: string,
      filters?: {
        status?: string;
        priority?: string;
        assigneeId?: string;
        sourceIssueId?: string;
        search?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<PaginatedList<TaskDto>>> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assigneeId) params.append("assigneeId", filters.assigneeId);
      if (filters?.sourceIssueId) params.append("sourceIssueId", filters.sourceIssueId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<ApiResponse<PaginatedList<TaskDto>>>(`/api/v1/projects/${projectId}/tasks${query}`);
    },
    get: async (projectId: string, taskId: string): Promise<ApiResponse<TaskDetailDto>> => {
      return request<ApiResponse<TaskDetailDto>>(`/api/v1/projects/${projectId}/tasks/${taskId}`);
    },
    create: async (projectId: string, data: CreateTaskRequest): Promise<ApiResponse<string>> => {
      return request<ApiResponse<string>>(`/api/v1/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (projectId: string, taskId: string, data: UpdateTaskRequest): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    patchStatus: async (projectId: string, taskId: string, status: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    verify: async (projectId: string, taskId: string): Promise<ApiResponse<TaskVerificationDto>> => {
      return request<ApiResponse<TaskVerificationDto>>(`/api/v1/projects/${projectId}/tasks/${taskId}/verify`, {
        method: "POST",
      });
    },
    verifications: async (projectId: string, taskId: string): Promise<ApiResponse<TaskVerificationDto[]>> => {
      return request<ApiResponse<TaskVerificationDto[]>>(`/api/v1/projects/${projectId}/tasks/${taskId}/verifications`);
    },
    getComments: async (projectId: string, taskId: string): Promise<ApiResponse<TaskCommentDto[]>> => {
      return request<ApiResponse<TaskCommentDto[]>>(`/api/v1/projects/${projectId}/tasks/${taskId}/comments`);
    },
    addComment: async (projectId: string, taskId: string, commentText: string): Promise<ApiResponse<TaskCommentDto>> => {
      return request<ApiResponse<TaskCommentDto>>(`/api/v1/projects/${projectId}/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ commentText }),
      });
    },
  },
  admin: {
    users: {
      list: async (params?: { search?: string; role?: string; isActive?: boolean; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedList<AdminUserDto>>> => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.role) queryParams.append("role", params.role);
        if (params?.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        return request<ApiResponse<PaginatedList<AdminUserDto>>>(`/api/v1/admin/users${queryString}`);
      },
      get: async (id: string): Promise<ApiResponse<AdminUserDetailDto>> => {
        return request<ApiResponse<AdminUserDetailDto>>(`/api/v1/admin/users/${id}`);
      },
      create: async (data: CreateAdminUserRequest): Promise<ApiResponse<AdminUserDto>> => {
        return request<ApiResponse<AdminUserDto>>("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      updateRole: async (id: string, role: string): Promise<ApiResponse<AdminUserDto | { success?: boolean }>> => {
        return request<ApiResponse<AdminUserDto | { success?: boolean }>>(`/api/v1/admin/users/${id}/role`, {
          method: "PUT",
          body: JSON.stringify({ role }),
        });
      },
      updateStatus: async (id: string, isActive: boolean): Promise<ApiResponse<AdminUserDto | { success?: boolean }>> => {
        return request<ApiResponse<AdminUserDto | { success?: boolean }>>(`/api/v1/admin/users/${id}/status`, {
          method: "PUT",
          body: JSON.stringify({ isActive }),
        });
      },
      assignProject: async (id: string, data: AssignUserProjectRequest): Promise<ApiResponse<UserProjectMembershipDto>> => {
        return request<ApiResponse<UserProjectMembershipDto>>(`/api/v1/admin/users/${id}/projects`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      unassignProject: async (id: string, projectId: string): Promise<ApiResponse<boolean>> => {
        return request<ApiResponse<boolean>>(`/api/v1/admin/users/${id}/projects/${projectId}`, {
          method: "DELETE",
        });
      },
    },
    activityLogs: {
      list: async (params?: ActivityLogFilterParams): Promise<ApiResponse<PaginatedList<ActivityLogDto>>> => {
        const queryParams = new URLSearchParams();
        if (params?.projectId) queryParams.append("projectId", params.projectId);
        if (params?.actorId) queryParams.append("actorId", params.actorId);
        if (params?.entityType) queryParams.append("entityType", params.entityType);
        if (params?.actionType) queryParams.append("actionType", params.actionType);
        if (params?.fromUtc) queryParams.append("fromUtc", params.fromUtc);
        if (params?.toUtc) queryParams.append("toUtc", params.toUtc);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        return request<ApiResponse<PaginatedList<ActivityLogDto>>>(`/api/v1/admin/activity-logs${queryString}`);
      },
    },
  },
  gsc: {
    getStatus: async (projectId: string): Promise<ApiResponse<GscConnectionDto | null>> => {
      return request<ApiResponse<GscConnectionDto | null>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/status`);
    },
    getAuthUrl: async (projectId: string): Promise<ApiResponse<GscAuthUrlDto>> => {
      return request<ApiResponse<GscAuthUrlDto>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/auth-url`);
    },
    completeCallback: async (projectId: string, data: CompleteGscOAuthCallbackRequest): Promise<ApiResponse<GscConnectionDto>> => {
      return request<ApiResponse<GscConnectionDto>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/callback`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getProperties: async (projectId: string): Promise<ApiResponse<GscPropertyDto[]>> => {
      return request<ApiResponse<GscPropertyDto[]>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/properties`);
    },
    bindProperty: async (projectId: string, propertyIdentifier: string): Promise<ApiResponse<GscConnectionDto>> => {
      return request<ApiResponse<GscConnectionDto>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/bind`, {
        method: "POST",
        body: JSON.stringify({ propertyIdentifier }),
      });
    },
    disconnect: async (projectId: string): Promise<ApiResponse<boolean | { success?: boolean }>> => {
      return request<ApiResponse<boolean | { success?: boolean }>>(`/api/v1/projects/${projectId}/settings/integrations/gsc/disconnect`, {
        method: "POST",
      });
    },
    triggerSync: async (projectId: string): Promise<ApiResponse<string | { queued?: boolean }>> => {
      return request<ApiResponse<string | { queued?: boolean }>>(`/api/v1/projects/${projectId}/integrations/gsc/sync`, {
        method: "POST",
      });
    },
    getOverview: async (
      projectId: string,
      params?: { startDate?: string; endDate?: string; device?: string }
    ): Promise<ApiResponse<GscPerformanceOverviewDto>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      if (params?.device) q.append("device", params.device);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<GscPerformanceOverviewDto>>(`/api/v1/projects/${projectId}/integrations/gsc/overview${qs}`);
    },
    getQueries: async (
      projectId: string,
      params?: {
        startDate?: string;
        endDate?: string;
        search?: string;
        device?: string;
        country?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDescending?: boolean;
      }
    ): Promise<ApiResponse<PaginatedList<GscQueryRowDto>>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      if (params?.search) q.append("search", params.search);
      if (params?.device) q.append("device", params.device);
      if (params?.country) q.append("country", params.country);
      if (params?.page) q.append("page", String(params.page));
      if (params?.pageSize) q.append("pageSize", String(params.pageSize));
      if (params?.sortBy) q.append("sortBy", params.sortBy);
      if (params?.sortDescending !== undefined) q.append("sortDescending", String(params.sortDescending));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<PaginatedList<GscQueryRowDto>>>(`/api/v1/projects/${projectId}/integrations/gsc/queries${qs}`);
    },
    getQueryHistory: async (
      projectId: string,
      queryText: string,
      params?: { startDate?: string; endDate?: string }
    ): Promise<ApiResponse<GscQueryDetailDto>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<GscQueryDetailDto>>(
        `/api/v1/projects/${projectId}/integrations/gsc/queries/${encodeURIComponent(queryText)}/history${qs}`
      );
    },
    getPages: async (
      projectId: string,
      params?: {
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDescending?: boolean;
      }
    ): Promise<ApiResponse<PaginatedList<GscPageRowDto>>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      if (params?.search) q.append("search", params.search);
      if (params?.page) q.append("page", String(params.page));
      if (params?.pageSize) q.append("pageSize", String(params.pageSize));
      if (params?.sortBy) q.append("sortBy", params.sortBy);
      if (params?.sortDescending !== undefined) q.append("sortDescending", String(params.sortDescending));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<PaginatedList<GscPageRowDto>>>(`/api/v1/projects/${projectId}/integrations/gsc/pages${qs}`);
    },
    getDeviceBreakdown: async (
      projectId: string,
      params?: { startDate?: string; endDate?: string }
    ): Promise<ApiResponse<GscDeviceStatDto[]>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<GscDeviceStatDto[]>>(`/api/v1/projects/${projectId}/integrations/gsc/devices${qs}`);
    },
    getCountryBreakdown: async (
      projectId: string,
      params?: { startDate?: string; endDate?: string; topCount?: number }
    ): Promise<ApiResponse<GscCountryStatDto[]>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      if (params?.topCount) q.append("topCount", String(params.topCount));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<GscCountryStatDto[]>>(`/api/v1/projects/${projectId}/integrations/gsc/countries${qs}`);
    },
  },
  dashboard: {
    getProjectDashboard: async (projectId: string): Promise<ApiResponse<ProjectDashboardDto>> => {
      return request<ApiResponse<ProjectDashboardDto>>(`/api/v1/projects/${projectId}/dashboard`);
    },
    getGlobalDashboard: async (): Promise<ApiResponse<GlobalDashboardDto>> => {
      return request<ApiResponse<GlobalDashboardDto>>(`/api/v1/dashboard`);
    },
  },
  reports: {
    list: async (projectId: string): Promise<ApiResponse<ReportSummaryDto[]>> => {
      return request<ApiResponse<ReportSummaryDto[]>>(`/api/v1/projects/${projectId}/reports`);
    },
    get: async (projectId: string, reportId: string): Promise<ApiResponse<ReportDetailDto>> => {
      return request<ApiResponse<ReportDetailDto>>(`/api/v1/projects/${projectId}/reports/${reportId}`);
    },
    create: async (
      projectId: string,
      data: {
        title: string;
        startDate: string;
        endDate: string;
        sections: string[];
        executiveNotes?: string;
      }
    ): Promise<ApiResponse<ReportDetailDto>> => {
      return request<ApiResponse<ReportDetailDto>>(`/api/v1/projects/${projectId}/reports`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    delete: async (projectId: string, reportId: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/reports/${reportId}`, {
        method: "DELETE",
      });
    },
  },
  notifications: {
    list: async (filters?: NotificationFilters): Promise<ApiResponse<PaginatedList<NotificationDto>>> => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
      if (filters?.unreadOnly !== undefined) params.append("unreadOnly", filters.unreadOnly.toString());
      if (filters?.projectId) params.append("projectId", filters.projectId);

      const query = params.toString();
      const endpoint = query ? `/api/v1/notifications?${query}` : "/api/v1/notifications";
      return request<ApiResponse<PaginatedList<NotificationDto>>>(endpoint);
    },
    getUnreadCount: async (): Promise<ApiResponse<UnreadCountDto>> => {
      return request<ApiResponse<UnreadCountDto>>("/api/v1/notifications/unread-count");
    },
    markRead: async (id: number): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
    markAllRead: async (projectId?: string): Promise<ApiResponse<number | boolean>> => {
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
      return request<ApiResponse<number | boolean>>(`/api/v1/notifications/read-all${query}`, {
        method: "POST",
      });
    },
  },
  ga4: {
    getStatus: async (projectId: string): Promise<ApiResponse<Ga4ConnectionDto | null>> => {
      return request<ApiResponse<Ga4ConnectionDto | null>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/status`);
    },
    getAuthUrl: async (projectId: string): Promise<ApiResponse<Ga4AuthUrlDto>> => {
      return request<ApiResponse<Ga4AuthUrlDto>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/auth-url`);
    },
    completeCallback: async (projectId: string, data: CompleteGa4OAuthCallbackRequest): Promise<ApiResponse<Ga4ConnectionDto>> => {
      return request<ApiResponse<Ga4ConnectionDto>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/callback`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getProperties: async (projectId: string): Promise<ApiResponse<Ga4PropertyDto[]>> => {
      return request<ApiResponse<Ga4PropertyDto[]>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/properties`);
    },
    bindProperty: async (projectId: string, propertyIdentifier: string): Promise<ApiResponse<Ga4ConnectionDto>> => {
      return request<ApiResponse<Ga4ConnectionDto>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/bind`, {
        method: "POST",
        body: JSON.stringify({ propertyIdentifier }),
      });
    },
    disconnect: async (projectId: string): Promise<ApiResponse<boolean | { success?: boolean }>> => {
      return request<ApiResponse<boolean | { success?: boolean }>>(`/api/v1/projects/${projectId}/settings/integrations/ga4/disconnect`, {
        method: "POST",
      });
    },
    triggerSync: async (projectId: string): Promise<ApiResponse<string | { queued?: boolean }>> => {
      return request<ApiResponse<string | { queued?: boolean }>>(`/api/v1/projects/${projectId}/integrations/ga4/sync`, {
        method: "POST",
      });
    },
    getOverview: async (
      projectId: string,
      params?: { startDate?: string; endDate?: string }
    ): Promise<ApiResponse<Ga4OverviewDto>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<Ga4OverviewDto>>(`/api/v1/projects/${projectId}/integrations/ga4/overview${qs}`);
    },
    getPages: async (
      projectId: string,
      params?: {
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDescending?: boolean;
      }
    ): Promise<ApiResponse<PaginatedList<Ga4PageRowDto>>> => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append("startDate", params.startDate);
      if (params?.endDate) q.append("endDate", params.endDate);
      if (params?.search) q.append("search", params.search);
      if (params?.page) q.append("page", String(params.page));
      if (params?.pageSize) q.append("pageSize", String(params.pageSize));
      if (params?.sortBy) q.append("sortBy", params.sortBy);
      if (params?.sortDescending !== undefined) q.append("sortDescending", String(params.sortDescending));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<PaginatedList<Ga4PageRowDto>>>(`/api/v1/projects/${projectId}/integrations/ga4/pages${qs}`);
    },
  },
  competitors: {
    list: async (projectId: string): Promise<ApiResponse<CompetitorDto[]>> => {
      return request<ApiResponse<CompetitorDto[]>>(`/api/v1/projects/${projectId}/competitors`);
    },
    add: async (projectId: string, data: AddCompetitorRequest): Promise<ApiResponse<CompetitorDto>> => {
      return request<ApiResponse<CompetitorDto>>(`/api/v1/projects/${projectId}/competitors`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (projectId: string, competitorId: string, data: UpdateCompetitorRequest): Promise<ApiResponse<CompetitorDto>> => {
      return request<ApiResponse<CompetitorDto>>(`/api/v1/projects/${projectId}/competitors/${competitorId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (projectId: string, competitorId: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/competitors/${competitorId}`, {
        method: "DELETE",
      });
    },
    getOverview: async (projectId: string, days: number = 30): Promise<ApiResponse<CompetitorOverviewDto>> => {
      return request<ApiResponse<CompetitorOverviewDto>>(`/api/v1/projects/${projectId}/competitors/overview?days=${days}`);
    },
    getVisibility: async (projectId: string, days: number = 30): Promise<ApiResponse<CompetitorOverviewDto>> => {
      return request<ApiResponse<CompetitorOverviewDto>>(`/api/v1/projects/${projectId}/competitors/visibility?days=${days}`);
    },

    getKeywords: async (
      projectId: string,
      params?: {
        search?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<CompetitorKeywordsResponseDto>> => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.page) q.append("page", String(params.page));
      if (params?.pageSize) q.append("pageSize", String(params.pageSize));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<CompetitorKeywordsResponseDto>>(`/api/v1/projects/${projectId}/competitors/keywords${qs}`);
    },
    getGap: async (
      projectId: string,
      params?: {
        search?: string;
        competitorId?: string;
        sort?: string;
        page?: number;
        pageSize?: number;
      }
    ): Promise<ApiResponse<CompetitorGapResponseDto>> => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.competitorId) q.append("competitorId", params.competitorId);
      if (params?.sort) q.append("sort", params.sort);
      if (params?.page) q.append("page", String(params.page));
      if (params?.pageSize) q.append("pageSize", String(params.pageSize));
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<ApiResponse<CompetitorGapResponseDto>>(`/api/v1/projects/${projectId}/competitors/gap${qs}`);
    },
    trackGap: async (projectId: string, keywordId: string): Promise<ApiResponse<boolean>> => {
      return request<ApiResponse<boolean>>(`/api/v1/projects/${projectId}/competitors/gap/${keywordId}/track`, {
        method: "POST",
      });
    },
  },
};

export default api;
