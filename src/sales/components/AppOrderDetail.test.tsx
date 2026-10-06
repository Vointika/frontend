import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { operatorInEur, orderInUsd } from "../fixtures";
import { AppOrderDetail } from "./AppOrderDetail";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => ({ tourOperatorId: "op-1" }),
		useNavigate: () => vi.fn(),
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const serve = (order: typeof orderInUsd) =>
	server.use(
		http.get(`${API}/tour-operators/${OP}/orders/${order.id}`, () =>
			HttpResponse.json(order),
		),
	);

describe("AppOrderDetail", () => {
	it("lists every refund with its status and amount in the order's currency, each against its own booking", async () => {
		serve(orderInUsd);
		renderWithProviders(
			<AppOrderDetail tourOperatorId={OP} orderId={orderInUsd.id} />,
			{ user: operatorInEur },
		);

		const succeeded = await screen.findByRole("row", { name: /Rained out/ });
		expect(succeeded).toHaveTextContent("$40.00");
		expect(succeeded).toHaveTextContent("Succeeded");
		expect(within(succeeded).getByRole("link")).toHaveTextContent("#1001-1");

		const failed = screen.getByRole("row", { name: /Failed/ });
		expect(failed).toHaveTextContent("$10.00");
		expect(screen.queryByText(/€/)).toBeNull();

		const pending = screen.getByRole("row", { name: /Pending/ });
		expect(pending).toHaveTextContent("$15.00");
		expect(within(pending).getByRole("link")).toHaveTextContent("#1001-2");
	});

	it("reads the refunded total from the order, not from the rows: a failed refund counts for nothing", async () => {
		serve(orderInUsd);
		renderWithProviders(
			<AppOrderDetail tourOperatorId={OP} orderId={orderInUsd.id} />,
			{ user: operatorInEur },
		);

		const refunded = await screen.findByText(/^Refunded$/, {
			selector: "dt",
		});
		expect(refunded.nextElementSibling).toHaveTextContent("$40.00");
	});

	it("shows the payment state and the order status as two badges in the header", async () => {
		serve({ ...orderInUsd, status: "PARTIALLY_CANCELLED" });
		renderWithProviders(
			<AppOrderDetail tourOperatorId={OP} orderId={orderInUsd.id} />,
			{ user: operatorInEur },
		);

		const heading = await screen.findByRole("heading", { name: "#1001" });
		const headerRow = heading.parentElement?.parentElement as HTMLElement;
		expect(headerRow).toHaveTextContent("Partially cancelled");
		expect(headerRow).toHaveTextContent("Partially refunded");
		expect(screen.getAllByText(/Partially/)).toHaveLength(2);
	});

	it("says so when nothing has been refunded", async () => {
		serve({
			...orderInUsd,
			paymentState: "PAID",
			refundedTotal: 0,
			refunds: [],
		});
		renderWithProviders(
			<AppOrderDetail tourOperatorId={OP} orderId={orderInUsd.id} />,
			{ user: operatorInEur },
		);

		expect(await screen.findByText("No refunds yet")).toBeInTheDocument();
		expect(screen.queryByRole("row", { name: /Succeeded/ })).toBeNull();
	});
});
