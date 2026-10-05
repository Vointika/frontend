import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { bookingInUsd } from "../fixtures";
import { useBookingActions } from "./use-booking-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/bookings/${bookingInUsd.id}`;

describe("useBookingActions", () => {
	it("cancel posts the reason, writes the answer into the booking cache and refreshes what the cancel touched", async () => {
		let sent: unknown;
		const refreshed = { ...bookingInUsd, status: "CANCELLED" };
		server.use(
			http.post(`${BASE}/cancel`, async ({ request }) => {
				sent = await request.json();
				return HttpResponse.json(refreshed);
			}),
		);
		const { result, invalidated, queryClient } = renderActions(() =>
			useBookingActions(OP, bookingInUsd),
		);
		const written = vi.spyOn(queryClient, "setQueryData");

		await fire(() => result.current.cancel.mutateAsync({ reason: "No-show" }));

		expect(sent).toEqual({ reason: "No-show" });
		expect(written).toHaveBeenCalledWith(
			queryKeys.booking(OP, "bk-1"),
			refreshed,
		);
		expect(invalidated()).toEqual([
			["bookings", OP],
			["orders", OP, "ord-1"],
			["orders", OP],
			["activity", OP],
			["slots", OP],
			["slots", OP, "slot-1"],
		]);
	});

	it("move posts the new departure and refreshes both departures", async () => {
		let sent: unknown;
		const refreshed = { ...bookingInUsd, slotId: "slot-2" };
		server.use(
			http.post(`${BASE}/move`, async ({ request }) => {
				sent = await request.json();
				return HttpResponse.json(refreshed);
			}),
		);
		const { result, invalidated, queryClient } = renderActions(() =>
			useBookingActions(OP, bookingInUsd),
		);
		const written = vi.spyOn(queryClient, "setQueryData");

		await fire(() => result.current.move.mutateAsync({ slotId: "slot-2" }));

		expect(sent).toEqual({ slotId: "slot-2" });
		expect(written).toHaveBeenCalledWith(
			queryKeys.booking(OP, "bk-1"),
			refreshed,
		);
		expect(invalidated()).toContainEqual(["slots", OP, "slot-1"]);
		expect(invalidated()).toContainEqual(["slots", OP, "slot-2"]);
		expect(invalidated()).toContainEqual(["orders", OP, "ord-1"]);
	});

	it("refund posts the amount and reason to the refunds collection and leaves the booking as it is", async () => {
		let sent: unknown;
		server.use(
			http.post(`${BASE}/refunds`, async ({ request }) => {
				sent = await request.json();
				return HttpResponse.json(
					{ id: "rf-1", bookingId: "bk-1", amount: 12.5, status: "PENDING" },
					{ status: 201 },
				);
			}),
		);
		const { result, invalidated, queryClient } = renderActions(() =>
			useBookingActions(OP, bookingInUsd),
		);
		const written = vi.spyOn(queryClient, "setQueryData");

		await fire(() =>
			result.current.refund.mutateAsync({ amount: 12.5, reason: null }),
		);

		expect(sent).toEqual({ amount: 12.5, reason: null });
		expect(written).not.toHaveBeenCalled();
		expect(invalidated()).toEqual([
			["bookings", OP],
			["orders", OP, "ord-1"],
			["orders", OP],
			["activity", OP],
		]);
	});
});
