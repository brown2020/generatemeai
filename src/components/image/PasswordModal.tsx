"use client";

import { Button, Modal } from "@/components/ui";

interface PasswordModalProps {
  password: string;
  setPassword: (password: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal for setting password protection on shared images.
 */
export const PasswordModal = ({
  password,
  setPassword,
  onConfirm,
  onCancel,
}: PasswordModalProps) => {
  return (
    <Modal
      title="Share This Image"
      description="Anyone with the link can view it. Add an optional password to limit who can open it."
      onClose={onCancel}
    >
      <form
        method="dialog"
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <label htmlFor="share-password" className="mb-1.5 block text-sm font-medium text-gray-700">
          Password (optional)
        </label>
        <input
          id="share-password"
          name="share-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-primary"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Make Sharable</Button>
        </div>
      </form>
    </Modal>
  );
};
