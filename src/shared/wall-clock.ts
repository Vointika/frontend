import { getLocale } from "#/paraglide/runtime";

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

export const isWallClock = (value: unknown): value is string =>
	typeof value === "string" && WALL_CLOCK.test(value);

// A departure's time is the operator's wall clock with no offset, so it is
// read as the reader's own clock, never shifted through UTC.
export const formatWallClock = (dateTime: string): string => {
	const match = WALL_CLOCK.exec(dateTime);
	if (!match) return dateTime;
	const [, y, mo, d, h, mn] = match.map(Number);
	const date = new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h ?? 0, mn ?? 0);
	return new Intl.DateTimeFormat(getLocale(), {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};
