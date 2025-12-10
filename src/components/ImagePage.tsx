"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";
import "../app/globals.css";
import { processVideoToGIF } from "@/actions/generateGif";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import useProfileStore from "@/zustand/useProfileStore";
import { creditsToMinus } from "@/utils/credits";
import ModalComponent from "./VideoModalComponent";
import { removeBackground } from "@/actions/removeBackground";
import { SiStagetimer } from "react-icons/si";
import { ImageData } from "@/types/image";
import { FirestorePaths } from "@/firebase/paths";
import { useImagePageData, useImagePageActions } from "./image-page";

import {
  ImageViewer,
  ImageMetadata,
  ImageActions,
  TagManager,
  SocialShare,
  PasswordModal,
  ColorPickerModal,
  PasswordProtection,
} from "./image";

const getFileTypeFromUrl = (url: string): string | null => {
  if (!url) return null;
  const fileName = url.split("/").pop();
  const cleanFileName = fileName?.split("?")[0];
  const fileParts = cleanFileName?.split(".");
  return fileParts && fileParts.length > 1 ? fileParts.pop() || null : null;
};

interface ImagePageProps {
  id: string;
}

const ImagePage = ({ id }: ImagePageProps) => {
  const router = useRouter();
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);

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
  } = useImagePageData({ id, uid, authPending });

  const {
    toggleSharable,
    handleDelete,
    handleCaptionChange,
    changeBackground,
    handleTryAgain,
    cleanupDebounce,
  } = useImagePageActions({
    id,
    uid,
    imageData,
    isSharable,
    setIsSharable,
    refreshData,
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile state
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const briaApiKey = useProfileStore((s) => s.profile.bria_api_key);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupDebounce();
  }, [cleanupDebounce]);

  const handleToggleSharable = useCallback(async () => {
    await toggleSharable(password);
    setShowPasswordModal(false);
  }, [toggleSharable, password]);

  const onCaptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleCaptionChange(event, setCaption);
    },
    [handleCaptionChange, setCaption]
  );

  const onChangeBackground = useCallback(
    async (color: string) => {
      await changeBackground(color, setBackgroundColor);
      setShowColorPicker(false);
    },
    [changeBackground, setBackgroundColor]
  );

  const handleBackgroundRemove = useCallback(async () => {
    if (!imageData || typeof imageData === "boolean") return;
    const imageUrl = imageData.downloadUrl;

    try {
      const result = await removeBackground(
        useCredits,
        credits,
        imageUrl,
        briaApiKey
      );

      if (!result?.error) {
        if (useCredits) {
          minusCredits(creditsToMinus("bria.ai"));
        }

        const docRef = uid
          ? doc(db, FirestorePaths.profileCover(uid, id))
          : doc(db, FirestorePaths.publicImage(id));

        await updateDoc(docRef, { downloadUrl: result?.result_url });
        refreshData();
        toast.success("Background removed successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error removing background: ", error);
      toast.error(`Failed to remove background: ${errorMessage}`);
    }
  }, [
    imageData,
    uid,
    id,
    useCredits,
    credits,
    briaApiKey,
    minusCredits,
    refreshData,
  ]);

  const handleCreateGif = useCallback(async () => {
    if (!imageData || typeof imageData === "boolean") return;
    try {
      setLoading(true);
      const response = await processVideoToGIF(
        imageData.videoDownloadUrl!,
        id,
        uid
      );
      setLoading(false);
      toast.success("GIF Created Successfully!");
      router.push(`${response}`);
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
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
  const hasVideo = imageData?.videoDownloadUrl;
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
          onShowPasswordModal={() => setShowPasswordModal(true)}
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
          openAPIKey={openAPIKey}
          useCredits={useCredits}
          credits={credits}
          minusCredits={minusCredits}
        />
      )}

      {imageData && uid && isOwner && !hasVideo && (
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

      {imageData &&
        uid &&
        isOwner &&
        imageData.downloadUrl?.includes("cloudfront.net") &&
        !hasVideo && (
          <button
            className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
            onClick={() => setShowColorPicker(true)}
          >
            Change Background Color
          </button>
        )}

      {imageData &&
        uid &&
        isOwner &&
        imageData.downloadUrl?.includes("googleapis.com") &&
        !hasVideo && (
          <button
            className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
            onClick={handleBackgroundRemove}
          >
            Remove Background
          </button>
        )}

      {imageData && !isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={() => router.push("/generate")}
        >
          Next: Generate Your Image
        </button>
      )}

      {hasVideo && !isGif && (
        <div className="p-2">
          <button
            onClick={handleCreateGif}
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

      {!hasVideo && uid && isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={handleTryAgain}
        >
          Try again
        </button>
      )}

      {hasVideo && uid && isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={() => setIsModalOpen(true)}
        >
          Try again
        </button>
      )}

      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal
          password={password}
          setPassword={setPassword}
          onConfirm={handleToggleSharable}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}

      {showColorPicker && (
        <ColorPickerModal
          initialColor={backgroundColor}
          onConfirm={onChangeBackground}
          onCancel={() => setShowColorPicker(false)}
        />
      )}

      {isModalOpen && imageData && (
        <ModalComponent
          imageData={{ ...imageData }}
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          downloadUrl={imageData.downloadUrl}
          ariaHideApp={false}
          initialData={hasVideo && imageData}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImagePage;
