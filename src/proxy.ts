import { NextResponse, type NextRequest } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PATHS = new Set(["/login", "/api/login"]);

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await isValidSession(token)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.nextUrl);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Static icons/logo/manifest stay public so the login page can show them.
  // (Drawing images are served by /api, which stays protected.)
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|svg|webmanifest)$).*)",
  ],
};
