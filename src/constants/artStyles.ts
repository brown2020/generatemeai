import { withIds, createOptionFinder } from "./optionFactory";

const artStyleOptions = [
  { value: "Prehistoric Art", label: "Prehistoric Art" },
  { value: "Ancient Egyptian Art", label: "Ancient Egyptian Art" },
  { value: "Ancient Greek Art", label: "Ancient Greek Art" },
  { value: "Renaissance Art", label: "Renaissance Art" },
  { value: "Haida Art", label: "Haida Art" },
  { value: "Ukiyo-e Art", label: "Ukiyo-e Art" },
  { value: "Impressionism", label: "Impressionism" },
  { value: "Cubism", label: "Cubism" },
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

export const artStyles = withIds(artStyleOptions);
export const findArtByValue = createOptionFinder(artStyles);
