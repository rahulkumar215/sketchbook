import { db } from "@/lib/db";

/**
 * Per-IP limit on failed sign-ins, kept in the database so it holds across
 * serverless instances (an in-memory counter resets with each one).
 * Per-IP only, on purpose: a global limit would let anyone lock the owner
 * out by failing on purpose.
 */
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const KEEP_MS = 24 * 60 * 60 * 1000;

/**
 * The caller's IP. On Vercel, x-forwarded-for is set by the platform and
 * can't be spoofed; behind another proxy, make sure it sets this header.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

/** Seconds until this IP may try again, or 0 if it may try now. */
export async function retryAfterSeconds(ip: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recent = await db().loginFailure.findMany({
    where: { ip, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  if (recent.length < MAX_FAILURES) return 0;
  // Locked until the oldest failure that still counts leaves the window.
  const unlocksAt =
    recent[recent.length - MAX_FAILURES].createdAt.getTime() + WINDOW_MS;
  return Math.max(1, Math.ceil((unlocksAt - Date.now()) / 1000));
}

export async function recordFailure(ip: string): Promise<void> {
  const client = db();
  await client.loginFailure.create({ data: { ip } });
  // Opportunistic cleanup, so the table never grows without bound.
  await client.loginFailure.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - KEEP_MS) } },
  });
}

export async function clearFailures(ip: string): Promise<void> {
  await db().loginFailure.deleteMany({ where: { ip } });
}
