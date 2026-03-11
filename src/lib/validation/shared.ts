import { z } from "zod";

export const idSchema = z.string().min(8);
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);
