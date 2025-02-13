import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// components
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/components/ui/themeProvider";
import { GithubIcon } from "@/icons/GithubIcon";
import { GithubIconWhite } from "@/icons/GithubIconWhite";
import { supabase } from "@/lib/supabase";
import { Authenticated } from "@/lib/useAuth";
import { DevToolsWrapper } from "@/lib/useDevTools";
import { axiosInstance } from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import { HomeIcon, LogOutIcon, MoonIcon, SunIcon } from "lucide-react";

axiosInstance.defaults.baseURL = `${location.origin}/api`;

function PageContent() {
	return (
		<>
			<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col bg-muted/40 pb-10">
				<Outlet />
			</main>
		</>
	);
}

function useSignOut() {
	return useMutation({
		mutationFn: async () => {
			await supabase.auth.signOut();
		},
	});
}

function ThemeButton() {
	const { setTheme } = useTheme();
	return (
		<div>
			<Button variant="ghost" size="icon" className="hidden dark:flex" onClick={() => setTheme("light")}>
				<SunIcon />
			</Button>
			<Button variant="ghost" size="icon" className="dark:hidden flex" onClick={() => setTheme("dark")}>
				<MoonIcon />
			</Button>
		</div>
	);
}

function Navbar() {
	const signOut = useSignOut();

	return (
		<header className="px-2 flex gap-2 items-center h-14 sticky top-0 bg-background border-b z-50">
			<Link to="/">
				<Button variant="ghost">
					<HomeIcon />
				</Button>
			</Link>
			<div className="flex-1"></div>
			<ThemeButton />
			<Authenticated>
				<Button onClick={() => signOut.mutate()} pending={signOut.isPending} variant="ghost" size="icon">
					<LogOutIcon />
				</Button>
			</Authenticated>
		</header>
	);
}

function PageStructure() {
	return (
		<>
			<div className="flex flex-col min-h-[100vh] pb-2">
				<Navbar />
				<div className="flex-1 flex flex-col">
					<PageContent />
				</div>
				<DevToolsWrapper>
					<TanStackRouterDevtools />
				</DevToolsWrapper>
				<Toaster />
				<footer className="min-h-10 text-muted-foreground flex justify-center items-center">
					<a href="https://github.com/smithgeek/contact-congress">
						<GithubIcon className="size-6 block dark:hidden" />
						<GithubIconWhite className="size-6 dark:block hidden" />
					</a>
				</footer>
			</div>
		</>
	);
}

export const Route = createRootRoute({
	component: () => <PageStructure />,
});
