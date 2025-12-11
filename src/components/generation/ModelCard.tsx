"use client";

import { memo, useCallback } from "react";
import { SelectModel } from "@/constants/models";
import { SelectableCard } from "./SelectableCard";

interface ModelCardProps {
  model: SelectModel;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Model selection card - thin wrapper around SelectableCard.
 */
export const ModelCard = memo(function ModelCard({
  model,
  isSelected,
  onClick,
}: ModelCardProps) {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <SelectableCard
      label={model.label}
      previewUrl={`/previews/models/${model.value}/1.jpg`}
      isSelected={isSelected}
      onClick={handleClick}
    />
  );
});
