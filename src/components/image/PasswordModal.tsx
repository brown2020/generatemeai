"use client";

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Make Sharable with Password (Optional)
        </h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password (optional)"
          className="w-full p-2 border rounded-sm mb-4"
        />
        <div className="flex justify-end">
          <button className="btn-secondary mr-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
