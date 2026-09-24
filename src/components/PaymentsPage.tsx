"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function subscribeToWebView() {
  return () => {};
}

function readNativeWebView() {
  return typeof window.ReactNativeWebView !== "undefined";
}

function formatPaymentDate(createdAt: unknown): string {
  let date: Date | null = null;
  if (createdAt && typeof createdAt === "object" && "toDate" in createdAt) {
    date = (createdAt as { toDate: () => Date }).toDate();
  } else if (createdAt && typeof createdAt === "object" && "_seconds" in createdAt) {
    date = new Date((createdAt as { _seconds: number })._seconds * 1000);
  }
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

export default function PaymentsPage() {
  const uid = useAuthStore((state) => state.uid);
  const { payments, paymentsLoading, paymentsError, fetchPayments } =
    usePaymentsStore();
  const profile = useProfileStore((state) => state.profile);
  const router = useRouter();

  useEffect(() => {
    if (uid) {
      fetchPayments();
    }
  }, [uid, fetchPayments]);

  const handleBuyCredits = () => {
    router.push("/payment-attempt");
  };

  const isNativeApp = useSyncExternalStore(
    subscribeToWebView,
    readNativeWebView,
    () => false
  );

  if (isNativeApp) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Available Credits</h3>
            <p className="mt-1 text-2xl font-semibold text-blue-700">
              {Math.round(profile.credits || 0)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBuyCredits}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Buy Credits
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Recent Transactions
        </h3>
        {paymentsLoading ? (
          <div className="text-center py-4 text-gray-600" role="status">Loading transactions…</div>
        ) : paymentsError ? (
          <div className="text-center py-4 text-red-700" role="alert">
            We couldn&apos;t load your transactions. Reload the page to try again.
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center py-4 text-sm text-gray-600">
            No purchases yet. Credit packs you buy will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPaymentDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tabular-nums">
                      {payment.currency || '$'}{(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${payment.status === 'succeeded' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
