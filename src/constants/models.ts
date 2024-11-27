import { model } from "@/types/model";

export type SelectModel = {
  id: number;
  value: model;
  label: string;
  type: "image" | "video" | "both";
  hasAudio: boolean;
  hasSilentAnimation: boolean;
  hasAnimationType: boolean;
  hasScriptPromptVideoGen: boolean;
};

export const models: SelectModel[] = [
  {
    id: 1,
    value: "dall-e",
    label: "DALL-E (OpenAI)",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 2,
    value: "stable-diffusion-xl",
    label: "Stable Diffusion-XL",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 3,
    value: "stability-sd3-turbo",
    label: "Stability SD3-turbo",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 4,
    value: "playground-v2",
    label: "Playground V2",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 5,
    value: "playground-v2-5",
    label: "Playground V2-5 (1024px Aesthetic)",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 6,
    value: "flux-schnell",
    label: "Flux Schnell (Blackforest Labs)",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 7,
    value: "d-id",
    label: "D-ID",
    type: "video",
    hasAudio: true,
    hasSilentAnimation: true,
    hasAnimationType: true,
    hasScriptPromptVideoGen: true,
  },
  {
    id: 8,
    value: "runway-ml",
    label: "RunwayML",
    type: "video",
    hasAudio: false,
    hasSilentAnimation: true,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
  {
    id: 9,
    value: "ideogram-ai",
    label: "Ideogram AI",
    type: "image",
    hasAudio: false,
    hasSilentAnimation: false,
    hasAnimationType: false,
    hasScriptPromptVideoGen: false,
  },
];

export const findModelByValue = (
  searchValue: model
): SelectModel | undefined => {
  return models.find((model) => model.value === searchValue);
};
