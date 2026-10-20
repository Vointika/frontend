import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppMoneyFormatCard } from "./AppMoneyFormatCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const serve = (money: {
	format: string | null;
	withCurrencyFormat: string | null;
}) =>
	server.use(
		http.get(`${API}/tour-operators/${OP}`, () =>
			HttpResponse.json({ id: OP, context: "tour-operators", money }),
		),
	);

describe("AppMoneyFormatCard", () => {
	it("shows a viewer the stored pattern, and a blank one as empty", async () => {
		serve({ format: "€{{amount}}", withCurrencyFormat: null });
		renderWithProviders(
			<AppMoneyFormatCard tourOperatorId={OP} canWrite={false} />,
		);

		const price = await screen.findByText("€{{amount}}");
		expect(price.closest("div")).toHaveTextContent("Price");
		expect(screen.queryByRole("textbox")).toBeNull();
		expect(
			screen.getByText("Price with currency").nextElementSibling,
		).toHaveTextContent("—");
	});

	it("gives an editor both patterns to edit, opened on what is stored", async () => {
		serve({ format: "€{{amount}}", withCurrencyFormat: "€{{amount}} EUR" });
		renderWithProviders(<AppMoneyFormatCard tourOperatorId={OP} canWrite />);

		expect(await screen.findByRole("textbox", { name: "Price" })).toHaveValue(
			"€{{amount}}",
		);
		expect(
			screen.getByRole("textbox", { name: "Price with currency" }),
		).toHaveValue("€{{amount}} EUR");
	});
});
