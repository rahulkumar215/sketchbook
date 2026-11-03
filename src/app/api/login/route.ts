import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { jsonError, parseBody } from "@/lib/api";
import { appPassword } from "@/lib/env";
import {
  clearFailures,
  clientIp,
  recordFailure,
  retryAfterSeconds,
} from "@/lib/login-throttle";
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
  return timingSafeEqual(digest(attempt), digest(appPassword()));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tooManyAttempts(seconds: number): Response {
  const minutes = Math.ceil(seconds / 60);
  return Response.json(
    {
      error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    },
    { status: 429, headers: { "Retry-After": String(seconds) } },
  );
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, loginSchema);
  if (!parsed.ok) return parsed.response;

  // Checked before the password, so a locked-out IP learns nothing.
  const ip = clientIp(req);
  const wait = await retryAfterSeconds(ip);
  if (wait > 0) return tooManyAttempts(wait);

  if (!passwordMatches(parsed.data.password)) {
    await recordFailure(ip);
    await delay(1000); // also slows down one-at-a-time guessing
    return jsonError(401, "Wrong password");
  }
  await clearFailures(ip);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    await createSessionToken(),
    sessionCookieOptions,
  );
  return Response.json({ ok: true });
}
