"use client";

import { useState } from "react";
import { PreviewMarker } from "@/components/generation/PreviewMarker";

interface GeneratedImagePreviewProps {
  imageUrl: string;
  imageUrls?: string[];
  showPreviewMarker: boolean;
  colorScheme?: string;
  lighting?: string;
  perspective?: string;
  composition?: string;
  medium?: string;
  mood?: string;
  onSelectImage?: (url: string) => void;
}

/**
 * Component to display generated image(s) with optional preview markers.
 * Supports single and multi-image layouts with selection.
 */
export const GeneratedImagePreview = ({
  imageUrl,
  imageUrls = [],
  showPreviewMarker,
  colorScheme = "None",
  lighting = "None",
  perspective = "None",
  composition = "None",
  medium = "None",
  mood = "None",
  onSelectImage,
}: GeneratedImagePreviewProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasMultiple = imageUrls.length > 1;
  const displayUrl = hasMultiple ? (imageUrls[selectedIndex] || imageUrl) : imageUrl;

  if (!imageUrl) {
    return (
      <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
        Your generated image will appear here
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      <div className="relative">
        <img
          className="w-full max-h-[50vh] rounded-lg shadow-lg object-contain"
          src={displayUrl}
          alt="Generated visualization"
        />

        {showPreviewMarker && (
          <PreviewMarker
            generatedImage={displayUrl}
            colorScheme={colorScheme}
            lighting={lighting}
            perspective={perspective}
            composition={composition}
            medium={medium}
            mood={mood}
          />
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2">
          {imageUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIndex(i);
                onSelectImage?.(url);
              }}
              className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                i === selectedIndex
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={url}
                alt={`Variation ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
