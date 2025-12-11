"use client";

import { ImageData } from "@/types/image";
import { PasswordModal, ColorPickerModal } from "../image";
import VideoModalComponent from "../VideoModalComponent";

interface ImagePageModalsProps {
  // Password modal
  showPasswordModal: boolean;
  password: string;
  setPassword: (password: string) => void;
  onPasswordConfirm: () => void;
  onPasswordCancel: () => void;

  // Color picker modal
  showColorPicker: boolean;
  backgroundColor: string;
  onColorConfirm: (color: string) => void;
  onColorCancel: () => void;

  // Video modal
  isVideoModalOpen: boolean;
  onVideoModalClose: () => void;
  imageData: ImageData | null | false;
  hasVideo: boolean;
}

/**
 * Consolidated modal components for the ImagePage.
 * Extracted to reduce complexity of the main component.
 */
export const ImagePageModals = ({
  showPasswordModal,
  password,
  setPassword,
  onPasswordConfirm,
  onPasswordCancel,
  showColorPicker,
  backgroundColor,
  onColorConfirm,
  onColorCancel,
  isVideoModalOpen,
  onVideoModalClose,
  imageData,
  hasVideo,
}: ImagePageModalsProps) => {
  return (
    <>
      {showPasswordModal && (
        <PasswordModal
          password={password}
          setPassword={setPassword}
          onConfirm={onPasswordConfirm}
          onCancel={onPasswordCancel}
        />
      )}

      {showColorPicker && (
        <ColorPickerModal
          initialColor={backgroundColor}
          onConfirm={onColorConfirm}
          onCancel={onColorCancel}
        />
      )}

      {isVideoModalOpen && imageData && typeof imageData !== "boolean" && (
        <VideoModalComponent
          imageData={imageData}
          isOpen={isVideoModalOpen}
          onRequestClose={onVideoModalClose}
          downloadUrl={imageData.downloadUrl}
          ariaHideApp={false}
          initialData={hasVideo ? imageData : false}
        />
      )}
    </>
  );
};
