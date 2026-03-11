import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { users } from "./access";
import { auditColumns } from "./_shared";

export const templates = sqliteTable(
  "templates",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    currentVersion: integer("current_version").notNull().default(1),
    organizationName: text("organization_name").notNull(),
    organizationLogoUrl: text("organization_logo_url"),
    footerText: text("footer_text"),
    printHeaderText: text("print_header_text"),
    printFooterText: text("print_footer_text"),
    submittedByLabel: text("submitted_by_label").notNull().default("Submitted by"),
    approvedByLabel: text("approved_by_label").notNull().default("Approved by"),
    showNotesArea: integer("show_notes_area", { mode: "boolean" }).notNull().default(true),
    settingsJson: text("settings_json").notNull().default("{}"),
    ...auditColumns(),
  },
  (table) => ({
    typeIdx: uniqueIndex("templates_type_idx").on(table.type),
  }),
);

export const templateVersions = sqliteTable(
  "template_versions",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    labelMapJson: text("label_map_json").notNull().default("{}"),
    visibleFieldsJson: text("visible_fields_json").notNull().default("[]"),
    sectionOrderJson: text("section_order_json").notNull().default("[]"),
    printSettingsJson: text("print_settings_json").notNull().default("{}"),
    signatureBlocksJson: text("signature_blocks_json").notNull().default("[]"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    notes: text("notes"),
    ...auditColumns(),
  },
  (table) => ({
    templateVersionIdx: uniqueIndex("template_versions_template_version_idx").on(
      table.templateId,
      table.versionNumber,
    ),
  }),
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    priority: text("priority").notNull().default("medium"),
    status: text("status").notNull().default("unread"),
    metaJson: text("meta_json").notNull().default("{}"),
    seenAt: text("seen_at"),
    dismissedAt: text("dismissed_at"),
    ...auditColumns(),
  },
  (table) => ({
    userStatusIdx: index("notifications_user_status_idx").on(table.userId, table.status),
  }),
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id),
    targetUserId: text("target_user_id").references(() => users.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    diffJson: text("diff_json").notNull().default("{}"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    actorIdx: index("audit_logs_actor_idx").on(table.actorUserId),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  }),
);

export const appSettings = sqliteTable(
  "app_settings",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    description: text("description"),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    ...auditColumns(),
  },
  (table) => ({
    categoryKeyIdx: uniqueIndex("app_settings_category_key_idx").on(table.category, table.key),
  }),
);
