import { SimplifiedLegislator } from "@/lib/useMyLegislators";
import { LegislativeDistrict } from "@/lib/useSenderProfile";
import { Label } from "./ui/label";

type DistrictLabelProps =
	| {
			legislator: SimplifiedLegislator;
			district?: never;
	  }
	| {
			legislator?: never;
			district: LegislativeDistrict;
	  };

export function DistrictLabel({ legislator, district }: DistrictLabelProps) {
	if (legislator) {
		if (legislator.currentTerm.type === "sen") {
			return null;
		}
		const district = legislator.currentTerm.district === 0 ? "At Large" : legislator.currentTerm.district;
		return (
			<Label>
				{legislator.currentTerm.state} District: {district}
			</Label>
		);
	}
	return (
		<div className="flex flex-col gap-1">
			<Label>State: {district.stateAbbreviation}</Label>
			<Label>District: {district.districtNumber === "0" ? "At Large" : district.districtNumber}</Label>
		</div>
	);
}
