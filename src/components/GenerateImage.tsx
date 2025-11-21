"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore, GenerationState } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { db } from "@/firebase/firebaseClient";
import { Timestamp, collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { PromptDataType } from "@/types/promptdata";
import { artStyles } from "@/constants/artStyles";
import { PulseLoader } from "react-spinners";
import { generatePrompt } from "@/utils/promptUtils";
import toast from "react-hot-toast";
import { models, SelectModel } from "@/constants/models";
import { creditsToMinus } from "@/utils/credits";
import { colors, getColorFromLabel } from "@/constants/colors";
import { getLightingFromLabel, lightings } from "@/constants/lightings";
import { useSearchParams } from "next/navigation";
import { suggestTags } from "@/actions/suggestTags";
import {
  Mic,
  StopCircle,
  XCircle,
  Check,
  ImagePlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  isIOSReactNativeWebView,
  checkRestrictedWords,
} from "@/utils/platform";
import {
  perspectives,
  getPerspectiveFromLabel,
} from "@/constants/perspectives";
import {
  compositions,
  getCompositionFromLabel,
} from "@/constants/compositions";
import { mediums, getMediumFromLabel } from "@/constants/mediums";
import { moods, getMoodFromLabel } from "@/constants/moods";
import { optimizePrompt } from "@/utils/promptOptimizer";
import { generateImage } from "@/actions/generateImage";
import { normalizeValue } from "@/utils/imageUtils";

import { PaginatedGrid } from "@/components/common/PaginatedGrid";
import { ModelCard } from "@/components/generation/ModelCard";
import { StyleCard } from "@/components/generation/StyleCard";
import { PreviewCard } from "@/components/generation/PreviewCard";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { model } from "@/types/model";

const isPreviewMarkingEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING === "true";

export default function GenerateImage() {
  const uid = useAuthStore((s) => s.uid);
  const searchterm = useSearchParams();
  
  // Profile Store
  const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key);
  const replicateAPIKey = useProfileStore((s) => s.profile.replicate_api_key);
  const ideogramAPIKey = useProfileStore((s) => s.profile.ideogram_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  // Generation Store
  const {
    imagePrompt,
    imageStyle,
    model,
    colorScheme,
    lighting,
    perspective,
    composition,
    medium,
    mood,
    selectedCategory,
    tags,
    generatedImage,
    uploadedImage,
    loading,
    isOptimizing,
    showMarkAsPreview,
    previewType,
    previewValue,
    setImagePrompt,
    setImageStyle,
    setModel,
    setColorScheme,
    setLighting,
    setPerspective,
    setComposition,
    setMedium,
    setMood,
    setSelectedCategory,
    setTags,
    setSuggestedTags,
    setGeneratedImage,
    setUploadedImage,
    setLoading,
    setIsOptimizing,
    setShowMarkAsPreview,
    setPreview,
    reset,
  } = useGenerationStore();

  const previewRef = useRef<HTMLDivElement>(null);
  const markAsPreviewRef = useRef<HTMLDivElement>(null);

  const { isRecording, startRecording, stopRecording } = useSpeechRecognition(
    (transcript) => setImagePrompt(transcript)
  );

  const isPromptValid = !!imagePrompt.trim();
  const isModelValid = !!model;

  // Initialize from URL params
  useEffect(() => {
    const freestyleSearchParam = searchterm.get("freestyle");
    const styleSearchParam = searchterm.get("style");
    const modelSearchParam = searchterm.get("model");
    const colorSearchParam = searchterm.get("color");
    const lightingSearchParam = searchterm.get("lighting");
    const tagsSearchParam = searchterm.get("tags")?.split(",").filter(Boolean);
    const imageReferenceSearchParam = searchterm.get("imageReference");
    const imageCategorySearchParam = searchterm.get("imageCategory");
    const perspectiveSearchParam = searchterm.get("perspective");
    const compositionSearchParam = searchterm.get("composition");
    const mediumSearchParam = searchterm.get("medium");
    const moodSearchParam = searchterm.get("mood");

    if (freestyleSearchParam) setImagePrompt(freestyleSearchParam);
    if (styleSearchParam) setImageStyle(styleSearchParam);
    if (modelSearchParam) setModel(modelSearchParam as model);
    
    if (colorSearchParam) {
      const colorOption = colors.find((c) => c.value === colorSearchParam);
      if (colorOption) setColorScheme(colorOption.label);
      else {
          const colorByLabel = colors.find(c => c.label.toLowerCase() === colorSearchParam.toLowerCase());
          if (colorByLabel) setColorScheme(colorByLabel.label);
      }
    }
    
    if (lightingSearchParam) {
      const lightingOption = lightings.find((l) => l.value === lightingSearchParam);
      if (lightingOption) setLighting(lightingOption.label);
      else {
          const lightingByLabel = lightings.find(l => l.label.toLowerCase() === lightingSearchParam.toLowerCase());
          if (lightingByLabel) setLighting(lightingByLabel.label);
      }
    }

    if (tagsSearchParam) setTags(tagsSearchParam);
    if (imageCategorySearchParam) setSelectedCategory(imageCategorySearchParam);
    if (perspectiveSearchParam) setPerspective(perspectiveSearchParam);
    if (compositionSearchParam) setComposition(compositionSearchParam);
    if (mediumSearchParam) setMedium(mediumSearchParam);
    if (moodSearchParam) setMood(moodSearchParam);

    if (imageReferenceSearchParam) {
      const loadImageFromUrl = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "default-image.jpg", { type: blob.type });
        setUploadedImage(file);
      };
      loadImageFromUrl(imageReferenceSearchParam);
    }
    
    // Cleanup on unmount
    return () => {
        // Option: reset(); // Uncomment if we want to reset store on unmount
    };
  }, [searchterm, setImagePrompt, setImageStyle, setModel, setColorScheme, setLighting, setTags, setSelectedCategory, setPerspective, setComposition, setMedium, setMood, setUploadedImage]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        previewType &&
        previewRef.current &&
        !previewRef.current.contains(event.target as Node)
      ) {
        setPreview(null, null);
      }

      if (
        showMarkAsPreview &&
        markAsPreviewRef.current &&
        !markAsPreviewRef.current.contains(event.target as Node)
      ) {
        setShowMarkAsPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [previewType, showMarkAsPreview, setPreview, setShowMarkAsPreview]);


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

    await setDoc(docRef, finalPromptData);
  }

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
            tags: tags,
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
    reset();
  };

  const handleSaveAsPreview = async (
    type:
      | "model"
      | "color"
      | "lighting"
      | "style"
      | "perspective"
      | "composition"
      | "medium"
      | "mood"
  ) => {
    if (!generatedImage) return;

    let value = "";
    switch (type) {
      case "model":
        value = model;
        break;
      case "color":
        if (colorScheme === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = colorScheme;
        break;
      case "lighting":
        if (lighting === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = lighting;
        break;
      case "style":
        const styleObj = artStyles.find((s) => s.label === imageStyle);
        value = styleObj
          ? normalizeValue(styleObj.value)
          : normalizeValue(imageStyle);
        break;
      case "perspective":
        if (perspective === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getPerspectiveFromLabel(perspective);
        break;
      case "composition":
        if (composition === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getCompositionFromLabel(composition);
        break;
      case "medium":
        if (medium === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMediumFromLabel(medium);
        break;
      case "mood":
        if (mood === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMoodFromLabel(mood);
        break;
    }

    if (!value) {
      toast.error(`Please select a ${type} first`);
      return;
    }

    try {
      const loadingToast = toast.loading("Saving preview...");

      const response = await fetch("/api/previews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          type: `${type}s`,
          value: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preview");
      }

      toast.success(`Saved as preview for ${type}: ${value}`, {
        id: loadingToast,
      });
      setShowMarkAsPreview(false);
      setPreview(null, null);

      // Force refresh of the component state to reload previews if needed
      // (State is in store now, so this timeout trick might need adjustment 
      // but for now we'll leave it as we just updated the store state)
    } catch (error) {
      toast.error("Failed to save preview image");
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

  const renderSelectGroup = (
      label: string, 
      options: { value: string; label: string }[], 
      currentValue: string, 
      setter: (val: string) => void,
      type: GenerationState["previewType"]
  ) => (
      <div className="space-y-2 relative">
          <label className="text-sm font-medium text-gray-700">
              {label}
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg">
              {options.map((option) => (
                  <button
                      key={option.value}
                      className={`px-2 py-1 rounded-full text-xs transition-colors
                          ${
                              currentValue === option.label
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-300 hover:bg-gray-100"
                          }`}
                      onClick={() => {
                          setter(option.label);
                          setPreview(null, null);
                          setTimeout(() => {
                              setPreview(type, option.value);
                          }, 100);
                      }}
                  >
                      {option.label}
                  </button>
              ))}
          </div>
          {previewType === type && previewValue && (
              <PreviewCard type={type!} value={previewValue} />
          )}
      </div>
  );

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
              onClick={
                isRecording ? stopRecording : startRecording
              }
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
                ${
                  !imagePrompt || isOptimizing
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
                    !imagePrompt
                      ? "text-gray-400"
                      : "text-purple-600 group-hover:text-purple-700"
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
                  const fileInput = document.getElementById(
                    "imageUpload"
                  ) as HTMLInputElement;
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
            <PaginatedGrid<SelectModel>
              items={models.filter(
                (m) => m.type === "image" || m.type === "both"
              )}
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
            <PaginatedGrid<{ value: string; label: string }>
              items={artStyles}
              itemsPerPage={8}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              renderItem={(style) => (
                <StyleCard
                  key={style.value}
                  style={style}
                  isSelected={imageStyle === style.value}
                  onClick={() => setImageStyle(style.value)}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelectGroup("Color Scheme", colors, colorScheme, setColorScheme, "color")}
            {renderSelectGroup("Lighting", lightings, lighting, setLighting, "lighting")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelectGroup("Perspective", perspectives, perspective, setPerspective, "perspective")}
            {renderSelectGroup("Composition", compositions, composition, setComposition, "composition")}
            {renderSelectGroup("Medium", mediums, medium, setMedium, "medium")}
            {renderSelectGroup("Mood", moods, mood, setMood, "mood")}
        </div>

        <button
          className={`py-2 px-4 rounded-lg font-medium text-white transition-all
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]"
            }
            ${
              !isPromptValid || !isModelValid
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
          disabled={loading || !isPromptValid || !isModelValid}
          onClick={handleGenerateSDXL}
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
                    onClick={() => setShowMarkAsPreview(!showMarkAsPreview)}
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
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                        onClick={() => handleSaveAsPreview("model")}
                      >
                        Current Model
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                        onClick={() => handleSaveAsPreview("style")}
                      >
                        Current Style
                      </button>
                      {colorScheme !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("color")}
                        >
                          Current Color Scheme
                        </button>
                      )}
                      {lighting !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("lighting")}
                        >
                          Current Lighting
                        </button>
                      )}
                      {perspective !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("perspective")}
                        >
                          Current Perspective
                        </button>
                      )}
                      {composition !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("composition")}
                        >
                          Current Composition
                        </button>
                      )}
                      {medium !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("medium")}
                        >
                          Current Medium
                        </button>
                      )}
                      {mood !== "None" && (
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 rounded-sm transition-colors"
                          onClick={() => handleSaveAsPreview("mood")}
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
