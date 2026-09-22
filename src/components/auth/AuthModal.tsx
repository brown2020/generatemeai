"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PulseLoader } from "react-spinners";

interface AuthStateProps {
  uid: string;
  authEmail: string;
  authDisplayName: string;
  authPending: boolean;
}

interface AuthHandlers {
  handleSignOut: () => void;
}

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  authState: AuthStateProps;
  handlers: AuthHandlers;
  modalRef: React.RefObject<HTMLDialogElement | null>;
  email?: string;
}

/**
 * Lightweight account dialog. Email/password flows live on /login, /signup,
 * and /forgot-password (first-class Auth UX routes).
 */
export function AuthModal({
  isVisible,
  onClose,
  authState,
  handlers,
  modalRef,
  email = "",
}: AuthModalProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;
    if (isVisible) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }, [isVisible, modalRef]);

  const { uid, authEmail, authDisplayName, authPending } = authState;

  return (
    <dialog
      ref={modalRef}
      aria-label="Account"
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border-0 bg-white p-4 text-black shadow-lg backdrop:bg-black/60 open:flex open:flex-col"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        aria-label="Close account dialog"
        onClick={onClose}
        className="absolute top-0 right-0 m-2 rounded-full bg-gray-200 p-2 hover:bg-gray-400"
      >
        <X size={24} className="text-gray-800" />
      </button>

      {uid ? (
        <div className="flex flex-col gap-2">
          <div className="text-center text-2xl">You are signed in</div>
          <div className="input-disabled">{authDisplayName}</div>
          <div className="input-disabled">{authEmail}</div>
          <button type="button" onClick={handlers.handleSignOut} className="btn-danger">
            Sign Out
          </button>
        </div>
      ) : authPending ? (
        <div className="flex flex-col gap-2">
          <div className="text-center text-2xl">Signing you in</div>
          <div className="flex flex-col gap-3 rounded-md border px-3 py-2 text-sm">
            <div>{`Check your email at ${email} for a message from Generate.me`}</div>
            <div>
              Waiting for you to click the sign-in link.{" "}
              <PulseLoader color="#000000" size={6} />
            </div>
          </div>
          <button type="button" onClick={handlers.handleSignOut} className="btn-danger">
            Start Over
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 py-2">
          <div className="pb-1 text-center text-2xl">Welcome</div>
          <p className="text-center text-sm text-gray-600">
            Sign in or create an account to generate images and manage your gallery.
          </p>
          <Link href="/login" className="btn-primary text-center" onClick={onClose}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
            onClick={onClose}
          >
            Create account
          </Link>
          <Link
            href="/forgot-password"
            className="text-center text-sm text-blue-600 underline"
            onClick={onClose}
          >
            Forgot password?
          </Link>
        </div>
      )}
    </dialog>
  );
}
