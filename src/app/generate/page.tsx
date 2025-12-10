"use client";

import dynamic from "next/dynamic";
import GenerateImageSkeleton from "@/components/GenerateImageSkeleton";

// Lazy load the heavy GenerateImage component for better initial load performance
const GenerateImage = dynamic(() => import("@/components/GenerateImage"), {
  loading: () => <GenerateImageSkeleton />,
  ssr: false, // Client-only component with heavy dependencies
});

export default function GeneratePage() {
  return <GenerateImage />;
}
