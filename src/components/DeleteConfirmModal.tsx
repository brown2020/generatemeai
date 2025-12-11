"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  showDeleteModal: boolean;
  onHideModal: () => void;
  onDeleteConfirm: () => void;
};

const CONFIRMATION_TEXT = "DELETE ACCOUNT";

export default function DeleteConfirmModal({
  showDeleteModal,
  onHideModal,
  onDeleteConfirm,
}: Props) {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmation === CONFIRMATION_TEXT) {
      onDeleteConfirm();
    } else {
      toast.error(`Please type '${CONFIRMATION_TEXT}' to confirm.`);
    }
  }, [deleteConfirmation, onDeleteConfirm]);

  if (!showDeleteModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-3 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold">
          Are you sure you want to delete your account?
        </h3>
        <p className="mb-4 mt-2 text-gray-600">
          Please type <strong>{CONFIRMATION_TEXT}</strong> to confirm.
        </p>
        <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Type ${CONFIRMATION_TEXT}`}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            onClick={onHideModal}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            onClick={handleDeleteConfirm}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
