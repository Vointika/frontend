import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { operatorInEur, orderRowInUsd } from "../fixtures";
import { AppOrdersList } from "./AppOrdersList";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => ({ tourOperatorId: "op-1" }),
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

describe("AppOrdersList", () => {
	it("shows each order's status and payment state in its row", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/orders`, () =>
				HttpResponse.json({
					data: [
						orderRowInUsd,
						{
							...orderRowInUsd,
							id: "ord-2",
							reference: "#1002",
							status: "CANCELLED",
							paymentState: "REFUNDED",
						},
					],
					nextCursor: null,
				}),
			),
		);
		renderWithProviders(<AppOrdersList tourOperatorId={OP} />, {
			user: operatorInEur,
		});

		const first = await screen.findByRole(
			"row",
			{ name: /#1001/ },
			{ timeout: 5000 },
		);
		expect(first).toHaveTextContent("Confirmed");
		expect(first).toHaveTextContent("Partially refunded");
		const second = screen.getByRole("row", { name: /#1002/ });
		expect(second).toHaveTextContent("Cancelled");
		expect(second).toHaveTextContent("Refunded");
	});
});
