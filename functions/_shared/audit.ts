import { auditLogs } from "../../src/db/schema";
import { getDb } from "./db";
import type { AppBindings } from "./env";

export async function logAudit(
  env: AppBindings,
  payload: {
    actorUserId?: string | null;
    targetUserId?: string | null;
    entityType: string;
    entityId?: string | null;
    action: string;
    summary: string;
    diffJson?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const db = getDb(env);

  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    actorUserId: payload.actorUserId ?? null,
    targetUserId: payload.targetUserId ?? null,
    entityType: payload.entityType,
    entityId: payload.entityId ?? null,
    action: payload.action,
    summary: payload.summary,
    diffJson: payload.diffJson ?? "{}",
    ipAddress: payload.ipAddress ?? null,
    userAgent: payload.userAgent ?? null,
  });
}
