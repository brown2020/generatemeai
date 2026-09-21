import type { NextRequest } from "next/server";
import { z } from "zod";
import { CREDIT_PACK } from "@/constants/creditPack";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer"),
});

/**
 * POST /api/payments/intent
 * Creates a Stripe PaymentIntent for the published credit pack only.
 * The intent is bound to the signed-in user so another account cannot claim it.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { amount } = await parseJsonBody(request, bodySchema);

  if (amount !== CREDIT_PACK.amountCents) {
    return jsonError(
      "Only the published credit pack can be purchased",
      "INVALID_INPUT"
    );
  }

  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
  if (!product) {
    return jsonError("Stripe product name is not defined", "INVALID_INPUT");
  }

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: CREDIT_PACK.amountCents,
    currency: "usd",
    metadata: {
      product,
      uid,
      credits: String(CREDIT_PACK.credits),
    },
    description: `Payment for product ${product}`,
  });

  if (!paymentIntent.client_secret) {
    return jsonError("Failed to create payment intent", "GENERATION_FAILED", 502);
  }

  return jsonOk({ clientSecret: paymentIntent.client_secret });
});
