import { describe, expect, it } from "vitest";
import { consumeRate } from "./rateLimit";

describe("consumeRate", () => {
  it("allows a fresh window and denies once the cap is reached", () => {
    const first = consumeRate(null, 1_000, 2, 60_000);
    expect(first.allowed).toBe(true);
    const second = consumeRate(first.next, 1_100, 2, 60_000);
    expect(second.allowed).toBe(true);
    const third = consumeRate(second.next, 1_200, 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.next.count).toBe(2);
  });
});
