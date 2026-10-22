"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PulseLoader } from "react-spinners";
import { Button, buttonClassName } from "@/components/ui";

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
        className="absolute top-0 right-0 m-2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X size={24} className="text-gray-800" />
      </button>

      {uid ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-center text-2xl">You are signed in</h2>
          <p className="truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{authDisplayName}</p>
          <p className="truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{authEmail}</p>
          <Button variant="danger" fullWidth onClick={handlers.handleSignOut}>
            Sign Out
          </Button>
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
          <Button variant="danger" fullWidth onClick={handlers.handleSignOut}>
            Start Over
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 py-2">
          <div className="pb-1 text-center text-2xl">Welcome</div>
          <p className="text-center text-sm text-gray-600">
            Sign in or create an account to generate images and manage your gallery.
          </p>
          <Link href="/login" className={buttonClassName({ className: "w-full" })} onClick={onClose}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className={buttonClassName({ variant: "outline", className: "w-full" })}
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
