import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { useSendActivity } from "./useSendActivity";

function getStorageFavs(): string[] {
	const data = localStorage.getItem("favorites");
	try {
		if (data) {
			return JSON.parse(data);
		}
	} catch {}
	return [];
}

export function useFavorites() {
	const queryClient = useQueryClient();
	const sendActivity = useSendActivity();
	const query = useQuery({
		queryKey: queryKeys.favoriteIds(),
		initialData: getStorageFavs(),
	});
	const removeFavorite = (id: string) => {
		queryClient.setQueryData<string[]>(queryKeys.favoriteIds(), (v) => {
			const newFavs = v?.filter((i) => i !== id) ?? [];
			localStorage.setItem("favorites", JSON.stringify(newFavs));
			return newFavs;
		});
	};
	const addFavorite = useMutation({
		mutationFn: async (id: string) => {
			queryClient.setQueryData<string[]>(queryKeys.favoriteIds(), (v) => {
				const newFavs = [...(v ?? []), id];
				localStorage.setItem("favorites", JSON.stringify(newFavs));
				return newFavs;
			});
			await sendActivity.mutateAsync({ id, activity: "favorite" });
		},
	});
	return { favorites: query.data, removeFavorite, addFavorite };
}
