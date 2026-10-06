import { AppBadge } from "@vointika/ui";
import { orderStatusLabel, orderStatusVariant } from "../format";
import type { OrderStatus } from "../types";

export const AppOrderStatusBadge = ({ status }: { status: OrderStatus }) => (
	<AppBadge variant={orderStatusVariant(status)}>
		{orderStatusLabel(status)}
	</AppBadge>
);
