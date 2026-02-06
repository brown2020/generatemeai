import { useState, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface UseClipboardOptions {
  /** Success message to show (default: "Copied to clipboard") */
  successMessage?: string;
  /** Duration to show copied state in ms (default: 2000) */
  resetDelay?: number;
}

/**
 * Hook for clipboard operations with copied state management.
 * Consolidates duplicate clipboard logic across the app.
 */
export const useClipboard = (options: UseClipboardOptions = {}) => {
  const { successMessage = "Copied to clipboard", resetDelay = 2000 } = options;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, key?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key ?? text);
        toast.success(successMessage);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopiedKey(null), resetDelay);
        return true;
      } catch (error) {
        toast.error("Failed to copy to clipboard");
        console.error("Clipboard error:", error);
        return false;
      }
    },
    [successMessage, resetDelay]
  );

  const isCopied = useCallback((key: string) => copiedKey === key, [copiedKey]);

  return { copy, isCopied, copiedKey };
};
