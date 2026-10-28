import type { NextRequest } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { errorToResponse, jsonError, jsonOk, parseJsonBody } from "@/lib/api/server";
import { isImageLocked, toViewerImageJson } from "@/utils/imageJson";
import { RateLimitError } from "@/utils/errors";
import { consumeRate, type RateWindow } from "@/utils/rateLimit";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ imageId: string }>;
}

const bodySchema = z.object({
  password: z.string().min(1).max(200),
});

const UNLOCK_LIMIT = 8;
const UNLOCK_WINDOW_MS = 60_000;
const unlockWindows = new Map<string, RateWindow>();

export function resetUnlockWindows(): void {
  unlockWindows.clear();
}

function secretsMatch(stored: string, attempt: string): boolean {
  const left = Buffer.from(stored);
  const right = Buffer.from(attempt);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * POST /api/images/:imageId/access
 * Returns a password-protected public image after the password matches.
 * The stored password is never included in the response.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { imageId } = await context.params;
    const { password } = await parseJsonBody(request, bodySchema);

    const decision = consumeRate(
      unlockWindows.get(imageId) ?? null,
      Date.now(),
      UNLOCK_LIMIT,
      UNLOCK_WINDOW_MS
    );
    unlockWindows.set(imageId, decision.next);
    if (!decision.allowed) {
      throw new RateLimitError("Too many password attempts. Please wait and try again.");
    }

    const publicSnap = await adminDb.doc(FirestorePaths.publicImage(imageId)).get();
    if (!publicSnap.exists) {
      return jsonError("Image not found", "NOT_FOUND", 404);
    }

    const data = publicSnap.data();
    if (isImageLocked(data)) {
      const stored = data?.password;
      if (typeof stored !== "string" || !secretsMatch(stored, password)) {
        return jsonError("That password doesn't match.", "AUTHORIZATION_FAILED", 401);
      }
    }

    return jsonOk({
      data: toViewerImageJson(imageId, data, false),
      isOwner: false,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
