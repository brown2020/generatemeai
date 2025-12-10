"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase/firebaseClient";
import {
  doc,
  getDoc,
  runTransaction,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // Image state
  const [imageData, setImageData] = useState<ImageData | null | false>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSharable, setIsSharable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
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

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch image data
  useEffect(() => {
    const fetchImageData = async () => {
      let docRef;
      if (uid && !authPending) {
        docRef = doc(db, "profiles", uid, "covers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ImageData;
          setImageData({ ...data, id });
          setIsSharable(data?.isSharable ?? false);
          setTags(data?.tags ?? []);
          setCaption(data?.caption ?? "");
          setIsOwner(true);
          setBackgroundColor(data?.backgroundColor || "#ffffff");
        }
      } else if (!isOwner) {
        docRef = doc(db, "publicImages", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ImageData;
          setImageData({ ...data, id });
          setIsSharable(data?.isSharable ?? false);
          setTags(data?.tags ?? []);
          setCaption(data?.caption ?? "");
          setBackgroundColor(data?.backgroundColor || "#ffffff");
          if (data?.password) {
            setIsPasswordProtected(true);
          }
        } else {
          setImageData(false);
        }
      }
    };

    if (id) fetchImageData();
  }, [id, uid, authPending, refreshCounter, isOwner]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const toggleSharable = useCallback(async () => {
    if (!imageData || !uid) return;
    try {
      const newSharableState = !isSharable;
      const coversDocRef = doc(db, "profiles", uid, "covers", id);
      const publicImagesDocRef = doc(db, "publicImages", id);

      if (newSharableState) {
        await runTransaction(db, async (transaction) => {
          const coversDocSnap = await transaction.get(coversDocRef);
          if (!coversDocSnap.exists()) {
            throw new Error("Document does not exist in covers");
          }
          transaction.set(publicImagesDocRef, {
            ...coversDocSnap.data(),
            isSharable: true,
            password: password,
          });
          transaction.update(coversDocRef, { isSharable: true });
        });
        setShowPasswordModal(false);
      } else {
        await runTransaction(db, async (transaction) => {
          const publicImagesDocSnap = await transaction.get(publicImagesDocRef);
          if (!publicImagesDocSnap.exists()) {
            throw new Error("Document does not exist in publicImages");
          }
          transaction.set(coversDocRef, {
            ...publicImagesDocSnap.data(),
            isSharable: false,
            password: "",
          });
          transaction.delete(publicImagesDocRef);
        });
      }

      setIsSharable(newSharableState);
      toast.success(
        `Image is now ${newSharableState ? "sharable" : "private"}`
      );
    } catch (error) {
      toast.error("Error updating share status: " + error);
    }
  }, [imageData, uid, id, isSharable, password]);

  const handleDelete = useCallback(async () => {
    if (!imageData || !uid) return;

    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const docRef = doc(db, "profiles", uid, "covers", id);
        await deleteDoc(docRef);

        const publicImagesDocRef = doc(db, "publicImages", id);
        await deleteDoc(publicImagesDocRef);

        toast.success("Image deleted successfully");
        delay(1000).then(() => router.push("/images"));
      } catch (error) {
        toast.error("Error deleting image: " + error);
      }
    }
  }, [imageData, uid, id, router]);

  const handleCaptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCaption(event.target.value);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        if (!imageData) return;
        try {
          const docRef = uid
            ? doc(db, "profiles", uid, "covers", id)
            : doc(db, "publicImages", id);

          await updateDoc(docRef, { caption: event.target.value || "" });
          setRefreshCounter((c) => c + 1);
          toast.success("Caption updated successfully");
        } catch (error) {
          toast.error("Error updating caption: " + error);
        }
      }, 1000);
    },
    [imageData, uid, id]
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
          ? doc(db, "profiles", uid, "covers", id)
          : doc(db, "publicImages", id);

        await updateDoc(docRef, { downloadUrl: result?.result_url });
        setRefreshCounter((c) => c + 1);
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
  }, [imageData, uid, id, useCredits, credits, briaApiKey, minusCredits]);

  const changeBackground = useCallback(
    async (color: string) => {
      const docRef = uid
        ? doc(db, "profiles", uid, "covers", id)
        : doc(db, "publicImages", id);

      await updateDoc(docRef, { backgroundColor: color });
      setBackgroundColor(color);
      setRefreshCounter((c) => c + 1);
      setShowColorPicker(false);
      toast.success("Background color changed successfully");
    },
    [uid, id]
  );

  const handleTryAgain = useCallback(() => {
    if (!imageData || typeof imageData === "boolean") return;

    const addQueryParam = (
      key: string,
      value: string | string[] | undefined
    ) => {
      if (value) {
        return Array.isArray(value)
          ? `${key}=${encodeURIComponent(value.join(","))}`
          : `${key}=${encodeURIComponent(value)}`;
      }
      return null;
    };

    const queryParams = [
      addQueryParam("freestyle", imageData.freestyle),
      addQueryParam("style", imageData.style),
      addQueryParam("model", imageData.model),
      addQueryParam("color", imageData.colorScheme),
      addQueryParam("lighting", imageData.lighting),
      addQueryParam("tags", imageData.tags),
      addQueryParam("imageReference", imageData.imageReference),
      addQueryParam("imageCategory", imageData.imageCategory),
      addQueryParam("perspective", imageData.perspective),
      addQueryParam("composition", imageData.composition),
      addQueryParam("medium", imageData.medium),
      addQueryParam("mood", imageData.mood),
    ].filter(Boolean);

    if (queryParams.length > 0) {
      router.push(`/generate?${queryParams.join("&")}`);
    }
  }, [imageData, router]);

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
          onToggleSharable={toggleSharable}
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
            onChange={handleCaptionChange}
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
          onConfirm={toggleSharable}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}

      {showColorPicker && (
        <ColorPickerModal
          initialColor={backgroundColor}
          onConfirm={changeBackground}
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
