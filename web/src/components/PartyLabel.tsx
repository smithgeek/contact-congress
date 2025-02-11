import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { SimpleTooltip } from "./ui/tooltip";

export function PartyLabel({ party, short }: { party: string; short?: boolean }) {
	return (
		<Label
			className={cn({
				"text-red-500": party === "Republican",
				"text-blue-500": party === "Democrat",
				"text-purple-500": party !== "Republican" && party !== "Democrat",
			})}
		>
			{short ? <SimpleTooltip tooltip={party}>{party[0]}</SimpleTooltip> : <span>{party}</span>}
		</Label>
	);
}
