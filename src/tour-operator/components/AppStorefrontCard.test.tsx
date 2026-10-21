import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppStorefrontCard } from "./AppStorefrontCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = "https://scape-park.vointika.example";

const serve = (passwordEnabled: boolean) =>
	server.use(
		http.get(`${API}/tour-operators/${OP}`, () =>
			HttpResponse.json({
				id: OP,
				context: "tour-operators",
				handle: "scape-park",
				storefrontUrl: URL_,
				storefrontPassword: {
					enabled: passwordEnabled,
					password: null,
					message: null,
				},
			}),
		),
	);

describe("AppStorefrontCard", () => {
	it("opens the address the backend sends, in a new tab that can't reach back into the admin", async () => {
		serve(false);
		renderWithProviders(<AppStorefrontCard tourOperatorId={OP} />);

		const link = await screen.findByRole("link", { name: /open storefront/i });
		expect(link).toHaveAttribute("href", URL_);
		expect(link).toHaveAttribute("target", "_blank");
		expect(link.getAttribute("rel")).toContain("noopener");
		expect(screen.getByText(URL_)).toBeInTheDocument();
		expect(screen.getByText("Open to everyone")).toBeInTheDocument();
	});

	it("says when visitors need the store-access password to get in", async () => {
		serve(true);
		renderWithProviders(<AppStorefrontCard tourOperatorId={OP} />);

		expect(
			await screen.findByText("Restricted — visitors need the password"),
		).toBeInTheDocument();
	});
});
