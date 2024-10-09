'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseClient';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAuthStore } from '@/zustand/useAuthStore';
import { Video, Image as ImageIcon } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

interface ImageData {
  downloadUrl: string | undefined;
  caption: string;
  id: string;
  timestamp: string;
  freestyle?: string;
  tags?: string[];
  backgroundColor?: string;
  videoDownloadUrl?: string;
}

const ImageListPage = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);

  useEffect(() => {
    const fetchImages = async () => {
      if (uid && !authPending) {
        const q = query(collection(db, 'profiles', uid, 'covers'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedImages: ImageData[] = [];
        const tagsSet: Set<string> = new Set();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const image: ImageData = { id: doc.id, ...data } as ImageData;
          fetchedImages.push(image);

          if (Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => {
              tag = tag.trim().toLowerCase();
              if (!tagsSet.has(tag)) {
                tagsSet.add(tag);
              }
            });
          }
        });

        setImages(fetchedImages);
        setAllTags(Array.from(tagsSet));
      }
    };

    fetchImages();
  }, [uid, authPending]);

  const handleSearch = () => {
    const formattedSelectedTags = selectedTags.map((tag) => tag.trim().toLowerCase());

    const filteredImages = images.filter(
      (image) =>
        image.freestyle?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (formattedSelectedTags.length === 0 ||
          formattedSelectedTags.every((tag) =>
            image.tags?.map((t) => t.trim().toLowerCase()).includes(tag)
          ))
    );

    return filteredImages;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredImages = handleSearch();
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

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
            className={`px-3 py-1 rounded-md ${
              selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {paginatedImages.map((image) => (
          <div
            key={image.id}
            className="relative cursor-pointer"
            onClick={() => (window.location.href = `/images/${image.id}`)}
          >
            <img
              src={image.downloadUrl}
              alt="Visual Result"
              className="w-full h-64 object-cover rounded-lg"
              style={{ background: image?.backgroundColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer select-none">
              {image.caption && (
                <div className="bg-[#000] bg-opacity-50 text-white text-sm rounded-md text-center h-[40%] w-[90%] overflow-hidden flex justify-center items-center">
                  {image.caption}
                </div>
              )}
            </div>

            <div className="absolute top-2 right-2">
              {image.videoDownloadUrl ? (
                <Video size={24} color="white" />
              ) : (
                <ImageIcon size={24} color="white" />
              )}
            </div>

            <div className="p-2">
              <p className="font-bold text-sm">
                {image.freestyle && image.freestyle.length > 100
                  ? `${image.freestyle.substring(0, 100)}...`
                  : image.freestyle}
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                {image.tags?.map((tag: string, index: number) => (
                  <span key={index} className="text-sm bg-gray-200 rounded-md px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {paginatedImages?.length > 0 && totalPages > 1 && (
        <div className="flex justify-center gap-2 my-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-white ${
              currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            } transition duration-150 ease-in-out`}
          >
            Previous
          </button>
          <span className="flex items-center px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-white ${
              currentPage === totalPages
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } transition duration-150 ease-in-out`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageListPage;
