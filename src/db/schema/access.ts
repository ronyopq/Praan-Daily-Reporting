import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { auditColumns, softDeleteColumns } from "./_shared";

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: integer("is_system", { mode: "boolean" }).notNull().default(true),
    ...auditColumns(),
  },
  (table) => ({
    codeIdx: uniqueIndex("roles_code_idx").on(table.code),
  }),
);

export const departmentsOrProjects = sqliteTable(
  "departments_or_projects",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    code: text("code"),
    description: text("description"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...auditColumns(),
    ...softDeleteColumns(),
  },
  (table) => ({
    typeNameIdx: uniqueIndex("departments_projects_type_name_idx").on(table.type, table.name),
  }),
);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    approvalStatus: text("approval_status").notNull().default("pending"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    preferredLanguage: text("preferred_language").notNull().default("bn"),
    sessionVersion: integer("session_version").notNull().default(1),
    lastLoginAt: text("last_login_at"),
    ...auditColumns(),
    ...softDeleteColumns(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    approvalStatusIdx: index("users_approval_status_idx").on(table.approvalStatus),
  }),
);

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  designation: text("designation").notNull(),
  departmentId: text("department_id").references(() => departmentsOrProjects.id),
  projectId: text("project_id").references(() => departmentsOrProjects.id),
  supervisorId: text("supervisor_id").references(() => users.id),
  phone: text("phone"),
  preferredLanguage: text("preferred_language").notNull().default("bn"),
  activeStatus: text("active_status").notNull().default("active"),
  ...auditColumns(),
});

export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    assignedAt: text("assigned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    assignedBy: text("assigned_by").references(() => users.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
    userIdx: index("user_roles_user_idx").on(table.userId),
  }),
);

export const approvalRequests = sqliteTable(
  "approval_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    notes: text("notes"),
    rejectionReason: text("rejection_reason"),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    reviewedAt: text("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => users.id),
    ...auditColumns(),
  },
  (table) => ({
    userIdx: uniqueIndex("approval_requests_user_idx").on(table.userId),
    statusIdx: index("approval_requests_status_idx").on(table.status),
  }),
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    revokedAt: text("revoked_at"),
    ...auditColumns(),
  },
  (table) => ({
    userIdx: index("auth_sessions_user_idx").on(table.userId),
    expiresIdx: index("auth_sessions_expires_idx").on(table.expiresAt),
  }),
);
