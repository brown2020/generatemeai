"use server";

import Stripe from "stripe";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { FieldValue } from "firebase-admin/firestore";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  AuthenticationError,
} from "@/utils/errors";
import { authenticateAction } from "@/utils/serverAuth";

interface ProcessedPaymentData {
  id: string;
  amount: number;
  created: number;
  status: string;
  creditsAdded: number;
  alreadyProcessed: boolean;
}

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not configured");
  }
  return new Stripe(key);
}

/**
 * Validates a Stripe payment and atomically adds credits + records payment server-side.
 * Prevents double-processing by checking if payment ID already exists.
 */
export async function processPaymentAndAddCredits(
  paymentIntentId: string
): Promise<ActionResult<ProcessedPaymentData>> {
  try {
    const uid = await authenticateAction();

    if (!paymentIntentId || !paymentIntentId.startsWith("pi_")) {
      return errorResult("Invalid payment intent ID", "INVALID_INPUT");
    }

    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return errorResult("Payment was not successful", "GENERATION_FAILED");
    }

    const paymentsRef = adminDb.collection(FirestorePaths.userPayments(uid));
    const existingQuery = await paymentsRef
      .where("id", "==", paymentIntent.id)
      .where("status", "==", "succeeded")
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const existing = existingQuery.docs[0].data();
      return successResult({
        id: paymentIntent.id,
        amount: existing.amount,
        created: existing.createdAt?.toMillis() ?? paymentIntent.created * 1000,
        status: "succeeded",
        creditsAdded: 0,
        alreadyProcessed: true,
      });
    }

    const creditsToAdd = paymentIntent.amount + 1;

    // Atomically: record payment + add credits in a transaction
    await adminDb.runTransaction(async (tx: any) => {
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
        tx.update(profileRef, {
          credits: FieldValue.increment(creditsToAdd),
        });
      } else {
        tx.set(profileRef, { credits: creditsToAdd });
      }
    });

    return successResult({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      created: paymentIntent.created * 1000,
      status: paymentIntent.status,
      creditsAdded: creditsToAdd,
      alreadyProcessed: false,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    console.error("Error processing payment:", getErrorMessage(error));
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}
