export type MemberRole = "OWNER" | "ADMIN" | "STAFF";

export interface Member {
	id: string;
	context: "users";
	role: MemberRole;
	joinedAt: string;
	name: string | null;
	email: string | null;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface Invitation {
	id: string;
	context: "invitations";
	email: string;
	name: string;
	role: MemberRole;
	status: InvitationStatus;
	expired: boolean;
	createdAt: string;
	expiresAt: string;
	acceptedAt: string | null;
	invitedBy: {
		id: string;
		context: "users";
		name: string;
	};
}

const KNOWN_ALERT_TYPES = ["NEW_BOOKING"] as const;
export type KnownAlertType = (typeof KNOWN_ALERT_TYPES)[number];
// The backend's list is the extension point: a type this build has no label
// for is still shown and still saved, under its own name.
export type AlertType = KnownAlertType | (string & {});

export interface MemberAlerts {
	alerts: { type: AlertType; subscribed: boolean }[];
}
