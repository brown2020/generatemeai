/* eslint-disable @next/next/no-img-element */
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
import { generateImage } from "@/actions/generateImage";
import { generatePrompt } from "@/utils/promptUtils";
import useProfileStore from "@/zustand/useProfileStore";
import toast from "react-hot-toast";
import { findModelByValue, models, SelectModel } from "@/constants/models";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { colors } from "@/constants/colors";
import { lightings } from "@/constants/lighting";
import { useSearchParams } from "next/navigation";

export default function GenerateImage() {
  const uid = useAuthStore((s) => s.uid);
  const searchterm = useSearchParams()
  const freestyleSearchParam = searchterm.get('freestyle');
  const styleSearchParam = searchterm.get('style')
  const modelSearchParam = searchterm.get('model')
  const colorSearchParam = searchterm.get('color')
  const lightingSearchParam = searchterm.get('lighting')
  const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key)
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);
  const [imagePrompt, setImagePrompt] = useState<string>(freestyleSearchParam || "");
  const [imageStyle, setImageStyle] = useState<string>(styleSearchParam || "");
  const [model, setModel] = useState<model>(modelSearchParam as model || "dall-e");
  const [colorScheme, setColorScheme] = useState<string>(colorSearchParam || "None");
  const [lighting, setLighting] = useState<string>(lightingSearchParam || "None");
  const [promptData, setPromptData] = useState<PromptDataType>({
    style: "",
    freestyle: "",
    downloadUrl: "",
    prompt: "",
    model: model,
    colorScheme,
    lighting
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");


  const colorValues = colors.map(color => color.value);
  const lightingValues = lightings.map(lightingss => lightingss.value)

  useEffect(() => {
    setPromptData((prevData) => ({
      ...prevData,
      style: "",
      freestyle: "",
    }));
  }, []);

  async function saveHistory(
    promptData: PromptDataType,
    prompt: string,
    downloadUrl: string
  ) {
    if (!uid) return;
    const coll = collection(db, "profiles", uid, "covers");
    const docRef = doc(coll);
    const p: PromptDataType = {
      ...promptData,
      downloadUrl: downloadUrl,
      model: model,
      prompt: prompt,
      id: docRef.id,
      timestamp: Timestamp.now(),
    };
    setPromptData(p);
    await setDoc(docRef, p);
  }

  const handleGenerateSDXL = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const prompt: string = generatePrompt(imagePrompt, imageStyle, colorScheme, lighting);
      const response = await generateImage(prompt, uid, openAPIKey, fireworksAPIKey, stabilityAPIKey, useCredits, credits, model);

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      const downloadURL = response?.imageUrl;
      if (!downloadURL) {
        throw new Error("Error generating image");
      }

      if (useCredits) {
        await minusCredits(creditsToMinus(model));
      }

      setGeneratedImage(downloadURL);
      await saveHistory({
        ...promptData,
        freestyle: imagePrompt,
        style: imageStyle,
        downloadUrl: downloadURL,
        model: model,
        prompt,
        lighting,
        colorScheme
      }, prompt, downloadURL);
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
      {/* Input Section */}
      <div className="flex flex-col w-full max-w-xl space-y-4">
        <TextareaAutosize
          autoFocus
          minRows={2}
          value={imagePrompt || ""}
          placeholder="Describe an image"
          onChange={(e) => setImagePrompt(e.target.value)}
          className="border-2 text-xl border-blue-500 bg-blue-100 rounded-md px-3 py-2 w-full"
        />
        <div>
          <div>Artistic Style (optional)</div>
          <Select
            isClearable={true}
            isSearchable={true}
            name="styles"
            onChange={(v) => setImageStyle(v ? v.value : "")}
            options={artStyles}
            styles={selectStyles}
            defaultInputValue={styleSearchParam || ''}
          />
        </div>
        <div>
          <div>Use</div>
          <Select
            isClearable={true}
            isSearchable={true}
            name="model"
            onChange={(v) => setModel(v ? (v as SelectModel).value : "dall-e")}
            defaultValue={findModelByValue(modelSearchParam as model || 'dall-e')}
            options={models}
            styles={selectStyles}
          />
        </div>

        <div className="flex space-x-4 items-center">
          <div>Colors:</div>
          <div className="relative flex items-center space-x-2">
            {colorValues.map((option) => (
              <div
                key={option}
                className={`cursor-pointer flex items-center space-x-1 p-2 rounded-md ${colorScheme === option ? "bg-gray-200" : ""}`}
                onClick={() => setColorScheme(option)}
                title={option}
              >
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <div>Lighting:</div>
          <div className="relative flex items-center space-x-2">
            {lightingValues.map((option) => (
              <div
                key={option}
                className={`cursor-pointer flex items-center space-x-1 p-2 rounded-md ${lighting === option ? "bg-gray-200" : ""}`}
                onClick={() => setLighting(option)}
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
              colorScheme,
              lighting,
            });
            handleGenerateSDXL(e);
          }}
        >
          {loading ? <PulseLoader color="#fff" size={12} /> : "Create Image"}
        </button>
      </div>

      {/* Generated Image Section */}
      <div className="w-full max-w-2xl mt-6">
        {generatedImage ? (
          <img
            className="object-cover w-full h-auto rounded-md"
            src={generatedImage}
            alt="Generated visualization"
          />
        ) : (
          <div className="text-gray-500 text-center">
            No image generated yet.
          </div>
        )}
      </div>
    </div>
  );
}
