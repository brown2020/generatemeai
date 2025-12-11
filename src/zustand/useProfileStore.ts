import { create } from "zustand";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseClient";
import { deleteUser, getAuth } from "firebase/auth";
import { getAuthState, getAuthUidOrNull } from "./helpers";

export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
  fireworks_api_key: string;
  openai_api_key: string;
  stability_api_key: string;
  bria_api_key: string;
  did_api_key: string;
  replicate_api_key: string;
  selectedAvatar: string;
  selectedTalkingPhoto: string;
  useCredits: boolean;
  runway_ml_api_key: string;
  ideogram_api_key: string;
}

const DEFAULT_CREDITS = 1000;
const MIN_CREDITS_THRESHOLD = 100;

const defaultProfile: ProfileType = {
  email: "",
  contactEmail: "",
  displayName: "",
  photoUrl: "",
  emailVerified: false,
  credits: DEFAULT_CREDITS,
  fireworks_api_key: "",
  openai_api_key: "",
  stability_api_key: "",
  bria_api_key: "",
  did_api_key: "",
  replicate_api_key: "",
  selectedAvatar: "",
  selectedTalkingPhoto: "",
  useCredits: true,
  runway_ml_api_key: "",
  ideogram_api_key: "",
};

interface ProfileState {
  profile: ProfileType;
  fetchProfile: () => Promise<void>;
  updateProfile: (newProfile: Partial<ProfileType>) => Promise<void>;
  minusCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

/**
 * Creates a profile by merging defaults with auth state and optional existing data.
 */
const createProfileFromAuth = (
  existingProfile?: Partial<ProfileType>
): ProfileType => {
  const { authEmail, authDisplayName, authPhotoUrl, authEmailVerified } =
    getAuthState();

  const baseProfile = existingProfile
    ? { ...defaultProfile, ...existingProfile }
    : { ...defaultProfile };

  // Ensure minimum credits
  const credits =
    baseProfile.credits >= MIN_CREDITS_THRESHOLD
      ? baseProfile.credits
      : DEFAULT_CREDITS;

  return {
    ...baseProfile,
    credits,
    email: authEmail || baseProfile.email,
    contactEmail: baseProfile.contactEmail || authEmail || "",
    displayName: baseProfile.displayName || authDisplayName || "",
    photoUrl: baseProfile.photoUrl || authPhotoUrl || "",
    emailVerified: authEmailVerified || baseProfile.emailVerified,
  };
};

/**
 * Updates credits in Firestore.
 */
async function updateCredits(uid: string, credits: number): Promise<void> {
  const userRef = doc(db, `users/${uid}/profile/userData`);
  await updateDoc(userRef, { credits });
}

/**
 * Logs profile errors consistently.
 */
function handleProfileError(action: string, error: unknown): void {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
  console.error(`Error ${action}:`, errorMessage);
}

const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,

  fetchProfile: async () => {
    const uid = getAuthUidOrNull();
    if (!uid) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      const docSnap = await getDoc(userRef);

      const newProfile = createProfileFromAuth(
        docSnap.exists() ? (docSnap.data() as ProfileType) : undefined
      );

      await setDoc(userRef, newProfile);
      set({ profile: newProfile });
    } catch (error) {
      handleProfileError("fetching or creating profile", error);
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>) => {
    const uid = getAuthUidOrNull();
    if (!uid) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      const updatedProfile = { ...get().profile, ...newProfile };

      set({ profile: updatedProfile });
      await updateDoc(userRef, updatedProfile);
    } catch (error) {
      handleProfileError("updating profile", error);
    }
  },

  deleteAccount: async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const uid = getAuthUidOrNull();

    if (!uid || !currentUser) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      await deleteDoc(userRef);
      await deleteUser(currentUser);
    } catch (error) {
      handleProfileError("deleting account", error);
    }
  },

  minusCredits: async (amount: number) => {
    const uid = getAuthUidOrNull();
    if (!uid) return false;

    const profile = get().profile;
    if (profile.credits < amount) return false;

    try {
      const newCredits = profile.credits - amount;
      await updateCredits(uid, newCredits);
      set({ profile: { ...profile, credits: newCredits } });
      return true;
    } catch (error) {
      handleProfileError("using credits", error);
      return false;
    }
  },

  addCredits: async (amount: number) => {
    const uid = getAuthUidOrNull();
    if (!uid) return;

    const profile = get().profile;
    const newCredits = profile.credits + amount;

    try {
      await updateCredits(uid, newCredits);
      set({ profile: { ...profile, credits: newCredits } });
    } catch (error) {
      handleProfileError("adding credits", error);
    }
  },
}));

export default useProfileStore;
