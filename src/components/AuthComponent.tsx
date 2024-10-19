"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import Link from "next/link";
import { MailIcon, XIcon, LockIcon } from "lucide-react";
import { PulseLoader } from "react-spinners";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";
import toast from "react-hot-toast";

import googleLogo from "@/app/assets/google.svg";
import Image from "next/image";
import { isIOSReactNativeWebView } from "@/utils/platform";

export default function AuthComponent() {
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);
  const uid = useAuthStore((s) => s.uid);
  const authEmail = useAuthStore((s) => s.authEmail);
  const authDisplayName = useAuthStore((s) => s.authDisplayName);
  const authPending = useAuthStore((s) => s.authPending);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEmailLinkLogin, setIsEmailLinkLogin] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(true);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  useEffect(() => {
    // Hide Google Sign-In button and the divider if in a React Native WebView on iOS
    setShowGoogleSignIn(!isIOSReactNativeWebView());
  }, []);

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
      alert("An error occurred while signing out.");
    } finally {
      hideModal();
    }
  };

  const handlePasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.localStorage.setItem("generateEmail", email);
      window.localStorage.setItem("generateName", email.split("@")[0]);
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
      window.localStorage.setItem("generateEmail", email);
      window.localStorage.setItem("generateName", email.split("@")[0]);
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
      alert("An error occurred while sending the sign-in link.");
      hideModal();
    }
  };

  // Forgot password handler
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

  return (
    <>
      {uid && (
        <button
          onClick={showModal}
          className="btn-secondary max-w-md mx-auto text-white"
        >
          You are signed in
        </button>
      )}
      {!uid && (
        <button onClick={showModal} className="btn-white max-w-md mx-auto">
          Sign In to Enable Your Account
        </button>
      )}

      {isVisible && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div
            ref={modalRef}
            className="relative bg-white text-black p-4 rounded-lg shadow-lg w-full max-w-md mx-auto"
            style={{ zIndex: 1000 }}
          >
            <button
              onClick={hideModal}
              className="absolute top-0 right-0 p-2 hover:bg-gray-400 bg-gray-200 rounded-full m-2"
            >
              <XIcon size={24} className="text-gray-800" />
            </button>
            {uid ? (
              <div className="flex flex-col gap-2">
                <div className="text-2xl text-center">You are signed in</div>
                <div className="input-disabled">{authDisplayName}</div>
                <div className="input-disabled">{authEmail}</div>
                <button onClick={handleSignOut} className="btn-danger">
                  Sign Out
                </button>
              </div>
            ) : authPending ? (
              <div className="flex flex-col gap-2">
                <div className="text-2xl text-center">Signing you in</div>
                <div className="flex flex-col gap-3 border rounded-md px-3 py-2">
                  <div>
                    {`Check your email at ${email} for a message from Generate.me`}
                  </div>
                  <div>{`If you don't see the message, check your spam folder. Mark it "not spam" or move it to your inbox.`}</div>
                  <div>
                    Click the sign-in link in the message to complete the
                    sign-in process.
                  </div>
                  <div>
                    Waiting for you to click the sign-in link.{" "}
                    <span>
                      {" "}
                      <PulseLoader color="#000000" size={6} />
                    </span>
                  </div>
                </div>

                <button onClick={handleSignOut} className="btn-danger">
                  Start Over
                </button>
              </div>
            ) : (
              <form
                onSubmit={
                  isEmailLinkLogin ? handleSubmit : handlePasswordSignup
                }
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
                      <hr className="flex-grow h-px bg-gray-400 border-0" />
                      <span className="px-3">or</span>
                      <hr className="flex-grow h-px bg-gray-400 border-0" />
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
            )}
          </div>
        </div>
      )}
    </>
  );
}

function isFirebaseError(
  error: unknown
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
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
          layout="fill"
          objectFit="contain"
        />
      </div>
      <span className="flex-grow text-center">{label}</span>
    </button>
  );
}
