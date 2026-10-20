import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { MoneyFormatSettings } from "../types";
import {
	type MoneyFormatFormData,
	moneyFormatSchema,
} from "../validators/money-format";
import { operatorDetailQuery } from "./use-operator-details";

export const useOperatorMoneyFormat = (tourOperatorId: string) =>
	useQuery({
		...operatorDetailQuery(tourOperatorId),
		select: (operator) => operator.money,
	});

const useMoneyFormatSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<unknown, AxiosError, MoneyFormatSettings>({
		mutationFn: (money) =>
			authApi.patch(`/tour-operators/${tourOperatorId}`, { money }),
		onSuccess: () => {
			toast.updated(m.money_format());
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
	});
};

export const useOperatorMoneyFormatForm = (
	tourOperatorId: string,
	money: MoneyFormatSettings,
) => {
	const save = useMoneyFormatSave(tourOperatorId);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			format: money.format ?? "",
			withCurrencyFormat: money.withCurrencyFormat ?? "",
		} as MoneyFormatFormData,
		validators: { onSubmit: moneyFormatSchema },
		onSubmit: ({ value }) => {
			const v = moneyFormatSchema.parse(value);
			save.mutate(
				{
					format: v.format || null,
					withCurrencyFormat: v.withCurrencyFormat || null,
				},
				{
					onSuccess: () => setErrorMessage(null),
					onError: (error) => setErrorMessage(apiErrorMessage(error)),
				},
			);
		},
	});

	return { form, isPending: save.isPending, errorMessage };
};
