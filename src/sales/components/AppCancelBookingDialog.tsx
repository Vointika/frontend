import {
	AppAlert,
	AppDialogFooter,
	AppLabelledControl,
	AppTextarea,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";

export const REASON_MAX = 500;

export const reasonOrNull = (raw: string): string | null => {
	const trimmed = raw.trim();
	return trimmed === "" ? null : trimmed;
};

export const AppCancelBookingDialog = ({
	open,
	onOpenChange,
	pending,
	errorMessage,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pending: boolean;
	errorMessage: string | null;
	onConfirm: (reason: string | null) => void;
}) => {
	const [reason, setReason] = useState("");
	const tooLong = reason.trim().length > REASON_MAX;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) setReason("");
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.cancel_booking_title()}</DialogTitle>
					<DialogDescription>{m.cancel_booking_body()}</DialogDescription>
				</DialogHeader>
				{errorMessage && <AppAlert description={errorMessage} />}
				<AppLabelledControl
					label={m.reason()}
					htmlFor="cancel-reason"
					description={m.reason_optional_hint()}
					invalid={tooLong}
				>
					<AppTextarea
						id="cancel-reason"
						rows={3}
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
				<AppDialogFooter
					destructive
					confirmLabel={m.cancel_booking()}
					disabled={tooLong}
					pending={pending}
					onConfirm={() => onConfirm(reasonOrNull(reason))}
				/>
			</DialogContent>
		</Dialog>
	);
};
