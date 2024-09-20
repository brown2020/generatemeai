// promptUtils.ts

export const generatePrompt = (
  visual: string = "An inspiring scene",
  artStyle?: string,
  colorScheme?: string,
  lighting?: string  
): string => {
  let promptDesign = visual;

  if (artStyle) {
    promptDesign += `\n\nPainted in the following artistic style: ${artStyle}`;
  }

  promptDesign += `\n\nThe image should be inspiring and beautiful without words. No text or logos.`;

  if (colorScheme && colorScheme != 'None') {
    promptDesign += `\n\nUse this for color scheme: ${colorScheme}`
  }

  if (lighting && lighting != 'None') {
    promptDesign += `\n\nUse this for lighting: ${lighting}`
  }

  return promptDesign;
};
