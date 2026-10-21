import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppForgotPasswordForm } from "./AppForgotPasswordForm";

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

describe("AppForgotPasswordForm", () => {
	it("names a malformed email itself, in the app's words, instead of the browser's tooltip", async () => {
		const user = userEvent.setup();
		const sent = vi.fn();
		server.use(
			http.post(`${API}/auth/request-password-reset`, () => {
				sent();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		renderWithProviders(<AppForgotPasswordForm />);

		await user.type(screen.getByLabelText(/email/i), "bad-email");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		expect(
			await screen.findByText("Please enter a valid email address"),
		).toBeInTheDocument();
		expect(sent).not.toHaveBeenCalled();
	});
});
