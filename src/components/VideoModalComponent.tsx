"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/zustand/useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { PromptDataType } from "@/types/promptdata";
import Select from "react-select";
import useProfileStore from "@/zustand/useProfileStore";
import toast from "react-hot-toast";
import { findModelByValue, models, SelectModel } from "@/constants/models";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { animations } from "@/constants/animations";
import Modal from "react-modal";
import { generateVideo } from "@/actions/generateVideo";
import { audios } from "@/constants/audios";
import { useRouter } from "next/navigation";

interface ModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imageData: any;
  isOpen: boolean;
  onRequestClose: () => void;
  downloadUrl: string;
  ariaHideApp: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

const ModalComponent: React.FC<ModalProps> = ({
  imageData,
  isOpen,
  onRequestClose,
  downloadUrl,
  ariaHideApp,
  initialData
}) => {
  const router = useRouter();

  const uid = useAuthStore((s) => s.uid);

  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const didApiKey = useProfileStore((s) => s.profile.did_api_key);

  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  const [mode, setMode] = useState<"video" | "gif">((initialData && !initialData?.scriptPrompt) ? "gif" : "video");
  const [scriptPrompt, setScriptPrompt] = useState<string>(initialData?.scriptPrompt || "");
  const [videoModel, setVideoModel] = useState<model>("d-id");
  const [audio, setAudio] = useState<string>(initialData?.audio || "Matthew");
  const [animation, setAnimation] = useState<string>(initialData?.animation || "nostalgia");
  const [loading, setLoading] = useState<boolean>(false);

  async function saveHistory(
    videoDownloadUrl: string,
    audio: string,
    videoModel: string,
    scriptPrompt: string,
    animation: string
  ) {
    const coll = collection(db, "profiles", uid, "covers");
    const docRef = doc(coll);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...restOfImageData } = imageData;

    const finalPromptData: PromptDataType = {
      ...restOfImageData,
      id: docRef.id,
      timestamp: Timestamp.now(),
      videoDownloadUrl: videoDownloadUrl || "",
      audio: audio || "",
      videoModel: videoModel || "",
      scriptPrompt: scriptPrompt,
      animation: animation || ""
    };

    await setDoc(docRef, finalPromptData);

    return docRef.id;
  }

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("uid", uid);
      formData.append("didAPIKey", didApiKey);
      formData.append("useCredits", useCredits.toString());
      formData.append("credits", credits.toString());
      formData.append("scriptPrompt", scriptPrompt);
      formData.append("videoModel", videoModel);
      formData.append("audio", audio);
      formData.append("imageUrl", downloadUrl);
      formData.append("animationType", animation);

      const result = await generateVideo(formData);

      if (!result || result.error || (!result.videoUrl)) {
        toast.error(`Failed to generate video: ${result?.error || "Unknown error"}`);
        throw new Error("Failed to generate video.");
      }

      const videoDownloadURL = result.videoUrl || "";

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

        onRequestClose()

        router.push(`/images/${docId}`)
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={ariaHideApp}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === "video" ? "Create Video" : "Create GIF"}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-2.5"
            onClick={onRequestClose}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <div className="p-4 md:p-5 space-y-6">
          <div className="flex w-full">
            <button
              className={`w-1/2 px-4 py-2 rounded-md rounded-r-none ${mode === "video" ? "bg-[#2563EB] text-white" : "bg-gray-200 text-black-500"}`}
              onClick={() => setMode("video")}
            >
              Video
            </button>
            <button
              className={`w-1/2 px-4 py-2 rounded-md rounded-l-none ${mode === "gif" ? "bg-[#2563EB] text-white" : "bg-gray-200 text-black-500"}`}
              onClick={() => setMode("gif")}
            >
              GIF
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
              <label className="block mb-2 text-sm font-medium text-gray-900">Model</label>
              <Select
                isClearable={true}
                isSearchable={true}
                name="videoModel"
                onChange={(v) => setVideoModel(v ? (v as SelectModel).value : "d-id")}
                defaultValue={findModelByValue(initialData?.videoModel || "d-id")}
                options={models.filter((m) => m.type === "video")}
              />
            </div>
            {mode === "video" && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Audio</label>
                <Select
                  isClearable
                  isSearchable
                  name="audio"
                  onChange={(v) => setAudio(v ? v.value : "Matthew")}
                  defaultValue={{ label: "Matthew", value: "Matthew" }}
                  options={audios.map((audio) => ({
                    id: audio.id,
                    label: audio.label,
                    value: audio.value,
                  }))}
                  placeholder="Select audio"
                />
              </div>
            )}
            {mode === "gif" && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Animation</label>
                <Select
                  isClearable
                  isSearchable
                  name="animation"
                  onChange={(v) => setAnimation(v ? v.value : initialData?.animation || "nostalgia")}
                  defaultValue={{ label: initialData?.animation || "nostalgia", value: initialData?.animation || "nostalgia" }}
                  options={animations.map((audio) => ({
                    id: audio.id,
                    label: audio.label,
                    value: audio.value,
                  }))}
                  placeholder="Select animation"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 flex justify-end space-x-4 border-t border-gray-300">
          <button
            className="btn-secondary"
            onClick={onRequestClose}
          >
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

export default ModalComponent;
