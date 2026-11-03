import { jwtVerify, SignJWT } from "jose";
import { appPassword, sessionSecret } from "@/lib/env";

export const SESSION_COOKIE = "sketchbook_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * The signing key mixes in a hash of APP_PASSWORD, so changing the password
 * signs out every existing session (as does rotating SESSION_SECRET).
 * Web Crypto rather than node:crypto, so this runs in any runtime.
 */
async function secretKey(): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(appPassword()),
  );
  return encoder.encode(`${sessionSecret()}:${toHex(digest)}`);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ sub: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(await secretKey());
}

export async function isValidSession(token: string | undefined) {
  if (!token) return false;
  // Outside the try: a missing or weak secret must fail loudly, not read
  // as "logged out".
  const key = await secretKey();
  try {
    await jwtVerify(token, key, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
