import {
	AppDetailField,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	Button,
} from "@vointika/ui";
import { ExternalLink } from "lucide-react";
import * as m from "#/paraglide/messages";
import { useOperatorDetails } from "../hooks/use-operator-details";

export const AppStorefrontCard = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const query = useOperatorDetails(tourOperatorId);

	return (
		<AppSettingsCard
			title={m.storefront()}
			description={m.storefront_description()}
		>
			<AppQueryState
				query={query}
				loading={<AppFormSkeleton rows={1} card={false} />}
			>
				{(operator) => (
					<div className="flex flex-col gap-6">
						<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<AppDetailField label={m.web_address()}>
								<span className="font-mono text-sm break-all">
									{operator.storefrontUrl}
								</span>
							</AppDetailField>
							<AppDetailField label={m.store_access()}>
								{operator.storefrontPassword.enabled
									? m.store_access_on()
									: m.store_access_off()}
							</AppDetailField>
						</dl>
						<div>
							<Button asChild variant="outline">
								<a
									href={operator.storefrontUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink />
									{m.open_storefront()}
								</a>
							</Button>
						</div>
					</div>
				)}
			</AppQueryState>
		</AppSettingsCard>
	);
};
