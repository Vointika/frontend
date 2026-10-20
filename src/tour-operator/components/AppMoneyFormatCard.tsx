import {
	AppDetailField,
	AppField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	EmptyValue,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import {
	useOperatorMoneyFormat,
	useOperatorMoneyFormatForm,
} from "../hooks/use-operator-money-format";
import type { MoneyFormatSettings } from "../types";
import { AMOUNT, AMOUNT_NO_DECIMALS } from "../validators/money-format";

export const AppMoneyFormatCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useOperatorMoneyFormat(tourOperatorId);

	return (
		<AppSettingsCard
			title={m.money_format()}
			description={m.money_format_description({
				amount: AMOUNT,
				noDecimals: AMOUNT_NO_DECIMALS,
			})}
		>
			<AppQueryState
				query={query}
				loading={<AppFormSkeleton rows={2} card={false} />}
			>
				{(money) =>
					canWrite ? (
						<MoneyFormatForm tourOperatorId={tourOperatorId} money={money} />
					) : (
						<MoneyFormatSummary money={money} />
					)
				}
			</AppQueryState>
		</AppSettingsCard>
	);
};

const MoneyFormatForm = ({
	tourOperatorId,
	money,
}: {
	tourOperatorId: string;
	money: MoneyFormatSettings;
}) => {
	const { form, isPending, errorMessage } = useOperatorMoneyFormatForm(
		tourOperatorId,
		money,
	);

	return (
		<AppForm
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			<FieldGroup>
				<form.Field name="format">
					{(field) => (
						<AppField
							field={field}
							label={m.money_format_price()}
							description={m.money_format_price_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="withCurrencyFormat">
					{(field) => (
						<AppField
							field={field}
							label={m.money_format_with_currency()}
							description={m.money_format_with_currency_hint()}
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppForm>
	);
};

const MoneyFormatSummary = ({ money }: { money: MoneyFormatSettings }) => (
	<dl className="flex flex-col gap-6">
		<AppDetailField label={m.money_format_price()}>
			{money.format ?? <EmptyValue />}
		</AppDetailField>
		<AppDetailField label={m.money_format_with_currency()}>
			{money.withCurrencyFormat ?? <EmptyValue />}
		</AppDetailField>
	</dl>
);
