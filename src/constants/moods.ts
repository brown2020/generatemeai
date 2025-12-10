import { createLabelToValueMapper } from "./optionFactory";

export const moods = [
  { value: "none", label: "None" },
  { value: "peaceful", label: "Peaceful" },
  { value: "dramatic", label: "Dramatic" },
  { value: "mysterious", label: "Mysterious" },
  { value: "energetic", label: "Energetic" },
  { value: "melancholic", label: "Melancholic" },
  { value: "whimsical", label: "Whimsical" },
];

export const getMoodFromLabel = createLabelToValueMapper();
