import { useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import toast from "react-hot-toast";
import { deleteCookie } from "cookies-next";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";
import { isIOSReactNativeWebView } from "@/utils/platform";
import { isFirebaseError } from "@/utils/errors";
import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Safely stores auth info in localStorage.
 */
const storeAuthInfo = (email: string, name?: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.EMAIL, email);
  window.localStorage.setItem(STORAGE_KEYS.NAME, name || email.split("@")[0]);
};

export const useAuthLogic = () => {
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);

  // UI state
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEmailLinkLogin, setIsEmailLinkLogin] = useState(false);
  // Platform is stable for the mount lifetime, so initialize lazily instead
  // of writing to state inside an effect. SSR defaults to true — the value
  // reconciles on first client render before any paint that depends on it.
  const [showGoogleSignIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !isIOSReactNativeWebView();
  });

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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

  const handleAuthError = (error: unknown) => {
    if (isFirebaseError(error)) {
      toast.error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    if (!acceptTerms) {
      if (formRef.current) {
        formRef.current.reportValidity();
      }
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (isFirebaseError(error)) {
        if (error.code === "auth/account-exists-with-different-credential") {
          toast.error(
            "An account with the same email exists with a different sign-in provider."
          );
        } else {
          toast.error(
            "Something went wrong signing in with Google\n" + error.message
          );
        }
      }
    } finally {
      hideModal();
    }
  };

  const handleSignOut = async () => {
    try {
      // 1. Delete auth cookie BEFORE Firebase sign-out.
      //    signOut(auth) triggers onAuthStateChanged which may navigate
      //    before the useAuthToken effect runs deleteCookie, leaving a
      //    stale cookie that makes proxy.ts think user is still authed.
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";
      deleteCookie(cookieName, { path: "/" });

      // 2. Sign out of Firebase.
      await signOut(auth);

      // 3. Clear auth store.
      clearAuthDetails();

      // 4. Clear browser storage.
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } catch {
      toast.error("An error occurred while signing out.");
    } finally {
      hideModal();
    }
  };

  const handlePasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      storeAuthInfo(email);
    } catch (error: unknown) {
      handleAuthError(error);
    } finally {
      hideModal();
    }
  };

  const handlePasswordSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      storeAuthInfo(email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if ((error as { code?: string }).code === "auth/email-already-in-use") {
          handlePasswordLogin();
          return;
        }
      }
      hideModal();
      handleAuthError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (typeof window === "undefined") return;

    const actionCodeSettings = {
      url: `${window.location.origin}/loginfinish`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      storeAuthInfo(email, name);
      setAuthDetails({ authPending: true });
    } catch {
      toast.error("An error occurred while sending the sign-in link.");
      hideModal();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      handleAuthError(error);
    }
  };

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    acceptTerms,
    setAcceptTerms,
    // UI state
    isVisible,
    showModal,
    hideModal,
    isEmailLinkLogin,
    setIsEmailLinkLogin,
    showGoogleSignIn,
    // Refs
    formRef,
    modalRef,
    // Handlers
    signInWithGoogle,
    handleSignOut,
    handlePasswordLogin,
    handlePasswordSignup,
    handleSubmit,
    handlePasswordReset,
  };
};
