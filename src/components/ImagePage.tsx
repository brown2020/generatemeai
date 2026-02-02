"use client";

import { useState, useCallback, useMemo } from "react";
import { db } from "@/firebase/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";
import { processVideoToGIF } from "@/actions/generateGif";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useProfileStore from "@/zustand/useProfileStore";
import { creditsToMinus } from "@/constants/modelRegistry";
import { getFileTypeFromUrl } from "@/utils/imageUtils";
import { removeBackground } from "@/actions/removeBackground";
import { ImageData } from "@/types/image";
import { FirestorePaths } from "@/firebase/paths";

/**
 * Modal types for the image page.
 * Using a discriminated union provides type safety and simplifies state management.
 */
type ModalType = "password" | "colorPicker" | "video" | null;
import {
  useImagePageData,
  useImagePageActions,
  ImagePageModals,
  ImagePageOwnerActions,
} from "./image-page";

import {
  ImageViewer,
  ImageMetadata,
  ImageActions,
  TagManager,
  SocialShare,
  PasswordProtection,
} from "./image";

interface ImagePageProps {
  id: string;
}

const ImagePage = ({ id }: ImagePageProps) => {
  const router = useRouter();
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);
  const authReady = useAuthStore((s) => s.authReady);

  // Profile state
  const profile = useProfileStore((s) => s.profile);
  const minusCredits = useProfileStore((s) => s.minusCredits);

  // Use custom hooks for data and actions
  const {
    imageData,
    isOwner,
    isSharable,
    tags,
    caption,
    backgroundColor,
    isPasswordProtected,
    setIsSharable,
    setTags,
    setCaption,
    setBackgroundColor,
    refreshData,
  } = useImagePageData({ id, uid, authPending, authReady });

  const {
    toggleSharable,
    handleDelete,
    handleCaptionChange,
    changeBackground,
    handleTryAgain,
  } = useImagePageActions({
    id,
    uid,
    imageData,
    isSharable,
    setIsSharable,
    refreshData,
  });

  // Consolidated modal state - only one modal can be open at a time
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived modal states for cleaner component props
  const modalState = useMemo(
    () => ({
      showPasswordModal: activeModal === "password",
      showColorPicker: activeModal === "colorPicker",
      isVideoModalOpen: activeModal === "video",
    }),
    [activeModal]
  );

  const closeModal = useCallback(() => setActiveModal(null), []);

  // Handlers
  const handleToggleSharable = useCallback(async () => {
    await toggleSharable(password);
    closeModal();
  }, [toggleSharable, password, closeModal]);

  const onCaptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleCaptionChange(event, setCaption);
    },
    [handleCaptionChange, setCaption]
  );

  const onChangeBackground = useCallback(
    async (color: string) => {
      await changeBackground(color, setBackgroundColor);
      closeModal();
    },
    [changeBackground, setBackgroundColor, closeModal]
  );

  const handleBackgroundRemove = useCallback(async () => {
    if (!imageData || typeof imageData === "boolean") return;

    try {
      const result = await removeBackground(
        profile.useCredits,
        profile.credits,
        imageData.downloadUrl,
        profile.bria_api_key
      );

      if (result.success) {
        if (profile.useCredits) {
          minusCredits(creditsToMinus("bria.ai"));
        }

        const docRef = uid
          ? doc(db, FirestorePaths.profileCover(uid, id))
          : doc(db, FirestorePaths.publicImage(id));

        await updateDoc(docRef, { downloadUrl: result.data.result_url });
        refreshData();
        toast.success("Background removed successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error removing background:", error);
      toast.error(`Failed to remove background: ${errorMessage}`);
    }
  }, [imageData, uid, id, profile, minusCredits, refreshData]);

  const handleCreateGif = useCallback(async () => {
    if (!imageData || typeof imageData === "boolean") return;
    try {
      setLoading(true);
      const result = await processVideoToGIF(
        imageData.videoDownloadUrl!,
        id,
        uid
      );

      if (result.success) {
        toast.success("GIF Created Successfully!");
        router.push(`/images/${result.data.newId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [imageData, id, uid, router]);

  // Render states
  if (imageData === false) {
    return (
      <div className="text-center text-3xl mt-10">
        The image does not exist or is private.
      </div>
    );
  }

  if (isPasswordProtected && !passwordVerified && !isOwner && imageData) {
    return (
      <PasswordProtection
        correctPassword={imageData.password || ""}
        onVerified={() => setPasswordVerified(true)}
      />
    );
  }

  const currentPageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/images/${id}`
      : "";
  const hasVideo = !!imageData?.videoDownloadUrl;
  const isGif = getFileTypeFromUrl(imageData?.videoDownloadUrl || "") === "gif";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {imageData && (
        <ImageViewer
          imageData={imageData as ImageData}
          backgroundColor={backgroundColor}
        />
      )}

      {imageData && isSharable && <SocialShare url={currentPageUrl} />}

      {imageData && (
        <ImageActions
          imageData={imageData as ImageData}
          isOwner={isOwner}
          isSharable={isSharable}
          uid={uid}
          onToggleSharable={handleToggleSharable}
          onDelete={handleDelete}
          onShowPasswordModal={() => setActiveModal("password")}
        />
      )}

      {imageData && <ImageMetadata imageData={imageData as ImageData} />}

      {uid && isOwner && imageData && (
        <TagManager
          imageData={imageData as ImageData}
          tags={tags}
          setTags={setTags}
          uid={uid}
          imageId={id}
          openAPIKey={profile.openai_api_key}
          useCredits={profile.useCredits}
          credits={profile.credits}
          minusCredits={minusCredits}
        />
      )}

      {imageData && uid && (
        <ImagePageOwnerActions
          imageData={imageData as ImageData}
          isOwner={isOwner}
          uid={uid}
          hasVideo={hasVideo}
          isGif={isGif}
          loading={loading}
          caption={caption}
          onCaptionChange={onCaptionChange}
          onShowColorPicker={() => setActiveModal("colorPicker")}
          onBackgroundRemove={handleBackgroundRemove}
          onTryAgain={handleTryAgain}
          onShowVideoModal={() => setActiveModal("video")}
          onCreateGif={handleCreateGif}
        />
      )}

      <ImagePageModals
        showPasswordModal={modalState.showPasswordModal}
        password={password}
        setPassword={setPassword}
        onPasswordConfirm={handleToggleSharable}
        onPasswordCancel={closeModal}
        showColorPicker={modalState.showColorPicker}
        backgroundColor={backgroundColor}
        onColorConfirm={onChangeBackground}
        onColorCancel={closeModal}
        isVideoModalOpen={modalState.isVideoModalOpen}
        onVideoModalClose={closeModal}
        imageData={imageData}
        hasVideo={hasVideo}
      />
    </div>
  );
};

export default ImagePage;
