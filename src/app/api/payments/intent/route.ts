import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer"),
});

/**
 * POST /api/payments/intent
 * Creates a Stripe PaymentIntent for the authenticated user.
 */
export const POST = withAuth(async (_uid, request: NextRequest) => {
  const { amount } = await parseJsonBody(request, bodySchema);

  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
  if (!product) {
    return jsonError("Stripe product name is not defined", "INVALID_INPUT");
  }

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { product },
    description: `Payment for product ${product}`,
  });

  if (!paymentIntent.client_secret) {
    return jsonError("Failed to create payment intent", "GENERATION_FAILED", 502);
  }

  return jsonOk({ clientSecret: paymentIntent.client_secret });
});
