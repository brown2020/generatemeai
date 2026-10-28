import { afterEach, describe, expect, it } from "vitest";
import { previewAdminUids, previewDirectory } from "./previewPath";

describe("previewDirectory", () => {
  it("stays inside public/previews", () => {
    const dir = previewDirectory("styles", "oil painting");
    expect(dir).toMatch(/\/public\/previews\/styles\/oilpainting$/);
  });

  it("rejects values that escape the preview directory", () => {
    expect(previewDirectory("styles", "../../previews-evil")).toBeNull();
    expect(previewDirectory("styles", "..")).toBeNull();
    expect(previewDirectory("styles", "a/b")).toBeNull();
    expect(previewDirectory("styles", "a\\b")).toBeNull();
  });
});

describe("previewAdminUids", () => {
  afterEach(() => {
    delete process.env.PREVIEW_ADMIN_UIDS;
  });

  it("is empty when the allowlist is unset", () => {
    delete process.env.PREVIEW_ADMIN_UIDS;
    expect(previewAdminUids()).toEqual([]);
  });

  it("splits a comma-separated allowlist", () => {
    process.env.PREVIEW_ADMIN_UIDS = " admin-a, admin-b ";
    expect(previewAdminUids()).toEqual(["admin-a", "admin-b"]);
  });
});
