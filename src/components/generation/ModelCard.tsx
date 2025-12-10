import { useCallback } from "react";
import { SelectModel } from "@/constants/models";
import { SelectableCard } from "./SelectableCard";

interface ModelCardProps {
  model: SelectModel;
  isSelected: boolean;
  onClick: () => void;
}

export const ModelCard = ({
  model: modelOption,
  isSelected,
  onClick,
}: ModelCardProps) => {
  const getPreviewPaths = useCallback(
    () =>
      Array.from(
        { length: 3 },
        (_, i) => `/previews/models/${modelOption.value}/${i + 1}.jpg`
      ),
    [modelOption.value]
  );

  return (
    <SelectableCard
      label={modelOption.label}
      isSelected={isSelected}
      onClick={onClick}
      getPreviewPaths={getPreviewPaths}
    />
  );
};
