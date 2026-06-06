import { describe, it, expect } from "vitest";
import { stripServerControlledProfileFields } from "./profileFields";

describe("stripServerControlledProfileFields", () => {
  it("removes a client-supplied credits value (credit forging guard)", () => {
    const result = stripServerControlledProfileFields({
      credits: 999999,
      displayName: "Mallory",
    });
    expect(result).not.toHaveProperty("credits");
    expect(result).toEqual({ displayName: "Mallory" });
  });

  it("preserves legitimate user-editable fields", () => {
    const updates = {
      displayName: "Alice",
      contactEmail: "alice@example.com",
      useCredits: false,
      openai_api_key: "sk-test",
    };
    expect(stripServerControlledProfileFields(updates)).toEqual(updates);
  });

  it("does not mutate the original object", () => {
    const updates = { credits: 5, useCredits: true };
    stripServerControlledProfileFields(updates);
    expect(updates).toHaveProperty("credits", 5);
  });

  it("returns an empty object when only protected fields are supplied", () => {
    expect(stripServerControlledProfileFields({ credits: 1 })).toEqual({});
  });
});
