import { Context } from "hono";

export function ok<T>(c: Context, payload: T, status = 200) {
  return c.json(payload, status as never);
}

export function fail(c: Context, error: string, status = 400, details?: unknown) {
  return c.json(
    {
      error,
      details,
    },
    status as never,
  );
}

export async function parseBody<T>(c: Context) {
  try {
    return (await c.req.json()) as T;
  } catch {
    return null;
  }
}
