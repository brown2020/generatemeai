import { jsonError, jsonOk } from "@/lib/api/server";
import { grantSucceededPack } from "@/lib/grantCredits";
import { getStripeClient } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * POST /api/payments/webhook
 * Grants the published pack when Stripe reports payment_intent.succeeded.
 * Unsigned or unconfigured calls are rejected and do not touch balances.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return jsonError("Stripe webhooks are not configured", "INVALID_INPUT", 503);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError("Missing Stripe signature", "AUTHENTICATION_REQUIRED", 401);
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = getStripeClient().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return jsonError("Invalid Stripe signature", "AUTHENTICATION_REQUIRED", 400);
  }

  if (event.type !== "payment_intent.succeeded") {
    return jsonOk({ received: true });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const uid = paymentIntent.metadata?.uid;
  if (!uid || paymentIntent.status !== "succeeded") {
    return jsonOk({ received: true, ignored: true });
  }

  const outcome = await grantSucceededPack(uid, paymentIntent);
  if (!outcome) {
    return jsonOk({ received: true, ignored: true });
  }

  return jsonOk({ received: true, alreadyProcessed: outcome.alreadyProcessed });
}
