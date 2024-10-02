// promptUtils.ts

import { imageCategories } from "@/constants/imageCategories";

export const generatePrompt = (
  visual: string = "An inspiring scene",
  artStyle?: string,
  colorScheme?: string,
  lighting?: string,
  imageCategory?: string | null
): string => {
  let promptDesign;

  // Start with the basic prompt based on the visual
  promptDesign = visual;

  // Apply the artistic style, if provided
  if (artStyle) {
    promptDesign += `\n\nPainted in the following artistic style: ${artStyle}`;
  }

  // Add no-text rule
  promptDesign += `\n\nThe image should be without words. No text or logos.`;

  // Apply the color scheme, if provided and valid
  if (colorScheme && colorScheme !== "None") {
    promptDesign += `\n\nUse this for color scheme: ${colorScheme}`;
  }

  // Apply the lighting, if provided
  if (lighting && lighting !== "None") {
    promptDesign += `\n\nUse this for lighting: ${lighting}`;
  }

  // Apply the image category's specific prompt engineering, if provided
  if (imageCategory) {
    const selectedCategory = imageCategories.find(
      (category) => category.type === imageCategory
    );

    if (selectedCategory) {
      promptDesign += `\n\n${selectedCategory.prompt_addition}`;
    }
  }

  return promptDesign;
};
