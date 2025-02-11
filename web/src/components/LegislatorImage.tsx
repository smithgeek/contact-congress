import { SimplifiedLegislator } from "@/lib/useMyLegislators";
import { cn } from "@/lib/utils";

export function LegislatorImage({
	legislator,
	className,
	size = "50",
}: {
	legislator: SimplifiedLegislator;
	className?: string;
	size?: "50" | "100" | "200";
}) {
	return (
		<img
			src={`https://www.govtrack.us/static/legislator-photos/${legislator.fullData.id.govtrack}-${size}px.jpeg`}
			alt={legislator.name}
			className={cn({ "max-w-[50px]": size === "50", "max-w-[100px]": size === "100", "max-w-[200px]": size === "200" }, className)}
		/>
	);
}
