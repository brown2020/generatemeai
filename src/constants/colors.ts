import { createLabelToValueMapper, withIds } from "./optionFactory";

const colorOptions = [
  { value: "none", label: "None" },
  { value: "Nature", label: "Nature" },
  { value: "Warm", label: "Warm" },
  { value: "Cool", label: "Cool" },
  { value: "Vibrant", label: "Vibrant" },
  { value: "Pastel", label: "Pastel" },
  { value: "Monochrome", label: "Monochrome" },
  { value: "Earthy", label: "Earthy" },
  { value: "Neon", label: "Neon" },
  { value: "Muted", label: "Muted" },
  { value: "Vintage", label: "Vintage" },
  { value: "Sepia", label: "Sepia" },
  { value: "Golden", label: "Golden" },
  { value: "Jewel Tones", label: "Jewel Tones" },
  { value: "High Contrast", label: "High Contrast" },
  { value: "Soft", label: "Soft" },
];

export const colors = withIds(colorOptions);
export const getColorFromLabel = createLabelToValueMapper();
