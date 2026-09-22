"use client";

import Link from "next/link";
import PaymentCheckoutPage from "@/components/PaymentCheckoutPage";
import { CREDIT_PACK } from "@/constants/creditPack";
import convertToSubcurrency from "@/utils/convertToSubcurrency";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY?.trim();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function PaymentAttempt() {
  const amount = CREDIT_PACK.displayDollars;

  if (!stripePromise) {
    // Soft-skip when Actions secrets omit Stripe (CI / local without payments).
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-6 text-center">
        <h1 className="text-2xl font-semibold">Payments unavailable</h1>
        <p className="text-sm text-gray-600">
          Stripe is not configured in this environment. Credit purchase is disabled until
          NEXT_PUBLIC_STRIPE_KEY is set.
        </p>
        <Link href="/profile" className="btn-primary">
          Back to profile
        </Link>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: convertToSubcurrency(amount),
        currency: "usd",
      }}
    >
      <PaymentCheckoutPage amount={amount} />
    </Elements>
  );
}
