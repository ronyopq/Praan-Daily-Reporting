import { drizzle } from "drizzle-orm/d1";

import * as schema from "../../src/db/schema";
import type { AppBindings } from "./env";

export function getDb(env: AppBindings) {
  return drizzle(env.DB, { schema });
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
