import { createOptionSet } from "./optionFactory";

const perspectiveOptions = [
  { value: "none", label: "None" },
  { value: "close_up", label: "Close-up Shot" },
  { value: "wide_angle", label: "Wide Angle" },
  { value: "aerial_view", label: "Aerial View" },
  { value: "birds_eye", label: "Bird's Eye View" },
  { value: "low_angle", label: "Low Angle" },
  { value: "eye_level", label: "Eye Level" },
  { value: "dutch_angle", label: "Dutch Angle" },
];

export const {
  options: perspectives,
  getValueFromLabel: getPerspectiveFromLabel,
  findByValue: findPerspectiveByValue,
  findByLabel: findPerspectiveByLabel,
} = createOptionSet(perspectiveOptions);
