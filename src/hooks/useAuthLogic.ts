import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { mapAuthError } from "@/utils/authErrors";
import { clearAuthSession } from "@/actions/authSession";

/**
 * Modal account shell helpers. Email/password auth lives on /login, /signup,
 * /forgot-password (see AuthPageForm).
 */
export const useAuthLogic = () => {
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);
  const [email] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        hideModal();
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await clearAuthSession();
      if (hasClientConfig) {
        await signOut(auth);
      }
      clearAuthDetails();
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } catch (error) {
      toast.error(mapAuthError(error));
    } finally {
      setAuthBusy(false);
      hideModal();
    }
  };

  return {
    email,
    isVisible,
    showModal,
    hideModal,
    modalRef,
    handleSignOut,
    authBusy,
  };
};
