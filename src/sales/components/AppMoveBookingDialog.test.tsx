import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { Slot } from "#/slots";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { bookingInUsd } from "../fixtures";
import {
	AppMoveBookingDialog,
	movableDepartures,
	wallClockNow,
} from "./AppMoveBookingDialog";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const slot = (id: string, startAt: string): Slot => ({
	id,
	context: "slots",
	experienceId: "exp-1",
	experienceName: "Buggies",
	experienceDescription: "",
	startAt,
	endAt: startAt,
	day: 1,
	durationMinutes: 60,
	status: "AVAILABLE",
	audiencePrices: [],
});

describe("movableDepartures", () => {
	it("drops the booking's own departure and any that has started, keeping the order", () => {
		const rows = [
			slot("past", "2026-10-01T09:00:00"),
			slot("slot-1", "2026-10-09T09:00:00"),
			slot("soon", "2026-10-06T10:00:00"),
			slot("later", "2026-10-11T09:00:00"),
		];

		expect(
			movableDepartures(rows, bookingInUsd, "2026-10-06T09:30").map(
				(s) => s.id,
			),
		).toEqual(["soon", "later"]);
	});

	it("reads now as the reader's wall clock in the shape a departure carries", () => {
		expect(wallClockNow(new Date(2026, 9, 6, 9, 5))).toBe("2026-10-06T09:05");
	});
});

describe("AppMoveBookingDialog", () => {
	it("asks the backend for this experience's live departures and lists the ones still to come", async () => {
		const user = userEvent.setup();
		let url = "";
		server.use(
			http.get(`${API}/tour-operators/${OP}/slots`, ({ request }) => {
				url = request.url;
				return HttpResponse.json({
					data: [
						slot("slot-1", "2026-10-09T09:00:00"),
						slot("slot-2", "2999-01-02T14:30:00"),
					],
					nextCursor: null,
				});
			}),
		);
		const onConfirm = vi.fn();
		renderWithProviders(
			<AppMoveBookingDialog
				tourOperatorId={OP}
				open
				onOpenChange={() => {}}
				booking={bookingInUsd}
				pending={false}
				errorMessage={null}
				onConfirm={onConfirm}
			/>,
		);

		const picker = await screen.findByRole("combobox", {
			name: /new departure/i,
		});
		const sent = new URL(url);
		expect(sent.searchParams.get("filter[experienceId][in]")).toBe("exp-1");
		expect(sent.searchParams.get("filter[status][not_in]")).toBe("CANCELLED");
		expect(sent.searchParams.get("sort")).toBe("startAt");

		expect(
			screen.getByRole("button", { name: /move booking/i }),
		).toBeDisabled();
		await user.click(picker);
		const listbox = await screen.findByRole("listbox");
		expect(within(listbox).getAllByRole("option")).toHaveLength(1);
		await user.click(within(listbox).getByRole("option", { name: /2999/ }));
		await user.click(screen.getByRole("button", { name: /move booking/i }));

		expect(onConfirm).toHaveBeenCalledWith("slot-2");
	});

	it("says so when the experience has no other departure to move to", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/slots`, () =>
				HttpResponse.json({
					data: [slot("slot-1", "2026-10-09T09:00:00")],
					nextCursor: null,
				}),
			),
		);
		renderWithProviders(
			<AppMoveBookingDialog
				tourOperatorId={OP}
				open
				onOpenChange={() => {}}
				booking={bookingInUsd}
				pending={false}
				errorMessage={null}
				onConfirm={() => {}}
			/>,
		);

		expect(
			await screen.findByText(/no other upcoming departure/i),
		).toBeInTheDocument();
	});
});
