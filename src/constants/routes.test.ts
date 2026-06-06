import { describe, it, expect } from "vitest";
import {
  isProtectedRoute,
  isPublicRoute,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from "./routes";

describe("isProtectedRoute", () => {
  it("treats each configured protected route as protected", () => {
    for (const route of PROTECTED_ROUTES) {
      expect(isProtectedRoute(route)).toBe(true);
    }
  });

  it("treats nested paths under a protected route as protected", () => {
    expect(isProtectedRoute("/profile/settings")).toBe(true);
    expect(isProtectedRoute("/payment-attempt/step-1")).toBe(true);
  });

  it("keeps the gallery index protected", () => {
    expect(isProtectedRoute("/images")).toBe(true);
  });

  it("exposes individual shared images publicly", () => {
    // /images/[id] must be public so share links work for signed-out users.
    expect(isProtectedRoute("/images/abc123")).toBe(false);
    expect(isProtectedRoute("/images/some-nested/id")).toBe(false);
  });

  it("does not protect public marketing/legal routes", () => {
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/about")).toBe(false);
    expect(isProtectedRoute("/terms")).toBe(false);
    expect(isProtectedRoute("/privacy")).toBe(false);
    expect(isProtectedRoute("/support")).toBe(false);
  });

  it("does not protect arbitrary unknown routes", () => {
    expect(isProtectedRoute("/loginfinish")).toBe(false);
    expect(isProtectedRoute("/totally-unknown")).toBe(false);
  });

  it("does not falsely match a route that only shares a prefix string", () => {
    // "/generated" must not be caught by the "/generate" rule.
    expect(isProtectedRoute("/generated")).toBe(false);
    expect(isProtectedRoute("/profiles")).toBe(false);
  });
});

describe("isPublicRoute", () => {
  it("treats each configured public route as public", () => {
    for (const route of PUBLIC_ROUTES) {
      expect(isPublicRoute(route)).toBe(true);
    }
  });

  it("treats shared image links as public", () => {
    expect(isPublicRoute("/images/abc123")).toBe(true);
  });

  it("does not consider protected routes public", () => {
    expect(isPublicRoute("/generate")).toBe(false);
    expect(isPublicRoute("/profile")).toBe(false);
  });
});
