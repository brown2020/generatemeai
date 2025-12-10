"use client";

import PaymentSuccessPage from "@/components/PaymentSuccessPage";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const payment_intent = searchParams.get("payment_intent") || "";

  return <PaymentSuccessPage payment_intent={payment_intent} />;
}
