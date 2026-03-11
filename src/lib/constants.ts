export const APP_NAME = "PRAAN Daily Reporting";
export const DHAKA_TIMEZONE = "Asia/Dhaka";

export const USER_ROLES = ["super_admin", "admin", "user"] as const;
export const APPROVAL_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
export const LANGUAGE_OPTIONS = ["bn", "en"] as const;
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
  { href: "/workspace", labelEn: "Dashboard", labelBn: "ড্যাশবোর্ড" },
  { href: "/workspace/work-plan", labelEn: "Work Plan", labelBn: "কর্মপরিকল্পনা" },
  { href: "/workspace/daily-activities", labelEn: "Daily Activities", labelBn: "দৈনিক কার্যবিবরণী" },
  { href: "/workspace/follow-ups", labelEn: "Follow-ups", labelBn: "ফলো-আপ" },
  { href: "/workspace/monthly-reports", labelEn: "Monthly Reports", labelBn: "মাসিক প্রতিবেদন" },
  { href: "/workspace/calendar", labelEn: "Calendar", labelBn: "ক্যালেন্ডার" },
  { href: "/workspace/print", labelEn: "Print Center", labelBn: "প্রিন্ট সেন্টার" },
  { href: "/workspace/profile", labelEn: "Profile", labelBn: "প্রোফাইল" },
] as const;

export const ADMIN_NAVIGATION = [
  { href: "/admin", labelEn: "Overview", labelBn: "সারসংক্ষেপ" },
  { href: "/admin/users", labelEn: "Users", labelBn: "ব্যবহারকারী" },
  { href: "/admin/approvals", labelEn: "Approvals", labelBn: "অনুমোদন" },
  { href: "/admin/templates", labelEn: "Templates", labelBn: "টেমপ্লেট" },
  { href: "/admin/holidays", labelEn: "Holidays", labelBn: "ছুটির তালিকা" },
  { href: "/admin/settings", labelEn: "Settings", labelBn: "সেটিংস" },
  { href: "/admin/audit", labelEn: "Audit Log", labelBn: "অডিট লগ" },
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
