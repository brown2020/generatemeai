"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { FirestorePaths } from "@/firebase/paths";
import { ImageData } from "@/types/image";

interface UseImagePageDataParams {
  id: string;
  uid: string;
  authPending: boolean;
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
  if (setters.setIsPasswordProtected && data?.password) {
    setters.setIsPasswordProtected(true);
  }
};

/**
 * Hook to manage image page data fetching and state.
 */
export const useImagePageData = ({
  id,
  uid,
  authPending,
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
    let isMounted = true;

    const fetchImageData = async () => {
      try {
        // Try to fetch as owner first (if authenticated)
        if (uid && !authPending) {
          const ownerDocRef = doc(db, FirestorePaths.profileCover(uid, id));
          const ownerDocSnap = await getDoc(ownerDocRef);

          if (isMounted && ownerDocSnap.exists()) {
            const data = ownerDocSnap.data() as ImageData;
            applyImageData(data, id, {
              setImageData,
              setIsSharable,
              setTags,
              setCaption,
              setBackgroundColor,
            });
            setIsOwner(true);
            return;
          }
        }

        // Fetch as public image (either not owner or not authenticated)
        const publicDocRef = doc(db, FirestorePaths.publicImage(id));
        const publicDocSnap = await getDoc(publicDocRef);

        if (!isMounted) return;

        if (publicDocSnap.exists()) {
          const data = publicDocSnap.data() as ImageData;
          applyImageData(data, id, {
            setImageData,
            setIsSharable,
            setTags,
            setCaption,
            setBackgroundColor,
            setIsPasswordProtected,
          });
          setIsOwner(false);
        } else {
          setImageData(false);
        }
      } catch (error) {
        console.error("Error fetching image data:", error);
        if (isMounted) {
          setImageData(false);
        }
      }
    };

    if (id) fetchImageData();

    return () => {
      isMounted = false;
    };
  }, [id, uid, authPending, refreshCounter]);

  const refreshData = useCallback(() => setRefreshCounter((c) => c + 1), []);

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
  };
};
