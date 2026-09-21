import type { NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { creditsForCatalogAmount } from "@/constants/creditPack";
import { STARTING_CREDITS } from "@/utils/creditCost";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
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

  const creditsToAdd = creditsForCatalogAmount(paymentIntent.amount);
  if (creditsToAdd === null) {
    return jsonError(
      "This payment does not match the published credit pack",
      "INVALID_INPUT"
    );
  }

  const paymentRef = adminDb.doc(FirestorePaths.userPayment(uid, paymentIntent.id));
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));

  const outcome = await adminDb.runTransaction(async (tx: Transaction) => {
    const existing = await tx.get(paymentRef);
    if (existing.exists && existing.data()?.status === "succeeded") {
      const createdAt = existing.data()?.createdAt as { toMillis?: () => number } | undefined;
      return {
        alreadyProcessed: true,
        creditsAdded: 0,
        amount: existing.data()?.amount ?? paymentIntent.amount,
        created:
          createdAt && typeof createdAt.toMillis === "function"
            ? createdAt.toMillis()
            : paymentIntent.created * 1000,
      };
    }

    const profileSnap = await tx.get(profileRef);
    const currentCredits = profileSnap.exists ? (profileSnap.data()?.credits ?? 0) : 0;
    if (profileSnap.exists) {
      tx.update(profileRef, { credits: currentCredits + creditsToAdd });
    } else {
      tx.set(profileRef, {
        credits: STARTING_CREDITS + creditsToAdd,
        useCredits: true,
      });
    }

    tx.set(paymentRef, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      credits: creditsToAdd,
      createdAt: FieldValue.serverTimestamp(),
      status: "succeeded",
      mode: "stripe",
      platform: "web",
      productId: "payment_gateway",
      currency: "$",
    });

    return {
      alreadyProcessed: false,
      creditsAdded: creditsToAdd,
      amount: paymentIntent.amount,
      created: paymentIntent.created * 1000,
    };
  });

  return jsonOk({
    id: paymentIntent.id,
    amount: outcome.amount,
    created: outcome.created,
    status: "succeeded",
    creditsAdded: outcome.creditsAdded,
    alreadyProcessed: outcome.alreadyProcessed,
  });
});
