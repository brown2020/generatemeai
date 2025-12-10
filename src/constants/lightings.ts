import { createLabelToValueMapper, withIds } from "./optionFactory";

const lightingOptions = [
  { value: "none", label: "None" },
  { value: "Back", label: "Back" },
  { value: "Front", label: "Front" },
  { value: "Side", label: "Side" },
  { value: "Ambient", label: "Ambient" },
  { value: "Spotlighting", label: "Spotlighting" },
  { value: "Soft", label: "Soft" },
  { value: "Dramatic", label: "Dramatic" },
  { value: "Low Key", label: "Low Key" },
  { value: "High Key", label: "High Key" },
  { value: "Cinematic", label: "Cinematic" },
  { value: "Golden Hour", label: "Golden Hour" },
  { value: "Rembrandt", label: "Rembrandt" },
  { value: "Broad", label: "Broad" },
  { value: "Split", label: "Split" },
  { value: "Butterfly", label: "Butterfly" },
  { value: "Silhouette", label: "Silhouette" },
  { value: "Chiaroscuro", label: "Chiaroscuro" },
  { value: "Harsh", label: "Harsh" },
  { value: "Softbox", label: "Softbox" },
];

export const lightings = withIds(lightingOptions);
export const getLightingFromLabel = createLabelToValueMapper();
