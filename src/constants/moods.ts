export const moods = [
  {
    value: "none",
    label: "None",
  },
  {
    value: "peaceful",
    label: "Peaceful",
  },
  {
    value: "dramatic",
    label: "Dramatic",
  },
  {
    value: "mysterious",
    label: "Mysterious",
  },
  {
    value: "energetic",
    label: "Energetic",
  },
  {
    value: "melancholic",
    label: "Melancholic",
  },
  {
    value: "whimsical",
    label: "Whimsical",
  },
];

export const getMoodFromLabel = (label: string): string => {
  return label === "None" ? "" : label.toLowerCase().replace(/\s+/g, '_');
}; 