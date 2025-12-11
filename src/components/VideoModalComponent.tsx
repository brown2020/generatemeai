"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import Select, { SingleValue } from "react-select";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { useAuthStore } from "@/zustand/useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { PromptDataType } from "@/types/promptdata";
import { ImageData } from "@/types/image";
import useProfileStore from "@/zustand/useProfileStore";
import {
  getModelConfig,
  getVideoModels,
  creditsToMinus,
  type Model,
  type ModelConfig,
} from "@/constants/modelRegistry";
import { animations } from "@/constants/animations";
import { generateVideo } from "@/actions/generateVideo";
import { audios } from "@/constants/audios";

type VideoMode = "video" | "animation";

interface VideoModalProps {
  imageData: ImageData;
  isOpen: boolean;
  onRequestClose: () => void;
  downloadUrl: string;
  ariaHideApp: boolean;
  initialData?: ImageData | false;
}

// Get video models for the select dropdown
const videoModels = getVideoModels();

const VideoModalComponent: React.FC<VideoModalProps> = ({
  imageData,
  isOpen,
  onRequestClose,
  downloadUrl,
  ariaHideApp,
  initialData,
}) => {
  const router = useRouter();
  const uid = useAuthStore((s) => s.uid);

  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const didApiKey = useProfileStore((s) => s.profile.did_api_key);
  const runwayApiKey = useProfileStore((s) => s.profile.runway_ml_api_key);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((s) => s.minusCredits);

  // Determine initial mode based on initialData
  const getInitialMode = (): VideoMode => {
    if (
      initialData &&
      typeof initialData !== "boolean" &&
      !initialData.scriptPrompt
    ) {
      return "animation";
    }
    return "video";
  };

  const getInitialValue = <T,>(field: keyof ImageData, defaultValue: T): T => {
    if (initialData && typeof initialData !== "boolean") {
      return (initialData[field] as T) ?? defaultValue;
    }
    return defaultValue;
  };

  const [mode, setMode] = useState<VideoMode>(getInitialMode());
  const [scriptPrompt, setScriptPrompt] = useState(
    getInitialValue("scriptPrompt", "")
  );
  const [videoModel, setVideoModel] = useState<Model>(
    getInitialValue("videoModel", "d-id") as Model
  );
  const [audio, setAudio] = useState(getInitialValue("audio", "Matthew"));
  const [animation, setAnimation] = useState(
    getInitialValue("animation", "nostalgia")
  );
  const [loading, setLoading] = useState(false);

  // Get current model config
  const currentModelConfig = getModelConfig(videoModel);

  const saveHistory = useCallback(
    async (
      videoDownloadUrl: string,
      audioValue: string,
      videoModelValue: string,
      scriptPromptValue: string,
      animationValue: string
    ) => {
      const coll = collection(db, "profiles", uid, "covers");
      const docRef = doc(coll);

      const { id: _id, ...restOfImageData } = imageData;

      const modelConfig = getModelConfig(videoModelValue);

      const finalPromptData: PromptDataType = {
        freestyle: restOfImageData.freestyle || "",
        style: restOfImageData.style || "",
        model: restOfImageData.model || "",
        colorScheme: restOfImageData.colorScheme || "None",
        lighting: restOfImageData.lighting || "None",
        perspective: restOfImageData.perspective || "None",
        composition: restOfImageData.composition || "None",
        medium: restOfImageData.medium || "None",
        mood: restOfImageData.mood || "None",
        tags: restOfImageData.tags || [],
        downloadUrl: restOfImageData.downloadUrl,
        id: docRef.id,
        timestamp: Timestamp.now(),
        // Video-specific fields stored in the object
        ...({
          videoDownloadUrl: videoDownloadUrl || "",
          audio: audioValue || "",
          videoModel: videoModelValue || "",
          scriptPrompt: scriptPromptValue,
          animation: modelConfig?.capabilities.hasAnimationType
            ? animationValue || ""
            : "",
        } as Partial<PromptDataType>),
      };

      await setDoc(docRef, finalPromptData);
      return docRef.id;
    },
    [imageData, uid]
  );

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("uid", uid);
      formData.append("didAPIKey", didApiKey);
      formData.append("runwayApiKey", runwayApiKey);
      formData.append("useCredits", useCredits.toString());
      formData.append("credits", credits.toString());
      formData.append("scriptPrompt", scriptPrompt);
      formData.append("videoModel", videoModel);
      formData.append("audio", audio);
      formData.append("imageUrl", downloadUrl);
      formData.append("animationType", animation);

      const result = await generateVideo(formData);

      // Handle ActionResult response
      if (!result.success) {
        toast.error(`Failed to generate video: ${result.error}`);
        throw new Error("Failed to generate video.");
      }

      const videoDownloadURL = result.data.videoUrl;

      if (useCredits && videoDownloadURL) {
        await minusCredits(creditsToMinus(videoModel));
      }

      if (videoDownloadURL) {
        const docId = await saveHistory(
          videoDownloadURL,
          audio,
          videoModel,
          scriptPrompt,
          animation
        );

        onRequestClose();

        router.push(`/images/${docId}`);
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

  // Filter models for the current mode
  const filteredModels = videoModels.filter((m) => {
    if (mode === "video") {
      return m.capabilities.hasScriptPromptVideoGen;
    }
    return m.capabilities.hasSilentAnimation;
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={ariaHideApp}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === "video" ? "Create Video" : "Create Silent Animation"}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-2.5"
            onClick={onRequestClose}
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <div className="p-4 md:p-5 space-y-6">
          <div className="flex w-full">
            <button
              className={`w-1/2 px-4 py-2 rounded-md rounded-r-none ${
                mode === "video"
                  ? "bg-[#2563EB] text-white"
                  : "bg-gray-200 text-black-500"
              }`}
              onClick={() => {
                setMode("video");
                setVideoModel("d-id");
              }}
            >
              Video
            </button>
            <button
              className={`w-1/2 px-4 py-2 rounded-md rounded-l-none ${
                mode === "animation"
                  ? "bg-[#2563EB] text-white"
                  : "bg-gray-200 text-black-500"
              }`}
              onClick={() => {
                setMode("animation");
                setVideoModel("d-id");
              }}
            >
              Silent Animation
            </button>
          </div>

          <div className="space-y-4">
            {mode === "video" && (
              <TextareaAutosize
                minRows={4}
                value={scriptPrompt}
                placeholder="Write the script here"
                onChange={(e) => setScriptPrompt(e.target.value)}
                className="border-2 border-blue-500 bg-blue-100 rounded-md px-3 py-2 w-full"
              />
            )}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Models
              </label>
              <Select<ModelConfig>
                isClearable={true}
                isSearchable={true}
                name="videoModel"
                onChange={(v: SingleValue<ModelConfig>) =>
                  setVideoModel(v ? (v.value as Model) : "d-id")
                }
                defaultValue={currentModelConfig}
                value={currentModelConfig}
                options={filteredModels}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
              />
            </div>
            {mode === "video" && currentModelConfig?.capabilities.hasAudio && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Audio
                </label>
                <Select
                  isClearable
                  isSearchable
                  name="audio"
                  onChange={(
                    v: SingleValue<{ label: string; value: string }>
                  ) => setAudio(v ? v.value : "Matthew")}
                  defaultValue={{ label: "Matthew", value: "Matthew" }}
                  options={audios.map((audio) => ({
                    label: audio.label,
                    value: audio.value,
                  }))}
                  placeholder="Select audio"
                />
              </div>
            )}
            {mode === "animation" &&
              currentModelConfig?.capabilities.hasAnimationType && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Animation
                  </label>
                  <Select
                    isClearable
                    isSearchable
                    name="animation"
                    onChange={(
                      v: SingleValue<{ label: string; value: string }>
                    ) => setAnimation(v ? v.value : animation)}
                    defaultValue={{
                      label: animation,
                      value: animation,
                    }}
                    options={animations.map((animation) => ({
                      label: animation.label,
                      value: animation.value,
                    }))}
                    placeholder="Select animation"
                  />
                </div>
              )}
          </div>
        </div>

        <div className="p-4 md:p-5 flex justify-end space-x-4 border-t border-gray-300">
          <button className="btn-secondary" onClick={onRequestClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoModalComponent;
