"use client";

import { memo, useCallback } from "react";
import { normalizeValue } from "@/utils/imageUtils";
import { SelectableCard } from "./SelectableCard";

interface StyleCardProps {
  style: { value: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Style selection card - thin wrapper around SelectableCard.
 */
export const StyleCard = memo(function StyleCard({
  style,
  isSelected,
  onClick,
}: StyleCardProps) {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const normalizedValue = normalizeValue(style.value);

  return (
    <SelectableCard
      label={style.label}
      previewUrl={`/previews/styles/${normalizedValue}/1.jpg`}
      isSelected={isSelected}
      onClick={handleClick}
    />
  );
});
