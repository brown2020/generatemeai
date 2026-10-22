"use client";

import { Info } from "lucide-react";
import { ImageData } from "@/types/image";
import { getModelConfig } from "@/constants/modelRegistry";

interface ImageMetadataProps {
  imageData: ImageData;
}

const timestampFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const MetadataRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <dt className="font-medium text-gray-600">{label}</dt>
      <dd className="min-w-0 wrap-break-word">{value}</dd>
    </div>
  );
};

/**
 * Displays metadata information about the image.
 */
export const ImageMetadata = ({ imageData }: ImageMetadataProps) => {
  const timestampValue = imageData?.timestamp
    ? timestampFormat.format(new Date(imageData.timestamp))
    : undefined;
  const modelLabel = (model?: string) =>
    model ? (getModelConfig(model)?.label ?? model) : undefined;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Info className="w-5 h-5 text-gray-500" aria-hidden />
        Details
      </h2>

      <dl className="grid gap-3 text-sm">
        <MetadataRow label="Prompt" value={imageData?.freestyle} />
        <MetadataRow label="Style" value={imageData?.style} />
        <MetadataRow label="Model" value={modelLabel(imageData?.model)} />
        <MetadataRow label="Color" value={imageData?.colorScheme} />
        <MetadataRow label="Lighting" value={imageData?.lighting} />
        <MetadataRow label="Perspective" value={imageData?.perspective} />
        <MetadataRow label="Composition" value={imageData?.composition} />
        <MetadataRow label="Medium" value={imageData?.medium} />
        <MetadataRow label="Mood" value={imageData?.mood} />
        <MetadataRow label="Category" value={imageData?.imageCategory} />
        <MetadataRow label="Created" value={timestampValue && `${timestampValue} UTC`} />
        <MetadataRow label="Video Model" value={modelLabel(imageData?.videoModel)} />
        <MetadataRow label="Audio" value={imageData?.audio} />
        <MetadataRow label="Script" value={imageData?.scriptPrompt} />
        {!imageData?.scriptPrompt && (
          <MetadataRow label="Animation" value={imageData?.animation} />
        )}

        {(imageData?.imageReference ||
          (imageData?.downloadUrl && imageData?.videoDownloadUrl)) && (
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <dt className="font-medium text-gray-600">
              {imageData?.imageReference ? "Reference Image" : "Avatar"}
            </dt>
            <dd>
            <img
              className="w-32 h-32 object-cover rounded-md border border-gray-200"
              src={imageData?.imageReference || imageData?.downloadUrl}
              alt={imageData?.freestyle || "Reference used for this generation"}
            />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};
