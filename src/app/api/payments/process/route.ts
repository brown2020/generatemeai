import type { NextRequest } from "next/server";
import { z } from "zod";
import { creditsForCatalogAmount } from "@/constants/creditPack";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { grantSucceededPack } from "@/lib/grantCredits";
import { getStripeClient } from "@/lib/stripe";
import { AuthorizationError } from "@/utils/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  paymentIntentId: z.string().startsWith("pi_", "Invalid payment intent ID"),
});

/**
 * POST /api/payments/process
 * Grants the catalog credit pack for a succeeded PaymentIntent owned by
 * the caller. The payment document id is the PaymentIntent id, and the
 * existence check runs inside the same transaction as the credit grant.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { paymentIntentId } = await parseJsonBody(request, bodySchema);

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.metadata?.uid !== uid) {
    throw new AuthorizationError("This payment belongs to another account.");
  }

  if (paymentIntent.status !== "succeeded") {
    return jsonError("Payment was not successful", "GENERATION_FAILED", 402);
  }

  const outcome = await grantSucceededPack(uid, paymentIntent);
  if (!outcome || creditsForCatalogAmount(paymentIntent.amount) === null) {
    return jsonError(
      "This payment does not match the published credit pack",
      "INVALID_INPUT"
    );
  }

  return jsonOk({
    id: paymentIntent.id,
    amount: outcome.amount,
    created: outcome.created,
    status: "succeeded",
    creditsAdded: outcome.creditsAdded,
    alreadyProcessed: outcome.alreadyProcessed,
  });
});
