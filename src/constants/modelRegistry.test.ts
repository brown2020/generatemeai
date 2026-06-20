import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MODEL_REGISTRY } from "./modelRegistry";

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
