import { describe, expect, it } from "vitest";
import { galleryEmptyMessage } from "./galleryEmptyMessage";

describe("galleryEmptyMessage", () => {
  it("keeps the first-image prompt when the account has no images", () => {
    expect(galleryEmptyMessage(false)).toEqual({
      title: "No images yet",
      body: "Generate your first image to get started!",
    });
  });

  it("does not tell a filtered gallery that it has no images", () => {
    expect(galleryEmptyMessage(true)).toEqual({
      title: "No matching images",
      body: "Nothing matches this search or filter. Clear them to see your gallery.",
    });
  });
});
