import "server-only";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { creditsForCatalogAmount } from "@/constants/creditPack";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { STARTING_CREDITS } from "@/utils/creditCost";

export interface PackGrant {
  alreadyProcessed: boolean;
  creditsAdded: number;
  amount: number;
  created: number;
}

/**
 * Grants the published pack for a succeeded PaymentIntent. The payment
 * document id is the PaymentIntent id, and the existence check runs inside
 * the same transaction as the credit grant. Returns null when the amount is
 * not the published pack.
 */
export async function grantSucceededPack(
  uid: string,
  paymentIntent: Stripe.PaymentIntent
): Promise<PackGrant | null> {
  const creditsToAdd = creditsForCatalogAmount(paymentIntent.amount);
  if (creditsToAdd === null) return null;

  const paymentRef = adminDb.doc(FirestorePaths.userPayment(uid, paymentIntent.id));
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));

  return adminDb.runTransaction(async (tx: Transaction) => {
    const existing = await tx.get(paymentRef);
    if (existing.exists && existing.data()?.status === "succeeded") {
      const createdAt = existing.data()?.createdAt as { toMillis?: () => number } | undefined;
      return {
        alreadyProcessed: true,
        creditsAdded: 0,
        amount: (existing.data()?.amount as number | undefined) ?? paymentIntent.amount,
        created:
          createdAt && typeof createdAt.toMillis === "function"
            ? createdAt.toMillis()
            : paymentIntent.created * 1000,
      };
    }

    const profileSnap = await tx.get(profileRef);
    const storedCredits = profileSnap.exists ? profileSnap.data()?.credits : 0;
    const currentCredits = typeof storedCredits === "number" ? storedCredits : 0;
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
}
