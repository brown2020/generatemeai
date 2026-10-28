import { beforeEach, describe, expect, it, vi } from "vitest";
import { memory } from "@/test/memoryFirestore";
import { CREDIT_PACK } from "@/constants/creditPack";
import { FirestorePaths } from "@/firebase/paths";

const constructEvent = vi.hoisted(() => vi.fn());

vi.mock("@/firebase/firebaseAdmin", async () => {
  const { memory: store } = await import("@/test/memoryFirestore");
  return { adminDb: store.adminDb, adminAuth: {}, adminBucket: {} };
});

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent },
  }),
}));

import { POST as stripeWebhook } from "@/app/api/payments/webhook/route";

const profilePath = FirestorePaths.userProfile("user-a");

function webhookRequest(signature?: string) {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature) headers.set("stripe-signature", signature);
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("Stripe webhook", () => {
  beforeEach(() => {
    memory.reset();
    constructEvent.mockReset();
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("does not grant credits when the webhook secret is unset", async () => {
    const response = await stripeWebhook(webhookRequest("sig"));
    expect(response.status).toBe(503);
    expect(constructEvent).not.toHaveBeenCalled();
    expect(memory.docs.has(profilePath)).toBe(false);
  });

  it("rejects a bad signature", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const response = await stripeWebhook(webhookRequest("sig"));
    expect(response.status).toBe(400);
    expect(memory.docs.has(profilePath)).toBe(false);
  });

  it("grants the pack once for a signed payment_intent.succeeded event", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    memory.docs.set(profilePath, { credits: 100, useCredits: true });
    const paymentIntent = {
      id: "pi_pack",
      amount: CREDIT_PACK.amountCents,
      status: "succeeded",
      created: 1_700_000_000,
      metadata: { uid: "user-a" },
    };
    constructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: paymentIntent },
    });

    const first = await stripeWebhook(webhookRequest("sig"));
    expect((await first.json()).data).toMatchObject({
      received: true,
      alreadyProcessed: false,
    });
    expect(memory.docs.get(profilePath)?.credits).toBe(100 + CREDIT_PACK.credits);

    const replay = await stripeWebhook(webhookRequest("sig"));
    expect((await replay.json()).data.alreadyProcessed).toBe(true);
    expect(memory.docs.get(profilePath)?.credits).toBe(100 + CREDIT_PACK.credits);
  });
});
