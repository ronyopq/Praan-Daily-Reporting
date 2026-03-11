import { z } from "zod";

import { APPROVAL_STATUSES, LANGUAGE_OPTIONS, USER_ROLES } from "@/lib/constants";
import { idSchema } from "@/lib/validation/shared";

export const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  designation: z.string().min(2).max(120),
  departmentId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  preferredLanguage: z.enum(LANGUAGE_OPTIONS),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registrationSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Use at least one uppercase letter")
      .regex(/[0-9]/, "Use at least one number"),
    confirmPassword: z.string(),
    profile: profileSchema,
    noteToAdmin: z.string().max(300).optional().nullable(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminUserUpdateSchema = z.object({
  userId: idSchema,
  approvalStatus: z.enum(APPROVAL_STATUSES).optional(),
  roleCodes: z.array(z.enum(USER_ROLES)).optional(),
  isActive: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
