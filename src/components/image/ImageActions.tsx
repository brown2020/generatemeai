"use client";

import { Download, Lock, Share2, Trash2 } from "lucide-react";
import domtoimage from "dom-to-image";
import toast from "react-hot-toast";
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
  const handleDownload = async () => {
    if (imageData?.videoDownloadUrl) {
      const videoUrl = imageData.videoDownloadUrl;
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${
        imageData?.freestyle
      }_${currentDate}.${getFileTypeFromUrl(videoUrl)}`;

      try {
        const response = await fetch(videoUrl);
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
        console.error("Video download error:", error);
        toast.error("Download error: " + error);
      }
    } else {
      const container = document.getElementById("image-container");
      if (!container) return;

      try {
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
        toast.error("Download error: " + error);
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

  return (
    <div className="flex flex-wrap gap-3">
      {imageData && (
        <button
          className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600 text-white rounded-lg font-medium 
            hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5" />
          Download
        </button>
      )}

      {uid && isOwner && (
        <button
          className="flex-1 min-w-[200px] px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium 
            hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          onClick={handleShareClick}
        >
          {isSharable ? (
            <>
              <Lock className="w-5 h-5" />
              Make Private
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Make Sharable
            </>
          )}
        </button>
      )}

      {imageData && uid && isOwner && (
        <button
          className="flex-1 min-w-[200px] px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium 
            hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          onClick={onDelete}
        >
          <Trash2 className="w-5 h-5" />
          Delete
        </button>
      )}
    </div>
  );
};
