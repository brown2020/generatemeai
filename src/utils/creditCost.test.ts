import { describe, expect, it } from "vitest";
import { creditsToMinus } from "@/constants/modelRegistry";
import { generationCreditCost } from "@/utils/creditCost";

describe("generationCreditCost", () => {
  it("uses the model maximum when the requested count is higher", () => {
    expect(generationCreditCost("flux-schnell", 4)).toBe(creditsToMinus("flux-schnell"));
    expect(generationCreditCost("dall-e", 4)).toBe(creditsToMinus("dall-e") * 4);
  });
});
