export const perspectives = [
  {
    value: "none",
    label: "None",
  },
  {
    value: "close_up",
    label: "Close-up Shot",
  },
  {
    value: "wide_angle",
    label: "Wide Angle",
  },
  {
    value: "aerial_view",
    label: "Aerial View",
  },
  {
    value: "birds_eye",
    label: "Bird's Eye View",
  },
  {
    value: "low_angle",
    label: "Low Angle",
  },
  {
    value: "eye_level",
    label: "Eye Level",
  },
  {
    value: "dutch_angle",
    label: "Dutch Angle",
  },
];

export const getPerspectiveFromLabel = (label: string): string => {
  return label === "None" ? "" : label.toLowerCase().replace(/\s+/g, '_');
}; 