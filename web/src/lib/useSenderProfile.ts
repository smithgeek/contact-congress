import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { useUpdateMyDistrict } from "./useMyDistrictInfo";

export interface SenderProfile {
	name: string;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
	email: string;
	phoneNumber: string;
}

function getSavedSenderProfile(): SenderProfile | null {
	const data = localStorage.getItem("senderProfile");
	if (data) {
		return JSON.parse(data);
	}
	return null;
}

export function useSenderProfile() {
	const queryClient = useQueryClient();
	const query = useQuery<SenderProfile | null>({
		queryKey: queryKeys.senderProfile(),
		initialData: getSavedSenderProfile() ?? null,
		queryFn: () => {
			return getSavedSenderProfile();
		},
	});
	const updateDistrict = useUpdateMyDistrict();
	return {
		senderProfile: query.data,
		setSenderProfile: (u: SenderProfile | null) => {
			queryClient.setQueryData(queryKeys.senderProfile(), u);
			if (u) {
				localStorage.setItem(queryKeys.localStorage.senderProfile, JSON.stringify(u));
			} else {
				for (const key of queryKeys.localStorage.localProfile()) {
					localStorage.removeItem(key);
				}
			}
			updateDistrict.mutate(u);
		},
		query,
	};
}
