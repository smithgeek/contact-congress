import { ReactNode } from "@tanstack/react-router";
import { useMemo } from "react";

export function useDevTools() {
	return useMemo(() => {
		return location.href.includes("localhost") || location.href.includes("dev=true");
	}, []);
}

export function DevToolsWrapper({ children }: { children: ReactNode }) {
	const showDevTools = useDevTools();
	if (showDevTools) {
		return <>{children}</>;
	}
	return null;
}
