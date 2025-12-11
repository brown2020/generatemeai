"use client";

import { ChangeEvent, useRef, useMemo, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  Mic,
  StopCircle,
  XCircle,
  ImagePlus,
  Sparkles,
  Loader2,
} from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onOptimize: () => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  isOptimizing: boolean;
  supportsImageUpload: boolean;
  uploadedImage: File | null;
}

/**
 * Prompt input component with voice recording and AI optimization.
 */
export const PromptInput = ({
  value,
  onChange,
  onOptimize,
  onUpload,
  onRemoveImage,
  onToggleRecording,
  isRecording,
  isOptimizing,
  supportsImageUpload,
  uploadedImage,
}: PromptInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create object URL for preview and clean up on unmount or file change
  const previewUrl = useMemo(() => {
    if (!uploadedImage) return null;
    return URL.createObjectURL(uploadedImage);
  }, [uploadedImage]);

  // Clean up object URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />

      <div className="relative rounded-lg">
        <TextareaAutosize
          autoFocus
          minRows={3}
          maxRows={5}
          value={value || ""}
          placeholder="Describe your image in detail..."
          onChange={onChange}
          className="block w-full px-4 py-3 pr-32 text-lg border-2 border-blue-200 
            rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            transition-all duration-200 ease-in-out"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {supportsImageUpload && (
            <button
              type="button"
              onClick={handleUploadClick}
              className="group relative inline-flex items-center justify-center w-9 h-9 
                rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 
                transition-all duration-200 hover:shadow-md"
              title="Upload reference image"
            >
              <ImagePlus className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleRecording}
            className={`group relative inline-flex items-center justify-center w-9 h-9 
              rounded-lg transition-all duration-200 hover:shadow-md
              ${
                isRecording
                  ? "bg-red-50 hover:bg-red-100 border border-red-200"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? (
              <StopCircle className="w-5 h-5 text-red-600 group-hover:text-red-700" />
            ) : (
              <Mic className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            )}
          </button>

          <button
            type="button"
            onClick={onOptimize}
            disabled={!value || isOptimizing}
            className={`group relative inline-flex items-center justify-center w-9 h-9 
              rounded-lg transition-all duration-200 hover:shadow-md
              ${
                !value || isOptimizing
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-purple-50 hover:bg-purple-100 border border-purple-200"
              }`}
            title="Enhance prompt with AI"
          >
            {isOptimizing ? (
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            ) : (
              <Sparkles
                className={`w-5 h-5 ${
                  !value
                    ? "text-gray-400"
                    : "text-purple-600 group-hover:text-purple-700"
                } transition-colors`}
              />
            )}
          </button>
        </div>
      </div>

      {supportsImageUpload && uploadedImage && previewUrl && (
        <div className="relative inline-block">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Reference"
              className="w-40 h-40 object-cover rounded-lg border-2 border-blue-600 shadow-md transition-transform hover:scale-105"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-md"
              onClick={onRemoveImage}
              title="Remove Image"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
