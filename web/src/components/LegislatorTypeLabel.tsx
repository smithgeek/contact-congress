import { SimplifiedLegislator } from "@/lib/useMyLegislators";
import { Label } from "./ui/label";

export function LegislatorTypeLabel({ legislator }: { legislator: SimplifiedLegislator }) {
	return <Label className="pointer-events-none">{legislator.currentTerm.type === "sen" ? `Senator` : "Representative"}</Label>;
}
