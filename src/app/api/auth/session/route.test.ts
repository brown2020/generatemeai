import { beforeEach, describe, expect, it, vi } from "vitest";
import { authCookieName } from "@/constants/authCookie";

const jar = vi.hoisted(() => ({
  set: vi.fn(),
  delete: vi.fn(),
}));
const verifyIdToken = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => jar,
}));

vi.mock("@/firebase/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken },
  adminDb: {},
  adminBucket: {},
}));

import { DELETE, POST } from "@/app/api/auth/session/route";

const token = "raw-session-token";

function sessionRequest(method: "POST" | "DELETE", header?: string) {
  const headers = new Headers({ "content-type": "application/json" });
  if (header) headers.set("x-auth-session", header);
  return new Request("http://localhost/api/auth/session", {
    method,
    headers,
    body: method === "POST" ? JSON.stringify({ idToken: token }) : undefined,
  });
}

describe("auth session cookie", () => {
  beforeEach(() => {
    jar.set.mockReset();
    jar.delete.mockReset();
    verifyIdToken.mockReset();
  });

  it("refuses a request that did not opt into the session header", async () => {
    const response = await POST(sessionRequest("POST"));
    expect(response.status).toBe(403);
    expect(verifyIdToken).not.toHaveBeenCalled();
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    verifyIdToken.mockRejectedValue(new Error("bad"));
    const response = await POST(sessionRequest("POST", "1"));
    expect(response.status).toBe(401);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("stores a verified token in an HttpOnly cookie and does not echo it", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-a" });
    const response = await POST(sessionRequest("POST", "1"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toEqual({ ok: true });
    expect(JSON.stringify(body)).not.toContain(token);
    expect(jar.set).toHaveBeenCalledWith(
      authCookieName(),
      token,
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" })
    );
  });

  it("clears the cookie on delete", async () => {
    const response = await DELETE(sessionRequest("DELETE", "1"));
    expect(response.status).toBe(200);
    expect(jar.delete).toHaveBeenCalledWith(authCookieName());
  });
});
