import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { supabase } from "./supabase";
import { SenderProfile } from "./useSenderProfile";

export interface LegislativeDistrict {
	stateAbbreviation: string | null;
	districtNumber: string | null;
	date?: number;
}

function getSavedDistrict(): LegislativeDistrict | null {
	const data = localStorage.getItem(queryKeys.localStorage.myDistrict);
	if (data) {
		return JSON.parse(data);
	}
	return null;
}

const defaultDistrict: LegislativeDistrict = {
	stateAbbreviation: null,
	districtNumber: null,
};

export function useUpdateMyDistrict() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (senderProfile: SenderProfile | null) => {
			let myDistrict = getSavedDistrict() ?? defaultDistrict;
			if ((myDistrict.districtNumber === null || myDistrict.stateAbbreviation === null) && senderProfile) {
				const address = [
					senderProfile?.address.street,
					senderProfile?.address.city,
					senderProfile?.address.state,
					senderProfile?.address.zip,
				]
					.filter(Boolean)
					.join(" ");
				const response = await supabase.functions.invoke<LegislativeDistrict>("district-lookup", {
					body: { address },
				});
				if (response.data) {
					localStorage.setItem(queryKeys.localStorage.myDistrict, JSON.stringify(response.data));
					myDistrict = response.data;
				}
			}
			queryClient.setQueryData(queryKeys.myDistrict(), myDistrict);
			queryClient.invalidateQueries({ queryKey: queryKeys.myDistrict() });
		},
	});
}

export function useMyDistrictInfo() {
	return useQuery<LegislativeDistrict>({
		queryKey: queryKeys.myDistrict(),
		initialData: getSavedDistrict() ?? defaultDistrict,
	});
}
