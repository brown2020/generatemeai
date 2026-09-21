"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface PasswordProtectionProps {
  correctPassword: string;
  onVerified: () => void;
}

/**
 * Password entry screen for protected images.
 */
export const PasswordProtection = ({
  correctPassword,
  onVerified,
}: PasswordProtectionProps) => {
  const [enteredPassword, setEnteredPassword] = useState("");

  const handleSubmit = () => {
    if (enteredPassword === correctPassword) {
      onVerified();
    } else {
      toast.error("Invalid password");
    }
  };

  return (
    <div className="flex flex-col items-center mt-5">
      <h2 className="text-xl mb-4">
        This image is password-protected. Please enter the password to view:
      </h2>
      <label htmlFor="view-password" className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <input
        id="view-password"
        type="password"
        value={enteredPassword}
        onChange={(e) => setEnteredPassword(e.target.value)}
        className="p-2 border rounded-sm mb-4"
      />
      <button onClick={handleSubmit} className="btn-primary2">
        Submit
      </button>
    </div>
  );
};
