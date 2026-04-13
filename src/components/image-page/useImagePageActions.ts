"use client";

import { useCallback, useRef, useEffect } from "react";
import { ImageData } from "@/types/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errors";
import {
  toggleImageSharable,
  deleteImage,
  updateImageCaption,
  updateImageBackground,
} from "@/actions/imageActions";

interface UseImagePageActionsParams {
  id: string;
  uid: string;
  imageData: ImageData | null | false;
  setIsSharable: (value: boolean) => void;
  refreshData: () => void;
}

export const useImagePageActions = ({
  id,
  uid,
  imageData,
  setIsSharable,
  refreshData,
}: UseImagePageActionsParams) => {
  const router = useRouter();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupDebounce = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupDebounce();
    };
  }, [cleanupDebounce]);

  const toggleSharable = useCallback(
    async (password: string = "") => {
      if (!imageData || !uid) return;

      try {
        const result = await toggleImageSharable(id, password);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setIsSharable(result.data.isSharable);
        toast.success(
          `Image is now ${result.data.isSharable ? "sharable" : "private"}`
        );
      } catch (error) {
        toast.error(`Error updating share status: ${getErrorMessage(error)}`);
      }
    },
    [imageData, uid, id, setIsSharable]
  );

  const handleDelete = useCallback(async () => {
    if (!imageData || !uid) return;

    try {
      const result = await deleteImage(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Image deleted successfully");
      setTimeout(() => router.push("/images"), 1000);
    } catch (error) {
      toast.error(`Error deleting image: ${getErrorMessage(error)}`);
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
          const result = await updateImageCaption(id, event.target.value);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          refreshData();
          toast.success("Caption updated successfully");
        } catch (error) {
          toast.error(`Error updating caption: ${getErrorMessage(error)}`);
        }
      }, 1000);
    },
    [imageData, id, refreshData, cleanupDebounce]
  );

  const changeBackground = useCallback(
    async (color: string, setBackgroundColor: (color: string) => void) => {
      try {
        const result = await updateImageBackground(id, color);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setBackgroundColor(color);
        refreshData();
        toast.success("Background color changed successfully");
      } catch (error) {
        toast.error(`Error changing background: ${getErrorMessage(error)}`);
      }
    },
    [id, refreshData]
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
