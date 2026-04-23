"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { processPaymentAndAddCredits } from "@/actions/processPayment";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Props = {
  payment_intent: string;
};

export default function PaymentSuccessPage({ payment_intent }: Props) {
  // Derive the "no payment intent" state from props during initial render so
  // the effect doesn't have to write state synchronously for that branch.
  const [message, setMessage] = useState(
    payment_intent ? "" : "No payment intent found"
  );
  const [loading, setLoading] = useState(!!payment_intent);
  const [created, setCreated] = useState(0);
  const [id, setId] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [creditsAdded, setCreditsAdded] = useState(0);

  const uid = useAuthStore((state) => state.uid);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const processedRef = useRef(false);

  useEffect(() => {
    if (!payment_intent || !uid || processedRef.current) return;
    processedRef.current = true;

    const handlePaymentSuccess = async () => {
      try {
        const result = await processPaymentAndAddCredits(payment_intent);

        if (!result.success) {
          setMessage(result.error);
          setLoading(false);
          return;
        }

        const data = result.data;
        setId(data.id);
        setAmount(data.amount);
        setCreated(data.created);
        setStatus(data.status);
        setCreditsAdded(data.creditsAdded);

        if (data.alreadyProcessed) {
          setMessage("Payment has already been processed.");
        } else {
          setMessage("Payment successful!");
        }

        // Refresh profile to pick up new credit balance
        await fetchProfile();
      } catch (error) {
        console.error("Error handling payment success:", error);
        setMessage("Error handling payment success");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [payment_intent, uid, fetchProfile]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="h-1 bg-linear-to-r from-green-400 to-emerald-500" />
        <div className="p-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-500 text-lg">Validating payment...</p>
            </div>
          ) : id ? (
            <div className="space-y-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thank you!</h1>
                <p className="text-gray-500 mt-1">
                  You successfully purchased credits
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-4xl font-bold text-gray-900">
                ${(amount / 100).toFixed(2)}
              </div>
              {creditsAdded > 0 && (
                <p className="text-green-600 font-medium">
                  +{creditsAdded} credits added to your account
                </p>
              )}
              <div className="text-sm text-gray-500 space-y-1">
                <p>ID: <span className="font-mono">{id}</span></p>
                <p>Date: {new Date(created).toLocaleString()}</p>
                <p>Status: <span className="capitalize">{status}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <p className="text-gray-700">{message}</p>
            </div>
          )}

          <Link
            href="/profile"
            className="mt-8 inline-flex items-center px-6 py-3 bg-blue-600 text-white 
              rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Account
          </Link>
        </div>
      </div>
    </main>
  );
}
