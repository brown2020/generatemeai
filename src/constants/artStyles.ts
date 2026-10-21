import { createOptionSet } from "./optionFactory";

// `hasPreview` styles ship public/previews/styles/<value without spaces>/1.jpg.
const artStyleOptions: Array<{ value: string; label: string; hasPreview?: boolean }> = [
  { value: "Prehistoric Art", label: "Prehistoric Art", hasPreview: true },
  { value: "Ancient Egyptian Art", label: "Ancient Egyptian Art", hasPreview: true },
  { value: "Ancient Greek Art", label: "Ancient Greek Art", hasPreview: true },
  { value: "Renaissance Art", label: "Renaissance Art", hasPreview: true },
  { value: "Haida Art", label: "Haida Art", hasPreview: true },
  { value: "Ukiyo-e Art", label: "Ukiyo-e Art", hasPreview: true },
  { value: "Impressionism", label: "Impressionism", hasPreview: true },
  { value: "Cubism", label: "Cubism", hasPreview: true },
  { value: "Surrealism", label: "Surrealism" },
  { value: "Abstract Expressionism", label: "Abstract Expressionism" },
  { value: "Minimalism", label: "Minimalism" },
  { value: "Street Art", label: "Street Art" },
  { value: "Contemporary Art", label: "Contemporary Art" },
  { value: "Documentary Photography", label: "Documentary Photography" },
  { value: "Art Nouveau", label: "Art Nouveau" },
  { value: "Neo-Pop Art", label: "Neo-Pop Art" },
  { value: "Contemporary Architecture", label: "Contemporary Architecture" },
  { value: "Installation Art", label: "Installation Art" },
  { value: "Aboriginal Australian Art", label: "Aboriginal Australian Art" },
  {
    value: "Traditional Chinese Painting",
    label: "Traditional Chinese Painting",
  },
];

export const {
  options: artStyles,
  getValueFromLabel: getArtStyleFromLabel,
  findByValue: findArtByValue,
  findByLabel: findArtByLabel,
} = createOptionSet(artStyleOptions);
