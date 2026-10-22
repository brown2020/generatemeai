"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Native modal dialog: `showModal()` gives focus containment, Escape to close,
 * and an inert background. Mount it only while open.
 */
export function Modal({ title, description, icon, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] overscroll-contain rounded-xl bg-white p-6 text-gray-900 shadow-lg backdrop:bg-black/50"
    >
      <div className="flex items-start gap-4">
        {icon}
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold text-balance">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </dialog>
  );
}
