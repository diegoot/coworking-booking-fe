import { describe, expect, it } from "vitest";
import { formatSlotTime } from "./format-slot-time";

describe("formatSlotTime", () => {
  it("formats an ISO timestamp as Argentina (business timezone) hours:minutes", () => {
    // Argentina is UTC-3, no DST: 09:00Z -> 06:00 ART, 13:00Z -> 10:00
    // ART, 00:00Z -> 21:00 ART the previous calendar day.
    expect(formatSlotTime("2026-09-18T09:00:00.000Z")).toBe("06:00 AM");
    expect(formatSlotTime("2026-09-18T13:00:00.000Z")).toBe("10:00 AM");
    expect(formatSlotTime("2026-09-18T00:00:00.000Z")).toBe("09:00 PM");
  });

  it("ignores the runtime's local timezone (always renders the Argentina hour)", () => {
    // The whole reason this util exists: `Availability` (Server
    // Component, server's local TZ) and `BookingForm` (Client
    // Component, browser's local TZ) must render the same slot with
    // the same label. Simulating a non-Argentina runtime TZ here would
    // have caught the original bug this util fixes.
    const originalTz = process.env.TZ;
    process.env.TZ = "UTC";

    expect(formatSlotTime("2026-09-18T13:00:00.000Z")).toBe("10:00 AM");

    process.env.TZ = originalTz;
  });
});
