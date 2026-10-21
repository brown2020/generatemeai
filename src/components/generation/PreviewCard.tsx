import { optionPreviewImages } from "@/constants/optionPreviews";

interface PreviewCardProps {
  type: string;
  value: string;
}

export const PreviewCard = ({ type, value }: PreviewCardProps) => {
  const images = optionPreviewImages(type, value);
  if (images.length === 0) return null;

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-xl p-3 w-64 transform -translate-x-1/2 left-1/2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        {images.map((src, index) => (
          <div key={src} className="relative aspect-square rounded-md overflow-hidden">
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
