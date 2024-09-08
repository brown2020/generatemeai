// promptUtils.ts

export const generatePrompt = (
  visual: string = "An inspiring scene",
  artStyle?: string,
  useCase?: string
): string => {
  let promptDesign = visual;

  if (artStyle) {
    promptDesign += `\n\nPainted in the following artistic style: ${artStyle}`;
  }

  if (useCase) {
    promptDesign += useCase;
  }

  promptDesign += `\n\nThe image should be inspiring and beautiful without words. No text or logos.`;

  return promptDesign;
};
