"use client";

import { useAuthState } from "@/zustand/selectors";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { AuthModal } from "./auth";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";

/**
 * Authentication component that handles sign in/out and displays auth state.
 * Uses the extracted AuthModal for the modal UI.
 */
export default function AuthComponent() {
  const { uid, authEmail, authDisplayName, authPending } = useAuthState();

  const {
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
    handlePasswordSignup,
    handleSubmit,
    handlePasswordReset,
  } = useAuthLogic();

  // Group props for cleaner AuthModal API
  const authState = { uid, authEmail, authDisplayName, authPending };

  const formState = {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    acceptTerms,
    setAcceptTerms,
    isEmailLinkLogin,
    setIsEmailLinkLogin,
  };

  const handlers = {
    signInWithGoogle,
    handleSignOut,
    handlePasswordSignup,
    handleSubmit,
    handlePasswordReset,
  };

  return (
    <>
      {/* Auth trigger buttons */}
      {uid ? (
        <Button onClick={showModal} variant="secondary" size="lg">
          You are signed in
        </Button>
      ) : (
        <Button
          onClick={showModal}
          size="lg"
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          Get Started Free
        </Button>
      )}

      {/* Auth modal */}
      <AuthModal
        isVisible={isVisible}
        onClose={hideModal}
        authState={authState}
        formState={formState}
        handlers={handlers}
        showGoogleSignIn={showGoogleSignIn}
        formRef={formRef}
        modalRef={modalRef}
      />
    </>
  );
}
