import { NextRequest, NextResponse } from "next/server";
import { isProtectedRoute } from "@/constants/routes";

/**
 * Next.js 16 Proxy - handles route protection at the edge.
 * Replaces middleware.ts for better performance and security.
 *
 * This runs before the page renders, preventing flash of protected content.
 * Route definitions are in @/constants/routes.ts for single source of truth.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

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
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
