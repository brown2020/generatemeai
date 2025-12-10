"use client";

import Link from "next/link";
import { MailIcon, XIcon, LockIcon } from "lucide-react";
import { PulseLoader } from "react-spinners";
import Image from "next/image";
import googleLogo from "@/app/assets/google.svg";

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  // Auth state
  uid: string;
  authEmail: string;
  authDisplayName: string;
  authPending: boolean;
  // Form state
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
  isEmailLinkLogin: boolean;
  setIsEmailLinkLogin: (value: boolean) => void;
  showGoogleSignIn: boolean;
  // Refs
  formRef: React.RefObject<HTMLFormElement | null>;
  modalRef: React.RefObject<HTMLDivElement | null>;
  // Handlers
  signInWithGoogle: () => void;
  handleSignOut: () => void;
  handlePasswordSignup: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handlePasswordReset: () => void;
}

export function AuthModal({
  isVisible,
  onClose,
  uid,
  authEmail,
  authDisplayName,
  authPending,
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
  showGoogleSignIn,
  formRef,
  modalRef,
  signInWithGoogle,
  handleSignOut,
  handlePasswordSignup,
  handleSubmit,
  handlePasswordReset,
}: AuthModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white text-black p-4 rounded-lg shadow-lg w-full max-w-md mx-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 hover:bg-gray-400 bg-gray-200 rounded-full m-2"
        >
          <XIcon size={24} className="text-gray-800" />
        </button>

        {uid ? (
          <SignedInContent
            authDisplayName={authDisplayName}
            authEmail={authEmail}
            handleSignOut={handleSignOut}
          />
        ) : authPending ? (
          <PendingContent email={email} handleSignOut={handleSignOut} />
        ) : (
          <SignInForm
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
            signInWithGoogle={signInWithGoogle}
            handlePasswordSignup={handlePasswordSignup}
            handleSubmit={handleSubmit}
            handlePasswordReset={handlePasswordReset}
          />
        )}
      </div>
    </div>
  );
}

// Sub-components for better organization
function SignedInContent({
  authDisplayName,
  authEmail,
  handleSignOut,
}: {
  authDisplayName: string;
  authEmail: string;
  handleSignOut: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl text-center">You are signed in</div>
      <div className="input-disabled">{authDisplayName}</div>
      <div className="input-disabled">{authEmail}</div>
      <button onClick={handleSignOut} className="btn-danger">
        Sign Out
      </button>
    </div>
  );
}

function PendingContent({
  email,
  handleSignOut,
}: {
  email: string;
  handleSignOut: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl text-center">Signing you in</div>
      <div className="flex flex-col gap-3 border rounded-md px-3 py-2">
        <div>{`Check your email at ${email} for a message from Generate.me`}</div>
        <div>{`If you don't see the message, check your spam folder. Mark it "not spam" or move it to your inbox.`}</div>
        <div>
          Click the sign-in link in the message to complete the sign-in process.
        </div>
        <div>
          Waiting for you to click the sign-in link.{" "}
          <span>
            <PulseLoader color="#000000" size={6} />
          </span>
        </div>
      </div>
      <button onClick={handleSignOut} className="btn-danger">
        Start Over
      </button>
    </div>
  );
}

function SignInForm({
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
  showGoogleSignIn,
  formRef,
  signInWithGoogle,
  handlePasswordSignup,
  handleSubmit,
  handlePasswordReset,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
  isEmailLinkLogin: boolean;
  setIsEmailLinkLogin: (value: boolean) => void;
  showGoogleSignIn: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  signInWithGoogle: () => void;
  handlePasswordSignup: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handlePasswordReset: () => void;
}) {
  return (
    <form
      onSubmit={isEmailLinkLogin ? handleSubmit : handlePasswordSignup}
      ref={formRef}
      className="flex flex-col gap-2"
    >
      <div className="text-3xl text-center pb-3">Sign In</div>

      {showGoogleSignIn && (
        <>
          <AuthButton
            label="Continue with Google"
            logo={googleLogo}
            onClick={signInWithGoogle}
          />
          <div className="flex items-center justify-center w-full h-12">
            <hr className="grow h-px bg-gray-400 border-0" />
            <span className="px-3">or</span>
            <hr className="grow h-px bg-gray-400 border-0" />
          </div>
        </>
      )}

      {isEmailLinkLogin && (
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="input-primary mb-2"
        />
      )}

      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="input-primary"
      />

      {!isEmailLinkLogin && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="input-primary mt-2"
        />
      )}

      {!isEmailLinkLogin && (
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="underline text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot Password?
          </button>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={!email || (!isEmailLinkLogin && !password)}
      >
        {isEmailLinkLogin ? (
          <div className="flex items-center gap-2 h-8">
            <MailIcon size={20} />
            <span>Continue with Email Link</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 h-8">
            <LockIcon size={20} />
            <span>Continue with Password</span>
          </div>
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsEmailLinkLogin(!isEmailLinkLogin)}
          className="underline"
        >
          {isEmailLinkLogin ? "Use Email/Password" : "Use Email Link"}
        </button>
      </div>

      <label className="flex items-center space-x-2 pl-1">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="h-full"
          required
        />
        <span>
          I accept the{" "}
          <Link href={"/terms"} className="underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            privacy
          </Link>{" "}
          policy.
        </span>
      </label>
    </form>
  );
}

function AuthButton({
  label,
  logo,
  onClick,
}: {
  label: string;
  logo: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 w-full px-4 py-2 border rounded-md hover:bg-gray-100"
      onClick={onClick}
    >
      <div className="w-6 h-6 relative">
        <Image
          src={logo}
          alt={`${label} logo`}
          fill
          className="object-contain"
        />
      </div>
      <span className="grow text-center">{label}</span>
    </button>
  );
}
