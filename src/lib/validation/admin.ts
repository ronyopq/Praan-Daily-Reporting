import { z } from "zod";

import { APPROVAL_STATUSES, TEMPLATE_TYPES } from "@/lib/constants";
import { isoDateSchema, monthSchema } from "@/lib/validation/shared";

export const holidaySchema = z.object({
  id: z.string().optional(),
  holidayDate: isoDateSchema,
  holidayType: z.enum(["none", "friday", "govt_holiday", "custom"]),
  label: z.string().min(2).max(120),
  isRecurring: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isOverrideAllowed: z.boolean().default(true),
});

export const templateVersionSchema = z.object({
  visibleFields: z.array(z.string()),
  sectionOrder: z.array(z.string()),
  labelMap: z.record(z.string(), z.string()),
  printSettings: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])),
  signatureBlocks: z.array(z.string()),
});

export const templateSchema = z.object({
  id: z.string().optional(),
  type: z.enum(TEMPLATE_TYPES),
  name: z.string().min(3).max(120),
  organizationName: z.string().min(2).max(120),
  organizationLogoUrl: z.string().url().optional().nullable(),
  footerText: z.string().max(500).optional().nullable(),
  printHeaderText: z.string().max(250).optional().nullable(),
  printFooterText: z.string().max(250).optional().nullable(),
  submittedByLabel: z.string().max(60).default("Submitted by"),
  approvedByLabel: z.string().max(60).default("Approved by"),
  showNotesArea: z.boolean().default(true),
  settings: templateVersionSchema,
});

export const dashboardFilterSchema = z.object({
  month: monthSchema.optional(),
  userId: z.string().optional(),
  departmentId: z.string().optional(),
});

export const approvalActionSchema = z.object({
  userId: z.string(),
  status: z.enum(APPROVAL_STATUSES),
  comment: z.string().max(300).optional().nullable(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
