import { describe, expect, it, vi } from "vitest";
import { mapAuthError, authErrorCode } from "./authErrors";

describe("mapAuthError", () => {
  it("maps known Firebase codes to friendly copy", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapAuthError({ code: "auth/invalid-credential", message: "raw" })).toMatch(
      /Invalid email or password/i
    );
    expect(mapAuthError({ code: "auth/weak-password", message: "raw" })).toMatch(/too weak/i);
    expect(authErrorCode({ code: "auth/user-not-found", message: "x" })).toBe(
      "auth/user-not-found"
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back without rethrowing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapAuthError(new Error("boom"))).toMatch(/try again/i);
    warn.mockRestore();
  });
});
