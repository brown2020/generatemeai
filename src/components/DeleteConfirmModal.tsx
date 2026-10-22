"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Modal } from "@/components/ui";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  /** When set, the user must type this text before Delete enables. */
  confirmText?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
}: DeleteConfirmModalProps) {
  const [confirmation, setConfirmation] = useState("");

  if (!isOpen) return null;

  const close = () => {
    setConfirmation("");
    onClose();
  };
  const canConfirm = !confirmText || confirmation === confirmText;

  return (
    <Modal
      title={title}
      description={message}
      onClose={close}
      icon={
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="size-5 text-red-600" />
        </div>
      }
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canConfirm) return;
          setConfirmation("");
          onConfirm();
        }}
      >
        {confirmText && (
          <div className="mt-4">
            <label htmlFor="delete-confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold">{confirmText}</span> to confirm
            </label>
            <input
              id="delete-confirm"
              name="delete-confirm"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="input-primary"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={!canConfirm}>
            Delete
          </Button>
        </div>
      </form>
    </Modal>
  );
}
