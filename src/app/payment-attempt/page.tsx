"use client";

import PaymentCheckoutPage from "@/components/PaymentCheckoutPage";
import { CREDIT_PACK } from "@/constants/creditPack";
import convertToSubcurrency from "@/utils/convertToSubcurrency";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

if (process.env.NEXT_PUBLIC_STRIPE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function PaymentAttempt() {
  const amount = CREDIT_PACK.displayDollars;

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
