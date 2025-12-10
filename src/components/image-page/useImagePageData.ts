"use client";

import { useState, useEffect } from "react";
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
    const fetchImageData = async () => {
      try {
        // Try to fetch as owner first
        if (uid && !authPending) {
          const ownerDocRef = doc(db, FirestorePaths.profileCover(uid, id));
          const ownerDocSnap = await getDoc(ownerDocRef);

          if (ownerDocSnap.exists()) {
            const data = ownerDocSnap.data() as ImageData;
            setImageData({ ...data, id });
            setIsSharable(data?.isSharable ?? false);
            setTags(data?.tags ?? []);
            setCaption(data?.caption ?? "");
            setIsOwner(true);
            setBackgroundColor(data?.backgroundColor || "#ffffff");
            return;
          }
        }

        // Fetch as public image if not owner
        if (!isOwner) {
          const publicDocRef = doc(db, FirestorePaths.publicImage(id));
          const publicDocSnap = await getDoc(publicDocRef);

          if (publicDocSnap.exists()) {
            const data = publicDocSnap.data() as ImageData;
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
      } catch (error) {
        console.error("Error fetching image data:", error);
        setImageData(false);
      }
    };

    if (id) fetchImageData();
  }, [id, uid, authPending, refreshCounter, isOwner]);

  const refreshData = () => setRefreshCounter((c) => c + 1);

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
