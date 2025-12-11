"use client";

import { Tag } from "lucide-react";

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

/**
 * Tag filter component for filtering images by tags.
 */
export const TagFilter = ({
  allTags,
  selectedTags,
  onToggleTag,
}: TagFilterProps) => {
  if (allTags.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Tag className="w-4 h-4" />
        Tags
      </div>
      <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {allTags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onToggleTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
