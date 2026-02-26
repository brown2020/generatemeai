import { create } from "zustand";
import { fetchPaymentsServer } from "@/actions/profileActions";
import { getAuthUidOrNull } from "./helpers";

export type PaymentType = {
  id: string;
  amount: number;
  createdAt: { toMillis: () => number } | null;
  status: string;
  mode: string;
  platform: string;
  productId: string;
  currency: string;
};

interface PaymentsStoreState {
  payments: PaymentType[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  fetchPayments: () => Promise<void>;
}

export const usePaymentsStore = create<PaymentsStoreState>((set) => ({
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  fetchPayments: async () => {
    const uid = getAuthUidOrNull();
    if (!uid) return;

    set({ paymentsLoading: true });

    try {
      const result = await fetchPaymentsServer();
      if (!result.success) {
        set({ paymentsError: result.error, paymentsLoading: false });
        return;
      }

      const payments = (result.data as PaymentType[]).sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );
      set({ payments, paymentsLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching payments";
      console.error("Error fetching payments:", errorMessage);
      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },
}));
