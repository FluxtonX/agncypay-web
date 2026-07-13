import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection proxy for AgncyPay.
 * (Next.js 16 renamed "middleware" to "proxy")
 *
 * Uses a lightweight session cookie (`agncypay_auth_session`) that is set
 * client-side after a successful Firebase login. This cookie simply signals
 * "a user is authenticated" — the actual auth token lives in Firebase's
 * IndexedDB on the client.
 *
 * Protected routes redirect to /auth/login when the cookie is missing.
 * Public routes are always accessible.
 */

// Routes that are always accessible without authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-email",
];

// Route prefixes that are always public
const PUBLIC_PREFIXES = [
  "/auth/",
  "/guest/",
  "/pay/",
  "/request/",
  "/receipt/",
  "/api/",
];

function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Prefix matches
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }

  // Static assets and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return true;
  }

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for the auth session cookie
  const authSession = request.cookies.get("agncypay_auth_session");

  if (!authSession?.value) {
    // User is not authenticated — redirect to login with return path
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
