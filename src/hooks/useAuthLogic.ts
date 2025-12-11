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
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";
import { isIOSReactNativeWebView } from "@/utils/platform";
import { isFirebaseError } from "@/utils/errors";

export const useAuthLogic = () => {
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEmailLinkLogin, setIsEmailLinkLogin] = useState(false);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(true);

  const formRef = useRef<HTMLFormElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  useEffect(() => {
    setShowGoogleSignIn(!isIOSReactNativeWebView());
  }, []);

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
      await signOut(auth);
      clearAuthDetails();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out.");
    } finally {
      hideModal();
    }
  };

  const handlePasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("generateEmail", email);
        window.localStorage.setItem("generateName", email.split("@")[0]);
      }
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
      if (typeof window !== "undefined") {
        window.localStorage.setItem("generateEmail", email);
        window.localStorage.setItem("generateName", email.split("@")[0]);
      }
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
      window.localStorage.setItem("generateEmail", email);
      window.localStorage.setItem("generateName", name);
      setAuthDetails({ authPending: true });
    } catch (error) {
      console.error("Error sending sign-in link:", error);
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
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    acceptTerms,
    setAcceptTerms,
    isVisible,
    showModal,
    hideModal,
    isEmailLinkLogin,
    setIsEmailLinkLogin,
    showGoogleSignIn,
    formRef,
    modalRef,
    signInWithGoogle,
    handleSignOut,
    handlePasswordLogin,
    handlePasswordSignup,
    handleSubmit,
    handlePasswordReset,
  };
};
