"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/zustand/useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { Timestamp, collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { PromptDataType } from "@/types/promptdata";
import { artStyles } from "@/constants/artStyles";
import { selectStyles } from "@/constants/selectStyles";

import Select, { OnChangeValue, SingleValue, MultiValue } from "react-select";

import { PulseLoader } from "react-spinners";
import { generatePrompt } from "@/utils/promptUtils";
import useProfileStore from "@/zustand/useProfileStore";
import toast from "react-hot-toast";
import { findModelByValue, models, SelectModel } from "@/constants/models";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { colors, getColorFromLabel } from "@/constants/colors";
import { getLightingFromLabel, lightings } from "@/constants/lightings";
import { useSearchParams } from "next/navigation";
import CreatableSelect from "react-select/creatable";
import { suggestTags } from "@/actions/suggestTags";
import { Image as ImageIcon, Mic, StopCircle, XCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { imageCategories } from "@/constants/imageCategories";
import {
  isIOSReactNativeWebView,
  checkRestrictedWords,
} from "@/utils/platform"; // Import the platform check function
import Image from 'next/image';

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Import the server action
import { generateImage } from "@/actions/generateImage";

// Add this utility function at the top level
const checkImageExists = async (src: string): Promise<boolean> => {
  try {
    const res = await fetch(src, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
};

const normalizeValue = (value: string): string => {
  return value.replace(/\s+/g, '');
};

const isPreviewMarkingEnabled = process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING === 'true';

const OptionPreview = ({ type, value }: { type: string; value: string }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const possibleImages = Array.from({ length: 6 }, (_, i) => 
        `/previews/${type}s/${value}/${i + 1}.jpg`
      );

      const existingImages = [];
      for (const img of possibleImages) {
        const exists = await checkImageExists(img);
        if (exists) {
          existingImages.push(img);
        }
      }

      setImages(existingImages);
      setLoading(false);
    };

    if (value && value !== "None") {
      loadImages();
    }
  }, [type, value]);

  if (!value || value === "None" || loading || images.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 3).map((src, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
            <img
              src={src}
              alt={`${type} preview ${index + 1}`}
              className="object-cover w-full h-full hover:scale-105 transition-transform"
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

// Add this new type
type GridProps = {
  items: any[];
  itemsPerPage: number;
  renderItem: (item: any) => JSX.Element;
  className?: string;
};

// Add this new component for paginated grid
const PaginatedGrid = ({ items, itemsPerPage, renderItem, className = "" }: GridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const startIndex = currentPage * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="relative">
      <div className={className}>
        {visibleItems.map((item, index) => renderItem(item))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-2 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={`p-1 rounded-full ${
              currentPage === 0 
                ? 'text-gray-400' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className={`p-1 rounded-full ${
              currentPage === totalPages - 1 
                ? 'text-gray-400' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// Modify the ModelCard and StyleCard components to be slightly larger
const ModelCard = ({ model: modelOption, isSelected, onClick }: { 
  model: SelectModel; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    const loadPreview = async () => {
      const possibleImages = Array.from({ length: 3 }, (_, i) => 
        `/previews/models/${modelOption.value}/${i + 1}.jpg`
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
    <div className="w-full aspect-[3/4]">
      <button
        onClick={onClick}
        className={`relative group w-full h-full rounded-lg overflow-hidden transition-all
          ${isSelected 
            ? 'ring-2 ring-blue-500 scale-[0.98]' 
            : 'hover:scale-[0.98] hover:shadow-lg'
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
          <div className="text-center text-white text-sm font-medium">
            {modelOption.label}
          </div>
        </div>
      </button>
    </div>
  );
};

const StyleCard = ({ style, isSelected, onClick }: { 
  style: { value: string; label: string }; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        // Normalize the style value to match the folder name
        const normalizedValue = normalizeValue(style.value);
        const possibleImages = Array.from({ length: 3 }, (_, i) => 
          `/previews/styles/${normalizedValue}/${i + 1}.jpg`
        );

        setDebugLog(prev => [...prev, `Checking paths: ${possibleImages.join(', ')}`]);

        for (const img of possibleImages) {
          const exists = await checkImageExists(img);
          setDebugLog(prev => [...prev, `Path ${img}: ${exists ? 'exists' : 'not found'}`]);
          
          if (exists) {
            setPreviewImage(img);
            break;
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error loading preview:', error);
        setDebugLog(prev => [...prev, `Error: ${errorMessage}`]);
      }
    };

    loadPreview();
  }, [style.value]);

  // Log debug information to console
  useEffect(() => {
    if (debugLog.length > 0) {
      console.log(`Debug log for style ${style.label}:`, debugLog);
    }
  }, [debugLog, style.label]);

  return (
    <div className="w-full aspect-[3/4]">
      <button
        onClick={onClick}
        className={`relative group w-full h-full rounded-lg overflow-hidden transition-all
          ${isSelected 
            ? 'ring-2 ring-blue-500 scale-[0.98]' 
            : 'hover:scale-[0.98] hover:shadow-lg'
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
                setPreviewImage('');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
          <div className="text-center text-white text-sm font-medium">
            {style.label}
          </div>
        </div>
      </button>
    </div>
  );
};

export default function GenerateImage() {
  const uid = useAuthStore((s) => s.uid);
  const searchterm = useSearchParams();
  const freestyleSearchParam = searchterm.get("freestyle");
  const styleSearchParam = searchterm.get("style");
  const modelSearchParam = searchterm.get("model");
  const colorSearchParam = searchterm.get("color");
  const lightingSearchParam = searchterm.get("lighting");
  const tagsSearchParam = searchterm.get("tags")?.split(",");
  const imageReferenceSearchParam = searchterm.get("imageReference");
  const imageCategorySearchParam = searchterm.get("imageCategory");
  const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key);
  const replicateAPIKey = useProfileStore((s) => s.profile.replicate_api_key);
  const ideogramAPIKey = useProfileStore((s) => s.profile.ideogram_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);
  const [imagePrompt, setImagePrompt] = useState<string>(
    freestyleSearchParam || ""
  );

  const [imageStyle, setImageStyle] = useState<string>(styleSearchParam || "");
  const [model, setModel] = useState<model>(
    (modelSearchParam as model) || "playground-v2"
  );
  const [colorScheme, setColorScheme] = useState<string>(
    colorSearchParam || "None"
  );
  const [lighting, setLighting] = useState<string>(
    lightingSearchParam || "None"
  );
  const [tags, setTags] = useState<string[]>(
    (tagsSearchParam as unknown as string[]) || []
  );
  const [tagInputValue, settagInputValue] = useState(
    tagsSearchParam
      ? tagsSearchParam.map((str) => {
          return { label: str, value: str };
        })
      : []
  );
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    imageCategorySearchParam || ""
  );
  const [promptData, setPromptData] = useState<PromptDataType>({
    style: "",
    freestyle: "",
    downloadUrl: "",
    prompt: "",
    model,
    colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
    lighting: getLightingFromLabel(lighting) || lightings[0].value,
    tags: tags,
  });

  const [isPromptValid, setIsPromptValid] = useState<boolean>(false);
  const [isModelValid, setIsModelValid] = useState<boolean>(true);

  // Add new state for preview modals
  const [showPreview, setShowPreview] = useState<{
    type: 'model' | 'color' | 'lighting' | 'style' | null;
    value: string | null;
  }>({ type: null, value: null });

  // Add new state for marking as preview
  const [showMarkAsPreview, setShowMarkAsPreview] = useState(false);

  // Add ref for preview card
  const previewRef = useRef<HTMLDivElement>(null);
  const markAsPreviewRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close preview card if clicking outside
      if (showPreview.type && 
          previewRef.current && 
          !previewRef.current.contains(event.target as Node)) {
        setShowPreview({ type: null, value: null });
      }

      // Close mark as preview dropdown if clicking outside
      if (showMarkAsPreview && 
          markAsPreviewRef.current && 
          !markAsPreviewRef.current.contains(event.target as Node)) {
        setShowMarkAsPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPreview.type, showMarkAsPreview]);

  useEffect(() => {
    setIsPromptValid(!!imagePrompt.trim());
    setIsModelValid(!!model);
  }, [imagePrompt, model]);

  const colorLabels = colors.map(
    (color: { value: string; label: string }) => color.label
  );
  const lightingLabels = lightings.map(
    (lightingss: { value: string; label: string }) => lightingss.label
  );

  const loadImageFromUrl = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "default-image.jpg", { type: blob.type });
    setUploadedImage(file);
  };

  useEffect(() => {
    if (imageReferenceSearchParam) {
      loadImageFromUrl(imageReferenceSearchParam);
    }
  }, [imageReferenceSearchParam]);

  useEffect(() => {
    setPromptData((prevData) => ({
      ...prevData,
      style: "",
      freestyle: "",
    }));
  }, []);

  const startAudioRecording = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log("Voice recording started...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setImagePrompt(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error occurred in recognition: ", event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
      console.log("Voice recording ended.");
    };

    recognition.start();
  };

  const handleTagSuggestions = async (prompt: string) => {
    let suggestions = await suggestTags(
      prompt,
      colorScheme,
      lighting,
      imageStyle,
      selectedCategory,
      tags,
      openAPIKey,
      useCredits,
      credits
    );

    if (suggestions.error) {
      return;
    }

    suggestions = suggestions.split(",");
    if (suggestions.length >= 1) {
      setSuggestedTags(suggestions);
    }
  };

  async function saveHistory(
    promptData: PromptDataType,
    prompt: string,
    downloadUrl: string
  ) {
    if (!uid) return;

    const coll = collection(db, "profiles", uid, "covers");
    const docRef = doc(coll);

    const finalPromptData: PromptDataType = {
      ...promptData,
      downloadUrl,
      model,
      prompt,
      id: docRef.id,
      timestamp: Timestamp.now(),
      tags,
      imageCategory: selectedCategory,
    };

    setPromptData(finalPromptData);
    await setDoc(docRef, finalPromptData);
  }

  const handleStyleChange = (
    v: OnChangeValue<{ value: string; label: string }, false>
  ) => {
    setImageStyle(v ? v.value : "");
  };

  const handleGenerateSDXL = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isPromptValid || !isModelValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (isIOSReactNativeWebView() && checkRestrictedWords(imagePrompt)) {
      toast.error(
        "Your description contains restricted words and cannot be used."
      );
      return;
    }

    try {
      setLoading(true);

      const prompt: string = generatePrompt(
        imagePrompt,
        imageStyle,
        getColorFromLabel(colorScheme) || colors[0].value,
        getLightingFromLabel(lighting) || lightings[0].value,
        selectedCategory // Pass the selected category to the prompt generation
      );

      const formData = new FormData();
      formData.append("message", prompt);
      formData.append("uid", uid);
      formData.append("openAPIKey", openAPIKey);
      formData.append("fireworksAPIKey", fireworksAPIKey);
      formData.append("stabilityAPIKey", stabilityAPIKey);
      formData.append("replicateAPIKey", replicateAPIKey);
      formData.append("ideogramAPIKey", ideogramAPIKey);
      formData.append("useCredits", useCredits.toString());
      formData.append("credits", credits.toString());
      formData.append("model", model);
      if (uploadedImage) {
        formData.append("imageField", uploadedImage);
      }
      // Call the server action instead of the API route
      const result = await generateImage(formData);

      if (!result || result.error) {
        toast.error(
          `Failed to generate image: ${result?.error || "Unknown error"}`
        );
        throw new Error("Failed to generate image.");
      }

      const downloadURL = result.imageUrl || "";
      const imageReference = result.imageReference || "";

      if (useCredits) {
        await minusCredits(creditsToMinus(model));
      }

      setGeneratedImage(downloadURL);

      if (downloadURL) {
        await saveHistory(
          {
            ...promptData,
            freestyle: imagePrompt,
            style: imageStyle,
            downloadUrl: downloadURL,
            model,
            prompt,
            lighting: getLightingFromLabel(lighting) || lightings[0].value,
            colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
            imageReference,
            imageCategory: selectedCategory,
          },
          prompt,
          downloadURL
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error generating image:", error.message);
      } else {
        console.error("An unknown error occurred during image generation.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Modify the PreviewCard component
  const PreviewCard = ({ type, value }: { type: string; value: string }) => {
    const [loadedImages, setLoadedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadImages = async () => {
        setLoading(true);
        const possibleImages = Array.from({ length: 6 }, (_, i) => 
          `/previews/${type}s/${value}/${i + 1}.jpg`
        );

        const existingImages = [];
        for (const img of possibleImages) {
          const exists = await checkImageExists(img);
          if (exists) {
            existingImages.push(img);
          }
        }

        setLoadedImages(existingImages);
        setLoading(false);
      };

      loadImages();
    }, [type, value]);

    const baseClassName = "absolute z-50 bg-white rounded-lg shadow-xl p-3 w-64 transform -translate-x-1/2 left-1/2 mt-2";

    if (loading) {
      return (
        <div ref={previewRef} className={baseClassName}>
          <div className="flex justify-center items-center h-32">
            <PulseLoader color="#3B82F6" size={8} />
          </div>
        </div>
      );
    }

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
            <div key={index} className="relative aspect-square rounded-md overflow-hidden">
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

  // Modify the handleSaveAsPreview function
  const handleSaveAsPreview = async (previewType: 'model' | 'color' | 'lighting' | 'style') => {
    if (!generatedImage) return;

    let value = '';
    switch (previewType) {
      case 'model':
        value = model;
        break;
      case 'color':
        value = colorScheme;
        break;
      case 'lighting':
        value = lighting;
        break;
      case 'style':
        // Find the style object to get the correct value
        const styleObj = artStyles.find(s => s.label === imageStyle);
        // Normalize the style value
        value = styleObj ? normalizeValue(styleObj.value) : normalizeValue(imageStyle);
        break;
    }

    if (!value) {
      toast.error(`Please select a ${previewType} first`);
      return;
    }

    try {
      const loadingToast = toast.loading('Saving preview...');
      
      console.log('Saving preview:', {
        type: `${previewType}s`,
        value: value,
        imageUrl: generatedImage
      });

      const response = await fetch('/api/previews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          type: `${previewType}s`,
          value: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preview');
      }

      const data = await response.json();
      console.log('Preview saved:', data);

      toast.success(`Saved as preview for ${previewType}: ${value}`, {
        id: loadingToast,
      });
      setShowMarkAsPreview(false);
      setShowPreview({ type: null, value: null });

      // Force refresh all cards
      setTimeout(() => {
        // Force a re-render of the component
        setModel(prev => prev);
        setImageStyle(prev => prev);
      }, 100);
    } catch (error) {
      toast.error('Failed to save preview image');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-3 bg-white">
      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="relative rounded-lg shadow-sm">
          <TextareaAutosize
            autoFocus
            minRows={3}
            maxRows={5}
            value={imagePrompt || ""}
            placeholder="Describe your image in detail... or use voice input"
            onChange={(e) => {
              setImagePrompt(e.target.value);
              handleTagSuggestions(e.target.value);
            }}
            className="border-2 text-xl border-blue-500 bg-blue-50 rounded-lg px-4 py-3 w-full transition-colors focus:outline-none focus:border-blue-600 focus:bg-white"
          />

          <div className="absolute bottom-3 right-3 flex space-x-2">
            {model !== "dall-e" && model !== "flux-schnell" && (
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
                onClick={() => {
                  const fileInput = document.getElementById("imageUpload");
                  fileInput?.click();
                }}
                title="Upload Reference Image"
              >
                <ImageIcon size={20} />
              </button>
            )}
            
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full 
                ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} 
                text-white transition-colors shadow-md`}
              onClick={isRecording ? () => setIsRecording(false) : startAudioRecording}
              title={isRecording ? "Stop Recording" : "Start Voice Input"}
            >
              {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
            </button>
          </div>
        </div>

        {model != "dall-e" && model != "flux-schnell" && uploadedImage && (
          <div className="relative inline-block">
            <div className="relative group">
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Reference"
                className="w-40 h-40 object-cover rounded-lg border-2 border-blue-600 shadow-md transition-transform hover:scale-105"
              />
              <button
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-md"
                onClick={() => {
                  setUploadedImage(null);
                  const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                title="Remove Image"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              AI Model
            </label>
            <PaginatedGrid
              items={models.filter((m) => m.type === "image" || m.type === "both")}
              itemsPerPage={8}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              renderItem={(modelOption) => (
                <ModelCard
                  key={modelOption.value}
                  model={modelOption}
                  isSelected={model === modelOption.value}
                  onClick={() => setModel(modelOption.value as model)}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Artistic Style
            </label>
            <PaginatedGrid
              items={artStyles}
              itemsPerPage={8}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              renderItem={(style) => (
                <StyleCard
                  key={style.value}
                  style={style}
                  isSelected={imageStyle === style.value}
                  onClick={() => handleStyleChange({ value: style.value, label: style.label })}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Color Scheme</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {colorLabels.map((option) => (
                option !== "None" && (
                  <button
                    key={option}
                    className={`px-2 py-1 rounded-full text-xs transition-colors
                      ${colorScheme === option 
                        ? "bg-blue-600 text-white" 
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      setColorScheme(option);
                      setShowPreview({ type: null, value: null });
                      setTimeout(() => {
                        setShowPreview({ type: 'color', value: option });
                      }, 100);
                    }}
                  >
                    {option}
                  </button>
                )
              ))}
            </div>
            {showPreview.type === 'color' && showPreview.value && (
              <PreviewCard type="color" value={showPreview.value} />
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Lighting</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {lightingLabels.map((option) => (
                option !== "None" && (
                  <button
                    key={option}
                    className={`px-2 py-1 rounded-full text-xs transition-colors
                      ${lighting === option 
                        ? "bg-blue-600 text-white" 
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      setLighting(option);
                      setShowPreview({ type: null, value: null });
                      setTimeout(() => {
                        setShowPreview({ type: 'lighting', value: option });
                      }, 100);
                    }}
                  >
                    {option}
                  </button>
                )
              ))}
            </div>
            {showPreview.type === 'lighting' && showPreview.value && (
              <PreviewCard type="lighting" value={showPreview.value} />
            )}
          </div>
        </div>

        <button
          className={`py-2 px-4 rounded-lg font-medium text-white transition-all
            ${loading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]"
            }
            ${!isPromptValid || !isModelValid ? "opacity-50 cursor-not-allowed" : ""}
          `}
          disabled={loading || !isPromptValid || !isModelValid}
          onClick={(e) => {
            setPromptData({
              ...promptData,
              freestyle: imagePrompt,
              style: imageStyle,
              colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
              lighting: getLightingFromLabel(lighting) || lightings[0].value,
              tags,
            });
            handleGenerateSDXL(e);
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <PulseLoader color="#fff" size={12} />
            </div>
          ) : (
            "Generate Image"
          )}
        </button>

        <div className="w-full">
          {generatedImage ? (
            <div className="animate-fade-in relative">
              <img
                className="w-full max-h-[50vh] rounded-lg shadow-lg object-contain"
                src={generatedImage}
                alt="Generated visualization"
              />
              
              {isPreviewMarkingEnabled && (
                <>
                  <button
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-blue-600 p-2 rounded-full shadow-lg transition-colors"
                    onClick={() => setShowMarkAsPreview(prev => !prev)}
                    title="Mark as Preview"
                  >
                    <Check size={24} />
                  </button>

                  {showMarkAsPreview && (
                    <div 
                      ref={markAsPreviewRef}
                      className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-2 space-y-2 z-50"
                    >
                      <div className="text-sm font-medium text-gray-700 px-2 py-1">
                        Save as preview for:
                      </div>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                        onClick={() => handleSaveAsPreview('model')}
                      >
                        Current Model
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                        onClick={() => handleSaveAsPreview('style')}
                      >
                        Current Style
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                        onClick={() => handleSaveAsPreview('color')}
                      >
                        Current Color Scheme
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                        onClick={() => handleSaveAsPreview('lighting')}
                      >
                        Current Lighting
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              Your generated image will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
