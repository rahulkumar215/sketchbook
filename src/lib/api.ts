import { cookies } from "next/headers";
import type { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

function isNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * Wraps a route handler: rejects requests without a valid session (defence
 * in depth on top of src/proxy.ts) and turns thrown errors into JSON.
 */
export function withAuth<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!(await isValidSession(token))) {
      return jsonError(401, "Not logged in");
    }
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (isNotFound(error)) return jsonError(404, "Not found");
      console.error(error);
      return jsonError(500, "Something went wrong on the server");
    }
  };
}

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

export async function parseBody<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<Parsed<z.output<S>>> {
  const raw: unknown = await req.json().catch(() => undefined);
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request";
    return { ok: false, response: jsonError(400, message) };
  }
  return { ok: true, data: result.data };
}
