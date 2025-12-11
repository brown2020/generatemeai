"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase/firebaseClient";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { ImageListItem } from "@/types/image";
import {
  FilterBar,
  FilterType,
  TagFilter,
  ImageGrid,
  Pagination,
} from "./images";

const ITEMS_PER_PAGE = 30;

const ImageListPage = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);

  useEffect(() => {
    const fetchImages = async () => {
      if (uid && !authPending) {
        const q = query(
          collection(db, "profiles", uid, "covers"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedImages: ImageListItem[] = [];
        const tagsSet = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedImages.push({ id: doc.id, ...data } as ImageListItem);

          if (Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => {
              tagsSet.add(tag.trim().toLowerCase());
            });
          }
        });

        setImages(fetchedImages);
        setAllTags(Array.from(tagsSet));
      }
    };

    fetchImages();
  }, [uid, authPending]);

  // Memoized filtered images to prevent recalculation on every render
  const filteredImages = useMemo(() => {
    const formattedSelectedTags = selectedTags.map((tag) =>
      tag.trim().toLowerCase()
    );
    const queryLower = searchQuery.toLowerCase();

    return images.filter((image) => {
      const freestyleMatch = image.freestyle
        ?.toLowerCase()
        .includes(queryLower);
      const tagsMatch = image.tags?.some((tag) =>
        tag.trim().toLowerCase().includes(queryLower)
      );
      const tagsFilterMatch =
        formattedSelectedTags.length === 0 ||
        formattedSelectedTags.every((tag) =>
          image.tags?.map((t) => t.trim().toLowerCase()).includes(tag)
        );
      const typeMatch =
        filterType === "all" ||
        (filterType === "image" && !image.videoDownloadUrl) ||
        (filterType === "video" && !!image.videoDownloadUrl);

      return (freestyleMatch || tagsMatch) && tagsFilterMatch && typeMatch;
    });
  }, [images, searchQuery, selectedTags, filterType]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const navigateToImage = useCallback(
    (id: string) => {
      router.push(`/images/${id}`);
    },
    [router]
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
          />
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />
        </div>

        <ImageGrid images={paginatedImages} onImageClick={navigateToImage} />

        {paginatedImages.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ImageListPage;
