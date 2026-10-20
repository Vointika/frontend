import { z } from "zod";
import * as m from "#/paraglide/messages";

export const AMOUNT = "{{amount}}";
export const AMOUNT_NO_DECIMALS = "{{amount_no_decimals}}";
const MAX = 40;

const occurrences = (text: string, token: string) =>
	text.split(token).length - 1;

const pattern = z
	.string()
	.trim()
	.max(MAX, m.validation_max_length({ count: MAX }))
	.refine((v) => !/[<>"]/.test(v), m.validation_money_characters())
	.refine(
		(v) =>
			v === "" ||
			occurrences(v, AMOUNT) + occurrences(v, AMOUNT_NO_DECIMALS) === 1,
		m.validation_money_placeholder({
			amount: AMOUNT,
			noDecimals: AMOUNT_NO_DECIMALS,
		}),
	);

export const moneyFormatSchema = z.object({
	format: pattern,
	withCurrencyFormat: pattern,
});

export type MoneyFormatFormData = z.infer<typeof moneyFormatSchema>;
