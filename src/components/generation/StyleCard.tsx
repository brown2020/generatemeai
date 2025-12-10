import { useCallback } from "react";
import { normalizeValue } from "@/utils/imageUtils";
import { SelectableCard } from "./SelectableCard";

interface StyleCardProps {
  style: { value: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}

export const StyleCard = ({ style, isSelected, onClick }: StyleCardProps) => {
  const getPreviewPaths = useCallback(() => {
    const normalizedValue = normalizeValue(style.value);
    return Array.from(
      { length: 3 },
      (_, i) => `/previews/styles/${normalizedValue}/${i + 1}.jpg`
    );
  }, [style.value]);

  return (
    <SelectableCard
      label={style.label}
      isSelected={isSelected}
      onClick={onClick}
      getPreviewPaths={getPreviewPaths}
    />
  );
};
