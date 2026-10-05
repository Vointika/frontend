import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { bookingInUsd, operatorInEur } from "../fixtures";
import { AppBookingDetail } from "./AppBookingDetail";

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
const ID = "bk-1";

describe("AppBookingDetail", () => {
	it("prices the booking in the currency its order was paid in, not the operator's today", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/bookings/${ID}`, () =>
				HttpResponse.json(bookingInUsd),
			),
		);
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{
				user: operatorInEur,
			},
		);

		const row = await screen.findByRole("row", { name: /adult/i });
		expect(row).toHaveTextContent("$169.00");
		expect(row).toHaveTextContent("$338.00");
		expect(screen.queryByText(/€/)).toBeNull();
	});

	it("shows a cancelled booking as cancelled", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/bookings/${ID}`, () =>
				HttpResponse.json({ ...bookingInUsd, status: "CANCELLED" }),
			),
		);
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{
				user: operatorInEur,
			},
		);

		expect(await screen.findByText("Cancelled")).toBeInTheDocument();
	});
});

describe("AppBookingDetail actions", () => {
	const booking = (status: "CONFIRMED" | "CANCELLED") =>
		server.use(
			http.get(`${API}/tour-operators/${OP}/bookings/${ID}`, () =>
				HttpResponse.json({ ...bookingInUsd, status }),
			),
			http.get(`${API}/tour-operators/${OP}/activity`, () =>
				HttpResponse.json({ data: [], nextCursor: null }),
			),
		);

	it("offers Move, Refund and Cancel on a live booking", async () => {
		const user = userEvent.setup();
		booking("CONFIRMED");
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{ user: operatorInEur },
		);

		expect(
			await screen.findByRole("button", { name: /move booking/i }),
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /more actions/i }));
		const menu = await screen.findByRole("menu");
		expect(
			within(menu)
				.getAllByRole("menuitem")
				.map((item) => item.textContent),
		).toEqual(["Refund", "Cancel booking"]);
	});

	it("offers only Refund on a cancelled booking: there is nothing left to move or cancel", async () => {
		booking("CANCELLED");
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{ user: operatorInEur },
		);

		expect(
			await screen.findByRole("button", { name: /^refund$/i }),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /more actions/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /move booking/i })).toBeNull();
	});

	it("shows a refused refund's reason inside the dialog, where the reader is", async () => {
		const user = userEvent.setup();
		booking("CANCELLED");
		server.use(
			http.post(`${API}/tour-operators/${OP}/bookings/${ID}/refunds`, () =>
				HttpResponse.json(
					{
						status: 409,
						error: "Conflict",
						message:
							"The refund is more than what remains refundable on this booking: 51.50 USD",
					},
					{ status: 409 },
				),
			),
		);
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{ user: operatorInEur },
		);

		await user.click(await screen.findByRole("button", { name: /^refund$/i }));
		const dialog = await screen.findByRole("dialog");
		await user.type(
			within(dialog).getByRole("textbox", { name: /amount/i }),
			"500",
		);
		await user.click(within(dialog).getByRole("button", { name: /^refund$/i }));

		expect(await within(dialog).findByText(/51\.50 USD/)).toBeInTheDocument();
		expect(screen.getByRole("dialog")).toBe(dialog);
	});
});
