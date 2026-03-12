import { and, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { HTTPException } from "hono/http-exception";

import {
  approvalRequests,
  departmentsOrProjects,
  followUps,
  holidays,
  monthlyReportCompletedItems,
  monthlyReportNextMonthItems,
  monthlyReportOngoingItems,
  monthlyReports,
  notifications,
  roles,
  templates,
  templateVersions,
  userProfiles,
  userRoles,
  users,
  workPlanItems,
  workPlans,
  dailyActivities,
  appSettings,
  auditLogs,
} from "../../src/db/schema";
import { todayInDhaka } from "../../src/lib/date";
import {
  adminUserUpdateSchema,
  dailyActivitySchema,
  followUpSchema,
  loginSchema,
  monthlyReportSchema,
  registrationSchema,
  templateSchema,
  workPlanGenerateSchema,
  workPlanSchema,
  holidaySchema,
} from "../../src/lib/validation";
import { createSession, destroySession, hashPassword, loadSessionUser, readSession, verifyPassword } from "../_shared/auth";
import { logAudit } from "../_shared/audit";
import { getDb, safeJsonParse } from "../_shared/db";
import { buildCalendarEvents, generateMonthlyReportDraft, generateWorkPlanDraft, refreshOverdueFollowUps } from "../_shared/drafts";
import type { AppBindings, AppVariables, SessionUser } from "../_shared/env";
import { fail, ok, parseBody } from "../_shared/respond";

const app = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>().basePath("/api");

app.use("*", async (c, next) => {
  c.set("sessionUser", null);
  c.set("sessionId", null);
  await readSession(c as never);
  await next();
});

function requireUser(c: typeof app extends Hono<infer E> ? import("hono").Context<E> : never) {
  const user = c.get("sessionUser");

  if (!user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  return user;
}

function requireAdmin(c: typeof app extends Hono<infer E> ? import("hono").Context<E> : never) {
  const user = requireUser(c);

  if (!["admin", "super_admin"].includes(user.role)) {
    throw new HTTPException(403, { message: "Admin access required" });
  }

  return user;
}

function actorMeta(c: Parameters<typeof requireUser>[0]) {
  return {
    ipAddress: c.req.header("CF-Connecting-IP") ?? null,
    userAgent: c.req.header("User-Agent") ?? null,
  };
}

function getTargetUserId(c: Parameters<typeof requireUser>[0], user: SessionUser) {
  const requestedUserId = c.req.query("userId");

  if (requestedUserId && ["admin", "super_admin"].includes(user.role)) {
    return requestedUserId;
  }

  return user.id;
}

async function cacheReminderState(env: AppBindings, userId: string, payload: Record<string, unknown>) {
  await env.APP_KV.put(`reminders:${userId}`, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24,
  });
}

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return fail(c, error.message, error.status);
  }

  return fail(c, error instanceof Error ? error.message : "Unexpected server error", 500);
});

app.get("/auth/session", async (c) => {
  return ok(c, {
    user: c.get("sessionUser"),
  });
});

app.post("/auth/register", async (c) => {
  const body = await parseBody<unknown>(c);
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid registration payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const existingUser = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);

  if (existingUser[0]) {
    return fail(c, "An account with this email already exists", 409);
  }

  const roleRecord = await db.select().from(roles).where(eq(roles.code, "user")).limit(1);

  if (!roleRecord[0]) {
    return fail(c, "Default user role is not seeded", 500);
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    id: userId,
    email: parsed.data.email,
    passwordHash: hashedPassword,
    approvalStatus: "pending",
    preferredLanguage: parsed.data.profile.preferredLanguage,
  });

  await db.insert(userProfiles).values({
    userId,
    fullName: parsed.data.profile.fullName,
    designation: parsed.data.profile.designation,
    departmentId: parsed.data.profile.departmentId ?? null,
    projectId: parsed.data.profile.projectId ?? null,
    supervisorId: parsed.data.profile.supervisorId ?? null,
    phone: parsed.data.profile.phone ?? null,
    preferredLanguage: parsed.data.profile.preferredLanguage,
  });

  await db.insert(userRoles).values({
    userId,
    roleId: roleRecord[0].id,
    isPrimary: true,
  });

  await db.insert(approvalRequests).values({
    id: crypto.randomUUID(),
    userId,
    status: "pending",
    notes: parsed.data.noteToAdmin ?? null,
  });

  await logAudit(c.env, {
    entityType: "user",
    entityId: userId,
    action: "registration_requested",
    summary: `Registration requested for ${parsed.data.email}`,
    ...actorMeta(c),
  });

  return ok(c, { message: "Registration submitted for approval" }, 201);
});

app.post("/auth/login", async (c) => {
  const body = await parseBody<unknown>(c);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid login payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const record = rows[0];

  if (!record) {
    return fail(c, "Invalid email or password", 401);
  }

  const matches = await verifyPassword(parsed.data.password, record.passwordHash);

  if (!matches) {
    return fail(c, "Invalid email or password", 401);
  }

  if (record.approvalStatus !== "approved") {
    return fail(c, `Account is ${record.approvalStatus}. Please contact an admin.`, 403);
  }

  const sessionUser = await loadSessionUser(c.env, record.id);

  if (!sessionUser) {
    return fail(c, "Unable to resolve your profile", 500);
  }

  await createSession(c as never, sessionUser, actorMeta(c));

  await db
    .update(users)
    .set({
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, record.id));

  return ok(c, { user: sessionUser });
});

app.post("/auth/logout", async (c) => {
  await destroySession(c as never);
  return ok(c, { success: true });
});

app.get("/dashboard", async (c) => {
  const user = requireUser(c);
  const db = getDb(c.env);
  const today = todayInDhaka();
  const month = c.req.query("month") ?? today.slice(0, 7);
  const scopeUserId = getTargetUserId(c, user);

  await refreshOverdueFollowUps(c.env, scopeUserId);

  const [plannedToday, pendingFollowUpCount, overdueFollowUpCount, activitiesThisMonth, todayPlanRows, pendingFollowUpRows] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(workPlanItems)
        .where(and(eq(workPlanItems.userId, scopeUserId), eq(workPlanItems.planDate, today))),
      db
        .select({ value: count() })
        .from(followUps)
        .where(and(eq(followUps.userId, scopeUserId), eq(followUps.status, "pending"))),
      db
        .select({ value: count() })
        .from(followUps)
        .where(and(eq(followUps.userId, scopeUserId), eq(followUps.status, "overdue"))),
      db
        .select({ value: count() })
        .from(dailyActivities)
        .where(and(eq(dailyActivities.userId, scopeUserId), gte(dailyActivities.activityDate, `${month}-01`), lte(dailyActivities.activityDate, `${month}-31`))),
      db
        .select()
        .from(workPlanItems)
        .where(and(eq(workPlanItems.userId, scopeUserId), eq(workPlanItems.planDate, today)))
        .orderBy(desc(workPlanItems.priority))
        .limit(6),
      db
        .select()
        .from(followUps)
        .where(and(eq(followUps.userId, scopeUserId), inArray(followUps.status, ["pending", "overdue", "snoozed"])))
        .orderBy(desc(followUps.dueDate))
        .limit(6),
    ]);

  const monthlyReport = await db
    .select({ status: monthlyReports.status })
    .from(monthlyReports)
    .where(and(eq(monthlyReports.userId, scopeUserId), eq(monthlyReports.month, month)))
    .limit(1);

  const monthlyReportProgress =
    monthlyReport[0]?.status === "approved"
      ? 100
      : monthlyReport[0]?.status === "submitted"
        ? 80
        : monthlyReport[0]?.status === "draft"
          ? 45
          : 0;

  await cacheReminderState(c.env, scopeUserId, {
    pending: pendingFollowUpCount[0]?.value ?? 0,
    overdue: overdueFollowUpCount[0]?.value ?? 0,
  });

  const payload = {
    today,
    summary: {
      plannedToday: plannedToday[0]?.value ?? 0,
      pendingFollowUps: pendingFollowUpCount[0]?.value ?? 0,
      overdueFollowUps: overdueFollowUpCount[0]?.value ?? 0,
      activitiesThisMonth: activitiesThisMonth[0]?.value ?? 0,
      monthlyReportProgress,
    },
    quickActions: [
      {
        title: "Add today’s activity",
        description: "Log daily register lines from planned work.",
        href: "/workspace/daily-activities",
      },
      {
        title: "Open work plan",
        description: "Review or update the monthly plan.",
        href: "/workspace/work-plan",
      },
      {
        title: "Create follow-up",
        description: "Capture unresolved work before it slips.",
        href: "/workspace/follow-ups",
      },
      {
        title: "Generate monthly report draft",
        description: "Draft report sections from current records.",
        href: "/workspace/monthly-reports",
      },
    ],
    todayPlan: todayPlanRows,
    suggestions: [
      ...todayPlanRows.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.expectedOutput ?? item.description,
        reason: "Suggested from today’s work plan",
      })),
      ...pendingFollowUpRows.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.note,
        reason: "Suggested from unresolved follow-up",
      })),
    ],
    pendingFollowUps: pendingFollowUpRows,
  } as Record<string, unknown>;

  if (["admin", "super_admin"].includes(user.role) || c.req.query("scope") === "admin") {
    const [activeUsers, pendingApprovals, orgOverdueFollowUps, reportsSubmitted] = await Promise.all([
      db.select({ value: count() }).from(users).where(eq(users.approvalStatus, "approved")),
      db.select({ value: count() }).from(approvalRequests).where(eq(approvalRequests.status, "pending")),
      db.select({ value: count() }).from(followUps).where(eq(followUps.status, "overdue")),
      db
        .select({ value: count() })
        .from(monthlyReports)
        .where(and(eq(monthlyReports.month, month), inArray(monthlyReports.status, ["submitted", "approved"]))),
    ]);

    payload.adminSummary = {
      activeUsers: activeUsers[0]?.value ?? 0,
      pendingApprovals: pendingApprovals[0]?.value ?? 0,
      overdueFollowUps: orgOverdueFollowUps[0]?.value ?? 0,
      reportsSubmitted: reportsSubmitted[0]?.value ?? 0,
    };
  }

  return ok(c, payload);
});

app.get("/work-plans", async (c) => {
  const user = requireUser(c);
  const month = c.req.query("month") ?? todayInDhaka().slice(0, 7);
  const targetUserId = getTargetUserId(c, user);
  const db = getDb(c.env);

  const plan = await db
    .select()
    .from(workPlans)
    .where(and(eq(workPlans.userId, targetUserId), eq(workPlans.month, month)))
    .limit(1);

  const items = plan[0]
    ? await db
        .select()
        .from(workPlanItems)
        .where(eq(workPlanItems.workPlanId, plan[0].id))
        .orderBy(workPlanItems.planDate)
    : [];

  const generated = await generateWorkPlanDraft(c.env, targetUserId, month);

  return ok(c, {
    workPlan: plan[0] ?? null,
    items,
    generatedDays: generated.generatedDays,
  });
});

app.post("/work-plans/generate", async (c) => {
  const user = requireUser(c);
  const body = await parseBody<unknown>(c);
  const parsed = workPlanGenerateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid work plan generation payload", 422, parsed.error.flatten());
  }

  const targetUserId = parsed.data.userId && ["admin", "super_admin"].includes(user.role) ? parsed.data.userId : user.id;
  const generated = await generateWorkPlanDraft(c.env, targetUserId, parsed.data.month);
  return ok(c, generated);
});

app.post("/work-plans", async (c) => {
  const user = requireUser(c);
  const body = await parseBody<unknown>(c);
  const parsed = workPlanSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid work plan payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const targetUserId = parsed.data.userId && ["admin", "super_admin"].includes(user.role) ? parsed.data.userId : user.id;
  const existing = await db
    .select()
    .from(workPlans)
    .where(and(eq(workPlans.userId, targetUserId), eq(workPlans.month, parsed.data.month)))
    .limit(1);

  const workPlanId = existing[0]?.id ?? crypto.randomUUID();

  if (existing[0]) {
    await db
      .update(workPlans)
      .set({
        status: parsed.data.status,
        reviewerComment: parsed.data.reviewerComment ?? null,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      })
      .where(eq(workPlans.id, workPlanId));
  } else {
    await db.insert(workPlans).values({
      id: workPlanId,
      userId: targetUserId,
      month: parsed.data.month,
      status: parsed.data.status,
      reviewerComment: parsed.data.reviewerComment ?? null,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  await db.delete(workPlanItems).where(eq(workPlanItems.workPlanId, workPlanId));

  if (parsed.data.items.length) {
    await db.insert(workPlanItems).values(
      parsed.data.items
        .filter((item) => item.title.trim())
        .map((item, index) => ({
          id: item.id ?? crypto.randomUUID(),
          workPlanId,
          userId: targetUserId,
          month: parsed.data.month,
          planDate: item.planDate,
          sortOrder: index,
          title: item.title,
          description: item.description ?? null,
          expectedOutput: item.expectedOutput ?? null,
          category: item.category ?? null,
          priority: item.priority,
          linkedProjectId: item.linkedProjectId ?? null,
          holidayType: item.holidayType,
          holidayLabel: item.holidayLabel ?? null,
          notes: item.notes ?? null,
          status: item.status,
          isAutoGenerated: item.isAutoGenerated,
          followUpRequired: item.followUpRequired,
          createdBy: user.id,
          updatedBy: user.id,
        })),
    );
  }

  await logAudit(c.env, {
    actorUserId: user.id,
    targetUserId,
    entityType: "work_plan",
    entityId: workPlanId,
    action: existing[0] ? "work_plan_updated" : "work_plan_created",
    summary: `Work plan saved for ${parsed.data.month}`,
    ...actorMeta(c),
  });

  return ok(c, { workPlanId });
});

app.get("/daily-activities", async (c) => {
  const user = requireUser(c);
  const db = getDb(c.env);
  const fromDate = c.req.query("fromDate") ?? todayInDhaka();
  const toDate = c.req.query("toDate") ?? fromDate;
  const targetUserId = getTargetUserId(c, user);

  await refreshOverdueFollowUps(c.env, targetUserId);

  const [activities, suggestedPlanItems, overdueFollowUpsForDate] = await Promise.all([
    db
      .select()
      .from(dailyActivities)
      .where(and(eq(dailyActivities.userId, targetUserId), gte(dailyActivities.activityDate, fromDate), lte(dailyActivities.activityDate, toDate)))
      .orderBy(desc(dailyActivities.activityDate), desc(dailyActivities.activityTime)),
    db
      .select()
      .from(workPlanItems)
      .where(and(eq(workPlanItems.userId, targetUserId), eq(workPlanItems.planDate, fromDate)))
      .limit(8),
    db
      .select()
      .from(followUps)
      .where(and(eq(followUps.userId, targetUserId), inArray(followUps.status, ["pending", "overdue", "snoozed"])))
      .limit(4),
  ]);

  return ok(c, {
    activities,
    suggestedPlanItems,
    overdueFollowUps: overdueFollowUpsForDate,
  });
});

app.post("/daily-activities", async (c) => {
  const user = requireUser(c);
  const body = await parseBody<unknown>(c);
  const parsed = dailyActivitySchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid daily activity payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const activityId = parsed.data.id ?? crypto.randomUUID();

  await db.insert(dailyActivities).values({
    id: activityId,
    userId: user.id,
    activityDate: parsed.data.activityDate,
    activityTime: parsed.data.activityTime,
    taskDescription: parsed.data.taskDescription,
    output: parsed.data.output ?? null,
    note: parsed.data.note ?? null,
    delivery: parsed.data.delivery ?? null,
    linkedPlanItemId: parsed.data.linkedPlanItemId ?? null,
    followUpDate: parsed.data.followUpDate ?? null,
    followUpNote: parsed.data.followUpNote ?? null,
    reminderStatus: parsed.data.reminderStatus,
    status: parsed.data.status,
    printGroupId: parsed.data.printGroupId ?? null,
    submittedAt: new Date().toISOString(),
    createdBy: user.id,
    updatedBy: user.id,
  });

  if (parsed.data.followUpDate) {
    const followUpId = crypto.randomUUID();

    await db.insert(followUps).values({
      id: followUpId,
      userId: user.id,
      sourceType: "activity",
      sourceId: activityId,
      title: parsed.data.taskDescription,
      note: parsed.data.followUpNote ?? parsed.data.note ?? null,
      dueDate: parsed.data.followUpDate,
      priority: "medium",
      status: "pending",
      createdBy: user.id,
      updatedBy: user.id,
    });

    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "follow_up_due",
      title: "Follow-up created",
      body: parsed.data.followUpNote ?? parsed.data.taskDescription,
      actionUrl: "/workspace/follow-ups",
      priority: "medium",
      status: "unread",
      metaJson: JSON.stringify({ followUpId }),
    });
  }

  return ok(c, { activityId }, 201);
});

app.get("/follow-ups", async (c) => {
  const user = requireUser(c);
  const db = getDb(c.env);
  const targetUserId = getTargetUserId(c, user);

  await refreshOverdueFollowUps(c.env, targetUserId);

  const items = await db
    .select()
    .from(followUps)
    .where(eq(followUps.userId, targetUserId))
    .orderBy(desc(followUps.dueDate));

  const pending = items.filter((item) => item.status !== "done" && item.status !== "cancelled").length;
  const overdue = items.filter((item) => item.status === "overdue").length;
  await cacheReminderState(c.env, targetUserId, { pending, overdue });

  return ok(c, { items });
});

app.post("/follow-ups", async (c) => {
  const user = requireUser(c);
  const body = await parseBody<unknown>(c);
  const parsed = followUpSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid follow-up payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const followUpId = parsed.data.id ?? crypto.randomUUID();

  await db.insert(followUps).values({
    id: followUpId,
    userId: parsed.data.userId && ["admin", "super_admin"].includes(user.role) ? parsed.data.userId : user.id,
    sourceType: parsed.data.sourceType,
    sourceId: parsed.data.sourceId ?? null,
    title: parsed.data.title,
    note: parsed.data.note ?? null,
    dueDate: parsed.data.dueDate,
    priority: parsed.data.priority,
    status: parsed.data.status,
    snoozedUntil: parsed.data.snoozedUntil ?? null,
    assignedToUserId: parsed.data.assignedToUserId ?? null,
    createdBy: user.id,
    updatedBy: user.id,
  });

  return ok(c, { followUpId }, 201);
});

app.post("/follow-ups/:id/complete", async (c) => {
  const user = requireUser(c);
  const db = getDb(c.env);
  const followUpId = c.req.param("id");

  await db
    .update(followUps)
    .set({
      status: "done",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    })
    .where(eq(followUps.id, followUpId));

  return ok(c, { followUpId });
});

app.post("/follow-ups/:id/snooze", async (c) => {
  const user = requireUser(c);
  const body = (await parseBody<{ snoozedUntil?: string }>(c)) ?? {};
  const db = getDb(c.env);
  const followUpId = c.req.param("id");

  await db
    .update(followUps)
    .set({
      status: "snoozed",
      snoozedUntil: body.snoozedUntil ?? null,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    })
    .where(eq(followUps.id, followUpId));

  return ok(c, { followUpId });
});

app.get("/monthly-reports", async (c) => {
  const user = requireUser(c);
  const db = getDb(c.env);
  const month = c.req.query("month") ?? todayInDhaka().slice(0, 7);
  const targetUserId = getTargetUserId(c, user);

  const reportRows = await db
    .select()
    .from(monthlyReports)
    .where(and(eq(monthlyReports.userId, targetUserId), eq(monthlyReports.month, month)))
    .limit(1);

  const report = reportRows[0];

  if (!report) {
    return ok(c, { report: null });
  }

  const [completedItems, ongoingItems, nextMonthItems] = await Promise.all([
    db.select().from(monthlyReportCompletedItems).where(eq(monthlyReportCompletedItems.reportId, report.id)),
    db.select().from(monthlyReportOngoingItems).where(eq(monthlyReportOngoingItems.reportId, report.id)),
    db.select().from(monthlyReportNextMonthItems).where(eq(monthlyReportNextMonthItems.reportId, report.id)),
  ]);

  return ok(c, {
    report: {
      ...report,
      completedItems,
      ongoingItems,
      nextMonthItems,
    },
  });
});

app.post("/monthly-reports/generate", async (c) => {
  const user = requireUser(c);
  const body = (await parseBody<{ month?: string }>(c)) ?? {};
  const month = body.month ?? todayInDhaka().slice(0, 7);
  const draft = await generateMonthlyReportDraft(c.env, user.id, month);
  return ok(c, draft);
});

app.post("/monthly-reports", async (c) => {
  const user = requireUser(c);
  const body = await parseBody<unknown>(c);
  const parsed = monthlyReportSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid monthly report payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const reportId = parsed.data.id ?? crypto.randomUUID();
  const existing = await db.select().from(monthlyReports).where(eq(monthlyReports.id, reportId)).limit(1);

  if (existing[0]) {
    await db
      .update(monthlyReports)
      .set({
        projectName: parsed.data.projectName ?? null,
        reportName: parsed.data.reportName ?? null,
        designationSnapshot: parsed.data.designationSnapshot ?? null,
        status: parsed.data.status,
        lessonsLearned: parsed.data.lessonsLearned ?? null,
        comments: parsed.data.comments ?? null,
        adminComment: parsed.data.adminComment ?? null,
        submittedByName: parsed.data.submittedByName ?? null,
        approvedByName: parsed.data.approvedByName ?? null,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id,
      })
      .where(eq(monthlyReports.id, reportId));
  } else {
    await db.insert(monthlyReports).values({
      id: reportId,
      userId: user.id,
      month: parsed.data.month,
      projectName: parsed.data.projectName ?? null,
      reportName: parsed.data.reportName ?? null,
      designationSnapshot: parsed.data.designationSnapshot ?? null,
      submissionDate: new Date().toISOString().slice(0, 10),
      status: parsed.data.status,
      lessonsLearned: parsed.data.lessonsLearned ?? null,
      comments: parsed.data.comments ?? null,
      adminComment: parsed.data.adminComment ?? null,
      submittedByName: parsed.data.submittedByName ?? user.profile.fullName,
      approvedByName: parsed.data.approvedByName ?? null,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  await db.delete(monthlyReportCompletedItems).where(eq(monthlyReportCompletedItems.reportId, reportId));
  await db.delete(monthlyReportOngoingItems).where(eq(monthlyReportOngoingItems.reportId, reportId));
  await db.delete(monthlyReportNextMonthItems).where(eq(monthlyReportNextMonthItems.reportId, reportId));

  if (parsed.data.completedItems.length) {
    await db.insert(monthlyReportCompletedItems).values(
      parsed.data.completedItems.map((item, index) => ({
        id: item.id ?? crypto.randomUUID(),
        reportId,
        sortOrder: index,
        taskDate: item.taskDate ?? null,
        taskName: item.taskName,
        output: item.output ?? null,
        remarks: item.remarks ?? null,
        sourceActivityId: item.sourceActivityId ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })),
    );
  }

  if (parsed.data.ongoingItems.length) {
    await db.insert(monthlyReportOngoingItems).values(
      parsed.data.ongoingItems.map((item, index) => ({
        id: item.id ?? crypto.randomUUID(),
        reportId,
        sortOrder: index,
        taskName: item.taskName,
        output: item.output ?? null,
        deadline: item.deadline ?? null,
        remarks: item.remarks ?? null,
        sourceFollowUpId: item.sourceFollowUpId ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })),
    );
  }

  if (parsed.data.nextMonthItems.length) {
    await db.insert(monthlyReportNextMonthItems).values(
      parsed.data.nextMonthItems.map((item, index) => ({
        id: item.id ?? crypto.randomUUID(),
        reportId,
        sortOrder: index,
        taskName: item.taskName,
        taskDate: item.taskDate ?? null,
        output: item.output ?? null,
        remarks: item.remarks ?? null,
        sourcePlanItemId: item.sourcePlanItemId ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })),
    );
  }

  return ok(c, { reportId });
});

app.get("/calendar", async (c) => {
  const user = requireUser(c);
  const month = c.req.query("month") ?? todayInDhaka().slice(0, 7);
  const events = await buildCalendarEvents(c.env, getTargetUserId(c, user), month, user.role);
  return ok(c, { events });
});

app.get("/admin/users", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db
    .select({
      id: users.id,
      email: users.email,
      approvalStatus: users.approvalStatus,
      fullName: userProfiles.fullName,
      designation: userProfiles.designation,
      departmentName: departmentsOrProjects.name,
      role: roles.code,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(departmentsOrProjects, eq(departmentsOrProjects.id, userProfiles.departmentId))
    .leftJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.isPrimary, true)))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .orderBy(desc(users.createdAt));

  return ok(c, { items });
});

app.post("/admin/users/:id", async (c) => {
  const admin = requireAdmin(c);
  const body = await parseBody<unknown>(c);
  const parsed = adminUserUpdateSchema.safeParse({
    ...(body ?? {}),
    userId: c.req.param("id"),
  });

  if (!parsed.success) {
    return fail(c, "Invalid admin user update payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);

  if (parsed.data.approvalStatus) {
    await db
      .update(users)
      .set({
        approvalStatus: parsed.data.approvalStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.id,
      })
      .where(eq(users.id, parsed.data.userId));

    await db
      .update(approvalRequests)
      .set({
        status: parsed.data.approvalStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: admin.id,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.id,
      })
      .where(eq(approvalRequests.userId, parsed.data.userId));
  }

  await logAudit(c.env, {
    actorUserId: admin.id,
    targetUserId: parsed.data.userId,
    entityType: "user",
    entityId: parsed.data.userId,
    action: "user_updated",
    summary: `User status updated to ${parsed.data.approvalStatus ?? "unchanged"}`,
    ...actorMeta(c),
  });

  return ok(c, { success: true });
});

app.get("/admin/approvals", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db
    .select({
      id: approvalRequests.id,
      status: approvalRequests.status,
      notes: approvalRequests.notes,
      fullName: userProfiles.fullName,
      email: users.email,
      submittedAt: approvalRequests.submittedAt,
    })
    .from(approvalRequests)
    .leftJoin(users, eq(users.id, approvalRequests.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .orderBy(desc(approvalRequests.submittedAt));

  return ok(c, { items });
});

app.get("/admin/templates", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db.select().from(templates).orderBy(templates.type);
  return ok(c, {
    items: items.map((item) => ({
      ...item,
      settings: safeJsonParse(item.settingsJson, {}),
    })),
  });
});

app.post("/admin/templates", async (c) => {
  const admin = requireAdmin(c);
  const body = await parseBody<unknown>(c);
  const parsed = templateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid template payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  const existing = await db.select().from(templates).where(eq(templates.type, parsed.data.type)).limit(1);
  const templateId = existing[0]?.id ?? crypto.randomUUID();
  const nextVersion = (existing[0]?.currentVersion ?? 0) + 1;
  const serializedSettings = JSON.stringify(parsed.data.settings);

  if (existing[0]) {
    await db
      .update(templates)
      .set({
        name: parsed.data.name,
        organizationName: parsed.data.organizationName,
        organizationLogoUrl: parsed.data.organizationLogoUrl ?? null,
        footerText: parsed.data.footerText ?? null,
        printHeaderText: parsed.data.printHeaderText ?? null,
        printFooterText: parsed.data.printFooterText ?? null,
        submittedByLabel: parsed.data.submittedByLabel,
        approvedByLabel: parsed.data.approvedByLabel,
        showNotesArea: parsed.data.showNotesArea,
        settingsJson: serializedSettings,
        currentVersion: nextVersion,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.id,
      })
      .where(eq(templates.id, templateId));
  } else {
    await db.insert(templates).values({
      id: templateId,
      type: parsed.data.type,
      name: parsed.data.name,
      organizationName: parsed.data.organizationName,
      organizationLogoUrl: parsed.data.organizationLogoUrl ?? null,
      footerText: parsed.data.footerText ?? null,
      printHeaderText: parsed.data.printHeaderText ?? null,
      printFooterText: parsed.data.printFooterText ?? null,
      submittedByLabel: parsed.data.submittedByLabel,
      approvedByLabel: parsed.data.approvedByLabel,
      showNotesArea: parsed.data.showNotesArea,
      settingsJson: serializedSettings,
      currentVersion: nextVersion,
      createdBy: admin.id,
      updatedBy: admin.id,
    });
  }

  await db.insert(templateVersions).values({
    id: crypto.randomUUID(),
    templateId,
    versionNumber: nextVersion,
    labelMapJson: JSON.stringify(parsed.data.settings.labelMap),
    visibleFieldsJson: JSON.stringify(parsed.data.settings.visibleFields),
    sectionOrderJson: JSON.stringify(parsed.data.settings.sectionOrder),
    printSettingsJson: JSON.stringify(parsed.data.settings.printSettings),
    signatureBlocksJson: JSON.stringify(parsed.data.settings.signatureBlocks),
    notes: `Saved by ${admin.profile.fullName}`,
    createdBy: admin.id,
    updatedBy: admin.id,
  });

  return ok(c, { templateId });
});

app.get("/admin/holidays", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db.select().from(holidays).orderBy(desc(holidays.holidayDate));
  return ok(c, { items });
});

app.post("/admin/holidays", async (c) => {
  const admin = requireAdmin(c);
  const body = await parseBody<unknown>(c);
  const parsed = holidaySchema.safeParse(body);

  if (!parsed.success) {
    return fail(c, "Invalid holiday payload", 422, parsed.error.flatten());
  }

  const db = getDb(c.env);
  await db.insert(holidays).values({
    id: parsed.data.id ?? crypto.randomUUID(),
    holidayDate: parsed.data.holidayDate,
    holidayType: parsed.data.holidayType,
    label: parsed.data.label,
    isRecurring: parsed.data.isRecurring,
    isActive: parsed.data.isActive,
    isOverrideAllowed: parsed.data.isOverrideAllowed,
    createdBy: admin.id,
    updatedBy: admin.id,
  });

  return ok(c, { success: true }, 201);
});

app.get("/admin/settings", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db.select().from(appSettings).orderBy(appSettings.category, appSettings.key);
  return ok(c, { items });
});

app.get("/admin/audit", async (c) => {
  requireAdmin(c);
  const db = getDb(c.env);
  const items = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  return ok(c, {
    items: items.map((item) => ({
      ...item,
      actorName: item.actorUserId,
    })),
  });
});

export const onRequest = handle(app);
