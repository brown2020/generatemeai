"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Check } from "lucide-react";
import { usePreviewSaver } from "@/hooks/usePreviewSaver";

interface PreviewMarkerProps {
  generatedImage: string;
  colorScheme: string;
  lighting: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
}

/**
 * Component for marking generated images as previews for different settings.
 * Only rendered when NEXT_PUBLIC_ENABLE_PREVIEW_MARKING is true.
 */
export function PreviewMarker({
  generatedImage,
  colorScheme,
  lighting,
  perspective,
  composition,
  medium,
  mood,
}: PreviewMarkerProps) {
  const [showMarkAsPreview, setShowMarkAsPreview] = useState(false);
  const markAsPreviewRef = useRef<HTMLDivElement>(null);
  const { saveAsPreview } = usePreviewSaver();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMarkAsPreview &&
        markAsPreviewRef.current &&
        !markAsPreviewRef.current.contains(event.target as Node)
      ) {
        setShowMarkAsPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMarkAsPreview]);

  const toggleMarkAsPreview = useCallback(() => {
    setShowMarkAsPreview((prev) => !prev);
  }, []);

  const handleSaveAsPreview = useCallback(
    async (
      type:
        | "model"
        | "color"
        | "lighting"
        | "style"
        | "perspective"
        | "composition"
        | "medium"
        | "mood"
    ) => {
      await saveAsPreview(type);
      setShowMarkAsPreview(false);
    },
    [saveAsPreview]
  );

  if (!generatedImage) return null;

  // Define available preview options based on current settings
  const previewOptions = [
    { type: "model" as const, label: "Current Model", show: true },
    { type: "style" as const, label: "Current Style", show: true },
    {
      type: "color" as const,
      label: "Current Color Scheme",
      show: colorScheme !== "None",
    },
    {
      type: "lighting" as const,
      label: "Current Lighting",
      show: lighting !== "None",
    },
    {
      type: "perspective" as const,
      label: "Current Perspective",
      show: perspective !== "None",
    },
    {
      type: "composition" as const,
      label: "Current Composition",
      show: composition !== "None",
    },
    {
      type: "medium" as const,
      label: "Current Medium",
      show: medium !== "None",
    },
    { type: "mood" as const, label: "Current Mood", show: mood !== "None" },
  ];

  return (
    <>
      <button
        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-blue-600 p-2 rounded-full shadow-lg transition-colors"
        onClick={toggleMarkAsPreview}
        title="Mark as Preview"
      >
        <Check size={24} />
      </button>

      {showMarkAsPreview && (
        <div
          ref={markAsPreviewRef}
          className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-2 space-y-2 z-50"
        >
          <div className="text-sm font-medium text-gray-700 px-2 py-1">
            Save as preview for:
          </div>
          {previewOptions
            .filter((option) => option.show)
            .map((option) => (
              <button
                key={option.type}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                onClick={() => handleSaveAsPreview(option.type)}
              >
                {option.label}
              </button>
            ))}
        </div>
      )}
    </>
  );
}
