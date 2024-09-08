"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import google_ctn from "@/app/assets/google_ctn.svg";

import Image from "next/image";
import Link from "next/link";
import { MailIcon, XIcon } from "lucide-react";
import { PulseLoader } from "react-spinners";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";

export default function AuthComponent() {
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);
  const uid = useAuthStore((s) => s.uid);
  const authEmail = useAuthStore((s) => s.authEmail);
  const authDisplayName = useAuthStore((s) => s.authDisplayName);
  const authPending = useAuthStore((s) => s.authPending);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  const signInWithGoogle = async () => {
    if (!acceptTerms) {
      formRef.current && formRef.current.reportValidity();
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
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

  return (
    <>
      {uid && (
        <button onClick={showModal} className="btn-secondary max-w-md mx-auto">
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
                    Waiting for your to click the sign-in link.{" "}
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
                onSubmit={handleSubmit}
                ref={formRef}
                className="flex flex-col gap-2"
              >
                <div className="text-3xl text-center pb-3">Sign In</div>

                <button
                  type="button"
                  className="w-full overflow-hidden"
                  onClick={signInWithGoogle}
                >
                  <Image
                    src={google_ctn.src}
                    alt="Google Logo"
                    className="object-cover w-full"
                    width={100}
                    height={20}
                  />
                </button>
                <div className="flex items-center justify-center w-full h-12">
                  <hr className="flex-grow h-px bg-gray-400 border-0" />
                  <span className="px-3">or</span>
                  <hr className="flex-grow h-px bg-gray-400 border-0" />
                </div>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-primary"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-primary"
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!email || !name}
                >
                  <div className="flex items-center gap-2 h-10">
                    <MailIcon size={30} />
                    <div className="text-xl">Continue with Email</div>
                  </div>
                </button>
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
