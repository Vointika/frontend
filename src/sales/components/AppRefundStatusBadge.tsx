import { AppBadge } from "@vointika/ui";
import { refundStatusLabel, refundStatusVariant } from "../format";
import type { RefundStatus } from "../types";

export const AppRefundStatusBadge = ({ status }: { status: RefundStatus }) => (
	<AppBadge variant={refundStatusVariant(status)}>
		{refundStatusLabel(status)}
	</AppBadge>
);
