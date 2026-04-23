import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  paymentIntentId: z
    .string()
    .startsWith("pi_", "Invalid payment intent ID"),
});

/**
 * POST /api/payments/validate
 * Validates a completed Stripe PaymentIntent.
 */
export const POST = withAuth(async (_uid, request: NextRequest) => {
  const { paymentIntentId } = await parseJsonBody(request, bodySchema);

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return jsonError("Payment was not successful", "GENERATION_FAILED", 402);
  }

  return jsonOk({
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    created: paymentIntent.created,
    status: paymentIntent.status,
    client_secret: paymentIntent.client_secret,
    currency: paymentIntent.currency,
    description: paymentIntent.description,
  });
});
