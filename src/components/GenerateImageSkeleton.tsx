"use client";

/**
 * Skeleton loader for GenerateImage component.
 * Displayed while the main component is being lazy loaded.
 */
export default function GenerateImageSkeleton() {
  return (
    <div className="flex flex-col items-center w-full p-3 bg-white animate-pulse">
      <div className="flex flex-col w-full max-w-4xl space-y-4">
        {/* Clear button placeholder */}
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-gray-200 rounded-md" />
        </div>

        {/* Textarea placeholder */}
        <div className="h-24 bg-gray-200 rounded-xl" />

        {/* Grid sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Model selector */}
          <div className="space-y-4">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Style selector */}
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Settings selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div className="h-12 bg-blue-200 rounded-lg" />

        {/* Image placeholder */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    </div>
  );
}
