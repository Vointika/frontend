import type { AppBadgeProps } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import type {
	AlertType,
	Invitation,
	InvitationStatus,
	KnownAlertType,
	MemberRole,
} from "./types";

export const roleLabel = (role: MemberRole): string =>
	role === "OWNER"
		? m.role_owner()
		: role === "ADMIN"
			? m.role_admin()
			: m.role_staff();

export const roleBadgeVariant = (role: MemberRole): "default" | "secondary" =>
	role === "OWNER" ? "default" : "secondary";

export const effectiveStatus = (invitation: Invitation): InvitationStatus =>
	invitation.status === "PENDING" && invitation.expired
		? "EXPIRED"
		: invitation.status;

export const statusLabel = (status: InvitationStatus): string =>
	status === "PENDING"
		? m.status_pending()
		: status === "ACCEPTED"
			? m.status_accepted()
			: status === "REVOKED"
				? m.status_revoked()
				: m.status_expired();

export const statusBadgeVariant = (
	status: InvitationStatus,
): AppBadgeProps["variant"] =>
	status === "PENDING"
		? "warning"
		: status === "ACCEPTED"
			? "success"
			: "outline";

const ALERT_LABELS: Record<KnownAlertType, () => string> = {
	NEW_BOOKING: m.alert_new_booking,
};

const isKnownAlertType = (type: AlertType): type is KnownAlertType =>
	type in ALERT_LABELS;

export const alertTypeLabel = (type: AlertType): string => {
	if (isKnownAlertType(type)) return ALERT_LABELS[type]();
	const words = type.toLowerCase().replace(/_/g, " ");
	return words.charAt(0).toUpperCase() + words.slice(1);
};
