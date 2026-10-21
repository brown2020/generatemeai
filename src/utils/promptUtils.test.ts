import { beforeEach, describe, expect, it } from "vitest";
import { generatePrompt } from "@/utils/promptUtils";
import { useGenerationStore } from "@/zustand/useGenerationStore";

describe("generatePrompt", () => {
  beforeEach(() => {
    useGenerationStore.getState().reset();
  });

  it("sends only the description when every option is left at its default", () => {
    useGenerationStore.getState().updateField("imagePrompt", "a fox in snow");
    expect(generatePrompt(useGenerationStore.getState())).toBe("a fox in snow");
  });

  it("uses the option labels the user picked, in a stable order", () => {
    useGenerationStore.getState().updateFields({
      imagePrompt: "a fox",
      imageStyle: "Impressionism",
      colorScheme: "Jewel Tones",
      lighting: "Golden Hour",
      perspective: "Bird's Eye",
      mood: "Serene",
      tags: ["winter", "forest"],
    });
    expect(generatePrompt(useGenerationStore.getState())).toBe(
      "a fox, Impressionism style, Jewel Tones color scheme, Golden Hour lighting, Bird's Eye perspective, Serene mood, winter, forest"
    );
  });

  it("treats a lowercase none like an unset option", () => {
    useGenerationStore.getState().updateFields({ imagePrompt: "a fox", colorScheme: "none", lighting: "" });
    expect(generatePrompt(useGenerationStore.getState())).toBe("a fox");
  });
});
