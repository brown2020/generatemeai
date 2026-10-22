"use client";

import { useState } from "react";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Modal, buttonClassName } from "@/components/ui";
import { ImageData } from "@/types/image";

interface ImagePageOwnerActionsProps {
  imageData: ImageData;
  isOwner: boolean;
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
  const [confirmingBackgroundRemoval, setConfirmingBackgroundRemoval] = useState(false);

  if (!isOwner) {
    return (
      <Link href="/generate" className={buttonClassName({ size: "lg", className: "w-full" })}>
        Generate Your Own Image
      </Link>
    );
  }

  const isCloudFrontImage = imageData.downloadUrl?.includes("cloudfront.net");
  const isGoogleStorageImage = imageData.downloadUrl?.includes("googleapis.com");

  return (
    <section aria-label="Edit image" className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      {!hasVideo && (
        <div>
          <label htmlFor="image-caption" className="mb-1.5 block text-sm font-medium text-gray-700">
            Caption
          </label>
          <TextareaAutosize
            id="image-caption"
            name="image-caption"
            autoComplete="off"
            value={caption}
            onChange={onCaptionChange}
            placeholder="Add a caption…"
            className="input-primary"
          />
          <p className="mt-1 text-xs text-gray-500">Saves automatically.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isCloudFrontImage && !hasVideo && (
          <Button variant="secondary" onClick={onShowColorPicker}>
            Change Background Color
          </Button>
        )}
        {isGoogleStorageImage && !hasVideo && (
          <Button variant="secondary" onClick={() => setConfirmingBackgroundRemoval(true)}>
            Remove Background
          </Button>
        )}
        {hasVideo && !isGif && (
          <Button variant="secondary" loading={loading} onClick={onCreateGif}>
            {loading ? "Converting…" : "Create GIF"}
          </Button>
        )}
        <Button variant="secondary" onClick={hasVideo ? onShowVideoModal : onTryAgain}>
          Try Again
        </Button>
      </div>

      {confirmingBackgroundRemoval && (
        <Modal
          title="Remove the Background?"
          description="This replaces the saved image with a transparent-background version and uses credits (or your Bria API key)."
          onClose={() => setConfirmingBackgroundRemoval(false)}
        >
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmingBackgroundRemoval(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmingBackgroundRemoval(false);
                onBackgroundRemove();
              }}
            >
              Remove Background
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
};
