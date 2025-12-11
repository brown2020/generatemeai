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

/**
 * Updates user details in Firestore (fire-and-forget).
 * Logs errors but doesn't throw to avoid breaking the UI.
 */
async function syncAuthToFirestore(
  details: Partial<AuthState>,
  uid: string
): Promise<void> {
  if (!uid) return;

  try {
    const userRef = doc(db, `users/${uid}`);

    // Only include serializable data (exclude functions)
    const serializableDetails: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details)) {
      if (typeof value !== "function") {
        serializableDetails[key] = value;
      }
    }

    await setDoc(
      userRef,
      { ...serializableDetails, lastSignIn: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error("Error syncing auth to Firestore:", error);
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...defaultAuthState,

  setAuthDetails: (details: Partial<AuthState>) => {
    // Update local state synchronously
    set(details);

    // Sync to Firestore asynchronously (fire-and-forget)
    const uid = details.uid ?? get().uid;
    if (uid) {
      syncAuthToFirestore(details, uid);
    }
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),
}));
