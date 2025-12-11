"use client";

import { useRouter } from "next/navigation";
import { SiStagetimer } from "react-icons/si";
import TextareaAutosize from "react-textarea-autosize";
import { ImageData } from "@/types/image";

interface ImagePageOwnerActionsProps {
  imageData: ImageData;
  isOwner: boolean;
  uid: string;
  hasVideo: boolean;
  isGif: boolean;
  loading: boolean;

  // Caption
  caption: string;
  onCaptionChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;

  // Actions
  onShowColorPicker: () => void;
  onBackgroundRemove: () => void;
  onTryAgain: () => void;
  onShowVideoModal: () => void;
  onCreateGif: () => void;
}

/**
 * Owner-specific actions for the ImagePage.
 * Only rendered when the current user owns the image.
 */
export const ImagePageOwnerActions = ({
  imageData,
  isOwner,
  uid,
  hasVideo,
  isGif,
  loading,
  caption,
  onCaptionChange,
  onShowColorPicker,
  onBackgroundRemove,
  onTryAgain,
  onShowVideoModal,
  onCreateGif,
}: ImagePageOwnerActionsProps) => {
  const router = useRouter();

  // Non-owner view: show generate button
  if (!isOwner) {
    return (
      <button
        className="btn-primary2 h-12 flex items-center justify-center mx-3"
        onClick={() => router.push("/generate")}
      >
        Next: Generate Your Image
      </button>
    );
  }

  const isCloudFrontImage = imageData.downloadUrl?.includes("cloudfront.net");
  const isGoogleStorageImage =
    imageData.downloadUrl?.includes("googleapis.com");

  return (
    <>
      {/* Caption editor (only for non-video content) */}
      {!hasVideo && (
        <div className="mt-4 w-full p-3 py-0">
          <h2 className="text-2xl mb-3 font-bold">Caption:</h2>
          <TextareaAutosize
            value={caption}
            onChange={onCaptionChange}
            placeholder="Enter caption"
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
      )}

      {/* Background color change (CloudFront images only) */}
      {isCloudFrontImage && !hasVideo && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
          onClick={onShowColorPicker}
        >
          Change Background Color
        </button>
      )}

      {/* Background removal (Google Storage images only) */}
      {isGoogleStorageImage && !hasVideo && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
          onClick={onBackgroundRemove}
        >
          Remove Background
        </button>
      )}

      {/* GIF creation (video content only, not already a GIF) */}
      {hasVideo && !isGif && (
        <div className="p-2">
          <button
            onClick={onCreateGif}
            className="btn-primary2 flex h-12 items-center justify-center w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex flex-row items-center space-x-2">
                <span className="rotating-icon">
                  <SiStagetimer />
                </span>
                <span>Converting...</span>
              </span>
            ) : (
              <span>Create GIF</span>
            )}
          </button>
        </div>
      )}

      {/* Try again button */}
      {!hasVideo ? (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={onTryAgain}
        >
          Try again
        </button>
      ) : (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={onShowVideoModal}
        >
          Try again
        </button>
      )}
    </>
  );
};
