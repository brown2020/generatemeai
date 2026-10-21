import { describe, expect, it } from "vitest";
import { colors, findColorByLabel, getColorFromLabel } from "./colors";
import { findLightingByLabel, getLightingFromLabel, lightings } from "./lightings";

describe("option round trip", () => {
  it.each([
    ["colors", colors, getColorFromLabel, findColorByLabel],
    ["lightings", lightings, getLightingFromLabel, findLightingByLabel],
  ] as const)("restores every saved %s value to its label", (_, options, toSaved, find) => {
    for (const { label } of options.filter((o) => o.label !== "None")) {
      expect(find(toSaved(label))?.label).toBe(label);
    }
  });

  it("restores legacy lowercase values", () => {
    expect(findColorByLabel("warm")?.label).toBe("Warm");
    expect(findColorByLabel("high_contrast")?.label).toBe("High Contrast");
    expect(findLightingByLabel("chiaroscuro")?.label).toBe("Chiaroscuro");
  });
});
