"use client";

import { useState } from "react";
import { Download, Lock, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { ImageData } from "@/types/image";
import { getFileTypeFromUrl } from "@/utils/imageUtils";

interface ImageActionsProps {
  imageData: ImageData;
  isOwner: boolean;
  isSharable: boolean;
  uid: string;
  onToggleSharable: () => void;
  onDelete: () => void;
  onShowPasswordModal: () => void;
}

/**
 * Action buttons for image operations (download, share, delete).
 */
export const ImageActions = ({
  imageData,
  isOwner,
  isSharable,
  uid,
  onToggleSharable,
  onDelete,
  onShowPasswordModal,
}: ImageActionsProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDownload = async () => {
    if (imageData?.videoDownloadUrl) {
      const videoUrl = imageData.videoDownloadUrl;
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${
        imageData?.freestyle
      }_${currentDate}.${getFileTypeFromUrl(videoUrl)}`;

      try {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Download failed (${response.status})`);
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Download error: ${msg}`);
      }
    } else {
      const container = document.getElementById("image-container");
      if (!container) return;

      try {
        // Dynamic import for better bundle size
        const domtoimage = (await import("dom-to-image")).default;

        const dataUrl = await domtoimage.toPng(container);
        const currentDate = new Date().toISOString().split("T")[0];
        const fileName = `${imageData?.freestyle}_${currentDate}.png`;

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Download error: ${msg}`);
      }
    }
  };

  const handleShareClick = () => {
    if (isSharable) {
      onToggleSharable();
    } else {
      onShowPasswordModal();
    }
  };

  const actionClass = "min-w-[200px] flex-1";

  return (
    <div className="flex flex-wrap gap-3">
      {imageData && (
        <Button size="lg" className={actionClass} leftIcon={<Download className="size-5" />} onClick={handleDownload}>
          Download
        </Button>
      )}

      {uid && isOwner && (
        <Button
          size="lg"
          variant="secondary"
          className={actionClass}
          leftIcon={isSharable ? <Lock className="size-5" /> : <Share2 className="size-5" />}
          onClick={handleShareClick}
        >
          {isSharable ? "Make Private" : "Make Sharable"}
        </Button>
      )}

      {imageData && uid && isOwner && (
        <Button
          size="lg"
          variant="outline"
          className={`${actionClass} border-red-200 text-red-600 hover:bg-red-50`}
          leftIcon={<Trash2 className="size-5" />}
          onClick={() => setConfirmingDelete(true)}
        >
          Delete
        </Button>
      )}

      <DeleteConfirmModal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        title="Delete This Image?"
        message="It will be removed from your gallery and any public link will stop working. This can't be undone."
      />
    </div>
  );
};
