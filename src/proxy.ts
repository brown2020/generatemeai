import { NextRequest, NextResponse } from "next/server";
import { isProtectedRoute } from "@/constants/routes";

/**
 * Next.js 16 Proxy - handles route protection at the edge.
 * Replaces middleware.ts for better performance and security.
 *
 * This runs before the page renders, preventing flash of protected content.
 * Route definitions are in @/constants/routes.ts for single source of truth.
 *
 * Note: Static files and assets are filtered by the config.matcher below,
 * so this function only receives route requests that need protection checks.
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
