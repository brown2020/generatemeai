import { model } from "@/types/model";

export type SelectModel = {
  id: number;
  value: model;
  label: string;
  type: 'image' | 'video';
};

export const models: SelectModel[] = [
  {
    id: 1,
    value: "dall-e",
    label: "DALL-E (OpenAI)",
    type: "image"
  },
  {
    id: 2,
    value: "stable-diffusion-xl",
    label: "Stable Diffusion-XL",
    type: 'image'
  },
  {
    id: 3,
    value: "stability-sd3-turbo",
    label: "Stability SD3-turbo",
    type: 'image'
  },
  {
    id: 4,
    value: "playground-v2",
    label: "Playground V2",
    type: 'image'
  },
  {
    id: 5,
    value: "playground-v2-5",
    label: "Playground V2-5 (1024px Aesthetic)",
    type: 'image'
  },
  {
    id: 6,
    value: 'd-id',
    label: 'D-ID',
    type: 'video'
  }
];

export const findModelByValue = (
  searchValue: model
): SelectModel | undefined => {
  return models.find((model) => model.value === searchValue);
};
