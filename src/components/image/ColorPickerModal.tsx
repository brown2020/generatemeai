"use client";

import { useState } from "react";

interface ColorPickerModalProps {
  initialColor: string;
  onConfirm: (color: string) => void;
  onCancel: () => void;
}

/**
 * Modal for selecting background color.
 */
export const ColorPickerModal = ({
  initialColor,
  onConfirm,
  onCancel,
}: ColorPickerModalProps) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Select a Background Color
        </h2>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full mb-4 h-10"
        />
        <div className="flex justify-end">
          <button className="btn-secondary mr-2" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onConfirm(selectedColor)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
