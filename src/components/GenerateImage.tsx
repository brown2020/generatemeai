"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/zustand/useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { Timestamp, collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PromptDataType } from "@/types/promptdata";
import { artStyles } from "@/constants/artStyles";
import { selectStyles } from "@/constants/selectStyles";
import Select from "react-select";
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
import { Image as ImageIcon, Mic, StopCircle, XCircle } from "lucide-react";
import { imageCategories } from "@/constants/imageCategories";

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
    model: model,
    colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
    lighting: getLightingFromLabel(lighting) || lightings[0].value,
    tags: tags,
  });

  const [isPromptValid, setIsPromptValid] = useState<boolean>(false);
  const [isModelValid, setIsModelValid] = useState<boolean>(true);

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
    downloadUrl: string,
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

  const handleGenerateSDXL = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isPromptValid || !isModelValid) {
      toast.error("Please fill in all required fields.");
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

  return (
    <div className="flex flex-col items-center w-full p-4 bg-white">
      <div className="flex flex-col w-full max-w-xl space-y-4 relative">
        <div className="relative">
          <TextareaAutosize
            autoFocus
            minRows={4}
            value={imagePrompt || ""}
            placeholder="Describe an image or use voice input"
            onChange={(e) => {
              setImagePrompt(e.target.value);
              handleTagSuggestions(e.target.value);
            }}
            className="border-2 text-xl border-blue-500 bg-blue-100 rounded-md px-3 py-2 w-full"
          />

          <button
            className={`absolute bottom-4 right-3 w-10 h-10 flex items-center justify-center rounded-full 
              ${isRecording ? "bg-red-600" : "bg-blue-600"} text-white`}
            onClick={
              isRecording ? () => setIsRecording(false) : startAudioRecording
            }
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
          </button>

          {model !== "dall-e" && (
            <button
              className="absolute bottom-4 right-[4rem] w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white"
              onClick={() => {
                const fileInput = document.getElementById(
                  "imageUpload"
                ) as HTMLInputElement | null;
                if (fileInput) {
                  fileInput.click();
                } else {
                  console.error("Element with ID 'imageUpload' not found.");
                }
              }}
              title="Upload Image"
            >
              <ImageIcon size={20} />
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          id="imageUpload"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              setUploadedImage(e.target.files[0]);
            }
          }}
        />

        {model != "dall-e" && uploadedImage && (
          <div className="mt-4 relative">
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded"
              className="w-32 h-32 object-cover rounded-md border-2 border-blue-600"
            />
            <button
              className="absolute top-0 left-0 bg-red-600 text-white rounded-full p-1"
              onClick={() => {
                setUploadedImage(null);

                const fileInput = document.getElementById(
                  "imageUpload"
                ) as HTMLInputElement | null;

                if (fileInput) {
                  fileInput.value = "";
                } else {
                  console.error("Element with ID 'imageUpload' not found.");
                }
              }}
              title="Delete Image"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        <div>
          <div>Artistic Style (optional)</div>
          <Select
            isClearable={true}
            isSearchable={true}
            name="styles"
            onChange={(v) => setImageStyle(v ? v.value : "")}
            options={artStyles}
            styles={selectStyles}
            defaultInputValue={styleSearchParam || ""}
          />
        </div>

        <div>
          <div>
            Use
          </div>
          <Select
            isClearable={true}
            isSearchable={true}
            name="model"
            onChange={(v) =>
              setModel(v ? (v as SelectModel).value : "playground-v2")
            }
            defaultValue={findModelByValue(
              (modelSearchParam as model) || "playground-v2"
            )}
            options={models.filter((m) => m.type === "image")}
            styles={selectStyles}
          />
        </div>

        <div>
          <div>Image Category (optional)</div>
          <Select
            isClearable={true}
            isSearchable={true}
            name="category"
            onChange={(v) => setSelectedCategory(v ? v.value : "")}
            options={imageCategories.map((category) => ({
              id: category.id,
              label: category.type,
              value: category.type,
            }))}
            defaultInputValue={imageCategorySearchParam || ""}
            styles={selectStyles}
            placeholder="Select image category"
          />
        </div>

        <div>
          <div>Tags (optional)</div>
          <CreatableSelect
            isMulti
            value={tagInputValue}
            options={suggestedTags.map((tag) => ({ label: tag, value: tag }))}
            onChange={(newTags) => {
              setTags(newTags.map((tag) => tag.value));
              settagInputValue(newTags as [{ label: string; value: string }]);
            }}
            placeholder="Add or select tags"
          />
        </div>

        <div className="flex space-x-4 items-center">
          <div>Colors:</div>
          <div className="relative flex items-center space-x-2 overflow-scroll">
            {colorLabels.map((option) => (
              <div
                key={option}
                className={`cursor-pointer flex items-center space-x-1 p-2 rounded-md ${
                  colorScheme === option ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  setColorScheme(option);
                }}
                title={option}
              >
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <div>Lighting:</div>
          <div className="relative flex items-center space-x-2 overflow-scroll">
            {lightingLabels.map((option) => (
              <div
                key={option}
                className={`cursor-pointer flex items-center space-x-1 p-2 rounded-md ${
                  lighting === option ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  setLighting(option);
                }}
                title={option}
              >
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-blue h-10 flex items-center justify-center disabled:opacity-50"
          disabled={loading}
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
            <PulseLoader color="#fff" size={12} />
          ) : (
            "Create an Image"
          )}
        </button>
      </div>

      <div className="w-full max-w-lg mt-6 flex justify-center">
        {generatedImage ? (
          <div className="image-container">
            <img
              className="object-cover rounded-md"
              src={generatedImage}
              alt="Generated visualization"
            />
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            No image generated yet.
          </div>
        )}
      </div>
    </div>
  );
}
