"use client";

import { Search } from "lucide-react";
import { FilterButton } from "./FilterButton";

export type FilterType = "all" | "image" | "video";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
}

/**
 * Search and filter bar for the images list.
 */
export const FilterBar = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="gallery-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="gallery-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by prompt or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <FilterButton
          type="all"
          isActive={filterType === "all"}
          onClick={() => onFilterChange("all")}
        />
        <FilterButton
          type="image"
          isActive={filterType === "image"}
          onClick={() => onFilterChange("image")}
        />
        <FilterButton
          type="video"
          isActive={filterType === "video"}
          onClick={() => onFilterChange("video")}
        />
      </div>
    </div>
  );
};
