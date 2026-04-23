import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface PaymentIntentData {
  clientSecret: string;
}

interface ValidatedPaymentData {
  id: string;
  amount: number;
  created: number;
  status: string;
  client_secret: string | null;
  currency: string;
  description: string | null;
}

/**
 * Creates a Stripe PaymentIntent for the authenticated user.
 *
 * @param amount - Amount in cents
 */
export function createPaymentIntent(
  amount: number
): Promise<ActionResult<PaymentIntentData>> {
  return apiPost<PaymentIntentData>("/api/payments/intent", { amount });
}

/**
 * Validates a completed Stripe PaymentIntent without applying credits.
 */
export function validatePaymentIntent(
  paymentIntentId: string
): Promise<ActionResult<ValidatedPaymentData>> {
  return apiPost<ValidatedPaymentData>("/api/payments/validate", {
    paymentIntentId,
  });
}
