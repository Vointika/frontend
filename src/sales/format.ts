import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import type {
	BookingFeeBearer,
	BookingStatus,
	OrderStatus,
	PaymentState,
	RefundStatus,
} from "./types";

type StateVariant = NonNullable<AppBadgeProps["variant"]>;

const STATUS_LABELS: Record<BookingStatus, () => string> = {
	CONFIRMED: m.booking_status_confirmed,
	CANCELLED: m.booking_status_cancelled,
};

const STATUS_VARIANTS: Record<BookingStatus, StateVariant> = {
	CONFIRMED: "success",
	CANCELLED: "destructive",
};

export const bookingStatusVariant = (status: BookingStatus): StateVariant =>
	STATUS_VARIANTS[status];

export const bookingStatusLabel = (status: BookingStatus): string =>
	STATUS_LABELS[status]();

export const BOOKING_STATUS_OPTIONS = (
	Object.keys(STATUS_LABELS) as BookingStatus[]
).map((value) => ({ value, label: bookingStatusLabel(value) }));

const BEARER_LABELS: Record<BookingFeeBearer, () => string> = {
	CUSTOMER: m.fee_bearer_customer,
	OPERATOR: m.fee_bearer_operator,
};

export const feeBearerLabel = (bearer: BookingFeeBearer): string =>
	BEARER_LABELS[bearer]();

const ORDER_STATUS_LABELS: Record<OrderStatus, () => string> = {
	CONFIRMED: m.order_status_confirmed,
	PARTIALLY_CANCELLED: m.order_status_partially_cancelled,
	CANCELLED: m.order_status_cancelled,
};

const ORDER_STATUS_VARIANTS: Record<OrderStatus, StateVariant> = {
	CONFIRMED: "success",
	PARTIALLY_CANCELLED: "warning",
	CANCELLED: "destructive",
};

export const orderStatusLabel = (status: OrderStatus): string =>
	ORDER_STATUS_LABELS[status]();

export const orderStatusVariant = (status: OrderStatus): StateVariant =>
	ORDER_STATUS_VARIANTS[status];

const PAYMENT_STATE_LABELS: Record<PaymentState, () => string> = {
	PAID: m.payment_state_paid,
	PARTIALLY_REFUNDED: m.payment_state_partially_refunded,
	REFUNDED: m.payment_state_refunded,
};

const PAYMENT_STATE_VARIANTS: Record<PaymentState, StateVariant> = {
	PAID: "success",
	PARTIALLY_REFUNDED: "warning",
	REFUNDED: "info",
};

export const paymentStateLabel = (state: PaymentState): string =>
	PAYMENT_STATE_LABELS[state]();

export const paymentStateVariant = (state: PaymentState): StateVariant =>
	PAYMENT_STATE_VARIANTS[state];

const REFUND_STATUS_LABELS: Record<RefundStatus, () => string> = {
	PENDING: m.refund_status_pending,
	SUCCEEDED: m.refund_status_succeeded,
	FAILED: m.refund_status_failed,
};

const REFUND_STATUS_VARIANTS: Record<RefundStatus, StateVariant> = {
	PENDING: "warning",
	SUCCEEDED: "success",
	FAILED: "destructive",
};

export const refundStatusLabel = (status: RefundStatus): string =>
	REFUND_STATUS_LABELS[status]();

export const refundStatusVariant = (status: RefundStatus): StateVariant =>
	REFUND_STATUS_VARIANTS[status];
