"use client";

import { ImageData } from "@/types/image";

interface ImageViewerProps {
  imageData: ImageData;
  backgroundColor?: string;
}

/**
 * Displays the main image or video content.
 */
export const ImageViewer = ({
  imageData,
  backgroundColor,
}: ImageViewerProps) => {
  const getFileTypeFromUrl = (url: string): string | null | undefined => {
    if (!url) return null;
    const fileName = url.split("/").pop();
    const cleanFileName = fileName?.split("?")[0];
    const fileParts = cleanFileName?.split(".");
    return fileParts && fileParts.length > 1 ? fileParts.pop() : null;
  };

  const isGif = getFileTypeFromUrl(imageData?.videoDownloadUrl || "") === "gif";
  const hasVideo = imageData?.videoDownloadUrl && !isGif;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
      <div
        className="relative aspect-square"
        id="image-container"
        style={{ backgroundColor: backgroundColor || "#ffffff" }}
      >
        {hasVideo ? (
          <video
            className="w-full h-full object-contain"
            src={imageData.videoDownloadUrl}
            controls
            height={512}
            width={512}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            className="w-full h-full object-contain"
            src={isGif ? imageData.videoDownloadUrl : imageData.downloadUrl}
            alt="Visual Result"
            height={512}
            width={512}
          />
        )}

        {imageData.caption && (
          <div className="absolute inset-0 flex items-end justify-center cursor-default p-4">
            <div className="bg-black/60 backdrop-blur-xs text-white text-xl md:text-2xl rounded-lg text-center p-4 w-full max-w-2xl">
              {imageData.caption}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
