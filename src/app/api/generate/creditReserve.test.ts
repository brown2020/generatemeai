import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { memory } from "@/test/memoryFirestore";
import { FirestorePaths } from "@/firebase/paths";

const testAuth = vi.hoisted(() => ({ uid: "user-a" }));
const providers = vi.hoisted(() => ({
  videoFails: false,
  tagsFail: false,
  sourceFails: false,
  briaFails: false,
  calls: 0,
}));

vi.mock("@/firebase/firebaseAdmin", async () => {
  const { memory: store } = await import("@/test/memoryFirestore");
  return { adminDb: store.adminDb, adminAuth: {}, adminBucket: {} };
});

vi.mock("@/utils/serverAuth", () => ({
  authenticateAction: async () => {
    if (!testAuth.uid) {
      const { AuthenticationError } = await import("@/utils/errors");
      throw new AuthenticationError("Authentication required. Please sign in.");
    }
    return testAuth.uid;
  },
}));

vi.mock("@/utils/storage", () => ({
  saveVideoFromUrl: async () => "https://storage.googleapis.com/bucket/video.mp4",
}));

vi.mock("ai", () => ({
  generateText: async () => {
    providers.calls += 1;
    if (providers.tagsFail) throw new Error("tag provider failed");
    return { text: "red, boat, water, sky, calm, dusk" };
  },
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => () => "gpt-4",
}));

import { POST as generateVideo } from "@/app/api/generate/video/route";
import { POST as generateTags } from "@/app/api/generate/tags/route";
import { POST as optimizePrompt } from "@/app/api/generate/optimize-prompt/route";
import { POST as removeBackground } from "@/app/api/generate/background-removal/route";
import { generationCreditCost } from "@/utils/creditCost";

const profilePath = FirestorePaths.userProfile("user-a");
const sourceUrl = "https://storage.googleapis.com/bucket/source.png";

function asRequest(request: Request): NextRequest {
  return request as NextRequest;
}

function seedProfile(credits: number, useCredits = true) {
  memory.docs.set(profilePath, { credits, useCredits });
}

function credits(): number {
  return memory.docs.get(profilePath)?.credits as number;
}

function videoRequest() {
  const body = new FormData();
  body.set("videoModel", "d-id");
  body.set("imageUrl", "https://example.com/source.png");
  body.set("useCredits", "true");
  body.set("credits", "99999");
  body.set("scriptPrompt", "hello");
  body.set("audio", "Matthew");
  return asRequest(
    new Request("http://localhost/api/generate/video", { method: "POST", body })
  );
}

function optimizeRequest(apiKey?: string) {
  return asRequest(
    new Request("http://localhost/api/generate/optimize-prompt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "a red boat", apiKey }),
    })
  );
}

function tagsRequest() {
  return asRequest(
    new Request("http://localhost/api/generate/tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: "a red boat",
        useCredits: true,
        credits: 99999,
      }),
    })
  );
}

function backgroundRequest() {
  return asRequest(
    new Request("http://localhost/api/generate/background-removal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ imageUrl: sourceUrl }),
    })
  );
}

describe("credit reservation", () => {
  beforeEach(() => {
    memory.reset();
    testAuth.uid = "user-a";
    providers.videoFails = false;
    providers.tagsFail = false;
    providers.sourceFails = false;
    providers.briaFails = false;
    providers.calls = 0;
    process.env.DID_API_KEY = "test-did";
    process.env.OPENAI_API_KEY = "test-openai";
    process.env.BRIA_AI_API_KEY = "test-bria";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const href = String(url);
        if (href.endsWith("/talks")) {
          if (providers.videoFails) {
            return { ok: false, json: async () => ({ description: "D-ID failed" }) };
          }
          return { ok: true, json: async () => ({ id: "talk-1" }) };
        }
        if (href.includes("/talks/")) {
          return { ok: true, json: async () => ({ result_url: "https://cdn.example/video.mp4" }) };
        }
        if (href === sourceUrl) {
          if (providers.sourceFails) return { ok: false, blob: async () => new Blob() };
          return { ok: true, blob: async () => new Blob(["png"]) };
        }
        if (href.includes("bria-api.com")) {
          if (providers.briaFails) {
            return { ok: false, json: async () => ({ message: "bria failed" }) };
          }
          return { ok: true, json: async () => ({ result_url: "https://example.com/cut.png" }) };
        }
        throw new Error(`unexpected fetch ${href}`);
      })
    );
  });

  it("charges a finished video and refunds when the provider fails", async () => {
    seedProfile(80);
    const success = await generateVideo(videoRequest());
    expect(success.status).toBe(200);
    expect(credits()).toBe(30);

    providers.videoFails = true;
    const failure = await generateVideo(videoRequest());
    expect(failure.status).toBe(500);
    expect(credits()).toBe(30);
  });

  it("lets only one overlapping video spend a single video's balance", async () => {
    seedProfile(50);
    const [first, second] = await Promise.all([generateVideo(videoRequest()), generateVideo(videoRequest())]);
    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 500]);
    expect(credits()).toBe(0);
  });

  it("charges prompt optimization and does not call the platform key without a debit or a user key", async () => {
    seedProfile(10);
    const success = await optimizePrompt(optimizeRequest());
    expect(success.status).toBe(200);
    expect(credits()).toBe(10 - generationCreditCost("chatgpt", 1));
    expect(providers.calls).toBe(1);

    providers.tagsFail = true;
    const failure = await optimizePrompt(optimizeRequest());
    expect(failure.status).toBe(500);
    expect(credits()).toBe(10 - generationCreditCost("chatgpt", 1));

    providers.tagsFail = false;
    providers.calls = 0;
    seedProfile(10, false);
    const byok = await optimizePrompt(optimizeRequest());
    expect(byok.status).toBe(400);
    expect(credits()).toBe(10);
    expect(providers.calls).toBe(0);
  });

  it("charges finished tags and refunds when the provider fails", async () => {
    seedProfile(10);
    const success = await generateTags(tagsRequest());
    expect(success.status).toBe(200);
    expect(credits()).toBe(8);

    providers.tagsFail = true;
    const failure = await generateTags(tagsRequest());
    expect(failure.status).toBe(500);
    expect(credits()).toBe(8);
  });

  it("charges a finished background removal and refunds when Bria fails", async () => {
    seedProfile(12);
    const success = await removeBackground(backgroundRequest());
    expect(success.status).toBe(200);
    expect(credits()).toBe(8);

    providers.briaFails = true;
    const failure = await removeBackground(backgroundRequest());
    expect(failure.status).toBe(502);
    expect(credits()).toBe(8);
  });
});
