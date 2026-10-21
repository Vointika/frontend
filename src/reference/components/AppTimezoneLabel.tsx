import type { Timezone } from "../types";

export const AppTimezoneLabel = ({ timezone }: { timezone: Timezone }) => (
	<>
		{timezone.country.flagUrl && (
			<img
				src={timezone.country.flagUrl}
				alt=""
				className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
			/>
		)}
		<span>
			{timezone.cityName}, {timezone.country.name}
		</span>
	</>
);
