import { describe, expect, it } from "vitest";
import { formatAuditAction, formatEntityType } from "./format";

describe("audit format", () => {
	it("names the three booking writes the backend logs under BOOKING", () => {
		expect(formatAuditAction("booking.cancelled")).toBe("cancelled a booking");
		expect(formatAuditAction("booking.moved")).toBe("moved a booking");
		expect(formatAuditAction("booking.refunded")).toBe("refunded a booking");
		expect(formatEntityType("BOOKING")).toBe("Booking");
	});
});
