import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppMemberAlertsCard } from "./AppMemberAlertsCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

describe("AppMemberAlertsCard", () => {
	it.each([
		true,
		false,
	])("shows the new-booking alert as subscribed=%s, the way the backend has it", async (subscribed) => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/members/me/alerts`, () =>
				HttpResponse.json({ alerts: [{ type: "NEW_BOOKING", subscribed }] }),
			),
		);
		renderWithProviders(<AppMemberAlertsCard tourOperatorId={OP} />);

		const box = await screen.findByRole("checkbox", { name: "New booking" });
		expect(box).toHaveAttribute("aria-checked", String(subscribed));
	});
});
