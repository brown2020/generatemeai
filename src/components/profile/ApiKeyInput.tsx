"use client";

import { useState, useCallback } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useClipboard } from "@/hooks";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Reusable API key input with visibility toggle and copy functionality.
 */
export const ApiKeyInput = ({
  label,
  value,
  onChange,
  placeholder,
}: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);
  const { copy, isCopied } = useClipboard();

  const handleCopy = useCallback(() => {
    copy(value, label);
  }, [copy, value, label]);

  const toggleVisibility = useCallback(() => {
    setShowKey((prev) => !prev);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        <input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20
            text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            hover:border-gray-400"
          placeholder={placeholder || `Enter your ${label}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Copy to clipboard"
          >
            {isCopied(label) ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
