import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { formatWallClock } from "#/shared/wall-clock";
import {
	SLOT_STATUSES,
	type SlotAudiencePrice,
	type SlotStatus,
} from "./types";

const SUNDAY_ANCHOR = new Date(Date.UTC(2024, 0, 7));

export const formatDayName = (day: number): string => {
	const date = new Date(SUNDAY_ANCHOR);
	date.setUTCDate(SUNDAY_ANCHOR.getUTCDate() + day);
	return new Intl.DateTimeFormat(getLocale(), {
		weekday: "long",
		timeZone: "UTC",
	}).format(date);
};

export const formatSlotDateTime = formatWallClock;

export const formatSlotDuration = (minutes: number): string => {
	const h = Math.floor(minutes / 60);
	const mn = minutes % 60;
	if (h === 0) return `${mn} min`;
	if (mn === 0) return `${h} h`;
	return `${h} h ${mn} min`;
};

export const formatBookedCapacity = (rows: SlotAudiencePrice[]): string => {
	const capacity = rows.reduce((sum, r) => sum + r.capacity, 0);
	const booked = rows.reduce((sum, r) => sum + r.bookedCount, 0);
	return `${booked} / ${capacity}`;
};

export const formatSlotStatus = (status: SlotStatus): string => {
	switch (status) {
		case "AVAILABLE":
			return m.status_available();
		case "SOLD_OUT":
			return m.status_sold_out();
		case "CANCELLED":
			return m.status_cancelled();
	}
};

export const slotStatusBadgeVariant = (
	status: SlotStatus,
): AppBadgeProps["variant"] => {
	switch (status) {
		case "AVAILABLE":
			return "success";
		case "SOLD_OUT":
			return "warning";
		case "CANCELLED":
			return "destructive";
	}
};

export const DAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
	value: String(d),
	label: formatDayName(d),
}));

export const STATUS_OPTIONS = SLOT_STATUSES.map((s) => ({
	value: s,
	label: formatSlotStatus(s),
}));
