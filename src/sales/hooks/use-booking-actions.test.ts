import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { bookingInUsd } from "../fixtures";
import { useBookingActions } from "./use-booking-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/bookings/${bookingInUsd.id}`;

const answeringNothing = (path: string, body: (sent: unknown) => void) =>
	http.post(`${BASE}/${path}`, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

const renderWithBookingCached = () => {
	const rendered = renderActions(() => useBookingActions(OP, bookingInUsd));
	rendered.queryClient.setQueryDefaults(
		queryKeys.booking(OP, bookingInUsd.id),
		{ gcTime: Number.POSITIVE_INFINITY },
	);
	rendered.queryClient.setQueryData(
		queryKeys.booking(OP, bookingInUsd.id),
		bookingInUsd,
	);
	return rendered;
};

describe("useBookingActions", () => {
	it("cancel posts the reason, keeps the cached booking whole, and reads it again", async () => {
		let sent: unknown;
		server.use(answeringNothing("cancel", (body) => (sent = body)));
		const { result, invalidated, queryClient } = renderWithBookingCached();

		await fire(() => result.current.cancel.mutateAsync({ reason: "No-show" }));

		expect(sent).toEqual({ reason: "No-show" });
		expect(
			queryClient.getQueryData(queryKeys.booking(OP, bookingInUsd.id)),
		).toEqual(bookingInUsd);
		expect(invalidated()).toEqual([
			["bookings", OP],
			["orders", OP],
			["activity", OP],
			["slots", OP],
		]);
		expect(queryKeys.booking(OP, bookingInUsd.id).slice(0, 2)).toEqual([
			...queryKeys.bookings(OP),
		]);
	});

	it("move posts the new departure, keeps the cached booking whole, and reads both departures again", async () => {
		let sent: unknown;
		server.use(answeringNothing("move", (body) => (sent = body)));
		const { result, invalidated, queryClient } = renderWithBookingCached();

		await fire(() => result.current.move.mutateAsync({ slotId: "slot-2" }));

		expect(sent).toEqual({ slotId: "slot-2" });
		expect(
			queryClient.getQueryData(queryKeys.booking(OP, bookingInUsd.id)),
		).toEqual(bookingInUsd);
		expect(invalidated()).toContainEqual(["bookings", OP]);
		expect(invalidated()).toContainEqual(["slots", OP]);
		expect(queryKeys.slot(OP, "slot-2").slice(0, 2)).toEqual([
			...queryKeys.slots(OP),
		]);
	});

	it("refund posts the amount and reason to the refunds collection and says it is requested", async () => {
		let sent: unknown;
		server.use(answeringNothing("refunds", (body) => (sent = body)));
		const { result, invalidated, queryClient } = renderWithBookingCached();

		await fire(() =>
			result.current.refund.mutateAsync({ amount: 12.5, reason: null }),
		);

		expect(sent).toEqual({ amount: 12.5, reason: null });
		expect(
			queryClient.getQueryData(queryKeys.booking(OP, bookingInUsd.id)),
		).toEqual(bookingInUsd);
		expect(await screen.findByText("Refund requested")).toBeInTheDocument();
		expect(invalidated()).toEqual([
			["bookings", OP],
			["orders", OP],
			["activity", OP],
		]);
	});
});
