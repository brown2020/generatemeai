"use client";

import { SettingsSelector } from "@/components/generation/SettingsSelector";
import { GENERATION_SETTINGS } from "@/constants/generationSettings";
import type { GenerationState } from "@/zustand/useGenerationStore";

/**
 * Props for GenerationSettings - accepts only the fields it needs.
 */
interface GenerationSettingsProps {
  store: {
    colorScheme: string;
    lighting: string;
    perspective: string;
    composition: string;
    medium: string;
    mood: string;
    previewType: GenerationState["previewType"];
    previewValue: string | null;
    updateField: <K extends keyof GenerationState>(
      field: K,
      value: GenerationState[K]
    ) => void;
    setPreview: (
      type: GenerationState["previewType"],
      value: string | null
    ) => void;
  };
}

/**
 * Field name mapping for store keys.
 */
const STORE_KEY_MAP: Record<string, keyof GenerationState> = {
  colorScheme: "colorScheme",
  lighting: "lighting",
  perspective: "perspective",
  composition: "composition",
  medium: "medium",
  mood: "mood",
};

/**
 * Renders all generation settings selectors using the static config.
 */
export const GenerationSettings = ({ store }: GenerationSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {GENERATION_SETTINGS.map((setting) => {
        const storeKey = setting.storeKey as keyof typeof STORE_KEY_MAP;
        const currentValue = store[storeKey as keyof typeof store] as string;

        return (
          <SettingsSelector
            key={setting.type}
            label={setting.label}
            options={setting.options}
            currentValue={currentValue}
            onChange={(value) =>
              store.updateField(STORE_KEY_MAP[storeKey], value)
            }
            type={setting.type}
            previewType={store.previewType}
            previewValue={store.previewValue}
            setPreview={store.setPreview}
          />
        );
      })}
    </div>
  );
};
