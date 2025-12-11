"use client";

import { SettingsSelector } from "@/components/generation/SettingsSelector";
import { GENERATION_SETTINGS } from "@/constants/generationSettings";
import { GenerationState } from "@/zustand/useGenerationStore";

interface GenerationSettingsProps {
  store: GenerationState;
}

/**
 * Renders all generation settings selectors using the static config.
 */
export const GenerationSettings = ({ store }: GenerationSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {GENERATION_SETTINGS.map((setting) => {
        const currentValue = store[setting.storeKey] as string;
        const setter = store[setting.setterKey] as (val: string) => void;

        return (
          <SettingsSelector
            key={setting.type}
            label={setting.label}
            options={setting.options}
            currentValue={currentValue}
            onChange={setter}
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
