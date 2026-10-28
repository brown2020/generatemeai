import { cookies } from "next/headers";
import { z } from "zod";
import { authCookieName } from "@/constants/authCookie";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/server";

export const runtime = "nodejs";

const bodySchema = z.object({
  idToken: z.string().min(1, "Missing auth token"),
});

const SESSION_HEADER = "x-auth-session";
const MAX_AGE_SECONDS = 60 * 60;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

function refusesCrossSite(request: Request) {
  if (request.headers.get(SESSION_HEADER) !== "1") {
    return jsonError("Forbidden", "AUTHORIZATION_FAILED", 403);
  }
  return null;
}

/**
 * POST /api/auth/session
 * Verifies a Firebase ID token and stores it in an HttpOnly cookie.
 */
export async function POST(request: Request) {
  const denied = refusesCrossSite(request);
  if (denied) return denied;

  const { idToken } = await parseJsonBody(request, bodySchema);
  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return jsonError("Invalid auth token", "AUTHENTICATION_REQUIRED", 401);
  }

  const jar = await cookies();
  jar.set(authCookieName(), idToken, cookieOptions());
  return jsonOk({ ok: true });
}

/**
 * DELETE /api/auth/session
 * Clears the HttpOnly auth cookie.
 */
export async function DELETE(request: Request) {
  const denied = refusesCrossSite(request);
  if (denied) return denied;

  const jar = await cookies();
  jar.delete(authCookieName());
  return jsonOk({ ok: true });
}
