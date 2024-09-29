// promptUtils.ts

export const generatePrompt = (
  visual: string = "An inspiring scene",
  artStyle?: string,
  colorScheme?: string,
  lighting?: string,
): string => {
  let promptDesign

  if (colorScheme == 'Nature') {
    promptDesign = `Create a close-up, color photograph of a ${visual}, capturing a lifelike portrayal of the subject. The image should feature a single, vibrant living thing figure facing forward, including the entire head and body with some margin. Demeanor: Friendly. Background: Soft gradient. Age/Stage: Young by default if not provided in the first sentence of this prompt. Appearance/Details: Natural and realistic features, including face, hair, and clothing that reflect a youthful, authentic look. Please avoid generating a statue or any non-nature representation; focus solely on a living, breathing living things (human, animation, plants or other) likeness, emphasizing youthful appearance by default if not provided on the first sentence of this prompt.`;
  } else {
    promptDesign = visual
  }

  if (artStyle) {
    promptDesign += `\n\nPainted in the following artistic style: ${artStyle}`;
  }

  promptDesign += `\n\nThe image should be without words. No text or logos.`;

  if (colorScheme && colorScheme !== 'None' && colorScheme !== 'Nature') {
    promptDesign += `\n\nUse this for color scheme: ${colorScheme}`;
  }

  if (lighting && lighting !== 'None') {
    promptDesign += `\n\nUse this for lighting: ${lighting}`;
  }

  return promptDesign;
};
