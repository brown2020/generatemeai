import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MODEL_REGISTRY, creditsToMinus, getImageModels, isSelectableImageModel, isValidModel } from "./modelRegistry";

const readEnvExampleKeys = (): Set<string> => {
  const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");

  return new Set(
    envExample
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=", 1)[0])
  );
};

describe("MODEL_REGISTRY environment documentation", () => {
  it("documents every registered provider API key in .env.example", () => {
    const envKeys = readEnvExampleKeys();
    const apiKeyEnvKeys = new Set(
      Object.values(MODEL_REGISTRY).map((config) => config.apiKey.envKey)
    );

    for (const key of apiKeyEnvKeys) {
      expect(envKeys.has(key)).toBe(true);
    }
  });

  it("keeps public credit env vars exactly aligned with registered models", () => {
    const envKeys = readEnvExampleKeys();
    const expectedCreditKeys = Object.values(MODEL_REGISTRY)
      .map((config) => config.credits.envKey)
      .sort();
    const documentedCreditKeys = [...envKeys]
      .filter((key) => key.startsWith("NEXT_PUBLIC_CREDITS_PER_"))
      .sort();

    expect(documentedCreditKeys).toEqual(expectedCreditKeys);
  });
});

describe("isValidModel", () => {
  it("accepts registered ids and rejects retired or inherited names", () => {
    expect(Object.keys(MODEL_REGISTRY).every(isValidModel)).toBe(true);
    for (const name of ["playground-v2", "stable-diffusion-xl", "constructor", "toString", ""]) {
      expect(isValidModel(name)).toBe(false);
    }
  });
});

describe("creditsToMinus", () => {
  it("reads the public credit price from a static env access", () => {
    const key = "NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE";
    const previous = process.env[key];
    process.env[key] = "7";
    expect(creditsToMinus("dall-e")).toBe(7);
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
});

describe("isSelectableImageModel", () => {
  it("offers only visible image models for new generations", () => {
    expect(getImageModels().map((m) => m.value)).toEqual(["dall-e"]);
    expect(isSelectableImageModel("dall-e")).toBe(true);
    for (const name of ["stability-sd3-turbo", "flux-schnell", "ideogram-ai", "d-id", "bria.ai", "playground-v2"]) {
      expect(isSelectableImageModel(name)).toBe(false);
    }
  });
});
