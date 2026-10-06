import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { bookingInUsd } from "../fixtures";
import { AppRefundBookingDialog } from "./AppRefundBookingDialog";

const render = (onConfirm: (body: unknown) => void) =>
	renderWithProviders(
		<AppRefundBookingDialog
			open
			onOpenChange={() => {}}
			booking={bookingInUsd}
			pending={false}
			errorMessage={null}
			onConfirm={onConfirm}
		/>,
	);

const amount = () => screen.getByRole("textbox", { name: /amount/i });
const confirm = () => screen.getByRole("button", { name: /^refund$/i });

describe("AppRefundBookingDialog", () => {
	it.each([
		["0", /greater than 0/i],
		["12.345", /two decimals/i],
	])("refuses %s before it reaches the backend, naming the rule", async (typed, rule) => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(onConfirm);

		await user.type(amount(), typed);
		await user.tab();

		expect(screen.getByText(rule)).toBeInTheDocument();
		expect(confirm()).toBeDisabled();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("sends the amount as a number and a blank reason as none", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(onConfirm);

		await user.type(amount(), "12.5");
		await user.click(confirm());

		expect(onConfirm).toHaveBeenCalledWith({ amount: 12.5, reason: null });
	});

	it("names the booking's total in its own currency without presenting it as the ceiling", () => {
		render(() => {});

		const body = screen.getByText(/\$338\.00/);
		expect(body).toHaveTextContent(/what remains refundable can be less/);
	});
});
