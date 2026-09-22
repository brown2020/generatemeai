import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/utils/serverAuth", () => ({
  authenticateAction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

import { authenticateAction } from "@/utils/serverAuth";
import { withAuth, jsonOk } from "./server";
import { AuthenticationError } from "@/utils/errors";

describe("withAuth deny", () => {
  beforeEach(() => {
    vi.mocked(authenticateAction).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(authenticateAction).mockRejectedValue(
      new AuthenticationError("Authentication required.")
    );
    const handler = withAuth(async () => jsonOk({ ok: true }));
    const res = await handler();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
