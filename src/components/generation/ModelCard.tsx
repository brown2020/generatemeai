import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { SelectModel } from "@/constants/models";
import { checkImageExists } from "@/utils/imageUtils";

interface ModelCardProps {
  model: SelectModel;
  isSelected: boolean;
  onClick: () => void;
}

export const ModelCard = ({
  model: modelOption,
  isSelected,
  onClick,
}: ModelCardProps) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const loadPreview = async () => {
      const possibleImages = Array.from(
        { length: 3 },
        (_, i) => `/previews/models/${modelOption.value}/${i + 1}.jpg`
      );

      for (const img of possibleImages) {
        const exists = await checkImageExists(img);
        if (exists) {
          setPreviewImage(img);
          break;
        }
      }
    };

    loadPreview();
  }, [modelOption.value]);

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
              alt={modelOption.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
          <div className="text-center text-white text-sm font-medium">
            {modelOption.label}
          </div>
        </div>
      </button>
    </div>
  );
};

