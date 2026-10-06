import {
	AppAlert,
	AppDialogFooter,
	AppEmptyState,
	AppLabelledControl,
	AppLoadingBlock,
	AppQueryState,
	AppSelect,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	SelectItem,
	useAllPages,
} from "@vointika/ui";
import { useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { formatSlotDateTime, type Slot } from "#/slots";
import type { BookingManifestItem } from "../types";

// A departure's startAt is the operator's wall clock with no offset, and the
// app reads it as the reader's own clock everywhere (formatSlotDateTime), so
// "has started" compares it against the reader's wall clock in the same shape.
const pad = (n: number) => String(n).padStart(2, "0");
export const wallClockNow = (now = new Date()): string =>
	`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

export const movableDepartures = (
	slots: readonly Slot[],
	booking: BookingManifestItem,
	now: string,
): Slot[] =>
	slots.filter((slot) => slot.id !== booking.slotId && slot.startAt > now);

export const AppMoveBookingDialog = ({
	tourOperatorId,
	open,
	onOpenChange,
	booking,
	pending,
	errorMessage,
	onConfirm,
}: {
	tourOperatorId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: BookingManifestItem;
	pending: boolean;
	errorMessage: string | null;
	onConfirm: (slotId: string) => void;
}) => {
	const [slotId, setSlotId] = useState("");
	const slots = useAllPages<Slot>(
		queryKeys.slots(tourOperatorId),
		`/tour-operators/${tourOperatorId}/slots?filter[experienceId][in]=${booking.experienceId}&filter[status][not_in]=CANCELLED,SOLD_OUT&sort=startAt`,
		{ enabled: open },
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) setSlotId("");
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.move_booking_title()}</DialogTitle>
					<DialogDescription>{m.move_booking_body()}</DialogDescription>
				</DialogHeader>
				{errorMessage && <AppAlert description={errorMessage} />}
				<AppQueryState
					query={slots}
					loading={<AppLoadingBlock className="py-8" />}
				>
					{(rows) => {
						const options = movableDepartures(rows, booking, wallClockNow());
						return options.length === 0 ? (
							<AppEmptyState variant="inline" title={m.no_other_departures()} />
						) : (
							<AppLabelledControl
								label={m.new_departure()}
								htmlFor="move-slot"
								required
							>
								<AppSelect
									id="move-slot"
									value={slotId}
									onValueChange={setSlotId}
									placeholder={m.new_departure()}
								>
									{options.map((slot) => (
										<SelectItem key={slot.id} value={slot.id}>
											{formatSlotDateTime(slot.startAt)}
										</SelectItem>
									))}
								</AppSelect>
							</AppLabelledControl>
						);
					}}
				</AppQueryState>
				<AppDialogFooter
					confirmLabel={m.move_booking()}
					disabled={slotId === ""}
					pending={pending}
					onConfirm={() => onConfirm(slotId)}
				/>
			</DialogContent>
		</Dialog>
	);
};
