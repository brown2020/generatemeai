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
import { Download, Share2 as Share, X } from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";

export default function ImageSelector() {
  const uid = useAuthStore((s) => s.uid);
  const [files, setFiles] = useState<any[]>([]);
  const [imagesLength, setImagesLength] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<any>(null);   
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "profiles", uid, "covers"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(filesData);
      setImagesLength(filesData.length);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const urlObject = new URL(url);
      const pathname = urlObject.pathname;
      const filename = pathname.substring(pathname.lastIndexOf("/") + 1);

      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleImageClick = (url: string, metadata: any) => {
    setSelectedImage(url);
    setImageMetadata(metadata);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setImageMetadata(null);
  };

  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const currentPageUrl = window.location.href;

  return (
    <div className="p-4 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {files.map((file, index) => (
          <div key={index} className="relative">
            <img
              src={file.downloadUrl}
              alt={`Cover ${index}`}
              className="w-full h-60 object-cover rounded-md cursor-pointer"
              onClick={() => handleImageClick(file.downloadUrl, file)}
            />
            <button
              onClick={() => handleDownload(file.downloadUrl)}
              className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md"
              aria-label="Download"
            >
              <Download size={24} />
            </button>
            <button
              onClick={toggleShareModal}
              className="absolute bottom-2 left-2 p-2 bg-white rounded-full shadow-md"
              aria-label="Share"
            >
              <Share size={24} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">Images: {imagesLength}</div>

      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative bg-white p-4 max-w-3xl w-full rounded-lg">
            <button
              className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-auto object-cover rounded-md"
            />
            {imageMetadata && (
              <div className="mt-4">
                {imageMetadata.freestyle && (
                  <p>
                    <strong>Freestyle:</strong> {imageMetadata.freestyle}
                  </p>
                )}
                {imageMetadata.prompt && (
                  <p>
                    <strong>Prompt:</strong> {imageMetadata.prompt}
                  </p>
                )}
                {imageMetadata.style && (
                  <p>
                    <strong>Style:</strong> {imageMetadata.style}
                  </p>
                )}
                {imageMetadata.model && (
                  <p>
                    <strong>Model:</strong> {imageMetadata.model}
                  </p>
                )}
                {imageMetadata.timestamp?.seconds && (
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(imageMetadata.timestamp.seconds * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative bg-white p-4 max-w-md w-full rounded-lg">
            <button
              className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full"
              onClick={toggleShareModal}
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Share this Image</h2>
              <div className="flex gap-4">
                <FacebookShareButton url={currentPageUrl}>
                  <FacebookIcon size={32} />
                </FacebookShareButton>
                <TwitterShareButton url={currentPageUrl}>
                  <TwitterIcon size={32} />
                </TwitterShareButton>
                <LinkedinShareButton url={currentPageUrl}>
                  <LinkedinIcon size={32} />
                </LinkedinShareButton>
                <EmailShareButton url={currentPageUrl}>
                  <EmailIcon size={32} />
                </EmailShareButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
