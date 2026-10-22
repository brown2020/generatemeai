"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";

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
    <Modal title="Background Color" onClose={onCancel}>
      <form
        method="dialog"
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(selectedColor);
        }}
      >
        <label htmlFor="background-color" className="mb-1.5 block text-sm font-medium text-gray-700">
          Color
        </label>
        <input
          id="background-color"
          name="background-color"
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-lg border border-gray-300"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </form>
    </Modal>
  );
};
