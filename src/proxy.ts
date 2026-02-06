import { NextRequest, NextResponse } from "next/server";
import { isProtectedRoute } from "@/constants/routes";

/**
 * Next.js 16 Proxy - UX-level route guard at the edge.
 *
 * IMPORTANT: This is a "soft gate" only — it checks for the existence of an
 * auth cookie to prevent unauthenticated users from seeing a flash of
 * protected content. It does NOT verify the token cryptographically.
 *
 * Real security is enforced in Server Actions via `authenticateAction()`
 * (see src/utils/serverAuth.ts), which verifies the Firebase ID token with
 * the Admin SDK on every mutation.
 *
 * Route definitions are in @/constants/routes.ts for single source of truth.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    // Check for auth cookie (set by useAuthToken hook)
    const authCookie = request.cookies.get(
      process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken"
    );

    if (!authCookie?.value) {
      // Redirect to home page for unauthenticated users
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
