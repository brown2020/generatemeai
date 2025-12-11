"use server";

import Stripe from "stripe";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
} from "@/utils/errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Payment intent data returned on successful creation.
 */
interface PaymentIntentData {
  clientSecret: string;
}

/**
 * Validated payment data returned on successful validation.
 */
interface ValidatedPaymentData {
  id: string;
  amount: number;
  created: number;
  status: string;
  client_secret: string | null;
  currency: string;
  description: string | null;
}

/**
 * Creates a Stripe payment intent.
 *
 * @param amount - Amount in cents
 * @returns ActionResult with client secret or error
 */
export async function createPaymentIntent(
  amount: number
): Promise<ActionResult<PaymentIntentData>> {
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

  try {
    if (!product) {
      return errorResult("Stripe product name is not defined", "INVALID_INPUT");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { product },
      description: `Payment for product ${process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME}`,
    });

    if (!paymentIntent.client_secret) {
      return errorResult(
        "Failed to create payment intent",
        "GENERATION_FAILED"
      );
    }

    return successResult({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Validates a Stripe payment intent.
 *
 * @param paymentIntentId - The payment intent ID to validate
 * @returns ActionResult with payment data or error
 */
export async function validatePaymentIntent(
  paymentIntentId: string
): Promise<ActionResult<ValidatedPaymentData>> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return errorResult("Payment was not successful", "GENERATION_FAILED");
    }

    return successResult({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      created: paymentIntent.created,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
      currency: paymentIntent.currency,
      description: paymentIntent.description,
    });
  } catch (error) {
    console.error("Error validating payment intent:", error);
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}
