"use client";

import { useCallback, useState } from "react";

type Props = {
  showDeleteModal: boolean;
  onHideModal: () => void;
  onDeleteConfirm: () => void;
};

export default function DeleteConfirmModal({
  showDeleteModal,
  onHideModal,
  onDeleteConfirm,
}: Props) {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmation === "DELETE ACCOUNT") {
      onDeleteConfirm();
    } else {
      alert("Please type 'DELETE ACCOUNT' to confirm.");
    }
  }, [deleteConfirmation, onDeleteConfirm]);

  if (!showDeleteModal) {
    return true;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h3 className="text-lg">Are you sure you want to delete your account?</h3>
        <p className="mb-4 mt-2">
          Please type <strong>DELETE ACCOUNT</strong> to confirm.
        </p>
        <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
          placeholder="Type DELETE ACCOUNT"
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-3 py-2 rounded-md"
            onClick={onHideModal}
          >
            Cancel
          </button>
          <button
            className="bg-[#2563EB] text-white px-3 py-2 rounded-md"
            onClick={handleDeleteConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
