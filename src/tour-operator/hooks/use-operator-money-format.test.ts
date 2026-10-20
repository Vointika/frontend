import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useOperatorMoneyFormatForm } from "./use-operator-money-format";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const render = (format: string | null, withCurrencyFormat: string | null) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() => useOperatorMoneyFormatForm(OP, { format, withCurrencyFormat }),
		{ wrapper: Wrapper },
	);
};

const submit = async (
	form: ReturnType<typeof render>["result"]["current"]["form"],
	values: Partial<{ format: string; withCurrencyFormat: string }>,
) => {
	act(() => {
		for (const [k, v] of Object.entries(values))
			form.setFieldValue(k as "format", v as string);
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("useOperatorMoneyFormatForm", () => {
	it("opens on the stored patterns, a missing one as blank", () => {
		const { result } = render("€{{amount}}", null);
		expect(result.current.form.state.values).toEqual({
			format: "€{{amount}}",
			withCurrencyFormat: "",
		});
	});

	it("sends the money section alone, a blank pattern as null so the default applies", async () => {
		const body = vi.fn();
		server.use(
			http.patch(URL_, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render("€{{amount}}", "€{{amount}} EUR");

		await submit(result.current.form, {
			format: "  {{amount}} €  ",
			withCurrencyFormat: "",
		});

		expect(body).toHaveBeenCalledWith({
			money: { format: "{{amount}} €", withCurrencyFormat: null },
		});
	});

	it("names a refused save on the form, not in a toast", async () => {
		server.use(
			http.patch(URL_, () =>
				HttpResponse.json(
					{
						status: 422,
						message:
							"money.format must contain exactly one {{amount}} or {{amount_no_decimals}}",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render(null, null);

		await submit(result.current.form, { format: "{{amount}}" });

		await waitFor(() =>
			expect(result.current.errorMessage).toMatch(/money\.format must contain/),
		);
	});
});
