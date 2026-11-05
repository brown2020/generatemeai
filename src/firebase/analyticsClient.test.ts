import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const flags = vi.hoisted(() => ({
  hasClientConfig: true,
  hasMeasurementId: true,
  supported: true,
}));

const spies = vi.hoisted(() => ({
  getAnalytics: vi.fn<(app: unknown) => { app: { name: string } }>(() => ({
    app: { name: "[DEFAULT]" },
  })),
  logEvent: vi.fn<
    (
      analyticsInstance: unknown,
      eventName: string,
      eventParams?: Record<string, unknown>
    ) => void
  >(),
  isSupported: vi.fn(async () => flags.supported),
  getApp: vi.fn(() => ({ name: "[DEFAULT]" })),
}));

vi.mock("./firebaseClient", () => ({
  get hasClientConfig() {
    return flags.hasClientConfig;
  },
  get hasMeasurementId() {
    return flags.hasMeasurementId;
  },
}));

vi.mock("firebase/app", () => ({
  getApp: () => spies.getApp(),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: (app: unknown) => spies.getAnalytics(app),
  isSupported: () => spies.isSupported(),
  logEvent: (
    analyticsInstance: unknown,
    eventName: string,
    eventParams?: Record<string, unknown>
  ) => spies.logEvent(analyticsInstance, eventName, eventParams),
}));

async function loadClient() {
  vi.resetModules();
  return import("./analyticsClient");
}

describe("logClientPageView", () => {
  beforeEach(() => {
    flags.hasClientConfig = true;
    flags.hasMeasurementId = true;
    flags.supported = true;
    spies.getAnalytics.mockClear();
    spies.logEvent.mockClear();
    spies.isSupported.mockClear();
    spies.getApp.mockClear();
    vi.stubGlobal("window", {
      location: {
        href: "https://www.generate.me/generate",
        pathname: "/generate",
        search: "",
      },
    });
    vi.stubGlobal("document", { title: "Generate" });
  });

  it("does not start Analytics without a measurement id", async () => {
    flags.hasMeasurementId = false;
    const { logClientPageView } = await loadClient();

    await logClientPageView("/generate", () => true);

    expect(spies.isSupported).not.toHaveBeenCalled();
    expect(spies.getAnalytics).not.toHaveBeenCalled();
    expect(spies.logEvent).not.toHaveBeenCalled();
  });

  it("does not start Analytics when the browser cannot support it", async () => {
    flags.supported = false;
    const { logClientPageView } = await loadClient();

    await logClientPageView("/generate", () => true);

    expect(spies.isSupported).toHaveBeenCalledTimes(1);
    expect(spies.getAnalytics).not.toHaveBeenCalled();
    expect(spies.logEvent).not.toHaveBeenCalled();
  });

  it("calls getAnalytics and leaves the initial page_view to the SDK", async () => {
    const { logClientPageView } = await loadClient();

    await logClientPageView("/generate", () => true);

    expect(spies.getAnalytics).toHaveBeenCalledTimes(1);
    expect(spies.getAnalytics).toHaveBeenCalledWith({ name: "[DEFAULT]" });
    expect(spies.logEvent).not.toHaveBeenCalled();
  });

  it("logs page_view when the client route changes", async () => {
    const { logClientPageView } = await loadClient();

    await logClientPageView("/generate", () => true);
    await logClientPageView("/generate?style=oil", () => true);

    expect(spies.logEvent).toHaveBeenCalledTimes(1);
    expect(spies.logEvent).toHaveBeenCalledWith(
      { app: { name: "[DEFAULT]" } },
      "page_view",
      {
        page_path: "/generate?style=oil",
        page_location: "https://www.generate.me/generate",
        page_title: "Generate",
      }
    );
  });

  it("does not log the same path twice", async () => {
    const { logClientPageView } = await loadClient();

    await logClientPageView("/images", () => true);
    await logClientPageView("/profile", () => true);
    await logClientPageView("/profile", () => true);

    expect(spies.logEvent).toHaveBeenCalledTimes(1);
    expect(spies.logEvent).toHaveBeenCalledWith(
      expect.anything(),
      "page_view",
      expect.objectContaining({ page_path: "/profile" })
    );
  });

  it("ignores a cancelled caller so strict mode does not double-count", async () => {
    let release: (supported: boolean) => void = () => {};
    const gate = new Promise<boolean>((resolve) => {
      release = resolve;
    });
    spies.isSupported.mockImplementation(() => gate);
    const { logClientPageView } = await loadClient();

    const cancelled = logClientPageView("/generate", () => false);
    const current = logClientPageView("/generate", () => true);
    release(true);
    await cancelled;
    await current;
    await logClientPageView("/generate", () => true);

    expect(spies.getAnalytics).toHaveBeenCalledTimes(1);
    expect(spies.logEvent).not.toHaveBeenCalled();
  });
});

describe("analytics content security policy", () => {
  it("allows the gtag script Firebase Analytics injects", () => {
    const source = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");
    const scriptSrc = source
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith('"script-src'));

    expect(scriptSrc).toContain("https://www.googletagmanager.com");
  });
});
