import { describe, expect, it } from "vitest";
import { createGeneratedImagePath, createVideoPath } from "./storage";

describe("storage object paths", () => {
  it("gives every generated object its own id under the caller's prefix", () => {
    const first = createGeneratedImagePath("user-a");
    const second = createGeneratedImagePath("user-a");
    expect(first).toMatch(/^generated\/user-a\/[0-9a-f-]+\.jpg$/);
    expect(second).toMatch(/^generated\/user-a\/[0-9a-f-]+\.jpg$/);
    expect(first).not.toBe(second);
  });

  it("keeps new videos under the caller's prefix", () => {
    expect(createVideoPath("user-a")).toMatch(
      /^video-generation\/user-a\/[0-9a-f-]+\.mp4$/
    );
  });
});
