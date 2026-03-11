import { and, desc, eq, gte, lte, notInArray } from "drizzle-orm";

import {
  dailyActivities,
  followUps,
  holidays,
  workPlanItems,
} from "../../src/db/schema";
import { DEFAULT_BANGLADESH_HOLIDAYS } from "../../src/lib/bangladesh-holidays";
import { createMonthPlanningSkeleton, getMonthBounds, listMonthDates } from "../../src/lib/date";
import { getDb } from "./db";
import type { AppBindings } from "./env";

export async function refreshOverdueFollowUps(env: AppBindings, userId?: string) {
  const db = getDb(env);
  const today = new Date().toISOString().slice(0, 10);

  await db
    .update(followUps)
    .set({
      status: "overdue",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        lte(followUps.dueDate, today),
        notInArray(followUps.status, ["done", "cancelled", "overdue"]),
        userId ? eq(followUps.userId, userId) : undefined,
      ),
    );
}

export async function generateWorkPlanDraft(env: AppBindings, userId: string, month: string) {
  const db = getDb(env);
  const [yearStart] = month.split("-");
  const dbHolidays = await db.select().from(holidays).where(gte(holidays.holidayDate, `${yearStart}-01-01`));
  const holidayMap = new Map<string, { label: string; type: string }>();

  for (const holiday of dbHolidays) {
    holidayMap.set(holiday.holidayDate, {
      label: holiday.label,
      type: holiday.holidayType,
    });
  }

  for (const holiday of DEFAULT_BANGLADESH_HOLIDAYS) {
    if (!holidayMap.has(holiday.date)) {
      holidayMap.set(holiday.date, {
        label: holiday.label,
        type: holiday.type,
      });
    }
  }

  const previousMonthItems = await db
    .select()
    .from(workPlanItems)
    .where(eq(workPlanItems.userId, userId))
    .orderBy(desc(workPlanItems.planDate))
    .limit(8);

  const unfinishedItems = previousMonthItems
    .filter((item) => ["planned", "in_progress", "carry_forward"].includes(item.status))
    .map((item, index) => ({
      planDate: listMonthDates(month)[index] ?? `${month}-01`,
      title: item.title,
      description: item.description,
      expectedOutput: item.expectedOutput,
      category: item.category,
      priority: item.priority,
      status: item.status,
      holidayType: "none",
      holidayLabel: "",
      followUpRequired: item.followUpRequired,
    }));

  return {
    generatedDays: createMonthPlanningSkeleton(month, holidayMap),
    suggestedItems: unfinishedItems,
  };
}

export async function generateMonthlyReportDraft(env: AppBindings, userId: string, month: string) {
  const db = getDb(env);
  const { start, end } = getMonthBounds(month);
  const fromDate = start.toISOString().slice(0, 10);
  const toDate = end.toISOString().slice(0, 10);

  const completedActivities = await db
    .select()
    .from(dailyActivities)
    .where(and(eq(dailyActivities.userId, userId), gte(dailyActivities.activityDate, fromDate), lte(dailyActivities.activityDate, toDate)))
    .orderBy(desc(dailyActivities.activityDate))
    .limit(12);

  const openFollowUps = await db
    .select()
    .from(followUps)
    .where(and(eq(followUps.userId, userId), notInArray(followUps.status, ["done", "cancelled"])))
    .orderBy(desc(followUps.dueDate))
    .limit(8);

  const nextMonthPlans = await db
    .select()
    .from(workPlanItems)
    .where(and(eq(workPlanItems.userId, userId), eq(workPlanItems.month, month)))
    .orderBy(desc(workPlanItems.planDate))
    .limit(8);

  return {
    completedItems: completedActivities.map((item, index) => ({
      sortOrder: index,
      taskDate: item.activityDate,
      taskName: item.taskDescription,
      output: item.output,
      remarks: item.note,
      sourceActivityId: item.id,
    })),
    ongoingItems: openFollowUps.map((item, index) => ({
      sortOrder: index,
      taskName: item.title,
      output: item.note,
      deadline: item.dueDate,
      remarks: item.status,
      sourceFollowUpId: item.id,
    })),
    nextMonthItems: nextMonthPlans.map((item, index) => ({
      sortOrder: index,
      taskName: item.title,
      taskDate: item.planDate,
      output: item.expectedOutput,
      remarks: item.notes,
      sourcePlanItemId: item.id,
    })),
  };
}

export async function buildCalendarEvents(env: AppBindings, userId: string, month: string, role: string) {
  const db = getDb(env);
  const itemScope = role === "user" ? eq(workPlanItems.userId, userId) : undefined;
  const followUpScope = role === "user" ? eq(followUps.userId, userId) : undefined;
  const activityScope = role === "user" ? eq(dailyActivities.userId, userId) : undefined;
  const holidayRows = await db.select().from(holidays).where(gte(holidays.holidayDate, `${month}-01`));

  const [planItems, activityItems, followUpItems] = await Promise.all([
    db.select().from(workPlanItems).where(and(eq(workPlanItems.month, month), itemScope)),
    db
      .select()
      .from(dailyActivities)
      .where(and(gte(dailyActivities.activityDate, `${month}-01`), lte(dailyActivities.activityDate, `${month}-31`), activityScope)),
    db
      .select()
      .from(followUps)
      .where(and(gte(followUps.dueDate, `${month}-01`), lte(followUps.dueDate, `${month}-31`), followUpScope)),
  ]);

  return [
    ...planItems.map((item) => ({
      id: `plan-${item.id}`,
      title: item.title,
      date: item.planDate,
      color: "#0284c7",
      extendedProps: {
        type: "work_plan",
        status: item.status,
      },
    })),
    ...activityItems.map((item) => ({
      id: `activity-${item.id}`,
      title: item.taskDescription,
      date: item.activityDate,
      color: "#16a34a",
      extendedProps: {
        type: "activity",
        status: item.status,
      },
    })),
    ...followUpItems.map((item) => ({
      id: `followup-${item.id}`,
      title: item.title,
      date: item.dueDate,
      color: item.status === "overdue" ? "#dc2626" : "#f59e0b",
      extendedProps: {
        type: "follow_up",
        status: item.status,
      },
    })),
    ...holidayRows.map((item) => ({
      id: `holiday-${item.id}`,
      title: item.label,
      date: item.holidayDate,
      color: "#f97316",
      extendedProps: {
        type: "holiday",
        status: item.holidayType,
      },
    })),
  ];
}
