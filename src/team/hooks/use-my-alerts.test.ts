import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { MemberAlerts } from "../types";
import { useMyAlertsForm } from "./use-my-alerts";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}/members/me/alerts`;

const subscribed: MemberAlerts = {
	alerts: [{ type: "NEW_BOOKING", subscribed: true }],
};

const render = (alerts: MemberAlerts) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMyAlertsForm(OP, alerts), { wrapper: Wrapper });
};

describe("useMyAlertsForm", () => {
	it("opens on the types the member is subscribed to", () => {
		const { result } = render(subscribed);
		expect(result.current.form.state.values.subscribed).toEqual([
			"NEW_BOOKING",
		]);

		const none = render({
			alerts: [{ type: "NEW_BOOKING", subscribed: false }],
		});
		expect(none.result.current.form.state.values.subscribed).toEqual([]);
	});

	it("PUTs the whole subscription list, an empty one included", async () => {
		const body = vi.fn();
		server.use(
			http.put(URL_, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(subscribed);

		act(() => result.current.form.setFieldValue("subscribed", []));
		await act(async () => {
			await result.current.form.handleSubmit();
		});

		expect(body).toHaveBeenCalledWith({ subscribed: [] });
	});

	it("names a refused save on the form, not in a toast", async () => {
		server.use(
			http.put(URL_, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Unknown alert type: X. Known: [NEW_BOOKING]",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render(subscribed);

		await act(async () => {
			await result.current.form.handleSubmit();
		});

		await waitFor(() =>
			expect(result.current.errorMessage).toBe(
				"Unknown alert type: X. Known: [NEW_BOOKING]",
			),
		);
		expect(screen.queryByText(/Unknown alert type/)).toBeNull();
	});
});
