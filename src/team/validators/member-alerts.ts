import { z } from "zod";

export const memberAlertsSchema = z.object({
	subscribed: z.array(z.string().min(1)),
});

export type MemberAlertsFormData = z.infer<typeof memberAlertsSchema>;
