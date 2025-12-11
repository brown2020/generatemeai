"use client";

import { memo, useCallback } from "react";
import { PreviewCard } from "@/components/generation/PreviewCard";
import { GenerationState } from "@/zustand/useGenerationStore";

interface SettingsSelectorProps {
  label: string;
  options: { value: string; label: string }[];
  currentValue: string;
  onChange: (val: string) => void;
  type: GenerationState["previewType"];
  previewType: GenerationState["previewType"];
  previewValue: string | null;
  setPreview: (
    type: GenerationState["previewType"],
    value: string | null
  ) => void;
}

/**
 * Settings selector component for generation options.
 * Displays options as selectable pills with preview support.
 */
export const SettingsSelector = memo(function SettingsSelector({
  label,
  options,
  currentValue,
  onChange,
  type,
  previewType,
  previewValue,
  setPreview,
}: SettingsSelectorProps) {
  const handleOptionClick = useCallback(
    (optionLabel: string, optionValue: string) => {
      onChange(optionLabel);
      // Brief delay to allow state update before showing preview
      setPreview(null, null);
      requestAnimationFrame(() => {
        setPreview(type, optionValue);
      });
    },
    [onChange, setPreview, type]
  );

  const showPreview = previewType === type && previewValue;

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
        {options.map((option) => {
          const isSelected = currentValue === option.label;

          return (
            <button
              key={option.value}
              type="button"
              className={`px-2 py-1 rounded-full text-xs transition-colors
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              onClick={() => handleOptionClick(option.label, option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {showPreview && <PreviewCard type={type!} value={previewValue} />}
    </div>
  );
});
