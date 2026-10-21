import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { AuthUser } from "#/auth";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppOperatorDetailsCard } from "./AppOperatorDetailsCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const dominicanRepublic = {
	id: "c-do",
	context: "countries",
	code: "DO",
	name: "Dominican Republic",
	flagUrl: null,
};

const owner: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [
		{
			id: OP,
			name: "Scape Park",
			logoUrl: null,
			timezone: "America/Santo_Domingo",
			currency: "USD",
			isDefault: true,
			role: "OWNER",
		},
	],
};

const serve = () =>
	server.use(
		http.get(`${API}/tour-operators/${OP}`, () =>
			HttpResponse.json({
				id: OP,
				context: "tour-operators",
				name: "Scape Park",
				handle: "scape-park",
				address: {
					address1: "Carretera Juanillo",
					address2: null,
					city: "Punta Cana",
					province: null,
					zip: null,
					countryCode: "DO",
					countryName: "Dominican Republic",
				},
				phone: null,
				email: null,
				timezoneId: "tz-sd",
				currencyId: "cur-usd",
			}),
		),
		http.get(`${API}/timezones`, () =>
			HttpResponse.json([
				{
					id: "tz-sd",
					context: "timezones",
					name: "America/Santo_Domingo",
					cityName: "Santo Domingo",
					country: dominicanRepublic,
				},
			]),
		),
		http.get(`${API}/currencies`, () =>
			HttpResponse.json([
				{
					id: "cur-usd",
					context: "currencies",
					code: "USD",
					name: "US Dollar",
					symbol: "$",
				},
			]),
		),
	);

describe("AppOperatorDetailsCard", () => {
	it("names a timezone by its city and country, as the first-run form does, not by its zone id", async () => {
		const user = userEvent.setup();
		serve();
		renderWithProviders(
			<AppOperatorDetailsCard tourOperatorId={OP} canWrite />,
			{ user: owner },
		);

		const picker = await screen.findByRole(
			"combobox",
			{ name: /timezone/i },
			{ timeout: 5000 },
		);

		await user.click(picker);
		expect(
			await screen.findByRole("option", {
				name: "Santo Domingo, Dominican Republic",
			}),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "America/Santo_Domingo" }),
		).toBeNull();
	});
});
