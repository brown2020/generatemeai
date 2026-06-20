import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import useProfileStore from "./useProfileStore";

export const useInitializeStores = () => {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);
  const authPending = useAuthStore((state) => state.authPending);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!uid || !authReady || authPending) return;
    fetchProfile();
  }, [authPending, authReady, fetchProfile, uid]);
};
