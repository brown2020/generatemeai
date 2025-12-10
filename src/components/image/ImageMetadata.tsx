"use client";

import { Info } from "lucide-react";
import { ImageData } from "@/types/image";

interface ImageMetadataProps {
  imageData: ImageData;
}

/**
 * Displays metadata information about the image.
 */
export const ImageMetadata = ({ imageData }: ImageMetadataProps) => {
  const MetadataRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <span className="font-medium text-gray-600">{label}:</span>
        <span>{value}</span>
      </div>
    );
  };

  const timestampValue = imageData?.timestamp?.seconds
    ? new Date(imageData.timestamp.seconds * 1000).toLocaleString()
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Info className="w-5 h-5 text-gray-500" />
        Metadata
      </h2>

      <div className="grid gap-3 text-sm">
        <MetadataRow label="Freestyle" value={imageData?.freestyle} />
        <MetadataRow label="Style" value={imageData?.style} />
        <MetadataRow label="Model" value={imageData?.model} />
        <MetadataRow label="Color" value={imageData?.colorScheme} />
        <MetadataRow label="Lighting" value={imageData?.lighting} />
        <MetadataRow label="Perspective" value={imageData?.perspective} />
        <MetadataRow label="Composition" value={imageData?.composition} />
        <MetadataRow label="Medium" value={imageData?.medium} />
        <MetadataRow label="Mood" value={imageData?.mood} />
        <MetadataRow label="Category" value={imageData?.imageCategory} />
        <MetadataRow label="Timestamp" value={timestampValue} />
        <MetadataRow label="Video Model" value={imageData?.videoModel} />
        <MetadataRow label="Audio" value={imageData?.audio} />
        <MetadataRow label="Script" value={imageData?.scriptPrompt} />
        {!imageData?.scriptPrompt && (
          <MetadataRow label="Animation" value={imageData?.animation} />
        )}

        {(imageData?.imageReference ||
          (imageData?.downloadUrl && imageData?.videoDownloadUrl)) && (
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-600">
              {imageData?.imageReference ? "Image Reference" : "Avatar"} Used:
            </span>
            <img
              className="w-32 h-32 object-cover rounded-md border-2 border-black-600"
              src={imageData?.imageReference || imageData?.downloadUrl}
              alt="image reference used"
            />
          </div>
        )}
      </div>
    </div>
  );
};
