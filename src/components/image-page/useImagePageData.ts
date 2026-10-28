"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api/client";
import { ImageData } from "@/types/image";

interface UseImagePageDataParams {
  id: string;
  uid: string;
  authPending: boolean;
  authReady: boolean;
}

interface ImagePageDataState {
  imageData: ImageData | null | false;
  isOwner: boolean;
  isSharable: boolean;
  tags: string[];
  caption: string;
  backgroundColor: string;
  isPasswordProtected: boolean;
}

interface UseImagePageDataReturn extends ImagePageDataState {
  setIsSharable: (value: boolean) => void;
  setTags: (tags: string[]) => void;
  setCaption: (caption: string) => void;
  setBackgroundColor: (color: string) => void;
  setIsPasswordProtected: (value: boolean) => void;
  refreshData: () => void;
  revealImage: (data: ImageData) => void;
}

/**
 * Helper to apply image data to state setters.
 */
const applyImageData = (
  data: ImageData,
  id: string,
  setters: {
    setImageData: (data: ImageData) => void;
    setIsSharable: (v: boolean) => void;
    setTags: (v: string[]) => void;
    setCaption: (v: string) => void;
    setBackgroundColor: (v: string) => void;
    setIsPasswordProtected?: (v: boolean) => void;
  }
) => {
  setters.setImageData({ ...data, id });
  setters.setIsSharable(data?.isSharable ?? false);
  setters.setTags(data?.tags ?? []);
  setters.setCaption(data?.caption ?? "");
  setters.setBackgroundColor(data?.backgroundColor || "#ffffff");
  if (setters.setIsPasswordProtected) {
    setters.setIsPasswordProtected(Boolean(data.locked));
  }
};

/**
 * Hook to manage image page data fetching and state.
 */
export const useImagePageData = ({
  id,
  uid,
  authPending,
  authReady,
}: UseImagePageDataParams): UseImagePageDataReturn => {
  const [imageData, setImageData] = useState<ImageData | null | false>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSharable, setIsSharable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchImageData = async () => {
      try {
        // The route prefers the owner's copy when the session cookie is present,
        // so wait for auth to settle before asking.
        if (!authReady || authPending) return;

        const result = await apiGet<{ data: ImageData; isOwner: boolean }>(
          `/api/images/${id}`
        );
        if (ignore) return;

        if (result.success && result.data?.data) {
          applyImageData(result.data.data, id, {
            setImageData,
            setIsSharable,
            setTags,
            setCaption,
            setBackgroundColor,
            setIsPasswordProtected,
          });
          setIsOwner(result.data.isOwner);
        } else {
          setImageData(false);
        }
      } catch (error) {
        console.error("Error fetching image data:", error);
        if (ignore) return;
        setImageData(false);
      }
    };

    if (id) fetchImageData();

    return () => {
      ignore = true;
    };
  }, [id, uid, authPending, authReady, refreshCounter]);

  const refreshData = useCallback(() => setRefreshCounter((c) => c + 1), []);

  const revealImage = useCallback((data: ImageData) => {
    applyImageData({ ...data, locked: false }, id, {
      setImageData,
      setIsSharable,
      setTags,
      setCaption,
      setBackgroundColor,
      setIsPasswordProtected,
    });
    setIsPasswordProtected(false);
  }, [id]);

  return {
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
    setIsPasswordProtected,
    refreshData,
    revealImage,
  };
};
