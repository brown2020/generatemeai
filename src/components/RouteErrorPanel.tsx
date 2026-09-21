"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface RouteErrorPanelProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  message: string;
  logLabel: string;
}

export function RouteErrorPanel({
  error,
  reset,
  title,
  message,
  logLabel,
}: RouteErrorPanelProps) {
  useEffect(() => {
    console.error(logLabel, error);
  }, [error, logLabel]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
