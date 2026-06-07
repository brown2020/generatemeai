import { describe, it, expect } from "vitest";
import { isAllowedStorageUrl } from "./storageUrl";

describe("isAllowedStorageUrl", () => {
  it("accepts Firebase/Google Storage HTTPS URLs", () => {
    expect(
      isAllowedStorageUrl("https://storage.googleapis.com/bucket/file.jpg?x=1")
    ).toBe(true);
    expect(
      isAllowedStorageUrl(
        "https://firebasestorage.googleapis.com/v0/b/app/o/img.png"
      )
    ).toBe(true);
  });

  it("accepts subdomains of allowed hosts", () => {
    expect(
      isAllowedStorageUrl("https://us.storage.googleapis.com/bucket/file.jpg")
    ).toBe(true);
  });

  it("rejects non-HTTPS schemes (SSRF/LFI guard)", () => {
    expect(isAllowedStorageUrl("http://storage.googleapis.com/x")).toBe(false);
    expect(isAllowedStorageUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedStorageUrl("gopher://storage.googleapis.com/")).toBe(false);
  });

  it("rejects internal/metadata and arbitrary hosts", () => {
    expect(isAllowedStorageUrl("https://169.254.169.254/latest/meta-data")).toBe(
      false
    );
    expect(isAllowedStorageUrl("https://localhost/admin")).toBe(false);
    expect(isAllowedStorageUrl("https://evil.com/x.jpg")).toBe(false);
  });

  it("rejects look-alike hosts that only embed an allowed host", () => {
    expect(
      isAllowedStorageUrl("https://storage.googleapis.com.evil.com/x")
    ).toBe(false);
    expect(
      isAllowedStorageUrl("https://evil-storage.googleapis.com.attacker.net/x")
    ).toBe(false);
    expect(
      isAllowedStorageUrl("https://storage.googleapis.com@evil.com/x")
    ).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isAllowedStorageUrl("")).toBe(false);
    expect(isAllowedStorageUrl("not a url")).toBe(false);
  });
});
