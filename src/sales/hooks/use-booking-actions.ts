import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { BookingManifestItem, Refund } from "../types";

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
	const orderKeys = [
		queryKeys.bookings(tourOperatorId),
		queryKeys.order(tourOperatorId, booking.orderId),
		queryKeys.orders(tourOperatorId),
		queryKeys.activity(tourOperatorId),
	];
	const applyRefreshed = (refreshed: BookingManifestItem) => {
		queryClient.setQueryData(
			queryKeys.booking(tourOperatorId, booking.id),
			refreshed,
		);
	};

	const cancel = useMutation<
		BookingManifestItem,
		AxiosError,
		{ reason: string | null }
	>({
		mutationFn: async (body) =>
			(await authApi.post<BookingManifestItem>(`${base}/cancel`, body)).data,
		onSuccess: (refreshed) => {
			applyRefreshed(refreshed);
			invalidate([
				...orderKeys,
				queryKeys.slots(tourOperatorId),
				queryKeys.slot(tourOperatorId, booking.slotId),
			]);
			toast.success(m.booking_cancelled());
		},
	});

	const move = useMutation<BookingManifestItem, AxiosError, { slotId: string }>(
		{
			mutationFn: async (body) =>
				(await authApi.post<BookingManifestItem>(`${base}/move`, body)).data,
			onSuccess: (refreshed, { slotId }) => {
				applyRefreshed(refreshed);
				invalidate([
					...orderKeys,
					queryKeys.slots(tourOperatorId),
					queryKeys.slot(tourOperatorId, booking.slotId),
					queryKeys.slot(tourOperatorId, slotId),
				]);
				toast.success(m.booking_moved());
			},
		},
	);

	const refund = useMutation<
		Refund,
		AxiosError,
		{ amount: number; reason: string | null }
	>({
		mutationFn: async (body) =>
			(await authApi.post<Refund>(`${base}/refunds`, body)).data,
		onSuccess: (sent) => {
			invalidate(orderKeys);
			toast.success(
				sent.status === "SUCCEEDED" ? m.refund_sent() : m.refund_requested(),
			);
		},
	});

	return { cancel, move, refund };
};
