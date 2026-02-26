import { create } from "zustand";
import { getAuthState, getAuthUidOrNull } from "./helpers";
import {
  fetchProfileServer,
  updateProfileServer,
} from "@/actions/profileActions";

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
}

/**
 * Merges server data with auth state to build the local profile.
 */
const createProfileFromAuth = (
  serverData?: Record<string, unknown>
): ProfileType => {
  const { authEmail, authDisplayName, authPhotoUrl, authEmailVerified } =
    getAuthState();

  const baseProfile = serverData
    ? { ...defaultProfile, ...serverData }
    : { ...defaultProfile };

  const credits =
    typeof baseProfile.credits === "number" && baseProfile.credits >= MIN_CREDITS_THRESHOLD
      ? baseProfile.credits
      : DEFAULT_CREDITS;

  return {
    ...defaultProfile,
    ...baseProfile,
    credits,
    email: (authEmail || baseProfile.email || "") as string,
    contactEmail: (baseProfile.contactEmail || authEmail || "") as string,
    displayName: (baseProfile.displayName || authDisplayName || "") as string,
    photoUrl: (baseProfile.photoUrl || authPhotoUrl || "") as string,
    emailVerified: (authEmailVerified || baseProfile.emailVerified || false) as boolean,
  };
};

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
      const result = await fetchProfileServer();
      if (!result.success) {
        handleProfileError("fetching profile", new Error(result.error));
        return;
      }

      const newProfile = createProfileFromAuth(result.data);

      // Sync auth-derived fields back to server
      await updateProfileServer({
        email: newProfile.email,
        contactEmail: newProfile.contactEmail,
        displayName: newProfile.displayName,
        photoUrl: newProfile.photoUrl,
        emailVerified: newProfile.emailVerified,
      });

      set({ profile: newProfile });
    } catch (error) {
      handleProfileError("fetching or creating profile", error);
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>) => {
    const uid = getAuthUidOrNull();
    if (!uid) return;

    try {
      const result = await updateProfileServer(newProfile as Record<string, unknown>);
      if (!result.success) {
        handleProfileError("updating profile", new Error(result.error));
        return;
      }
      const previousProfile = get().profile;
      set({ profile: { ...previousProfile, ...newProfile } });
    } catch (error) {
      handleProfileError("updating profile", error);
    }
  },
}));

export default useProfileStore;
