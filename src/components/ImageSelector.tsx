/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseClient";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { useAuthStore } from "@/zustand/useAuthStore";

export default function ImageSelector() {
  const uid = useAuthStore((s) => s.uid);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [imagesLength, setImagesLength] = useState(0);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "profiles", uid, "covers"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const urls = snapshot.docs
        .map((doc) => doc.data().downloadUrl)
        .filter(Boolean);
      setFileUrls(urls);
      setImagesLength(urls.length);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div className="p-4 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {fileUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Cover ${index}`}
            className="w-full h-60 object-cover rounded-md cursor-pointer"
          />
        ))}
      </div>
      <div className="mt-4 text-center">Images: {imagesLength}</div>
    </div>
  );
}
