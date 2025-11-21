import { useState, useEffect, useRef } from "react";
import { checkImageExists } from "@/utils/imageUtils";

interface PreviewCardProps {
  type: string;
  value: string;
}

export const PreviewCard = ({ type, value }: PreviewCardProps) => {
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === "none" || !value) {
      setLoadedImages([]);
      return;
    }

    const loadImages = async () => {
      setLoadedImages([]);
      const possibleImages = Array.from(
        { length: 6 },
        (_, i) => `/previews/${type}s/${value}/${i + 1}.jpg`
      );

      const existingImages = [];
      for (const img of possibleImages) {
        const exists = await checkImageExists(img);
        if (exists) {
          existingImages.push(img);
        }
      }

      setLoadedImages(existingImages);
    };

    loadImages();
  }, [type, value]);

  if (value === "none" || !value) {
    return null;
  }

  const baseClassName =
    "absolute z-50 bg-white rounded-lg shadow-xl p-3 w-64 transform -translate-x-1/2 left-1/2 mt-2";

  if (loadedImages.length === 0) {
    return (
      <div ref={previewRef} className={baseClassName}>
        <div className="text-center text-gray-500 py-4">
          No preview images available
        </div>
      </div>
    );
  }

  return (
    <div ref={previewRef} className={baseClassName}>
      <div className="grid grid-cols-2 gap-2">
        {loadedImages.map((src, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md overflow-hidden"
          >
            <img
              src={src}
              alt={`${type} preview ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        Example images using {value}
      </div>
    </div>
  );
};

