'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseClient';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAuthStore } from '@/zustand/useAuthStore';
import { Video, Image as ImageIcon, Search, Filter, Tag } from 'lucide-react';

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
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
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

    const filteredImages = images.filter((image) => {
      const freestyleMatch = image.freestyle?.toLowerCase().includes(searchQuery.toLowerCase());

      const tagsMatch = image.tags?.some((tag) =>
        tag.trim().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const tagsFilterMatch =
        formattedSelectedTags.length === 0 ||
        formattedSelectedTags.every((tag) =>
          image.tags?.map((t) => t.trim().toLowerCase()).includes(tag)
        );

      const typeMatch =
        filterType === 'all' ||
        (filterType === 'image' && !image.videoDownloadUrl) ||
        (filterType === 'video' && image.videoDownloadUrl);

      return (freestyleMatch || tagsMatch) && tagsFilterMatch && typeMatch;
    });

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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt or tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors
                  ${filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Filter className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setFilterType('image')}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors
                  ${filterType === 'image' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <ImageIcon className="w-4 h-4" />
                Images
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors
                  ${filterType === 'video' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Video className="w-4 h-4" />
                Videos
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </div>
            <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {paginatedImages.map((image) => (
            <div
              key={image.id}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden 
                hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => (window.location.href = `/images/${image.id}`)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.downloadUrl}
                  alt={image.caption || "Generated image"}
                  className="w-full h-full object-cover"
                  style={{ background: image?.backgroundColor }}
                />
                
                <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                  {image.videoDownloadUrl ? (
                    <Video className="w-5 h-5 text-white" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white" />
                  )}
                </div>

                {image.caption && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                    transition-opacity flex items-center justify-center p-4">
                    <p className="text-white text-sm text-center line-clamp-4">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-900 font-medium line-clamp-2">
                  {image.freestyle || "No prompt available"}
                </p>
                
                {image.tags && image.tags.length > 0 && (
                  <div className="mt-2 flex gap-1.5 flex-wrap max-h-20 overflow-y-auto 
                    scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {image.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {paginatedImages?.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageListPage;
