"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  /** @deprecated Use isOpen instead */
  showDeleteModal?: boolean;
  /** @deprecated Use onClose instead */
  onHideModal?: () => void;
  /** @deprecated Use onConfirm instead */
  onDeleteConfirm?: () => void;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Account",
  message = "This action cannot be undone.",
  confirmText = "DELETE ACCOUNT",
  showDeleteModal,
  onHideModal,
  onDeleteConfirm,
}: Props) {
  const [confirmation, setConfirmation] = useState("");

  // Support legacy props
  const visible = isOpen ?? showDeleteModal;
  const handleClose = onClose ?? onHideModal ?? (() => {});

  const handleConfirm = useCallback(() => {
    if (confirmation === confirmText) {
      const action = onConfirm ?? onDeleteConfirm ?? (() => {});
      action();
      setConfirmation("");
    } else {
      toast.error(`Please type '${confirmText}' to confirm.`);
    }
  }, [confirmation, confirmText, onConfirm, onDeleteConfirm]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="font-mono font-bold">{confirmText}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={confirmText}
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => { handleClose(); setConfirmation(""); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
              rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmation !== confirmText}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
              hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
