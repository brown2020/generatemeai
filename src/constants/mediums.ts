import { createOptionSet } from "./optionFactory";

const mediumOptions = [
  { value: "none", label: "None" },
  { value: "digital_art", label: "Digital Art" },
  { value: "oil_painting", label: "Oil Painting" },
  { value: "watercolor", label: "Watercolor" },
  { value: "pencil_sketch", label: "Pencil Sketch" },
  { value: "photography", label: "Photography" },
  { value: "3d_render", label: "3D Render" },
  { value: "mixed_media", label: "Mixed Media" },
];

export const {
  options: mediums,
  getValueFromLabel: getMediumFromLabel,
  findByValue: findMediumByValue,
  findByLabel: findMediumByLabel,
} = createOptionSet(mediumOptions);
