'use client'

import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseClient";
import { collection, query, getDocs } from "firebase/firestore";
import { useAuthStore } from "@/zustand/useAuthStore";

const ImageListPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);

  useEffect(() => {
    const fetchImages = async () => {
      if (uid && !authPending) {
        const q = query(collection(db, "profiles", uid, "covers"));
        const querySnapshot = await getDocs(q);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchedImages: any[] = [];
        const tagsSet: Set<string> = new Set();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedImages.push({ id: doc.id, ...data });
          data.tags?.forEach((tag: string) => tagsSet.add(tag));
        });

        setImages(fetchedImages);
        setAllTags(Array.from(tagsSet));
      }
    };

    fetchImages();
  }, [uid, authPending]);

  const handleSearch = () => {
    const filteredImages = images.filter(image =>
      image.freestyle?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTags.length === 0 || selectedTags.every(tag => image.tags?.includes(tag)))
    );
    return filteredImages;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredImages = handleSearch();

  return (
    <div className="flex flex-col w-[98%] mx-auto h-full gap-2">
      <div className="flex items-center gap-4 my-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {allTags.map((tag, index) => (
          <button
            key={index}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-md ${selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="relative cursor-pointer"
            onClick={() => window.location.href = `/images/${image.id}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.downloadUrl}
              alt="Visual Result"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer select-none">
              {image.caption && (
                <div className="bg-[#000] bg-opacity-50 text-white text-sm rounded-md text-center h-[40%] w-[90%] overflow-hidden flex justify-center items-center">
                  {image.caption}
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="font-bold text-sm">{image.freestyle.length > 100
                ? `${image.freestyle.substring(0, 100)}...`
                : image.freestyle}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                {image.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-200 rounded-md px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageListPage;
