import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface ProcessedPaymentData {
  id: string;
  amount: number;
  created: number;
  status: string;
  creditsAdded: number;
  alreadyProcessed: boolean;
}

/**
 * Validates a succeeded PaymentIntent and applies credits atomically.
 * Idempotent on paymentIntentId — replays return alreadyProcessed: true.
 */
export function processPaymentAndAddCredits(
  paymentIntentId: string
): Promise<ActionResult<ProcessedPaymentData>> {
  return apiPost<ProcessedPaymentData>("/api/payments/process", {
    paymentIntentId,
  });
}
