"use client";

import { Filter, Image as ImageIcon, Video } from "lucide-react";
import { FilterType } from "./FilterBar";

interface FilterButtonProps {
  type: FilterType;
  isActive: boolean;
  onClick: () => void;
}

const FILTER_CONFIG: Record<
  FilterType,
  { icon: React.ElementType; label: string }
> = {
  all: { icon: Filter, label: "All" },
  image: { icon: ImageIcon, label: "Images" },
  video: { icon: Video, label: "Videos" },
};

/**
 * Reusable filter button component.
 */
export const FilterButton = ({
  type,
  isActive,
  onClick,
}: FilterButtonProps) => {
  const config = FILTER_CONFIG[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </button>
  );
};
