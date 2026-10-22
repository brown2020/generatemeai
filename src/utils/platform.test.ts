import { afterEach, describe, expect, it, vi } from "vitest";
import { isIOSReactNativeWebView } from "./platform";

describe("isIOSReactNativeWebView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is false during server rendering", () => {
    expect(isIOSReactNativeWebView()).toBe(false);
  });

  it("is false in a regular browser", () => {
    vi.stubGlobal("window", {});
    expect(isIOSReactNativeWebView()).toBe(false);
  });

  it("is true inside the mobile app WebView", () => {
    vi.stubGlobal("window", { ReactNativeWebView: { postMessage: () => {} } });
    expect(isIOSReactNativeWebView()).toBe(true);
  });
});
