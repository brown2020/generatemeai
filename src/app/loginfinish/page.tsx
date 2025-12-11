"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/firebase/firebaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import useProfileStore from "@/zustand/useProfileStore";
import { STORAGE_KEYS } from "@/constants/storage";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function LoginFinishPage() {
  const router = useRouter();
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function attemptSignIn() {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          throw new Error("Sign in link is not valid");
        }

        let email = window.localStorage.getItem(STORAGE_KEYS.EMAIL);
        const name = window.localStorage.getItem(STORAGE_KEYS.NAME) || "";

        if (!email) {
          email = window.prompt("Please confirm your email");
          if (!email) {
            throw new Error("Email confirmation cancelled by user");
          }
        }

        const userCredential = await signInWithEmailLink(
          auth,
          email,
          window.location.href
        );

        const user = userCredential.user;
        const authEmail = user?.email;
        const uid = user?.uid;
        const selectedName = name || user?.displayName || "";

        if (!uid || !authEmail) {
          throw new Error("No user found");
        }

        setAuthDetails({
          uid,
          authEmail,
          authDisplayName: selectedName,
        });
        updateProfile({ displayName: selectedName });
        toast.success("Successfully signed in!");
        router.replace("/generate");
      } catch (error) {
        let message = "Unknown error signing in";
        if (error instanceof FirebaseError) {
          message = error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
      } finally {
        // Clean up localStorage
        window.localStorage.removeItem(STORAGE_KEYS.EMAIL);
        window.localStorage.removeItem(STORAGE_KEYS.NAME);
      }
    }

    attemptSignIn();
  }, [router, setAuthDetails, updateProfile]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="text-red-500 text-lg font-medium">Sign in failed</div>
        <p className="text-gray-600 text-center max-w-md">{errorMessage}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <ClipLoader color="#2563EB" size={50} />
      <p className="text-gray-600">Completing sign in...</p>
    </div>
  );
}
