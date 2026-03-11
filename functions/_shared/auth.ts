import { compare, hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";

import { authSessions, departmentsOrProjects, roles, userProfiles, userRoles, users } from "../../src/db/schema";
import { getDb, safeJsonParse } from "./db";
import type { AppBindings, SessionUser } from "./env";
import { getCookieName, getSessionTtlSeconds } from "./env";

function getJwtSecret(env: AppBindings) {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((chunk) => chunk.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function loadSessionUser(env: AppBindings, userId: string): Promise<SessionUser | null> {
  const db = getDb(env);

  const userRecord = await db
    .select({
      id: users.id,
      email: users.email,
      approvalStatus: users.approvalStatus,
      preferredLanguage: users.preferredLanguage,
      fullName: userProfiles.fullName,
      designation: userProfiles.designation,
      phone: userProfiles.phone,
      departmentId: userProfiles.departmentId,
      projectId: userProfiles.projectId,
      supervisorId: userProfiles.supervisorId,
      role: roles.code,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.isPrimary, true)))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(users.id, userId))
    .limit(1);

  const record = userRecord[0];

  if (!record) {
    return null;
  }

  const [department, project, supervisor] = await Promise.all([
    record.departmentId
      ? db
          .select({ name: departmentsOrProjects.name })
          .from(departmentsOrProjects)
          .where(eq(departmentsOrProjects.id, record.departmentId))
          .limit(1)
      : Promise.resolve([]),
    record.projectId
      ? db
          .select({ name: departmentsOrProjects.name })
          .from(departmentsOrProjects)
          .where(eq(departmentsOrProjects.id, record.projectId))
          .limit(1)
      : Promise.resolve([]),
    record.supervisorId
      ? db
          .select({ fullName: userProfiles.fullName })
          .from(userProfiles)
          .where(eq(userProfiles.userId, record.supervisorId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return {
    id: record.id,
    email: record.email,
    role: (record.role ?? "user") as SessionUser["role"],
    approvalStatus: record.approvalStatus,
    preferredLanguage: (record.preferredLanguage ?? "bn") as "bn" | "en",
    profile: {
      fullName: record.fullName ?? "Unknown user",
      designation: record.designation ?? "Team member",
      departmentName: department[0]?.name ?? null,
      projectName: project[0]?.name ?? null,
      supervisorName: supervisor[0]?.fullName ?? null,
      phone: record.phone,
    },
  };
}

export async function createSession(
  c: { env: AppBindings },
  sessionUser: SessionUser,
  meta: { userAgent?: string | null; ipAddress?: string | null },
) {
  const db = getDb(c.env);
  const sessionId = nanoid(24);
  const ttl = getSessionTtlSeconds(c.env);
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const secret = getJwtSecret(c.env);
  const tokenHash = await hashValue(sessionId);

  await db.insert(authSessions).values({
    id: sessionId,
    userId: sessionUser.id,
    sessionTokenHash: tokenHash,
    expiresAt,
    userAgent: meta.userAgent ?? null,
    ipAddress: meta.ipAddress ?? null,
  });

  await c.env.APP_KV.put(
    `session:${sessionId}`,
    JSON.stringify({
      userId: sessionUser.id,
      role: sessionUser.role,
      issuedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    }),
    {
      expirationTtl: ttl,
    },
  );

  const token = await new SignJWT({
    sub: sessionUser.id,
    sid: sessionId,
    ver: 1,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret);

  setCookie(c as never, getCookieName(c.env), token, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "Lax",
    maxAge: ttl,
  });
}

export async function readSessionFromRequest(request: Request, env: AppBindings) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getCookieName(env)}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!token) {
    return {
      sessionUser: null,
      sessionId: null,
    };
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env));
    const sessionId = String(payload.sid ?? "");
    const sessionUserId = String(payload.sub ?? "");

    if (!sessionId || !sessionUserId) {
      return {
        sessionUser: null,
        sessionId: null,
      };
    }

    const db = getDb(env);
    const sessionRecord = await db
      .select()
      .from(authSessions)
      .where(and(eq(authSessions.id, sessionId), eq(authSessions.userId, sessionUserId)))
      .limit(1);

    const record = sessionRecord[0];

    if (!record || record.revokedAt || record.expiresAt < new Date().toISOString()) {
      return {
        sessionUser: null,
        sessionId: null,
      };
    }

    const sessionUser = await loadSessionUser(env, sessionUserId);

    if (!sessionUser || sessionUser.approvalStatus !== "approved") {
      return {
        sessionUser: null,
        sessionId: null,
      };
    }

    const kvMeta = safeJsonParse<Record<string, string>>(await env.APP_KV.get(`session:${sessionId}`), {});

    await env.APP_KV.put(
      `session:${sessionId}`,
      JSON.stringify({
        ...kvMeta,
        lastSeenAt: new Date().toISOString(),
      }),
      { expirationTtl: getSessionTtlSeconds(env) },
    );

    return {
      sessionUser,
      sessionId,
    };
  } catch {
    return {
      sessionUser: null,
      sessionId: null,
    };
  }
}

export async function readSession(c: {
  env: AppBindings;
  req: { raw: Request };
  get: (key: "sessionUser" | "sessionId") => SessionUser | null | string | null;
  set: (key: "sessionUser" | "sessionId", value: SessionUser | null | string | null) => void;
}) {
  const existing = c.get("sessionUser");

  if (existing) {
    return existing as SessionUser;
  }

  const result = await readSessionFromRequest(c.req.raw, c.env);
  c.set("sessionUser", result.sessionUser);
  c.set("sessionId", result.sessionId);
  return result.sessionUser;
}

export async function destroySession(c: {
  env: AppBindings;
  get: (key: "sessionId") => string | null;
}) {
  const sessionId = c.get("sessionId");

  if (sessionId) {
    const db = getDb(c.env);
    await db
      .update(authSessions)
      .set({
        revokedAt: new Date().toISOString(),
      })
      .where(eq(authSessions.id, sessionId));

    await c.env.APP_KV.delete(`session:${sessionId}`);
  }

  deleteCookie(c as never, getCookieName(c.env), {
    path: "/",
  });
}
