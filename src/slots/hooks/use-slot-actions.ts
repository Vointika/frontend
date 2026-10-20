import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

export const useSlotActions = (tourOperatorId: string, slotId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/slots/${slotId}`;

	// Both writes answer 204 with nothing; `slots` is a prefix of the slot's
	// own key, so invalidating it reads the slot again.
	const refetch = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.slots(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const cancel = useMutation<void, AxiosError>({
		mutationFn: async () => {
			await authApi.post(`${base}/cancel`);
		},
		onSuccess: () => {
			refetch();
			toast.success(m.slot_cancelled());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const setCapacities = useMutation<
		void,
		AxiosError,
		{ audienceId: string; capacity: number }[]
	>({
		mutationFn: async (capacities) => {
			await authApi.patch(base, { capacities });
		},
		onSuccess: () => {
			refetch();
			toast.updated(m.availability());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { cancel, setCapacities };
};
