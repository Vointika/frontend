import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { AlertType, MemberAlerts } from "../types";
import {
	type MemberAlertsFormData,
	memberAlertsSchema,
} from "../validators/member-alerts";

const endpoint = (tourOperatorId: string) =>
	`/tour-operators/${tourOperatorId}/members/me/alerts`;

export const useMyAlerts = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.myAlerts(tourOperatorId),
		queryFn: async () =>
			(await authApi.get<MemberAlerts>(endpoint(tourOperatorId))).data,
	});

const useMyAlertsSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<unknown, AxiosError, { subscribed: AlertType[] }>({
		mutationFn: (body) => authApi.put(endpoint(tourOperatorId), body),
		onSuccess: () => {
			toast.updated(m.alerts());
			queryClient.invalidateQueries({
				queryKey: queryKeys.myAlerts(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
	});
};

export const useMyAlertsForm = (
	tourOperatorId: string,
	alerts: MemberAlerts,
) => {
	const save = useMyAlertsSave(tourOperatorId);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			subscribed: alerts.alerts
				.filter((alert) => alert.subscribed)
				.map((alert) => alert.type),
		} as MemberAlertsFormData,
		validators: { onSubmit: memberAlertsSchema },
		onSubmit: ({ value }) => {
			save.mutate(memberAlertsSchema.parse(value), {
				onSuccess: () => setErrorMessage(null),
				onError: (error) => setErrorMessage(apiErrorMessage(error)),
			});
		},
	});

	return { form, isPending: save.isPending, errorMessage };
};
