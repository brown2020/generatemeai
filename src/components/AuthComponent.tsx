"use client";

import { useAuthState } from "@/zustand/selectors";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { AuthModal } from "./auth";

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
        <button
          onClick={showModal}
          className="btn-secondary max-w-md mx-auto text-white"
        >
          You are signed in
        </button>
      ) : (
        <button onClick={showModal} className="btn-white max-w-md mx-auto">
          Sign In to Enable Your Account
        </button>
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
