"use client";

import { memo, useMemo } from "react";
import { normalizeValue } from "@/utils/imageUtils";

interface SelectableCardProps {
  /** Display label */
  label: string;
  /** Preview image URL */
  previewUrl?: string;
  /** Whether this card is selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Optional badge text */
  badge?: string;
  /** Whether to show preview image */
  showPreview?: boolean;
}

/**
 * Generic selectable card component for models, styles, etc.
 */
export const SelectableCard = memo(function SelectableCard({
  label,
  previewUrl,
  isSelected,
  onClick,
  badge,
  showPreview = true,
}: SelectableCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all
        ${
          isSelected
            ? "border-blue-600 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      onClick={onClick}
    >
      {showPreview && previewUrl && (
        <div className="w-full aspect-square mb-2 rounded overflow-hidden bg-gray-100">
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <span
        className={`text-xs font-medium text-center line-clamp-2 ${
          isSelected ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {label}
      </span>

      {badge && (
        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded">
          {badge}
        </span>
      )}

      {isSelected && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Specialized Card Components (thin wrappers for type safety)
// ============================================================================

type PreviewType = "models" | "styles";

interface ItemCardProps {
  item: { value: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Creates a preview URL based on item type and value.
 */
const getPreviewUrl = (type: PreviewType, value: string): string => {
  const normalizedValue = type === "styles" ? normalizeValue(value) : value;
  return `/previews/${type}/${normalizedValue}/1.jpg`;
};

/**
 * Model selection card.
 */
export const ModelCard = memo(function ModelCard({
  item,
  isSelected,
  onClick,
}: ItemCardProps) {
  const previewUrl = useMemo(
    () => getPreviewUrl("models", item.value),
    [item.value]
  );

  return (
    <SelectableCard
      label={item.label}
      previewUrl={previewUrl}
      isSelected={isSelected}
      onClick={onClick}
    />
  );
});

/**
 * Style selection card.
 */
export const StyleCard = memo(function StyleCard({
  item,
  isSelected,
  onClick,
}: ItemCardProps) {
  const previewUrl = useMemo(
    () => getPreviewUrl("styles", item.value),
    [item.value]
  );

  return (
    <SelectableCard
      label={item.label}
      previewUrl={previewUrl}
      isSelected={isSelected}
      onClick={onClick}
    />
  );
});
