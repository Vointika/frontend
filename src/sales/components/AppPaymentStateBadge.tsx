import { AppBadge } from "@vointika/ui";
import { paymentStateLabel, paymentStateVariant } from "../format";
import type { PaymentState } from "../types";

export const AppPaymentStateBadge = ({ state }: { state: PaymentState }) => (
	<AppBadge variant={paymentStateVariant(state)}>
		{paymentStateLabel(state)}
	</AppBadge>
);
