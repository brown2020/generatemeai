"use client";

import { PreviewMarker } from "@/components/generation/PreviewMarker";

interface GeneratedImagePreviewProps {
  imageUrl: string;
  showPreviewMarker: boolean;
  colorScheme?: string;
  lighting?: string;
  perspective?: string;
  composition?: string;
  medium?: string;
  mood?: string;
}

/**
 * Component to display the generated image with optional preview markers.
 */
export const GeneratedImagePreview = ({
  imageUrl,
  showPreviewMarker,
  colorScheme = "None",
  lighting = "None",
  perspective = "None",
  composition = "None",
  medium = "None",
  mood = "None",
}: GeneratedImagePreviewProps) => {
  if (!imageUrl) {
    return (
      <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
        Your generated image will appear here
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <img
        className="w-full max-h-[50vh] rounded-lg shadow-lg object-contain"
        src={imageUrl}
        alt="Generated visualization"
      />

      {showPreviewMarker && (
        <PreviewMarker
          generatedImage={imageUrl}
          colorScheme={colorScheme}
          lighting={lighting}
          perspective={perspective}
          composition={composition}
          medium={medium}
          mood={mood}
        />
      )}
    </div>
  );
};
