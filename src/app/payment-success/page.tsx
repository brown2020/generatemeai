import { Suspense } from "react";
import PaymentSuccessWrapper from "./PaymentSuccessWrapper";

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      }
    >
      <PaymentSuccessWrapper />
    </Suspense>
  );
}
