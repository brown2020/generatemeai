import { model } from "@/types/model";

export type SelectModel = {
  id: number;
  value: model;
  label: string;
};

export const models: SelectModel[] = [
  {
    id: 1,
    value: "dall-e",
    label: "DALL-E (OpenAI)",
  },
  {
    id: 2,
    value: "stable-diffusion-xl",
    label: "Stable Diffusion-XL",
  },
  {
    id: 3,
    value: "stability-sd3-turbo",
    label: "Stability SD3-turbo",
  },
  {
    id: 4,
    value: "playground-v2",
    label: "Playground V2",
  },
  {
    id: 5, // New model entry
    value: "playground-v2-5",
    label: "Playground V2-5 (1024px Aesthetic)",
  },
];

export const findModelByValue = (
  searchValue: model
): SelectModel | undefined => {
  return models.find((model) => model.value === searchValue);
};
