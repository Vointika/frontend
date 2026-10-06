import {
	AppAudiencePriceTable,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	EmptyValue,
	formatMoney,
} from "@vointika/ui";
import { ArrowRightLeft, Ban, Ticket, Undo2 } from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
import { formatSlotDateTime } from "#/slots";
import { bookingLineColumns, pricedLines } from "../columns";
import { useBooking } from "../hooks/use-booking";
import { useBookingActions } from "../hooks/use-booking-actions";
import type { BookingManifestItem } from "../types";
import { AppBookingStatusBadge } from "./AppBookingStatusBadge";
import { AppCancelBookingDialog } from "./AppCancelBookingDialog";
import { AppMoveBookingDialog } from "./AppMoveBookingDialog";
import { AppRefundBookingDialog } from "./AppRefundBookingDialog";

export const AppBookingDetail = ({
	tourOperatorId,
	bookingId,
}: {
	tourOperatorId: string;
	bookingId: string;
}) => {
	const query = useBooking(tourOperatorId, bookingId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/bookings"
			params={{ tourOperatorId }}
		>
			{m.back_to_bookings()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.booking()}
			icon={Ticket}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.operations() }, { label: m.bookings() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(booking) => (
				<BookingView tourOperatorId={tourOperatorId} booking={booking} />
			)}
		</AppResourceView>
	);
};

const BookingView = ({
	tourOperatorId,
	booking,
}: {
	tourOperatorId: string;
	booking: BookingManifestItem;
}) => {
	const currency = booking.currency;
	const locale = getLocale();
	const { canWrite } = usePermissions();
	const { cancel, move, refund } = useBookingActions(tourOperatorId, booking);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [moveOpen, setMoveOpen] = useState(false);
	const [refundOpen, setRefundOpen] = useState(false);
	const live = booking.status !== "CANCELLED";

	const actions = [
		...(live
			? [
					{
						id: "move",
						label: m.move_booking(),
						icon: ArrowRightLeft,
						onSelect: () => {
							move.reset();
							setMoveOpen(true);
						},
					},
				]
			: []),
		{
			id: "refund",
			label: m.refund(),
			icon: Undo2,
			onSelect: () => {
				refund.reset();
				setRefundOpen(true);
			},
		},
		...(live
			? [
					{
						id: "cancel",
						label: m.cancel_booking(),
						icon: Ban,
						variant: "destructive" as const,
						onSelect: () => {
							cancel.reset();
							setCancelOpen(true);
						},
					},
				]
			: []),
	];

	return (
		<>
			<AppPageHeader
				title={booking.reference}
				description={booking.experienceName}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.operations() },
							{
								label: m.bookings(),
								to: "/tour-operators/$tourOperatorId/bookings",
								params: { tourOperatorId },
							},
							{ label: booking.reference },
						]}
					/>
				}
			/>

			<AppCard
				title={m.departure()}
				action={<AppBookingStatusBadge status={booking.status} />}
			>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<AppDetailField label={m.experience()}>
						<AppResourceLink
							to="/tour-operators/$tourOperatorId/experiences/$experienceId"
							params={{ tourOperatorId, experienceId: booking.experienceId }}
						>
							{booking.experienceName}
						</AppResourceLink>
					</AppDetailField>
					<AppDetailField label={m.departure()}>
						<AppResourceLink
							to="/tour-operators/$tourOperatorId/availability/$slotId"
							params={{ tourOperatorId, slotId: booking.slotId }}
						>
							{formatSlotDateTime(booking.startAt)}
						</AppResourceLink>
					</AppDetailField>
					<AppDetailField label={m.pickup_location()}>
						{booking.pickup ? (
							<AppResourceLink
								to="/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId"
								params={{
									tourOperatorId,
									pickupLocationId: booking.pickup.pickupLocationId,
								}}
							>
								{booking.pickup.name}
							</AppResourceLink>
						) : (
							<EmptyValue />
						)}
					</AppDetailField>
					<AppDetailField label={m.party_size()}>
						{booking.partySize}
					</AppDetailField>
				</dl>
			</AppCard>

			<AppCard title={m.customer()}>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<AppDetailField label={m.name()}>
						{booking.customer.name}
					</AppDetailField>
					<AppDetailField label={m.email()}>
						<a href={`mailto:${booking.customer.email}`}>
							{booking.customer.email}
						</a>
					</AppDetailField>
					<AppDetailField label={m.phone()}>
						{booking.customer.phone ? (
							<a href={`tel:${booking.customer.phone}`}>
								{booking.customer.phone}
							</a>
						) : (
							<EmptyValue />
						)}
					</AppDetailField>
					<AppDetailField label={m.customer_notes()}>
						{booking.customer.detail ?? <EmptyValue />}
					</AppDetailField>
					<AppDetailField label={m.order()}>
						<AppResourceLink
							to="/tour-operators/$tourOperatorId/orders/$orderId"
							params={{ tourOperatorId, orderId: booking.orderId }}
						>
							{m.view_order()}
						</AppResourceLink>
					</AppDetailField>
				</dl>
			</AppCard>

			<AppCard title={m.total()} className="flex flex-col gap-4">
				<AppAudiencePriceTable
					rows={pricedLines(booking.lines)}
					currency={currency}
					columns={bookingLineColumns(currency, locale)}
				/>
				<dl className="grid grid-cols-2 gap-4">
					<AppDetailField label={m.total()}>
						{formatMoney(booking.totalPrice, currency, locale)}
					</AppDetailField>
				</dl>
			</AppCard>

			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="BOOKING"
				entityId={booking.id}
			/>

			<AppCancelBookingDialog
				open={cancelOpen}
				onOpenChange={setCancelOpen}
				pending={cancel.isPending}
				errorMessage={cancel.error ? apiErrorMessage(cancel.error) : null}
				onConfirm={(reason) =>
					cancel.mutate({ reason }, { onSuccess: () => setCancelOpen(false) })
				}
			/>
			<AppMoveBookingDialog
				tourOperatorId={tourOperatorId}
				open={moveOpen}
				onOpenChange={setMoveOpen}
				booking={booking}
				pending={move.isPending}
				errorMessage={move.error ? apiErrorMessage(move.error) : null}
				onConfirm={(slotId) =>
					move.mutate({ slotId }, { onSuccess: () => setMoveOpen(false) })
				}
			/>
			<AppRefundBookingDialog
				open={refundOpen}
				onOpenChange={setRefundOpen}
				booking={booking}
				pending={refund.isPending}
				errorMessage={refund.error ? apiErrorMessage(refund.error) : null}
				onConfirm={(body) =>
					refund.mutate(body, { onSuccess: () => setRefundOpen(false) })
				}
			/>
		</>
	);
};
