import { afterEach, describe, expect, it, vi } from "vitest";
import { getBusinessToday } from "./business-date";

describe("getBusinessToday", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the business's calendar day, not the UTC one", () => {
    // 2026-09-18 22:11 in Argentina (UTC-3) is already 2026-09-19
    // 01:11 UTC — this is exactly the bug `new Date().toISOString()`
    // had: it would report "tomorrow" for anyone in Argentina late at
    // night.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T01:11:00.000Z"));

    expect(getBusinessToday()).toBe("2026-09-18");
  });

  it("stays on the same UTC day when there's no timezone crossover", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-18T15:00:00.000Z"));

    expect(getBusinessToday()).toBe("2026-09-18");
  });
});
