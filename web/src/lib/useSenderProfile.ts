import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

export interface LegislativeDistrict {
	stateAbbreviation: string | null;
	districtNumber: string | null;
	date?: number;
	error?: string | null;
}

export interface SenderProfile {
	name?: string;
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
	};
	email?: string;
	phoneNumber?: string;
	district?: LegislativeDistrict | null;
}

function getSavedSenderProfile(): SenderProfile | null {
	const data = localStorage.getItem("senderProfile");
	if (data) {
		return JSON.parse(data);
	}
	return null;
}

export function useSenderProfile() {
	return useQuery<SenderProfile | null>({
		queryKey: queryKeys.senderProfile(),
		initialData: getSavedSenderProfile() ?? null,
		queryFn: () => {
			return getSavedSenderProfile();
		},
	});
}
