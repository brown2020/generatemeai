import { describe, it, expect } from "vitest";
import { fetchChecked, isAllowedStorageUrl, isUserMediaUrl } from "./storageUrl";

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

describe("isUserMediaUrl", () => {
  it("accepts only this account's generated, reference, and video objects", () => {
    expect(
      isUserMediaUrl(
        "https://storage.googleapis.com/demo-bucket/generated/user-a/a.png",
        "user-a"
      )
    ).toBe(true);
    expect(
      isUserMediaUrl(
        "https://storage.googleapis.com/demo-bucket/generated/user-b/a.png",
        "user-a"
      )
    ).toBe(false);
    expect(
      isUserMediaUrl(
        "https://storage.googleapis.com/demo-bucket/video-generation/clip.mp4",
        "user-a"
      )
    ).toBe(false);
  });
});

describe("fetchChecked", () => {
  it("refuses a redirect to a blocked host without fetching it", async () => {
    const calls: string[] = [];
    await expect(
      fetchChecked("https://storage.googleapis.com/bucket/generated/user-a/a.png", {
        maxBytes: 100,
        allow: (url) => isUserMediaUrl(url, "user-a"),
        fetchImpl: async (url) => {
          calls.push(String(url));
          return {
            ok: false,
            status: 302,
            headers: { get: () => "http://169.254.169.254/latest/meta-data" },
          };
        },
      })
    ).rejects.toThrow(/not allowed/i);
    expect(calls).toEqual([
      "https://storage.googleapis.com/bucket/generated/user-a/a.png",
    ]);
  });

  it("follows a redirect only when the next hop is still allowed", async () => {
    const next = "https://storage.googleapis.com/bucket/generated/user-a/b.png";
    const bytes = await fetchChecked(
      "https://storage.googleapis.com/bucket/generated/user-a/a.png",
      {
        maxBytes: 100,
        allow: (url) => isUserMediaUrl(url, "user-a"),
        fetchImpl: async (url) => {
          if (String(url).endsWith("/a.png")) {
            return {
              ok: false,
              status: 302,
              headers: { get: () => next },
            };
          }
          return {
            ok: true,
            status: 200,
            headers: { get: () => null },
            arrayBuffer: async () => new Uint8Array([9]).buffer,
          };
        },
      }
    );
    expect(bytes).toEqual(Buffer.from([9]));
  });
});
