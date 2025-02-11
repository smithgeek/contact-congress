import { Legislator } from "@/types/legislature";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { useMyDistrictInfo } from "./useMyDistrictInfo";

function useLegislators() {
	return useQuery({
		queryKey: queryKeys.legislators,
		queryFn: async () => {
			const response = await fetch(`https://unitedstates.github.io/congress-legislators/legislators-current.json`);
			return (await response.json()) as Legislator[];
		},
		refetchInterval: false,
		refetchIntervalInBackground: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	});
}
export interface SimplifiedLegislator {
	id: string;
	name: string;
	address: string;
	website: string;
	phone: string;
	contactForm: string;
	currentTerm: Legislator["terms"][0];
	fullData: Legislator;
}

function sortLegislator(a: Legislator, b: Legislator) {
	if (a.terms[a.terms.length - 1].type === "rep") {
		return -1;
	}
	if (b.terms[a.terms.length - 1].type === "rep") {
		return 1;
	}
	if (a.terms[a.terms.length - 1].state_rank === "senior") {
		return -1;
	}
	return 1;
}

function getContactFormUrl(currentTerm: Legislator["terms"][0]) {
	if (currentTerm.contact_form) {
		return {
			url: currentTerm.contact_form,
			guess: false,
		};
	}
	if (currentTerm.url) {
		return {
			url: `${currentTerm.url}/contact/`,
			guess: true,
		};
	}
	return {
		url: "",
		guess: false,
	};
}

function createSimplifiedLegislator(legislator: Legislator): SimplifiedLegislator {
	const currentTerm = legislator.terms[legislator.terms.length - 1];
	const contact = getContactFormUrl(currentTerm);
	return {
		name: legislator.name.official_full,
		address: currentTerm.address ?? "",
		contactForm: contact.url,
		fullData: legislator,
		currentTerm,
		id: legislator.id.bioguide,
		phone: currentTerm.phone ?? "",
		website: currentTerm.url ?? "",
	};
}

function useDistrictLegislators({ state, district }: { state: string | null; district: string | null }) {
	const legislators = useLegislators();
	return useQuery({
		queryKey: queryKeys.myLegislators({ state, district }),
		initialData: [],
		queryFn: async () => {
			if (district === null || state === null) {
				return [];
			}
			return (
				legislators.data
					?.filter((l) => {
						const index = l.terms.length - 1;
						if (l.terms[index].state !== state) {
							return false;
						}
						if (l.terms[index].type === "sen") {
							return true;
						}
						if (l.terms[index].district?.toString() === district) {
							return true;
						}
						return false;
					})
					.sort(sortLegislator)
					.map(createSimplifiedLegislator) ?? []
			);
		},
		enabled: legislators.data !== undefined,
	});
}

export function useMyLegislators() {
	const districtQuery = useMyDistrictInfo();
	return useDistrictLegislators({ state: districtQuery.data.stateAbbreviation, district: districtQuery.data.districtNumber });
}
