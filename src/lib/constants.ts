export const APP_NAME = "PRAAN Daily Reporting";
export const DHAKA_TIMEZONE = "Asia/Dhaka";

export const USER_ROLES = ["super_admin", "admin", "user"] as const;
export const APPROVAL_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
export const LANGUAGE_OPTIONS = ["en"] as const;
export const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;
export const HOLIDAY_TYPES = ["none", "friday", "govt_holiday", "custom"] as const;
export const WORK_PLAN_STATUSES = ["draft", "submitted", "reviewed", "returned", "approved"] as const;
export const WORK_PLAN_ITEM_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "skipped",
  "moved",
  "carry_forward",
] as const;
export const DAILY_ACTIVITY_STATUSES = [
  "draft",
  "submitted",
  "completed",
  "ongoing",
  "needs_follow_up",
] as const;
export const FOLLOW_UP_STATUSES = ["pending", "done", "snoozed", "overdue", "cancelled"] as const;
export const MONTHLY_REPORT_STATUSES = [
  "draft",
  "submitted",
  "reviewed",
  "returned",
  "approved",
] as const;
export const TEMPLATE_TYPES = [
  "daily_activity_register",
  "monthly_work_plan",
  "monthly_report",
] as const;

export const WORKSPACE_NAVIGATION = [
  { href: "/workspace", label: "Dashboard" },
  { href: "/workspace/work-plan", label: "Work Plan" },
  { href: "/workspace/daily-activities", label: "Daily Activities" },
  { href: "/workspace/follow-ups", label: "Follow-ups" },
  { href: "/workspace/monthly-reports", label: "Monthly Reports" },
  { href: "/workspace/calendar", label: "Calendar" },
  { href: "/workspace/print", label: "Print Center" },
  { href: "/workspace/profile", label: "Profile" },
] as const;

export const ADMIN_NAVIGATION = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/holidays", label: "Holidays" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
] as const;

export const DEFAULT_TEMPLATE_SETTINGS = {
  daily_activity_register: {
    visibleFields: ["activity_time", "task_description", "output", "note", "delivery"],
    sectionOrder: ["header", "table", "noteBlock", "signature"],
    labelMap: {
      title: "Daily Activity Register",
      taskDescription: "Task's Description",
      output: "Output",
      note: "Note",
      delivery: "Delivery",
    },
    printSettings: {
      showDateHeader: true,
      compactRows: false,
      showFooter: true,
    },
    signatureBlocks: ["submitted_by", "approved_by"],
  },
  monthly_work_plan: {
    visibleFields: ["plan_date", "title", "expected_output", "category", "priority", "status"],
    sectionOrder: ["header", "calendarSummary", "table", "signature"],
    labelMap: {
      title: "Monthly Work Plan",
      planDate: "Date",
      expectedOutput: "Expected Output",
    },
    printSettings: {
      showHolidayBadges: true,
      showNotesArea: true,
    },
    signatureBlocks: ["submitted_by", "approved_by"],
  },
  monthly_report: {
    visibleFields: [
      "project_name",
      "reporting_month",
      "completed_task",
      "ongoing_tasks",
      "tasks_for_next_month",
      "lesson_learned",
      "comments",
    ],
    sectionOrder: [
      "header",
      "completedTasks",
      "ongoingTasks",
      "nextMonth",
      "lessons",
      "comments",
      "signature",
    ],
    labelMap: {
      title: "Monthly Report",
      completedTask: "Completed Task",
      ongoingTasks: "Ongoing Tasks",
      nextMonthTasks: "Tasks for Next Month",
      lessonsLearned: "Lesson Learned",
    },
    printSettings: {
      showSubmissionDate: true,
      showFooter: true,
    },
    signatureBlocks: ["submitted_by", "approved_by"],
  },
} as const;
