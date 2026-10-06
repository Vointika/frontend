import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/links";
import { AppMemberAlertsCard } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/notifications/",
)({
	component: NotificationsSettingsPage,
});

function NotificationsSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.notifications()}
				description={m.notifications_description()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.notifications() },
						]}
					/>
				}
			/>
			<AppMemberAlertsCard tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
