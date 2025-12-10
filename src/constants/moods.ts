import { createOptionSet } from "./optionFactory";

const moodOptions = [
  { value: "none", label: "None" },
  { value: "peaceful", label: "Peaceful" },
  { value: "dramatic", label: "Dramatic" },
  { value: "mysterious", label: "Mysterious" },
  { value: "energetic", label: "Energetic" },
  { value: "melancholic", label: "Melancholic" },
  { value: "whimsical", label: "Whimsical" },
];

export const {
  options: moods,
  getValueFromLabel: getMoodFromLabel,
  findByValue: findMoodByValue,
  findByLabel: findMoodByLabel,
} = createOptionSet(moodOptions);
