"use client";

import { Video, Image as ImageIcon } from "lucide-react";
import { ImageListItem } from "@/types/image";

interface ImageGridProps {
  images: ImageListItem[];
  onImageClick: (id: string) => void;
}

/**
 * Grid display for image list items.
 */
export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No images found. Start generating to see your creations here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(image.id)}
        />
      ))}
    </div>
  );
};

interface ImageCardProps {
  image: ImageListItem;
  onClick: () => void;
}

/**
 * Individual image card component.
 */
const ImageCard = ({ image, onClick }: ImageCardProps) => {
  const hasVideo = !!image.videoDownloadUrl;

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden 
        hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        <img
          src={image.downloadUrl}
          alt={image.caption || "Generated image"}
          className="w-full h-full object-cover"
          style={{ background: image?.backgroundColor }}
        />

        <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
          {hasVideo ? (
            <Video className="w-5 h-5 text-white" />
          ) : (
            <ImageIcon className="w-5 h-5 text-white" />
          )}
        </div>

        {image.caption && (
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
            transition-opacity flex items-center justify-center p-4"
          >
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
          <div
            className="mt-2 flex gap-1.5 flex-wrap max-h-20 overflow-y-auto 
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
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
  );
};
