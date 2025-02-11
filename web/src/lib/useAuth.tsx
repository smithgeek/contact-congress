import { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "@tanstack/react-router";
import { useEffect } from "react";
import { queryKeys } from "./queryKeys";
import { supabase } from "./supabase";

function useAuthSessions() {
	const queryClient = useQueryClient();

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			queryClient.setQueryData(queryKeys.sessionAuth(), session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			queryClient.setQueryData(queryKeys.sessionAuth(), session);
		});

		return () => subscription.unsubscribe();
	}, []);
}

export function useAuth() {
	const sessionQuery = useQuery<Session | null>({
		queryKey: queryKeys.sessionAuth(),
		initialData: null,
	});
	return {
		session: sessionQuery.data,
	};
}

export function SupabaseAuthProvider() {
	useAuthSessions();
	return null;
}

export function Authenticated({ children }: { children: ReactNode }) {
	const { session } = useAuth();
	if (!session) {
		return null;
	}
	return <>{children}</>;
}

export function NotAuthenticated({ children }: { children: ReactNode }) {
	const { session } = useAuth();
	if (session) {
		return null;
	}
	return <>{children}</>;
}
