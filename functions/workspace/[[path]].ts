import { readSessionFromRequest } from "../_shared/auth";

export const onRequest: PagesFunction = async (context) => {
  const { sessionUser } = await readSessionFromRequest(context.request, context.env as never);

  if (!sessionUser) {
    return Response.redirect(new URL("/login", context.request.url), 302);
  }

  return context.next();
};
