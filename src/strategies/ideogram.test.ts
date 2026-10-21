import { afterEach, describe, expect, it, vi } from "vitest";
import { ideogramStrategy } from "./ideogram";

const V3_ASPECT_RATIOS = ["1x3", "3x1", "1x2", "2x1", "9x16", "16x9", "10x16", "16x10", "2x3", "3x2", "3x4", "4x3", "4x5", "5x4", "1x1"];

afterEach(() => vi.unstubAllGlobals());

const sentAspectRatio = async (aspectRatio?: string) => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ data: [{ url: "https://ideogram.example/img.png" }] }))
    .mockResolvedValueOnce(new Response(new Uint8Array([1])));
  vi.stubGlobal("fetch", fetchMock);
  await ideogramStrategy({ message: "a fox", apiKey: "k", useCredits: true, aspectRatio, img: null });
  return (fetchMock.mock.calls[0][1].body as FormData).get("aspect_ratio");
};

describe("ideogramStrategy", () => {
  it.each(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", undefined])(
    "sends a v3 aspect ratio for %s",
    async (ratio) => {
      expect(V3_ASPECT_RATIOS).toContain(await sentAspectRatio(ratio));
    }
  );
});
