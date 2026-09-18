import { describe, expect, it } from "vitest";
import { formatSlotTime } from "./format-slot-time";

describe("formatSlotTime", () => {
  it("formats an ISO timestamp as UTC hours:minutes", () => {
    expect(formatSlotTime("2026-09-18T09:00:00.000Z")).toBe("09:00 AM");
    expect(formatSlotTime("2026-09-18T13:00:00.000Z")).toBe("01:00 PM");
    expect(formatSlotTime("2026-09-18T00:00:00.000Z")).toBe("12:00 AM");
  });

  it("ignores the runtime's local timezone (always renders the UTC hour)", () => {
    // The whole reason this util exists: `Availability` (Server
    // Component, server's local TZ) and `BookingForm` (Client
    // Component, browser's local TZ) must render the same slot with
    // the same label. Simulating a non-UTC runtime TZ here would have
    // caught the original bug this util fixes.
    const originalTz = process.env.TZ;
    process.env.TZ = "America/Argentina/Buenos_Aires"; // UTC-3

    expect(formatSlotTime("2026-09-18T13:00:00.000Z")).toBe("01:00 PM");

    process.env.TZ = originalTz;
  });
});
