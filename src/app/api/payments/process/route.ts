import type { NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  paymentIntentId: z.string().startsWith("pi_", "Invalid payment intent ID"),
});

/**
 * POST /api/payments/process
 * Validates a succeeded PaymentIntent, atomically records the payment, and
 * credits the user. Idempotent on paymentIntentId — replays report
 * alreadyProcessed: true.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { paymentIntentId } = await parseJsonBody(request, bodySchema);

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return jsonError("Payment was not successful", "GENERATION_FAILED", 402);
  }

  const paymentsRef = adminDb.collection(FirestorePaths.userPayments(uid));
  const existingQuery = await paymentsRef
    .where("id", "==", paymentIntent.id)
    .where("status", "==", "succeeded")
    .limit(1)
    .get();

  if (!existingQuery.empty) {
    const existing = existingQuery.docs[0].data();
    return jsonOk({
      id: paymentIntent.id,
      amount: existing.amount,
      created: existing.createdAt?.toMillis() ?? paymentIntent.created * 1000,
      status: "succeeded",
      creditsAdded: 0,
      alreadyProcessed: true,
    });
  }

  const creditsToAdd = paymentIntent.amount + 1;

  await adminDb.runTransaction(async (tx: Transaction) => {
    const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
    const profileSnap = await tx.get(profileRef);

    const paymentDocRef = paymentsRef.doc();
    tx.set(paymentDocRef, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      createdAt: FieldValue.serverTimestamp(),
      status: paymentIntent.status,
      mode: "stripe",
      platform: "web",
      productId: "payment_gateway",
      currency: "$",
    });

    if (profileSnap.exists) {
      tx.update(profileRef, { credits: FieldValue.increment(creditsToAdd) });
    } else {
      tx.set(profileRef, { credits: creditsToAdd });
    }
  });

  return jsonOk({
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    created: paymentIntent.created * 1000,
    status: paymentIntent.status,
    creditsAdded: creditsToAdd,
    alreadyProcessed: false,
  });
});
