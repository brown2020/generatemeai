import { db } from "@/firebase/firebaseClient";
import { Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { create } from "zustand";

/**
 * Auth state interface - represents authentication-related user data.
 * Note: Credits are managed in useProfileStore to avoid duplication.
 */
interface AuthState {
  uid: string;
  firebaseUid: string;
  authEmail: string;
  authDisplayName: string;
  authPhotoUrl: string;
  authEmailVerified: boolean;
  authReady: boolean;
  authPending: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
  isInvited: boolean;
  lastSignIn: Timestamp | null;
  premium: boolean;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  uid: "",
  firebaseUid: "",
  authEmail: "",
  authDisplayName: "",
  authPhotoUrl: "",
  authEmailVerified: false,
  authReady: false,
  authPending: false,
  isAdmin: false,
  isAllowed: false,
  isInvited: false,
  lastSignIn: null,
  premium: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...defaultAuthState,

  setAuthDetails: async (details: Partial<AuthState>) => {
    const { ...oldState } = get();
    const newState = { ...oldState, ...details };
    set(newState);
    await updateUserDetailsInFirestore(newState, get().uid);
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),
}));

async function updateUserDetailsInFirestore(
  details: Partial<AuthState>,
  uid: string
) {
  if (uid) {
    const userRef = doc(db, `users/${uid}`);

    // Sanitize the details object to exclude any functions
    const sanitizedDetails = { ...details };

    // Remove any unexpected functions or properties
    Object.keys(sanitizedDetails).forEach((key) => {
      if (typeof sanitizedDetails[key as keyof AuthState] === "function") {
        delete sanitizedDetails[key as keyof AuthState];
      }
    });

    try {
      await setDoc(
        userRef,
        { ...sanitizedDetails, lastSignIn: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating auth details in Firestore:", error);
    }
  }
}
