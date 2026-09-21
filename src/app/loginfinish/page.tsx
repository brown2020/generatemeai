"use client";

import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "@/firebase/firebaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { STORAGE_KEYS } from "@/constants/storage";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function LoginFinishPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let ignore = false;

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
        if (ignore) return;

        const user = userCredential.user;
        const authEmail = user?.email;
        const uid = user?.uid;
        const selectedName = name || user?.displayName || "";

        if (!uid || !authEmail) {
          throw new Error("No user found");
        }

        if (selectedName && user.displayName !== selectedName) {
          await updateFirebaseProfile(user, { displayName: selectedName });
        }
        if (ignore) return;

        toast.success("Successfully signed in!");
        setStatus("success");
      } catch (error) {
        if (ignore) return;
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
        window.localStorage.removeItem(STORAGE_KEYS.EMAIL);
        window.localStorage.removeItem(STORAGE_KEYS.NAME);
      }
    }

    attemptSignIn();

    return () => {
      ignore = true;
    };
  }, []);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="text-red-500 text-lg font-medium">Sign in failed</div>
        <p className="text-gray-600 text-center max-w-md">{errorMessage}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <p className="text-gray-700 text-lg">You are signed in.</p>
        <Link
          href="/generate"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </Link>
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
