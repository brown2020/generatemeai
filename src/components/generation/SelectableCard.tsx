import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { checkImageExists } from "@/utils/imageUtils";

interface SelectableCardProps {
  /** Display label for the card */
  label: string;
  /** Whether the card is currently selected */
  isSelected: boolean;
  /** Click handler for the card */
  onClick: () => void;
  /** Function that returns an array of possible preview image paths */
  getPreviewPaths: () => string[];
}

/**
 * A generic selectable card component with preview image support.
 * Used for model selection, style selection, and other similar UI patterns.
 */
export const SelectableCard = ({
  label,
  isSelected,
  onClick,
  getPreviewPaths,
}: SelectableCardProps) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const loadPreview = async () => {
      const possibleImages = getPreviewPaths();

      for (const img of possibleImages) {
        const exists = await checkImageExists(img);
        if (exists) {
          setPreviewImage(img);
          break;
        }
      }
    };

    loadPreview();
  }, [getPreviewPaths]);

  return (
    <div className="w-full aspect-3/4">
      <button
        onClick={onClick}
        className={`relative group w-full h-full rounded-lg overflow-hidden transition-all
          ${
            isSelected
              ? "ring-2 ring-blue-500 scale-[0.98]"
              : "hover:scale-[0.98] hover:shadow-lg"
          }
        `}
      >
        <div className="absolute inset-0 bg-gray-100">
          {previewImage ? (
            <img
              src={previewImage}
              alt={label}
              className="w-full h-full object-cover"
              onError={() => setPreviewImage("")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
          <div className="text-center text-white text-sm font-medium">
            {label}
          </div>
        </div>
      </button>
    </div>
  );
};
