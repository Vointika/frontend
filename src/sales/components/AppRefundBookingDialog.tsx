import {
	AppAlert,
	AppDialogFooter,
	AppLabelledControl,
	AppNumericInput,
	AppTextarea,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	formatMoney,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import type { BookingManifestItem } from "../types";
import { REASON_MAX, reasonOrNull } from "./AppCancelBookingDialog";

const TWO_DECIMALS = /^\d+(\.\d{1,2})?$/;

const refundAmountIssue = (raw: string): string | null => {
	const value = raw.trim();
	if (value === "" || Number(value) <= 0) return m.validation_amount_positive();
	if (!TWO_DECIMALS.test(value)) return m.validation_amount_decimals();
	return null;
};

export const AppRefundBookingDialog = ({
	open,
	onOpenChange,
	booking,
	pending,
	errorMessage,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: BookingManifestItem;
	pending: boolean;
	errorMessage: string | null;
	onConfirm: (refund: { amount: number; reason: string | null }) => void;
}) => {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [touched, setTouched] = useState(false);
	const amountIssue = refundAmountIssue(amount);
	const tooLong = reason.trim().length > REASON_MAX;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) {
					setAmount("");
					setReason("");
					setTouched(false);
				}
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.refund_booking_title()}</DialogTitle>
					<DialogDescription>
						{m.refund_booking_body({
							currency: booking.currency,
							total: formatMoney(
								booking.totalPrice,
								booking.currency,
								getLocale(),
							),
						})}
					</DialogDescription>
				</DialogHeader>
				{errorMessage && <AppAlert description={errorMessage} />}
				<div className="flex flex-col gap-3">
					<AppLabelledControl
						label={m.refund_amount()}
						hint={booking.currency}
						htmlFor="refund-amount"
						required
						invalid={touched && amountIssue !== null}
					>
						<AppNumericInput
							id="refund-amount"
							decimal
							value={amount}
							aria-invalid={(touched && amountIssue !== null) || undefined}
							onValueChange={setAmount}
							onBlur={() => setTouched(true)}
						/>
					</AppLabelledControl>
					{touched && amountIssue && (
						<p className="text-sm text-destructive">{amountIssue}</p>
					)}
					<AppLabelledControl
						label={m.reason()}
						htmlFor="refund-reason"
						description={m.reason_optional_hint()}
						invalid={tooLong}
					>
						<AppTextarea
							id="refund-reason"
							rows={2}
							value={reason}
							aria-invalid={tooLong || undefined}
							onValueChange={setReason}
						/>
					</AppLabelledControl>
					{tooLong && (
						<p className="text-sm text-destructive">
							{m.validation_max_length({ count: REASON_MAX })}
						</p>
					)}
				</div>
				<AppDialogFooter
					confirmLabel={m.refund()}
					disabled={amountIssue !== null || tooLong}
					pending={pending}
					onConfirm={() => {
						setTouched(true);
						if (amountIssue || tooLong) return;
						onConfirm({
							amount: Number(amount.trim()),
							reason: reasonOrNull(reason),
						});
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};
