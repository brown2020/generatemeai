"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getIdToken,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { setCookie } from "cookies-next";
import { Eye, EyeOff, LockIcon, MailIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import googleLogo from "@/app/assets/google.svg";
import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { mapAuthError } from "@/utils/authErrors";
import { STORAGE_KEYS } from "@/constants/storage";
import { useAuthStore } from "@/zustand/useAuthStore";

export type AuthPageMode = "login" | "signup" | "forgot";

type Props = { mode: AuthPageMode };

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";
const SESSION_TIMEOUT_MS = 12_000;

const TITLES: Record<AuthPageMode, string> = {
  login: "Sign in",
  signup: "Create account",
  forgot: "Forgot password",
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function settleSessionCookie() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("No user after auth");
  const token = await getIdToken(firebaseUser, true);
  setCookie(COOKIE_NAME, token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function storeAuthInfo(em: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.EMAIL, em);
  window.localStorage.setItem(STORAGE_KEYS.NAME, em.split("@")[0]);
}

function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label htmlFor="auth-password" className="mt-1 text-sm font-medium text-gray-700">
        Password
      </label>
      <div className="relative">
        <input
          id="auth-password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your password"
          className="input-primary w-full pr-12"
          required
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </>
  );
}

function AuthFooterLinks({ mode }: { mode: AuthPageMode }) {
  if (mode === "login") {
    return (
      <p>
        No account?{" "}
        <Link href="/signup" className="text-blue-600 underline">
          Create account
        </Link>
      </p>
    );
  }
  if (mode === "signup") {
    return (
      <p>
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    );
  }
  return (
    <p>
      Remembered it?{" "}
      <Link href="/login" className="text-blue-600 underline">
        Back to sign in
      </Link>
    </p>
  );
}

export function AuthPageForm({ mode }: Props) {
  const router = useRouter();
  const setAuthDetails = useAuthStore((s) => s.setAuthDetails);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const finishSignedIn = async () => {
    await withTimeout(settleSessionCookie(), SESSION_TIMEOUT_MS, "Session sync");
    const u = auth.currentUser!;
    setAuthDetails({
      uid: u.uid,
      authEmail: u.email || "",
      authDisplayName: u.displayName || "",
      authPhotoUrl: u.photoURL || "",
      authEmailVerified: u.emailVerified || false,
      authReady: true,
      authPending: false,
    });
    storeAuthInfo(u.email || email);
    router.replace("/generate");
  };

  const runAuth = async (action: () => Promise<void>) => {
    setError(null);
    if (!hasClientConfig) {
      setError("Authentication is not configured.");
      return;
    }
    setLoading(true);
    try {
      await action();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (mode !== "forgot" && !password) {
      setError("Please enter your password.");
      return;
    }
    if (mode === "signup" && !acceptTerms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }
    if (mode === "forgot") {
      void (async () => {
        setError(null);
        if (!hasClientConfig) {
          setError("Authentication is not configured.");
          return;
        }
        setLoading(true);
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setResetSent(true);
          toast.success(`Password reset email sent to ${email.trim()}`);
        } catch (err) {
          setError(mapAuthError(err));
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    void runAuth(async () => {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      await finishSignedIn();
    });
  };

  const onGoogle = () => {
    if (mode === "signup" && !acceptTerms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }
    void runAuth(async () => {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await finishSignedIn();
    });
  };

  if (resetSent) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-3xl font-semibold text-gray-900">{TITLES[mode]}</h1>
        <div className="flex flex-col gap-3 text-sm text-gray-700" role="status">
          <p>
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            Check your inbox and spam folder.
          </p>
          <Link href="/login" className="btn-primary text-center">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-center text-3xl font-semibold text-gray-900">{TITLES[mode]}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        {mode !== "forgot" && (
          <>
            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
            >
              <span className="relative h-6 w-6">
                <Image src={googleLogo} alt="" fill sizes="24px" className="object-contain" />
              </span>
              <span className="grow text-center">Continue with Google</span>
            </button>
            <div className="flex h-8 items-center justify-center">
              <hr className="h-px grow border-0 bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">or</span>
              <hr className="h-px grow border-0 bg-gray-300" />
            </div>
          </>
        )}

        <label htmlFor="auth-email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="input-primary"
          required
        />

        {mode !== "forgot" && (
          <PasswordField
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        )}

        {mode === "login" && (
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 underline hover:text-blue-800">
              Forgot password?
            </Link>
          </div>
        )}

        {mode === "signup" && (
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              I accept the{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                privacy
              </Link>{" "}
              policy.
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary disabled:opacity-60" disabled={loading}>
          <span className="flex h-8 items-center justify-center gap-2">
            {loading ? (
              <span aria-live="polite">Working…</span>
            ) : mode === "forgot" ? (
              <>
                <MailIcon size={18} />
                Send reset link
              </>
            ) : mode === "signup" ? (
              <>
                <LockIcon size={18} />
                Create account
              </>
            ) : (
              <>
                <LockIcon size={18} />
                Sign in
              </>
            )}
          </span>
        </button>

        <div className="mt-2 space-y-1 text-center text-sm">
          <AuthFooterLinks mode={mode} />
        </div>
      </form>
    </div>
  );
}
