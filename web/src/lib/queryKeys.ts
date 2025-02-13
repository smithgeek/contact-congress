export const queryKeys = {
	local: ["local"] as const,
	localProfile: () => [...queryKeys.local, "profile"] as const,
	senderProfile: () => [...queryKeys.localProfile(), "sender"] as const,
	favoriteIds: () => [...queryKeys.local, "favoriteIds"] as const,
	myLegislators: ({ state, district }: { state: string | null; district: string | null }) =>
		[...queryKeys.localProfile(), "legislators", state, district] as const,
	legislators: ["legislators"] as const,

	session: ["session"] as const,
	sessionAuth: () => [...queryKeys.session, "auth"] as const,
	myFavoriteMessages: () => [...queryKeys.session, "messages", "my", "favorites"] as const,
	myMessages: () => [...queryKeys.session, "messages", "my"] as const,

	trendingMessages: ["messages", "trending"] as const,

	template(id: string) {
		return ["template", id] as const;
	},
	localStorage: {
		senderProfile: "senderProfile",
		localProfile: () => [queryKeys.localStorage.senderProfile],
	},
	search: (query: string) => ["search", query] as const,
};
