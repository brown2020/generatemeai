"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/zustand/useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { Timestamp, collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { PromptDataType } from "@/types/promptdata";
import { artStyles } from "@/constants/artStyles";
import { OnChangeValue } from "react-select";
import { PulseLoader } from "react-spinners";
import { generatePrompt } from "@/utils/promptUtils";
import useProfileStore from "@/zustand/useProfileStore";
import toast from "react-hot-toast";
import { models, SelectModel } from "@/constants/models";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { colors, getColorFromLabel } from "@/constants/colors";
import { getLightingFromLabel, lightings } from "@/constants/lightings";
import { useSearchParams } from "next/navigation";
import { suggestTags } from "@/actions/suggestTags";
import { 
  Image as ImageIcon, 
  Mic, 
  StopCircle, 
  XCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ImagePlus, 
  Sparkles, 
  Loader2 
} from "lucide-react";
import {
  isIOSReactNativeWebView,
  checkRestrictedWords,
} from "@/utils/platform";
import { perspectives, getPerspectiveFromLabel } from "@/constants/perspectives";
import { compositions, getCompositionFromLabel } from "@/constants/compositions";
import { mediums, getMediumFromLabel } from "@/constants/mediums";
import { moods, getMoodFromLabel } from "@/constants/moods";
import { optimizePrompt } from '@/utils/promptOptimizer';

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

import { generateImage } from "@/actions/generateImage";

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

type GridProps = {
  items: any[];
  itemsPerPage: number;
  renderItem: (item: any) => JSX.Element;
  className?: string;
};

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
  const perspectiveSearchParam = searchterm.get("perspective");
  const compositionSearchParam = searchterm.get("composition");
  const mediumSearchParam = searchterm.get("medium");
  const moodSearchParam = searchterm.get("mood");
  const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key);
  const replicateAPIKey = useProfileStore((s) => s.profile.replicate_api_key);
  const ideogramAPIKey = useProfileStore((s) => s.profile.ideogram_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);
  const [imagePrompt, setImagePrompt] = useState<string>(freestyleSearchParam ?? "");
  const [imageStyle, setImageStyle] = useState<string>(styleSearchParam ?? "");
  const [model, setModel] = useState<model>((modelSearchParam as model) ?? "playground-v2");
  const [colorScheme, setColorScheme] = useState<string>(() => {
    const colorOption = colors.find(c => c.value === colorSearchParam);
    if (colorOption) {
      return colorOption.label;
    }
    const colorByLabel = colors.find(c => 
      c.label.toLowerCase() === colorSearchParam?.toLowerCase()
    );
    return colorByLabel?.label ?? "None";
  });
  const [lighting, setLighting] = useState<string>(() => {
    const lightingOption = lightings.find(l => l.value === lightingSearchParam);
    if (lightingOption) {
      return lightingOption.label;
    }
    const lightingByLabel = lightings.find(l => 
      l.label.toLowerCase() === lightingSearchParam?.toLowerCase()
    );
    return lightingByLabel?.label ?? "None";
  });
  const [perspective, setPerspective] = useState<string>(perspectiveSearchParam ?? "None");
  const [composition, setComposition] = useState<string>(compositionSearchParam ?? "None");
  const [medium, setMedium] = useState<string>(mediumSearchParam ?? "None");
  const [mood, setMood] = useState<string>(moodSearchParam ?? "None");
  const [selectedCategory, setSelectedCategory] = useState<string>(imageCategorySearchParam ?? "");
  const [tags, setTags] = useState<string[]>(tagsSearchParam ?? []);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [promptData, setPromptData] = useState<PromptDataType>({
    style: styleSearchParam ?? "",
    freestyle: freestyleSearchParam ?? "",
    model: (modelSearchParam as model) ?? "playground-v2",
    colorScheme: colorSearchParam ?? colors[0].value,
    lighting: lightingSearchParam ?? lightings[0].value,
    perspective: perspectiveSearchParam ?? "None",
    composition: compositionSearchParam ?? "None",
    medium: mediumSearchParam ?? "None",
    mood: moodSearchParam ?? "None",
    tags: tagsSearchParam ?? [],
  });

  const [isPromptValid, setIsPromptValid] = useState<boolean>(false);
  const [isModelValid, setIsModelValid] = useState<boolean>(true);

  const [showPreview, setShowPreview] = useState<{
    type: 'model' | 'color' | 'lighting' | 'style' | 'perspective' | 'composition' | 'medium' | 'mood' | null;
    value: string | null;
  }>({ type: null, value: null });

  const [showMarkAsPreview, setShowMarkAsPreview] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const markAsPreviewRef = useRef<HTMLDivElement>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPreview.type && 
          previewRef.current && 
          !previewRef.current.contains(event.target as Node)) {
        setShowPreview({ type: null, value: null });
      }

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
        selectedCategory,
        perspective,
        composition,
        medium,
        mood,
        tags
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
            perspective: perspective,
            composition: composition,
            medium: medium,
            mood: mood,
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

  const handleClearAll = () => {
    setImagePrompt('');
    setImageStyle('');
    setColorScheme('None');
    setLighting('None');
    setPerspective('None');
    setComposition('None');
    setMedium('None');
    setMood('None');
    setTags([]);
    setSelectedCategory('');
    setUploadedImage(null);
    setGeneratedImage('');
    setPromptData({
      freestyle: '',
      style: '',
      model: 'playground-v2',
      colorScheme: '',
      lighting: '',
      perspective: '',
      composition: '',
      medium: '',
      mood: '',
      tags: [],
    });
  };

  const PreviewCard = ({ type, value }: { type: string; value: string }) => {
    const [loadedImages, setLoadedImages] = useState<string[]>([]);

    useEffect(() => {
      if (value === 'none' || !value) {
        setLoadedImages([]);
        return;
      }

      const loadImages = async () => {
        setLoadedImages([]);
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
      };

      loadImages();
    }, [type, value]);

    if (value === 'none' || !value) {
      return null;
    }

    const baseClassName = "absolute z-50 bg-white rounded-lg shadow-xl p-3 w-64 transform -translate-x-1/2 left-1/2 mt-2";

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

  const handleSaveAsPreview = async (previewType: 'model' | 'color' | 'lighting' | 'style' | 'perspective' | 'composition' | 'medium' | 'mood') => {
    if (!generatedImage) return;

    let value = '';
    switch (previewType) {
      case 'model':
        value = model;
        break;
      case 'color':
        if (colorScheme === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = colorScheme;
        break;
      case 'lighting':
        if (lighting === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = lighting;
        break;
      case 'style':
        const styleObj = artStyles.find(s => s.label === imageStyle);
        value = styleObj ? normalizeValue(styleObj.value) : normalizeValue(imageStyle);
        break;
      case 'perspective':
        if (perspective === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getPerspectiveFromLabel(perspective);
        break;
      case 'composition':
        if (composition === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getCompositionFromLabel(composition);
        break;
      case 'medium':
        if (medium === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMediumFromLabel(medium);
        break;
      case 'mood':
        if (mood === 'None') {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMoodFromLabel(mood);
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

      setTimeout(() => {
        setModel(prev => prev);
        setImageStyle(prev => prev);
        setPerspective(prev => prev);
        setComposition(prev => prev);
        setMedium(prev => prev);
        setMood(prev => prev);
      }, 100);
    } catch (error) {
      toast.error('Failed to save preview image');
      console.error(error);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!imagePrompt || isOptimizing) return;
    
    try {
      setIsOptimizing(true);
      const optimizedPrompt = await optimizePrompt(imagePrompt, openAPIKey);
      setImagePrompt(optimizedPrompt);
      toast.success("Prompt optimized!");
    } catch (error) {
      toast.error("Failed to optimize prompt. Please try again.");
      console.error("Optimization error:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-3 bg-white">
      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All Options
          </button>
        </div>

        <div className="relative rounded-lg">
          <TextareaAutosize
            autoFocus
            minRows={3}
            maxRows={5}
            value={imagePrompt || ""}
            placeholder="Describe your image in detail..."
            onChange={(e) => {
              setImagePrompt(e.target.value);
              handleTagSuggestions(e.target.value);
            }}
            className="block w-full px-4 py-3 pr-32 text-lg border-2 border-blue-200 
              rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              transition-all duration-200 ease-in-out"
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {model !== "dall-e" && model !== "flux-schnell" && (
              <button
                onClick={() => {
                  const fileInput = document.getElementById("imageUpload");
                  fileInput?.click();
                }}
                className="group relative inline-flex items-center justify-center w-9 h-9 
                  rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 
                  transition-all duration-200 hover:shadow-md"
                title="Upload reference image"
              >
                <ImagePlus 
                  className="w-5 h-5 text-gray-600 group-hover:text-gray-800 
                    transition-colors" 
                />
              </button>
            )}

            <button
              onClick={isRecording ? () => setIsRecording(false) : startAudioRecording}
              className={`group relative inline-flex items-center justify-center w-9 h-9 
                rounded-lg transition-all duration-200 hover:shadow-md
                ${isRecording 
                  ? 'bg-red-50 hover:bg-red-100 border border-red-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5 text-red-600 group-hover:text-red-700" />
              ) : (
                <Mic 
                  className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors`}
                />
              )}
            </button>

            <button
              onClick={handleOptimizePrompt}
              disabled={!imagePrompt || isOptimizing}
              className={`group relative inline-flex items-center justify-center w-9 h-9 
                rounded-lg transition-all duration-200 hover:shadow-md
                ${!imagePrompt || isOptimizing
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}
              title="Enhance prompt with AI"
            >
              {isOptimizing ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <Sparkles 
                  className={`w-5 h-5 ${
                    !imagePrompt 
                      ? 'text-gray-400' 
                      : 'text-purple-600 group-hover:text-purple-700'
                  } transition-colors`}
                />
              )}
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
              {colors.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${colorScheme === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setColorScheme(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'color', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'color' && showPreview.value && (
              <PreviewCard type="color" value={showPreview.value} />
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Lighting</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {lightings.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${lighting === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setLighting(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'lighting', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'lighting' && showPreview.value && (
              <PreviewCard type="lighting" value={showPreview.value} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Perspective</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {perspectives.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${perspective === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setPerspective(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'perspective', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'perspective' && showPreview.value && (
              <PreviewCard type="perspective" value={showPreview.value} />
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Composition</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {compositions.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${composition === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setComposition(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'composition', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'composition' && showPreview.value && (
              <PreviewCard type="composition" value={showPreview.value} />
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Medium</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {mediums.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${medium === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setMedium(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'medium', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'medium' && showPreview.value && (
              <PreviewCard type="medium" value={showPreview.value} />
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Mood</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {moods.map((option) => (
                <button
                  key={option.value}
                  className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${mood === option.label 
                      ? "bg-blue-600 text-white" 
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setMood(option.label);
                    setShowPreview({ type: null, value: null });
                    setTimeout(() => {
                      setShowPreview({ type: 'mood', value: option.value });
                    }, 100);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showPreview.type === 'mood' && showPreview.value && (
              <PreviewCard type="mood" value={showPreview.value} />
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
              perspective: perspective,
              composition: composition,
              medium: medium,
              mood: mood,
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
                      {colorScheme !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('color')}
                        >
                          Current Color Scheme
                        </button>
                      )}
                      {lighting !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('lighting')}
                        >
                          Current Lighting
                        </button>
                      )}
                      {perspective !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('perspective')}
                        >
                          Current Perspective
                        </button>
                      )}
                      {composition !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('composition')}
                        >
                          Current Composition
                        </button>
                      )}
                      {medium !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('medium')}
                        >
                          Current Medium
                        </button>
                      )}
                      {mood !== 'None' && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleSaveAsPreview('mood')}
                        >
                          Current Mood
                        </button>
                      )}
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
