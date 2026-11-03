import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { jsonError, parseBody } from "@/lib/api";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";
import { loginSchema } from "@/lib/validators";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time compare so response timing doesn't leak the password. */
function passwordMatches(attempt: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD is not set");
  return timingSafeEqual(digest(attempt), digest(expected));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const parsed = await parseBody(req, loginSchema);
  if (!parsed.ok) return parsed.response;

  if (!passwordMatches(parsed.data.password)) {
    await delay(1000); // slows down password guessing
    return jsonError(401, "Wrong password");
  }
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    await createSessionToken(),
    sessionCookieOptions,
  );
  return Response.json({ ok: true });
}
