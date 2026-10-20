import { describe, expect, it } from "vitest";
import {
	formatAuditAction,
	formatAuditValue,
	formatEntityType,
} from "./format";

describe("audit format", () => {
	it("names the three booking writes the backend logs under BOOKING", () => {
		expect(formatAuditAction("booking.cancelled")).toBe("cancelled a booking");
		expect(formatAuditAction("booking.moved")).toBe("moved a booking");
		expect(formatAuditAction("booking.refunded")).toBe("refunded a booking");
		expect(formatEntityType("BOOKING")).toBe("Booking");
	});

	it("reads a logged departure as its date and time, not as an object", () => {
		expect(
			formatAuditValue({ slotId: "slot-1", startAt: "2026-10-10T09:00:00" }),
		).toBe("Oct 10, 2026, 9:00 AM");
		expect(formatAuditValue({ slotId: "slot-1" })).toBe("slot-1");
	});
});
