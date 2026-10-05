import { z } from "zod";
import { ALERT_TYPES } from "../types";

export const memberAlertsSchema = z.object({
	subscribed: z.array(z.enum(ALERT_TYPES)),
});

export type MemberAlertsFormData = z.infer<typeof memberAlertsSchema>;
