import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { users } from "./access";
import { auditColumns, softDeleteColumns } from "./_shared";
import { dailyActivities, followUps, workPlanItems } from "./planning";

export const monthlyReports = sqliteTable(
  "monthly_reports",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: text("month").notNull(),
    projectName: text("project_name"),
    reportName: text("report_name"),
    designationSnapshot: text("designation_snapshot"),
    submissionDate: text("submission_date"),
    status: text("status").notNull().default("draft"),
    lessonsLearned: text("lessons_learned"),
    comments: text("comments"),
    adminComment: text("admin_comment"),
    submittedByName: text("submitted_by_name"),
    approvedByName: text("approved_by_name"),
    generatedFrom: text("generated_from"),
    submittedAt: text("submitted_at"),
    reviewedAt: text("reviewed_at"),
    approvedAt: text("approved_at"),
    approvedBy: text("approved_by").references(() => users.id),
    ...auditColumns(),
    ...softDeleteColumns(),
  },
  (table) => ({
    userMonthIdx: uniqueIndex("monthly_reports_user_month_idx").on(table.userId, table.month),
    statusIdx: index("monthly_reports_status_idx").on(table.status),
  }),
);

export const monthlyReportCompletedItems = sqliteTable(
  "monthly_report_completed_items",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => monthlyReports.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    taskDate: text("task_date"),
    taskName: text("task_name").notNull(),
    output: text("output"),
    remarks: text("remarks"),
    sourceActivityId: text("source_activity_id").references(() => dailyActivities.id),
    ...auditColumns(),
  },
  (table) => ({
    reportIdx: index("monthly_report_completed_report_idx").on(table.reportId),
  }),
);

export const monthlyReportOngoingItems = sqliteTable(
  "monthly_report_ongoing_items",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => monthlyReports.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    taskName: text("task_name").notNull(),
    output: text("output"),
    deadline: text("deadline"),
    remarks: text("remarks"),
    sourceFollowUpId: text("source_follow_up_id").references(() => followUps.id),
    ...auditColumns(),
  },
  (table) => ({
    reportIdx: index("monthly_report_ongoing_report_idx").on(table.reportId),
  }),
);

export const monthlyReportNextMonthItems = sqliteTable(
  "monthly_report_next_month_items",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => monthlyReports.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    taskName: text("task_name").notNull(),
    taskDate: text("task_date"),
    output: text("output"),
    remarks: text("remarks"),
    sourcePlanItemId: text("source_plan_item_id").references(() => workPlanItems.id),
    ...auditColumns(),
  },
  (table) => ({
    reportIdx: index("monthly_report_next_report_idx").on(table.reportId),
  }),
);
