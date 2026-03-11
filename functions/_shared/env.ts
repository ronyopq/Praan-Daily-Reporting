export type AppBindings = {
  DB: D1Database;
  APP_KV: KVNamespace;
  SESSION_SECRET: string;
  SESSION_COOKIE_NAME?: string;
  SESSION_TTL_SECONDS?: string;
  APP_NAME?: string;
  APP_TIMEZONE?: string;
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

export type AppVariables = {
  sessionUser: SessionUser | null;
  sessionId: string | null;
};

export function getCookieName(env: AppBindings) {
  return env.SESSION_COOKIE_NAME || "__praan_session";
}

export function getSessionTtlSeconds(env: AppBindings) {
  const parsed = Number(env.SESSION_TTL_SECONDS || "2592000");
  return Number.isFinite(parsed) ? parsed : 2_592_000;
}
