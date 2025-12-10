"use client";

import { useCallback, useRef } from "react";
import { db } from "@/firebase/firebaseClient";
import { doc, runTransaction, deleteDoc, updateDoc } from "firebase/firestore";
import { FirestorePaths } from "@/firebase/paths";
import { ImageData } from "@/types/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UseImagePageActionsParams {
  id: string;
  uid: string;
  imageData: ImageData | null | false;
  isSharable: boolean;
  setIsSharable: (value: boolean) => void;
  refreshData: () => void;
}

/**
 * Hook to manage image page actions (share, delete, update caption, etc.).
 */
export const useImagePageActions = ({
  id,
  uid,
  imageData,
  isSharable,
  setIsSharable,
  refreshData,
}: UseImagePageActionsParams) => {
  const router = useRouter();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce on unmount
  const cleanupDebounce = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };

  const toggleSharable = useCallback(
    async (password: string = "") => {
      if (!imageData || !uid) return;

      try {
        const newSharableState = !isSharable;
        const coversDocRef = doc(db, FirestorePaths.profileCover(uid, id));
        const publicImagesDocRef = doc(db, FirestorePaths.publicImage(id));

        if (newSharableState) {
          // Make public
          await runTransaction(db, async (transaction) => {
            const coversDocSnap = await transaction.get(coversDocRef);
            if (!coversDocSnap.exists()) {
              throw new Error("Document does not exist in covers");
            }
            transaction.set(publicImagesDocRef, {
              ...coversDocSnap.data(),
              isSharable: true,
              password,
            });
            transaction.update(coversDocRef, { isSharable: true });
          });
        } else {
          // Make private
          await runTransaction(db, async (transaction) => {
            const publicImagesDocSnap = await transaction.get(
              publicImagesDocRef
            );
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
    },
    [imageData, uid, id, isSharable, setIsSharable]
  );

  const handleDelete = useCallback(async () => {
    if (!imageData || !uid) return;

    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const docRef = doc(db, FirestorePaths.profileCover(uid, id));
        await deleteDoc(docRef);

        const publicImagesDocRef = doc(db, FirestorePaths.publicImage(id));
        await deleteDoc(publicImagesDocRef);

        toast.success("Image deleted successfully");
        setTimeout(() => router.push("/images"), 1000);
      } catch (error) {
        toast.error("Error deleting image: " + error);
      }
    }
  }, [imageData, uid, id, router]);

  const handleCaptionChange = useCallback(
    (
      event: React.ChangeEvent<HTMLTextAreaElement>,
      setCaption: (caption: string) => void
    ) => {
      setCaption(event.target.value);

      cleanupDebounce();

      debounceTimeout.current = setTimeout(async () => {
        if (!imageData) return;
        try {
          const docRef = uid
            ? doc(db, FirestorePaths.profileCover(uid, id))
            : doc(db, FirestorePaths.publicImage(id));

          await updateDoc(docRef, { caption: event.target.value || "" });
          refreshData();
          toast.success("Caption updated successfully");
        } catch (error) {
          toast.error("Error updating caption: " + error);
        }
      }, 1000);
    },
    [imageData, uid, id, refreshData]
  );

  const changeBackground = useCallback(
    async (color: string, setBackgroundColor: (color: string) => void) => {
      const docRef = uid
        ? doc(db, FirestorePaths.profileCover(uid, id))
        : doc(db, FirestorePaths.publicImage(id));

      await updateDoc(docRef, { backgroundColor: color });
      setBackgroundColor(color);
      refreshData();
      toast.success("Background color changed successfully");
    },
    [uid, id, refreshData]
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

  return {
    toggleSharable,
    handleDelete,
    handleCaptionChange,
    changeBackground,
    handleTryAgain,
    cleanupDebounce,
  };
};
