import "server-only";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getAuthContext } from "@/utils/serverAuth";
import { AppError, ErrorCodes, RateLimitError } from "@/utils/errors";
import { consumeRate } from "@/utils/rateLimit";

export const GENERATION_RATE_LIMIT = 20;
export const GENERATION_RATE_WINDOW_MS = 60_000;

export class EmailVerificationRequiredError extends AppError {
  constructor() {
    super(
      "Verify your email before using platform credits. Resend the verification email from your profile.",
      ErrorCodes.AUTHORIZATION_FAILED,
      403
    );
    this.name = "EmailVerificationRequiredError";
  }
}

/**
 * Counts one generation attempt for this account and, when platform credits
 * would be spent, requires the Firebase token's email_verified claim.
 */
export async function assertGenerationAccess(
  uid: string,
  useCredits: boolean
): Promise<void> {
  const ref = adminDb.doc(`users/${uid}/rateLimit/generation`);
  const decision = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : undefined;
    const state =
      data && typeof data.windowStart === "number" && typeof data.count === "number"
        ? { windowStart: data.windowStart, count: data.count }
        : null;
    const next = consumeRate(state, Date.now(), GENERATION_RATE_LIMIT, GENERATION_RATE_WINDOW_MS);
    tx.set(ref, next.next);
    return next;
  });

  if (!decision.allowed) {
    throw new RateLimitError(
      "Too many generation requests. Please wait a minute and try again.",
      Math.ceil(decision.retryAfterMs / 1000)
    );
  }

  if (!useCredits) return;

  const { emailVerified } = await getAuthContext();
  if (!emailVerified) {
    throw new EmailVerificationRequiredError();
  }
}
