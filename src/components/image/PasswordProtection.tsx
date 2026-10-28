"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { unlockImage } from "@/actions/imageActions";
import type { ImageData } from "@/types/image";

interface PasswordProtectionProps {
  imageId: string;
  onUnlocked: (data: ImageData) => void;
}

/**
 * Password entry screen for protected images. The password is checked on the
 * server; this component never receives the stored password.
 */
export const PasswordProtection = ({
  imageId,
  onUnlocked,
}: PasswordProtectionProps) => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <form
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!enteredPassword || isSubmitting) return;
          setIsSubmitting(true);
          void unlockImage(imageId, enteredPassword)
            .then((result) => {
              if (!result.success || !result.data?.data) {
                setHasError(true);
                return;
              }
              onUnlocked(result.data.data as unknown as ImageData);
            })
            .catch(() => setHasError(true))
            .finally(() => setIsSubmitting(false));
        }}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-50">
          <Lock className="size-6 text-blue-600" />
        </div>
        <h1 className="text-center text-xl font-semibold text-gray-900 text-balance">
          This Image Is Password-Protected
        </h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          Enter the password the owner shared with you.
        </p>
        <label htmlFor="view-password" className="mt-6 mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="view-password"
          name="view-password"
          type="password"
          autoComplete="off"
          value={enteredPassword}
          aria-invalid={hasError}
          aria-describedby="view-password-error"
          onChange={(e) => {
            setEnteredPassword(e.target.value);
            setHasError(false);
          }}
          className="input-primary"
        />
        <p id="view-password-error" aria-live="polite" className="mt-1.5 min-h-5 text-sm text-red-600">
          {hasError ? "That password doesn't match. Check it with the owner and try again." : ""}
        </p>
        <Button type="submit" fullWidth className="mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Checking…" : "View Image"}
        </Button>
      </form>
    </div>
  );
};
