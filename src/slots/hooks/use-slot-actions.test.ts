import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useSlotActions } from "./use-slot-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "slot-1";
const BASE = `${API}/tour-operators/${OP}/slots/${ID}`;

const CACHED = {
	id: ID,
	context: "slots",
	status: "AVAILABLE",
};

describe("useSlotActions", () => {
	it("cancel keeps the cached slot whole, the POST answering nothing, and reads it again", async () => {
		server.use(
			http.post(
				`${BASE}/cancel`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		const { result, invalidated, queryClient } = renderActions(() =>
			useSlotActions(OP, ID),
		);
		queryClient.setQueryDefaults(queryKeys.slot(OP, ID), {
			gcTime: Number.POSITIVE_INFINITY,
		});
		queryClient.setQueryData(queryKeys.slot(OP, ID), CACHED);

		await fire(() => result.current.cancel.mutateAsync());

		expect(queryClient.getQueryData(queryKeys.slot(OP, ID))).toEqual(CACHED);
		expect(invalidated()).toEqual([
			["slots", OP],
			["activity", OP],
		]);
	});

	it("refetches the slot once its capacities are set, the PATCH answering nothing", async () => {
		server.use(http.patch(BASE, () => new HttpResponse(null, { status: 204 })));
		const { result, invalidated } = renderActions(() => useSlotActions(OP, ID));

		await fire(() =>
			result.current.setCapacities.mutateAsync([
				{ audienceId: "aud-1", capacity: 12 },
			]),
		);

		expect(invalidated()).toEqual([
			["slots", OP],
			["activity", OP],
		]);
		expect(queryKeys.slot(OP, ID).slice(0, queryKeys.slots(OP).length)).toEqual(
			[...queryKeys.slots(OP)],
		);
	});

	it("offers no status setter", () => {
		const { result } = renderActions(() => useSlotActions(OP, ID));

		expect(Object.keys(result.current).sort()).toEqual([
			"cancel",
			"setCapacities",
		]);
	});

	it("shows the backend reason when a capacity is below what is booked", async () => {
		server.use(
			http.patch(BASE, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Capacity cannot be below the seats already booked",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = renderActions(() => useSlotActions(OP, ID));

		await fire(() =>
			result.current.setCapacities.mutateAsync([
				{ audienceId: "aud-1", capacity: 1 },
			]),
		);

		expect(
			await screen.findByText(
				"Capacity cannot be below the seats already booked",
			),
		).toBeInTheDocument();
	});
});
