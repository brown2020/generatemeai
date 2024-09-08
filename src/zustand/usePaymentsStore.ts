import { create } from "zustand";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { db } from "@/firebase/firebaseClient";

export type PaymentType = {
  id: string;
  amount: number;
  createdAt: Timestamp | null;
  status: string;
};

interface PaymentsStoreState {
  payments: PaymentType[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<PaymentType, "createdAt">) => Promise<void>;
  checkIfPaymentProcessed: (paymentId: string) => Promise<PaymentType | null>;
}

export const usePaymentsStore = create<PaymentsStoreState>((set) => ({
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  fetchPayments: async () => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      console.error("Invalid UID for fetchPayments");
      return;
    }

    set({ paymentsLoading: true });

    try {
      const payments = await fetchUserPayments(uid);
      set({ payments, paymentsLoading: false });
    } catch (error) {
      handleError(set, error, "Error fetching payments");
    }
  },

  addPayment: async (payment) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      console.error("Invalid UID for addPayment");
      return;
    }

    set({ paymentsLoading: true });

    try {
      const paymentExists = await checkPaymentExists(uid, payment.id);
      if (paymentExists) {
        toast.error("Payment with this ID already exists.");
        set({ paymentsLoading: false });
        return;
      }

      const newPayment = await createPayment(uid, payment);
      set((state) => {
        const updatedPayments = sortPayments([...state.payments, newPayment]);
        return { payments: updatedPayments, paymentsLoading: false };
      });

      toast.success("Payment added successfully.");
    } catch (error) {
      handleError(set, error, "Error adding payment");
    }
  },

  checkIfPaymentProcessed: async (paymentId) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return null;
    return await findProcessedPayment(uid, paymentId);
  },
}));

// Helper function to fetch user payments
async function fetchUserPayments(uid: string): Promise<PaymentType[]> {
  const q = query(collection(db, "users", uid, "payments"));
  const querySnapshot = await getDocs(q);
  const payments = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    amount: doc.data().amount,
    createdAt: doc.data().createdAt,
    status: doc.data().status,
  }));

  return sortPayments(payments);
}

// Helper function to check if payment exists
async function checkPaymentExists(
  uid: string,
  paymentId: string
): Promise<boolean> {
  const q = query(
    collection(db, "users", uid, "payments"),
    where("id", "==", paymentId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Helper function to create a new payment
async function createPayment(
  uid: string,
  payment: Omit<PaymentType, "createdAt">
): Promise<PaymentType> {
  const newPaymentDoc = await addDoc(collection(db, "users", uid, "payments"), {
    id: payment.id,
    amount: payment.amount,
    createdAt: Timestamp.now(),
    status: payment.status,
  });

  return {
    id: newPaymentDoc.id,
    amount: payment.amount,
    createdAt: Timestamp.now(),
    status: payment.status,
  };
}

// Helper function to find a processed payment
async function findProcessedPayment(
  uid: string,
  paymentId: string
): Promise<PaymentType | null> {
  const paymentsRef = collection(db, "users", uid, "payments");
  const q = query(
    paymentsRef,
    where("id", "==", paymentId),
    where("status", "==", "succeeded")
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as PaymentType;
  }

  return null;
}

// Helper function to sort payments by createdAt
function sortPayments(payments: PaymentType[]): PaymentType[] {
  return payments.sort(
    (a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
  );
}

// Helper function to handle errors with correct typing for Zustand set function
function handleError(
  set: (
    partial:
      | Partial<PaymentsStoreState>
      | ((state: PaymentsStoreState) => Partial<PaymentsStoreState>),
    replace?: boolean
  ) => void,
  error: unknown,
  defaultMessage: string
): void {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  console.error(defaultMessage, errorMessage);
  set({ paymentsError: errorMessage, paymentsLoading: false });
}
