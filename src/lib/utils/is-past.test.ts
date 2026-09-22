import { describe, expect, it } from "vitest";
import { isPast } from "./is-past";

describe("isPast", () => {
  it("returns true for an instant already behind us", () => {
    expect(isPast("2026-09-18T10:00:00.000Z")).toBe(true);
  });

  it("returns false for an instant still ahead of us", () => {
    expect(isPast(new Date(Date.now() + 60 * 60 * 1000).toISOString())).toBe(
      false
    );
  });
});
