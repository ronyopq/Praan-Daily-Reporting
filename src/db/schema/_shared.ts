import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const auditColumns = () => ({
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
});

export const softDeleteColumns = () => ({
  deletedAt: text("deleted_at"),
  deletedBy: text("deleted_by"),
});
