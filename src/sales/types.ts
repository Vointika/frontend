export type BookingFeeBearer = "CUSTOMER" | "OPERATOR";

interface OrderFees {
	linesTotal: number;
	bookingFee: number;
	bookingFeePercentage: number;
	bookingFeeBearer: BookingFeeBearer;
	operatorAmount: number;
}

export type OrderStatus = "CONFIRMED" | "PARTIALLY_CANCELLED" | "CANCELLED";
export type PaymentState = "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";
export type RefundStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export interface Refund {
	id: string;
	bookingId: string;
	amount: number;
	currency: string;
	status: RefundStatus;
	reason: string | null;
	requestedBy: string;
	createdAt: string;
}

export interface OrderListItem {
	id: string;
	number: number;
	reference: string;
	context: "orders";
	status: OrderStatus;
	paymentState: PaymentState;
	refundedTotal: number;
	customerName: string;
	customerEmail: string;
	totalPrice: number;
	fees: OrderFees;
	currency: string;
	placedAt: string;
}

interface OrderCustomer {
	name: string;
	email: string;
	phone: string | null;
	detail: string | null;
}

export interface BookingLine {
	id: string;
	audienceId: string;
	audienceName: string;
	quantity: number;
	unitPrice: number;
	pickupUnitPrice: number;
}

interface BookingPickup {
	pickupLocationId: string;
	name: string;
	time: string;
}

export type BookingStatus = "CONFIRMED" | "CANCELLED";

interface BookingCancellation {
	cancelledAt: string;
	cancelledBy: string;
	reason: string | null;
}

export interface Booking {
	id: string;
	position: number;
	reference: string;
	slotId: string;
	experienceId: string;
	experienceName: string;
	startAt: string;
	endAt: string;
	pickup: BookingPickup | null;
	partySize: number;
	totalPrice: number;
	status: BookingStatus;
	cancellation: BookingCancellation | null;
	lines: BookingLine[];
}

export interface Order {
	id: string;
	number: number;
	reference: string;
	context: "orders";
	status: OrderStatus;
	paymentState: PaymentState;
	refundedTotal: number;
	refunds: Refund[];
	checkoutSessionId: string;
	paymentId: string;
	customer: OrderCustomer;
	totalPrice: number;
	fees: OrderFees;
	currency: string;
	placedAt: string;
	bookings: Booking[];
}

export interface BookingManifestItem extends Booking {
	context: "bookings";
	orderId: string;
	currency: string;
	customer: OrderCustomer;
}
