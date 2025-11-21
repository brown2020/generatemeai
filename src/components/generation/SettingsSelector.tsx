import React from "react";
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
  setPreview: (type: GenerationState["previewType"], value: string | null) => void;
}

export const SettingsSelector: React.FC<SettingsSelectorProps> = ({
  label,
  options,
  currentValue,
  onChange,
  type,
  previewType,
  previewValue,
  setPreview,
}) => {
  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-2 py-1 rounded-full text-xs transition-colors
                          ${
                            currentValue === option.label
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-100"
                          }`}
            onClick={() => {
              onChange(option.label);
              setPreview(null, null);
              setTimeout(() => {
                setPreview(type, option.value);
              }, 100);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {previewType === type && previewValue && (
        <PreviewCard type={type!} value={previewValue} />
      )}
    </div>
  );
};

