"use client";

export type ApiErrorShape = {
  error: string;
  details?: unknown;
};

export type SessionUser = {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "user";
  approvalStatus: string;
  preferredLanguage: "bn" | "en";
  profile: {
    fullName: string;
    designation: string;
    departmentName?: string | null;
    projectName?: string | null;
    supervisorName?: string | null;
    phone?: string | null;
  };
};

export type DashboardPayload = {
  today: string;
  summary: {
    plannedToday: number;
    pendingFollowUps: number;
    overdueFollowUps: number;
    activitiesThisMonth: number;
    monthlyReportProgress: number;
  };
  quickActions: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  todayPlan: Array<Record<string, unknown>>;
  suggestions: Array<Record<string, unknown>>;
  pendingFollowUps: Array<Record<string, unknown>>;
  adminSummary?: {
    activeUsers: number;
    pendingApprovals: number;
    overdueFollowUps: number;
    reportsSubmitted: number;
  };
};

export type WorkPlanResponse = {
  workPlan: Record<string, unknown> | null;
  items: Array<Record<string, unknown>>;
  generatedDays: Array<Record<string, unknown>>;
};

export type GeneratedWorkPlanResponse = {
  generatedDays: Array<Record<string, unknown>>;
  suggestedItems: Array<Record<string, unknown>>;
};

export type DailyActivitiesResponse = {
  activities: Array<Record<string, unknown>>;
  suggestedPlanItems: Array<Record<string, unknown>>;
  overdueFollowUps: Array<Record<string, unknown>>;
};

export type FollowUpsResponse = {
  items: Array<Record<string, unknown>>;
};

export type MonthlyReportResponse = {
  report: (Record<string, unknown> & {
    completedItems?: Array<Record<string, unknown>>;
    ongoingItems?: Array<Record<string, unknown>>;
    nextMonthItems?: Array<Record<string, unknown>>;
  }) | null;
};

export type GeneratedMonthlyReportResponse = {
  completedItems: Array<Record<string, unknown>>;
  ongoingItems: Array<Record<string, unknown>>;
  nextMonthItems: Array<Record<string, unknown>>;
};

export type CalendarResponse = {
  events: Array<Record<string, unknown>>;
};

export type AdminListResponse = {
  items: Array<Record<string, unknown>>;
};

export type AdminSettingsResponse = {
  items: Array<Record<string, unknown>>;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | ApiErrorShape;

  if (!response.ok) {
    const error = payload as ApiErrorShape;
    throw new Error(error.error || "Request failed");
  }

  return payload as T;
}

export async function apiFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
}

export const api = {
  session: () => apiFetch<{ user: SessionUser | null }>("/api/auth/session"),
  login: (body: unknown) =>
    apiFetch<{ user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: unknown) =>
    apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () =>
    apiFetch<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    }),
  dashboard: (params = "") =>
    apiFetch<DashboardPayload>(`/api/dashboard${params ? `?${params}` : ""}`),
  workPlans: (params = "") =>
    apiFetch<WorkPlanResponse>(`/api/work-plans${params ? `?${params}` : ""}`),
  generateWorkPlan: (body: unknown) =>
    apiFetch<GeneratedWorkPlanResponse>("/api/work-plans/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  saveWorkPlan: (body: unknown) =>
    apiFetch<{ workPlanId: string }>("/api/work-plans", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  dailyActivities: (params = "") =>
    apiFetch<DailyActivitiesResponse>(`/api/daily-activities${params ? `?${params}` : ""}`),
  saveDailyActivity: (body: unknown) =>
    apiFetch<{ activityId: string }>("/api/daily-activities", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  followUps: (params = "") =>
    apiFetch<FollowUpsResponse>(`/api/follow-ups${params ? `?${params}` : ""}`),
  saveFollowUp: (body: unknown) =>
    apiFetch<{ followUpId: string }>("/api/follow-ups", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  completeFollowUp: (id: string) =>
    apiFetch<{ followUpId: string }>(`/api/follow-ups/${id}/complete`, { method: "POST" }),
  snoozeFollowUp: (id: string, body: unknown) =>
    apiFetch<{ followUpId: string }>(`/api/follow-ups/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  monthlyReports: (params = "") =>
    apiFetch<MonthlyReportResponse>(`/api/monthly-reports${params ? `?${params}` : ""}`),
  generateMonthlyReport: (body: unknown) =>
    apiFetch<GeneratedMonthlyReportResponse>("/api/monthly-reports/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  saveMonthlyReport: (body: unknown) =>
    apiFetch<{ reportId: string }>("/api/monthly-reports", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  calendar: (params = "") =>
    apiFetch<CalendarResponse>(`/api/calendar${params ? `?${params}` : ""}`),
  adminUsers: (params = "") =>
    apiFetch<AdminListResponse>(`/api/admin/users${params ? `?${params}` : ""}`),
  adminUpdateUser: (id: string, body: unknown) =>
    apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminApprovals: () => apiFetch<AdminListResponse>("/api/admin/approvals"),
  adminTemplates: () => apiFetch<AdminListResponse>("/api/admin/templates"),
  adminSaveTemplate: (body: unknown) =>
    apiFetch<{ templateId: string }>("/api/admin/templates", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminHolidays: () => apiFetch<AdminListResponse>("/api/admin/holidays"),
  adminSaveHoliday: (body: unknown) =>
    apiFetch<{ success: boolean }>("/api/admin/holidays", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminSettings: () => apiFetch<AdminSettingsResponse>("/api/admin/settings"),
  adminAudit: (params = "") =>
    apiFetch<AdminListResponse>(`/api/admin/audit${params ? `?${params}` : ""}`),
};
