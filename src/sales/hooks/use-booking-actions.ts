import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { BookingManifestItem } from "../types";

// The three transitions answer 204 with nothing, so the booking is read
// again: `bookings` is a prefix of the booking's own key, `orders` of its
// order's.
export const useBookingActions = (
	tourOperatorId: string,
	booking: BookingManifestItem,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/bookings/${booking.id}`;

	const invalidate = (keys: readonly (readonly unknown[])[]) => {
		for (const queryKey of keys) queryClient.invalidateQueries({ queryKey });
	};
	const salesKeys = [
		queryKeys.bookings(tourOperatorId),
		queryKeys.orders(tourOperatorId),
		queryKeys.activity(tourOperatorId),
	];

	const cancel = useMutation<void, AxiosError, { reason: string | null }>({
		mutationFn: async (body) => {
			await authApi.post(`${base}/cancel`, body);
		},
		onSuccess: () => {
			invalidate([...salesKeys, queryKeys.slots(tourOperatorId)]);
			toast.success(m.booking_cancelled());
		},
	});

	const move = useMutation<void, AxiosError, { slotId: string }>({
		mutationFn: async (body) => {
			await authApi.post(`${base}/move`, body);
		},
		onSuccess: () => {
			invalidate([...salesKeys, queryKeys.slots(tourOperatorId)]);
			toast.success(m.booking_moved());
		},
	});

	const refund = useMutation<
		void,
		AxiosError,
		{ amount: number; reason: string | null }
	>({
		mutationFn: async (body) => {
			await authApi.post(`${base}/refunds`, body);
		},
		onSuccess: () => {
			invalidate(salesKeys);
			toast.success(m.refund_requested());
		},
	});

	return { cancel, move, refund };
};
