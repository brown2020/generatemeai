import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { checkImageExists, normalizeValue } from "@/utils/imageUtils";

interface StyleCardProps {
  style: { value: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}

export const StyleCard = ({ style, isSelected, onClick }: StyleCardProps) => {
  const [previewImage, setPreviewImage] = useState<string>("");
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const normalizedValue = normalizeValue(style.value);
        const possibleImages = Array.from(
          { length: 3 },
          (_, i) => `/previews/styles/${normalizedValue}/${i + 1}.jpg`
        );

        setDebugLog((prev) => [
          ...prev,
          `Checking paths: ${possibleImages.join(", ")}`,
        ]);

        for (const img of possibleImages) {
          const exists = await checkImageExists(img);
          setDebugLog((prev) => [
            ...prev,
            `Path ${img}: ${exists ? "exists" : "not found"}`,
          ]);

          if (exists) {
            setPreviewImage(img);
            break;
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error loading preview:", error);
        setDebugLog((prev) => [...prev, `Error: ${errorMessage}`]);
      }
    };

    loadPreview();
  }, [style.value]);

  useEffect(() => {
    if (debugLog.length > 0) {
      console.log(`Debug log for style ${style.label}:`, debugLog);
    }
  }, [debugLog, style.label]);

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
              alt={style.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${previewImage}`);
                setPreviewImage("");
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
          <div className="text-center text-white text-sm font-medium">
            {style.label}
          </div>
        </div>
      </button>
    </div>
  );
};

