import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { NextRequest as NextRequestCtor } from "next/server";
import { memory } from "@/test/memoryFirestore";
import { CREDIT_PACK } from "@/constants/creditPack";
import { generationCreditCost, STARTING_CREDITS } from "@/utils/creditCost";
import { FirestorePaths } from "@/firebase/paths";

const testAuth = vi.hoisted(() => ({ uid: "user-a" }));
const strategyCall = vi.hoisted(() => ({
  calls: [] as Array<{ imageCount?: number }>,
  impl: (async () => "png-bytes") as (
    input: { imageCount?: number }
  ) => Promise<unknown>,
}));
const stripeMock = vi.hoisted(() => ({
  create: vi.fn(),
  retrieve: vi.fn(),
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

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    paymentIntents: {
      create: stripeMock.create,
      retrieve: stripeMock.retrieve,
    },
  }),
}));

vi.mock("@/strategies", () => ({
  getStrategy: () => (input: { imageCount?: number }) => {
    strategyCall.calls.push(input);
    return strategyCall.impl(input);
  },
}));

vi.mock("@/utils/storage", () => ({
  saveToStorage: async () => "https://storage.example/generated/a.png",
  createGeneratedImagePath: () => "generated/user-a/a.png",
  createReferenceImagePath: () => "image-references/user-a/a.png",
}));

import { POST as generateImage } from "@/app/api/generate/image/route";
import { POST as createIntent } from "@/app/api/payments/intent/route";
import { POST as processPayment } from "@/app/api/payments/process/route";
import { POST as validatePayment } from "@/app/api/payments/validate/route";
import { GET as getImage, DELETE as deleteImage } from "@/app/api/images/[imageId]/route";
import { POST as shareImage } from "@/app/api/images/[imageId]/share/route";
import { GET as getProfile } from "@/app/api/profile/route";
import { POST as saveHistory } from "@/app/api/history/route";
import { proxy } from "@/proxy";

const profilePath = FirestorePaths.userProfile("user-a");

function asRequest(request: Request): NextRequest {
  return request as NextRequest;
}

function imageForm(model: string, imageCount: number, extras?: Record<string, string>) {
  const body = new FormData();
  body.set("message", "a red boat");
  body.set("uid", "user-a");
  body.set("model", model);
  body.set("useCredits", "true");
  body.set("credits", "99999");
  body.set("imageCount", String(imageCount));
  for (const [key, value] of Object.entries(extras ?? {})) {
    body.set(key, value);
  }
  return asRequest(
    new Request("http://localhost/api/generate/image", { method: "POST", body })
  );
}

function jsonPost(url: string, body: unknown) {
  return asRequest(
    new Request(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

function imageContext(imageId: string) {
  return { params: Promise.resolve({ imageId }) };
}

async function readEvents(response: Response) {
  const text = await response.text();
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { status: string; data?: { coverId?: string }; error?: string; code?: string });
}

function coverPaths(uid = "user-a") {
  return [...memory.docs.keys()].filter((path) =>
    path.startsWith(`${FirestorePaths.profileCovers(uid)}/`)
  );
}

function seedProfile(credits: number, useCredits = true) {
  memory.docs.set(profilePath, { credits, useCredits });
}

function succeededIntent(overrides: Record<string, unknown> = {}) {
  return {
    id: "pi_pack",
    amount: CREDIT_PACK.amountCents,
    status: "succeeded",
    created: 1_700_000_000,
    currency: "usd",
    description: "pack",
    client_secret: "sec_should_not_leak",
    metadata: { uid: "user-a", credits: String(CREDIT_PACK.credits) },
    ...overrides,
  };
}

describe("critical routes", () => {
  beforeEach(() => {
    memory.reset();
    testAuth.uid = "user-a";
    strategyCall.calls = [];
    strategyCall.impl = async (input) =>
      Array.from({ length: input.imageCount ?? 1 }, () => "png-bytes");
    stripeMock.create.mockReset();
    stripeMock.retrieve.mockReset();
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = "Generate Credits";
    process.env.OPENAI_API_KEY = "test-openai";
    process.env.REPLICATE_API_KEY = "test-replicate";
    stripeMock.create.mockImplementation(async (args: { amount: number; metadata: Record<string, string> }) => ({
      id: "pi_new",
      client_secret: "sec_new",
      amount: args.amount,
      metadata: args.metadata,
    }));
  });

  it("sends an anonymous visitor home and lets a session cookie through", () => {
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";
    const anonymous = proxy(new NextRequestCtor("http://localhost/generate"));
    expect(anonymous.status).toBe(307);
    expect(anonymous.headers.get("location")).toContain("redirect=%2Fgenerate");

    const signedIn = proxy(
      new NextRequestCtor("http://localhost/generate", {
        headers: { cookie: `${cookieName}=session-token` },
      })
    );
    expect(signedIn.status).toBe(200);
  });

  it("rejects image generation without a verified session", async () => {
    testAuth.uid = "";
    seedProfile(100);
    const events = await readEvents(await generateImage(imageForm("dall-e", 1)));
    expect(events.at(-1)?.code).toBe("AUTHENTICATION_REQUIRED");
    expect(strategyCall.calls).toHaveLength(0);
    expect(memory.docs.get(profilePath)?.credits).toBe(100);
  });

  it("charges per image before the provider, stores the gallery record, and reloads it", async () => {
    seedProfile(100);
    let creditsDuring = -1;
    strategyCall.impl = async (input) => {
      creditsDuring = memory.docs.get(profilePath)?.credits as number;
      return Array.from({ length: input.imageCount ?? 1 }, () => "png-bytes");
    };

    const events = await readEvents(await generateImage(imageForm("dall-e", 4)));
    const complete = events.find((event) => event.status === "complete");
    expect(complete?.data?.coverId).toBeTruthy();
    expect(strategyCall.calls[0]?.imageCount).toBe(4);
    expect(creditsDuring).toBe(84);
    expect(memory.docs.get(profilePath)?.credits).toBe(84);

    const coverId = complete?.data?.coverId as string;
    const reloaded = await getImage(
      asRequest(new Request(`http://localhost/api/images/${coverId}`)),
      imageContext(coverId)
    );
    const payload = await reloaded.json();
    expect(payload.data.isOwner).toBe(true);
    expect(payload.data.data.downloadUrl).toBe("https://storage.example/generated/a.png");

    const styled = await saveHistory(
      jsonPost("http://localhost/api/history", {
        id: coverId,
        freestyle: "boat",
        style: "oil",
        downloadUrl: "https://storage.example/generated/a.png",
        model: "dall-e",
        prompt: "a red boat",
        tags: [],
        imageCategory: "",
        lighting: "",
        colorScheme: "",
        imageReference: "",
        perspective: "",
        composition: "",
        medium: "",
        mood: "",
      })
    );
    expect((await styled.json()).data.id).toBe(coverId);
    expect(coverPaths()).toHaveLength(1);
    expect(memory.docs.get(FirestorePaths.profileCover("user-a", coverId))?.style).toBe("oil");
  });

  it("caps models that only generate one image and ignores the client credit balance", async () => {
    seedProfile(100);
    const events = await readEvents(await generateImage(imageForm("flux-schnell", 4)));
    expect(events.at(-1)?.status).toBe("complete");
    expect(strategyCall.calls[0]?.imageCount).toBe(1);
    expect(memory.docs.get(profilePath)?.credits).toBe(96);
  });

  it("does not charge a BYOK generation", async () => {
    seedProfile(100, false);
    const events = await readEvents(
      await generateImage(imageForm("dall-e", 4, { openAPIKey: "user-key" }))
    );
    expect(events.at(-1)?.status).toBe("complete");
    expect(memory.docs.get(profilePath)?.credits).toBe(100);
    expect(coverPaths()).toHaveLength(1);
  });

  it("refunds the reserve when the provider fails and leaves no gallery record", async () => {
    seedProfile(100);
    strategyCall.impl = async () => {
      throw new Error("provider down");
    };
    const events = await readEvents(await generateImage(imageForm("dall-e", 4)));
    expect(events.at(-1)?.status).toBe("error");
    expect(memory.docs.get(profilePath)?.credits).toBe(100);
    expect(coverPaths()).toHaveLength(0);
  });

  it("refuses a generation the balance cannot cover", async () => {
    seedProfile(10);
    const events = await readEvents(await generateImage(imageForm("dall-e", 4)));
    expect(events.at(-1)?.status).toBe("error");
    expect(strategyCall.calls).toHaveLength(0);
    expect(memory.docs.get(profilePath)?.credits).toBe(10);
  });

  it("lets only one of two overlapping generations spend the same balance", async () => {
    seedProfile(20);
    const [firstResponse, secondResponse] = await Promise.all([
      generateImage(imageForm("dall-e", 4)),
      generateImage(imageForm("dall-e", 4)),
    ]);
    const [first, second] = await Promise.all([
      readEvents(firstResponse),
      readEvents(secondResponse),
    ]);
    const statuses = [first.at(-1)?.status, second.at(-1)?.status].sort();
    expect(statuses).toEqual(["complete", "error"]);
    expect(strategyCall.calls).toHaveLength(1);
    expect(memory.docs.get(profilePath)?.credits).toBe(4);
    expect(coverPaths()).toHaveLength(1);
  });

  it("deletes only the owner's gallery image and public mirror", async () => {
    seedProfile(100);
    memory.docs.set(FirestorePaths.profileCover("user-a", "img-1"), {
      downloadUrl: "https://storage.example/a.png",
      isSharable: true,
    });
    memory.docs.set(FirestorePaths.publicImage("img-1"), {
      downloadUrl: "https://storage.example/a.png",
    });
    memory.docs.set(FirestorePaths.profileCover("user-b", "img-b"), {
      downloadUrl: "https://storage.example/private-b.png",
      note: "private-gallery",
    });

    testAuth.uid = "user-b";
    const denied = await deleteImage(
      asRequest(new Request("http://localhost/api/images/img-1", { method: "DELETE" })),
      imageContext("img-1")
    );
    expect(denied.status).toBe(404);
    expect(memory.docs.has(FirestorePaths.publicImage("img-1"))).toBe(true);
    expect(memory.docs.has(FirestorePaths.profileCover("user-a", "img-1"))).toBe(true);

    testAuth.uid = "user-a";
    const hidden = await getImage(
      asRequest(new Request("http://localhost/api/images/img-b")),
      imageContext("img-b")
    );
    expect(hidden.status).toBe(404);

    const removed = await deleteImage(
      asRequest(new Request("http://localhost/api/images/img-1", { method: "DELETE" })),
      imageContext("img-1")
    );
    expect(removed.status).toBe(200);
    expect(memory.docs.has(FirestorePaths.profileCover("user-a", "img-1"))).toBe(false);
    expect(memory.docs.has(FirestorePaths.publicImage("img-1"))).toBe(false);

    const replay = await deleteImage(
      asRequest(new Request("http://localhost/api/images/img-1", { method: "DELETE" })),
      imageContext("img-1")
    );
    expect(replay.status).toBe(404);
    expect(memory.docs.has(FirestorePaths.profileCover("user-b", "img-b"))).toBe(true);
  });

  it("publishes only the owner's image and reloads the public copy", async () => {
    memory.docs.set(FirestorePaths.profileCover("user-a", "img-1"), {
      downloadUrl: "https://storage.example/a.png",
      isSharable: false,
      prompt: "boat",
    });
    memory.docs.set(FirestorePaths.profileCover("user-b", "img-b"), {
      downloadUrl: "https://storage.example/private-b.png",
      note: "private-gallery",
    });

    testAuth.uid = "user-b";
    const denied = await shareImage(
      jsonPost("http://localhost/api/images/img-1/share", { password: "" }),
      imageContext("img-1")
    );
    expect(denied.status).toBe(404);
    expect(memory.docs.has(FirestorePaths.publicImage("img-1"))).toBe(false);

    testAuth.uid = "user-a";
    const shared = await shareImage(
      jsonPost("http://localhost/api/images/img-1/share", { password: "" }),
      imageContext("img-1")
    );
    expect((await shared.json()).data.isSharable).toBe(true);

    testAuth.uid = "";
    const reloaded = await getImage(
      asRequest(new Request("http://localhost/api/images/img-1")),
      imageContext("img-1")
    );
    const payload = await reloaded.json();
    expect(payload.data.isOwner).toBe(false);
    expect(payload.data.data.downloadUrl).toBe("https://storage.example/a.png");
    expect(JSON.stringify(payload)).not.toContain("private-gallery");
    expect(memory.docs.has(FirestorePaths.profileCover("user-b", "img-b"))).toBe(true);
  });

  it("sells only the published pack, grants it once, and reloads the balance", async () => {
    seedProfile(100);
    const rejected = await createIntent(
      jsonPost("http://localhost/api/payments/intent", { amount: 100 })
    );
    expect(rejected.status).toBe(400);
    expect(stripeMock.create).not.toHaveBeenCalled();

    const created = await createIntent(
      jsonPost("http://localhost/api/payments/intent", { amount: CREDIT_PACK.amountCents })
    );
    expect(created.status).toBe(200);
    expect(stripeMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: CREDIT_PACK.amountCents,
        metadata: expect.objectContaining({ uid: "user-a", credits: "10000" }),
      })
    );

    stripeMock.retrieve.mockResolvedValue(
      succeededIntent({ metadata: { uid: "user-b" }, amount: CREDIT_PACK.amountCents })
    );
    const stolen = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect(stolen.status).toBe(403);
    expect(memory.docs.get(profilePath)?.credits).toBe(100);

    stripeMock.retrieve.mockResolvedValue(succeededIntent({ amount: 100 }));
    const offCatalog = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect(offCatalog.status).toBe(400);
    expect(memory.docs.get(profilePath)?.credits).toBe(100);

    stripeMock.retrieve.mockResolvedValue(succeededIntent());
    const processed = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect((await processed.json()).data).toMatchObject({
      creditsAdded: CREDIT_PACK.credits,
      alreadyProcessed: false,
    });

    const reloaded = await getProfile();
    expect((await reloaded.json()).data.credits).toBe(100 + CREDIT_PACK.credits);

    const replay = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect((await replay.json()).data.alreadyProcessed).toBe(true);
    expect((await (await getProfile()).json()).data.credits).toBe(100 + CREDIT_PACK.credits);

    const validated = await validatePayment(
      jsonPost("http://localhost/api/payments/validate", { paymentIntentId: "pi_pack" })
    );
    const validatedBody = await validated.json();
    expect(validatedBody.data.client_secret).toBeUndefined();

    testAuth.uid = "user-b";
    const other = await validatePayment(
      jsonPost("http://localhost/api/payments/validate", { paymentIntentId: "pi_pack" })
    );
    expect(other.status).toBe(403);
  });

  it("grants a pack once when two process calls overlap, and a Stripe failure writes nothing", async () => {
    seedProfile(100);
    stripeMock.retrieve.mockResolvedValue(succeededIntent());
    const [first, second] = await Promise.all([
      processPayment(jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })),
      processPayment(jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })),
    ]);
    const payloads = await Promise.all([first.json(), second.json()]);
    const added = payloads.map((payload) => payload.data.creditsAdded).sort((a, b) => a - b);
    expect(added).toEqual([0, CREDIT_PACK.credits]);
    expect(memory.docs.get(profilePath)?.credits).toBe(100 + CREDIT_PACK.credits);

    memory.reset();
    seedProfile(50);
    stripeMock.retrieve.mockRejectedValue(new Error("stripe down"));
    const failed = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect(failed.status).toBe(500);
    expect(memory.docs.get(profilePath)?.credits).toBe(50);
    expect(memory.docs.has(FirestorePaths.userPayment("user-a", "pi_pack"))).toBe(false);
  });

  it("grants a pack on top of the starting balance when no profile exists yet", async () => {
    stripeMock.retrieve.mockResolvedValue(succeededIntent());
    const response = await processPayment(
      jsonPost("http://localhost/api/payments/process", { paymentIntentId: "pi_pack" })
    );
    expect(response.status).toBe(200);
    expect(memory.docs.get(profilePath)?.credits).toBe(STARTING_CREDITS + CREDIT_PACK.credits);
  });

  it("writes the starting balance once and then returns the stored balance, including a low one", async () => {
    const created = await getProfile();
    expect((await created.json()).data.credits).toBe(STARTING_CREDITS);
    expect(memory.docs.get(profilePath)?.credits).toBe(STARTING_CREDITS);

    const again = await getProfile();
    expect((await again.json()).data.credits).toBe(STARTING_CREDITS);

    memory.docs.set(profilePath, { credits: 40, useCredits: true });
    const low = await getProfile();
    expect((await low.json()).data.credits).toBe(40);

    memory.reset();
    const events = await readEvents(await generateImage(imageForm("dall-e", 1)));
    expect(events.some((event) => event.status === "complete")).toBe(true);
    expect(memory.docs.get(profilePath)?.credits).toBe(
      STARTING_CREDITS - generationCreditCost("dall-e", 1)
    );
  });
});
