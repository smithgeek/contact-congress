import { createRootRouteWithContext, HeadContent, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// components
import { ReportIssueLink } from "@/components/ReportIssueLink";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/components/ui/themeProvider";
import { ContactMyCongressLogo } from "@/icons/ContactMyCongressLogo";
import { GithubIcon } from "@/icons/GithubIcon";
import { GithubIconWhite } from "@/icons/GithubIconWhite";
import { supabase } from "@/lib/supabase";
import { Authenticated } from "@/lib/useAuth";
import { DevToolsWrapper } from "@/lib/useDevTools";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { LogOutIcon, MenuIcon, MoonIcon, SunIcon, User2Icon } from "lucide-react";
import { createPortal } from "react-dom";

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
			<Link to="/" className="flex items-center gap-2">
				<ContactMyCongressLogo className="size-8" />
				<div className="text-lg sm:text-2xl font-bold">
					<span className="text-[#dc444b]">Contact</span>
					<span className="text-muted-foreground dark:text-white">My</span>
					<span className="text-[#365ee0]">Congress</span>
					<span className="text-muted-foreground">.com</span>
				</div>
			</Link>
			<div className="flex-1"></div>
			<ThemeButton />
			<Authenticated>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon">
							<MenuIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56">
						<Link to="/account">
							<DropdownMenuItem>
								<User2Icon />
								My Account
							</DropdownMenuItem>
						</Link>
						<DropdownMenuItem onClick={() => signOut.mutate()}>
							<LogOutIcon /> Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Authenticated>
		</header>
	);
}

function PageStructure() {
	return (
		<>
			{createPortal(<HeadContent />, document.getElementById("htmlHead")!)}
			<div className="flex flex-col min-h-[100vh] pb-2">
				<Navbar />
				<div className="flex-1 flex flex-col">
					<PageContent />
				</div>
				<DevToolsWrapper>
					<TanStackRouterDevtools />
				</DevToolsWrapper>
				<Toaster />
				<footer className="min-h-10 text-muted-foreground flex justify-center items-center gap-4">
					<Link to="/privacy">
						<Button variant="link" className="text-muted-foreground">
							Privacy Policy
						</Button>
					</Link>
					<ReportIssueLink className="text-muted-foreground" />
					<a href="https://github.com/smithgeek/contact-congress">
						<GithubIcon className="size-6 block dark:hidden" />
						<GithubIconWhite className="size-6 dark:block hidden" />
					</a>
				</footer>
			</div>
		</>
	);
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	component: () => <PageStructure />,
	head: () => ({
		meta: [
			{
				title: "Contact My Congress",
			},
			{
				property: "og:image",
				content: "https://contactmycongress.com/images/ezgif-7c9131410e70a0.jpg",
			},
		],
	}),
});
