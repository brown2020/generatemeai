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
        uid={uid}
        authEmail={authEmail}
        authDisplayName={authDisplayName}
        authPending={authPending}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        acceptTerms={acceptTerms}
        setAcceptTerms={setAcceptTerms}
        isEmailLinkLogin={isEmailLinkLogin}
        setIsEmailLinkLogin={setIsEmailLinkLogin}
        showGoogleSignIn={showGoogleSignIn}
        formRef={formRef}
        modalRef={modalRef}
        signInWithGoogle={signInWithGoogle}
        handleSignOut={handleSignOut}
        handlePasswordSignup={handlePasswordSignup}
        handleSubmit={handleSubmit}
        handlePasswordReset={handlePasswordReset}
      />
    </>
  );
}
