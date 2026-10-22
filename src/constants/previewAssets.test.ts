import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { artStyles } from "@/constants/artStyles";
import { OPTION_PREVIEW_COUNTS } from "@/constants/optionPreviews";
import { normalizeValue } from "@/utils/imageUtils";

const previewRoot = path.join(process.cwd(), "public", "previews");
const previewFile = (type: string, value: string) =>
  path.join(previewRoot, type, value, "1.jpg");

describe("generate page preview images", () => {
  it("ships a sample image for every art style", () => {
    const missing = artStyles
      .map((style) => style.value)
      .filter((value) => !existsSync(previewFile("styles", normalizeValue(value))));
    expect(missing).toEqual([]);
  });

  it("lists exactly the option preview folders that ship, with their image counts", () => {
    const optionTypes = readdirSync(previewRoot).filter((dir) => !["models", "styles"].includes(dir));
    const shipped = Object.fromEntries(
      optionTypes.flatMap((type) =>
        readdirSync(path.join(previewRoot, type)).map((value) => [
          `${type}/${value}`,
          readdirSync(path.join(previewRoot, type, value)).filter((file) => /^\d+\.jpg$/.test(file)).length,
        ])
      )
    );
    expect(shipped).toEqual(OPTION_PREVIEW_COUNTS);
  });
});
