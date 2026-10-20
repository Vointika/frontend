import { describe, expect, it } from "vitest";
import { moneyFormatSchema } from "./money-format";

const issue = (format: string) => {
	const result = moneyFormatSchema.safeParse({
		format,
		withCurrencyFormat: "",
	});
	return result.success ? null : result.error.issues[0]?.message;
};

describe("moneyFormatSchema", () => {
	it.each([
		"",
		"US$ {{amount}}",
		"€ {{amount_no_decimals}}",
		"{{amount}} USD",
	])("accepts %j", (format) => {
		expect(issue(format)).toBeNull();
	});

	it.each([
		["$", /exactly once/],
		["{{amount}} {{amount}}", /exactly once/],
		["{{amount}} {{amount_no_decimals}}", /exactly once/],
		["<b>{{amount}}</b>", /quotation marks/],
		[`"{{amount}}"`, /quotation marks/],
		[`${"x".repeat(31)}{{amount}}`, /at most 40/],
	])("refuses %j, naming the rule", (format, rule) => {
		expect(issue(format)).toMatch(rule);
	});
});
