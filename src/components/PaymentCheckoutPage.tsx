"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/actions/paymentActions";
import convertToSubcurrency from "@/utils/convertToSubcurrency";
import { CREDIT_PACK } from "@/constants/creditPack";
import { ClipLoader } from "react-spinners";

type Props = { amount: number };

export default function PaymentCheckoutPage({ amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function initializePayment() {
      try {
        const result = await createPaymentIntent(convertToSubcurrency(amount));
        if (ignore) return;

        if (result.success) {
          setClientSecret(result.data.clientSecret);
        } else {
          setErrorMessage(result.error);
        }
      } catch (error: unknown) {
        if (ignore) return;
        if (error instanceof Error) {
          setErrorMessage(
            error.message || "Failed to initialize payment. Please try again."
          );
        } else {
          setErrorMessage("An unknown error occurred.");
        }
      }
    }

    initializePayment();

    return () => {
      ignore = true;
    };
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment failed");
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${amount}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(
          error.message || "Payment validation failed. Please try again."
        );
        console.error("Payment validation error:", error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
        console.error("Unknown error occurred during payment validation.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <ClipLoader color="#4A90E2" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center max-w-6xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Buy {CREDIT_PACK.credits.toLocaleString("en-US")} credits
        </h1>
        <p className="mt-2 text-lg text-gray-700">
          One-time purchase: <span className="font-semibold tabular-nums">${amount}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md w-full">
        {clientSecret && <PaymentElement />}

        {errorMessage && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="text-white w-full p-4 bg-blue-600 hover:bg-blue-700 mt-4 rounded-lg font-semibold disabled:opacity-50"
        >
          {!loading ? `Pay $${amount}` : "Processing…"}
        </button>
      </form>
    </div>
  );
}
