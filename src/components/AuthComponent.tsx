"use client";

import Link from "next/link";
import { useAuthState } from "@/zustand/selectors";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { AuthModal } from "./auth";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export default function AuthComponent() {
  const { uid, authEmail, authDisplayName, authPending } = useAuthState();
  const { email, isVisible, showModal, hideModal, modalRef, handleSignOut } = useAuthLogic();

  return (
    <>
      {uid ? (
        <Button onClick={showModal} variant="secondary" size="lg">
          You are signed in
        </Button>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Get Started Free
            </Button>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-700 underline underline-offset-2"
          >
            Sign in
          </Link>
        </div>
      )}

      <AuthModal
        isVisible={isVisible}
        onClose={hideModal}
        authState={{ uid, authEmail, authDisplayName, authPending }}
        handlers={{ handleSignOut }}
        modalRef={modalRef}
        email={email}
      />
    </>
  );
}
