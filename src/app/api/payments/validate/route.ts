import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { getStripeClient } from "@/lib/stripe";
import { AuthorizationError } from "@/utils/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  paymentIntentId: z
    .string()
    .startsWith("pi_", "Invalid payment intent ID"),
});

/**
 * POST /api/payments/validate
 * Confirms a succeeded PaymentIntent belongs to the caller.
 * The client secret stays on the intent-creation response.
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

  return jsonOk({
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    created: paymentIntent.created,
    status: paymentIntent.status,
    currency: paymentIntent.currency,
    description: paymentIntent.description,
  });
});
