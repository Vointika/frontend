import {
	AppCheckboxGroupField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { alertTypeLabel } from "../format";
import { useMyAlerts, useMyAlertsForm } from "../hooks/use-my-alerts";
import type { MemberAlerts } from "../types";

export const AppMemberAlertsCard = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const query = useMyAlerts(tourOperatorId);

	return (
		<AppSettingsCard title={m.alerts()} description={m.alerts_description()}>
			<AppQueryState
				query={query}
				loading={<AppFormSkeleton rows={1} card={false} />}
			>
				{(alerts) => (
					<AlertsForm tourOperatorId={tourOperatorId} alerts={alerts} />
				)}
			</AppQueryState>
		</AppSettingsCard>
	);
};

const AlertsForm = ({
	tourOperatorId,
	alerts,
}: {
	tourOperatorId: string;
	alerts: MemberAlerts;
}) => {
	const { form, isPending, errorMessage } = useMyAlertsForm(
		tourOperatorId,
		alerts,
	);
	const options = alerts.alerts.map((alert) => ({
		value: alert.type,
		label: alertTypeLabel(alert.type),
	}));

	return (
		<AppForm
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			<FieldGroup>
				<form.Field name="subscribed">
					{(field) => (
						<AppCheckboxGroupField
							field={field}
							label={m.alerts_legend()}
							options={options}
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppForm>
	);
};
