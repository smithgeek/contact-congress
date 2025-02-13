import { LegislatorImage } from "@/components/LegislatorImage";
import { LegislatorTypeLabel } from "@/components/LegislatorTypeLabel";
import { LoginFormDialog } from "@/components/login-form";
import { PartyLabel } from "@/components/PartyLabel";
import { PrivateInfoLabel } from "@/components/PrivateInfoLabel";
import { SenderProfileForm } from "@/components/SenderProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tables } from "@/generated/database.types";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { Authenticated, NotAuthenticated, useAuth } from "@/lib/useAuth";
import { useFavorites } from "@/lib/useFavorites";
import { useMyLegislators } from "@/lib/useMyLegislators";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GlobeIcon, MailIcon, SearchIcon, StarIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { uuidv7 } from "uuidv7";

export const Route = createFileRoute("/")({
	component: Page,
});

function useTrendingMessages() {
	return useQuery({
		queryKey: queryKeys.trendingMessages,
		queryFn: async () => {
			const result = await supabase
				.from("trending_templates")
				.select()
				.order("activity_count", { ascending: false })
				.returns<{ id: string; title: string }[]>();
			return result.data;
		},
	});
}

function useMyFavoriteMessages() {
	const { favorites } = useFavorites();
	return useQuery({
		queryKey: queryKeys.myFavoriteMessages(),
		queryFn: async () => {
			const result = await supabase
				.from("templates")
				.select("id, title")
				.in("id", favorites)
				.order("favorites", { ascending: false })
				.limit(10);
			return result.data;
		},
	});
}

function useMyMessages() {
	const { session } = useAuth();
	return useQuery({
		queryKey: queryKeys.myMessages(),
		queryFn: async () => {
			const result = await supabase
				.from("templates")
				.select("id, title")
				.eq("author_id", session?.user.id ?? "");
			return result.data ?? [];
		},
		enabled: !!session?.user.id,
		initialData: [],
	});
}

function TemplateList({ templates }: { templates: Pick<Tables<"templates">, "id" | "title">[] }) {
	return (
		<div className="flex flex-col gap-1">
			{templates.map((m) => {
				return (
					<Link to={`/messages/${m.id}`} key={m.id}>
						<Button variant={"link"} className="text-left">
							{m.title}
						</Button>
					</Link>
				);
			})}
		</div>
	);
}

function MyMessagesCard() {
	const navigate = useNavigate();
	const myMessages = useMyMessages();

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between">
				<h2 className="text-2xl">My Messages</h2>
				<Authenticated>
					<Button
						onClick={() => {
							navigate({
								to: "/messages/$templateId",
								params: {
									templateId: uuidv7(),
								},
							});
						}}
					>
						Create
					</Button>
				</Authenticated>
			</CardHeader>
			<CardContent>
				<Authenticated>
					<TemplateList templates={myMessages.data ?? []} />
				</Authenticated>
				<NotAuthenticated>
					<LoginFormDialog>
						<Button variant={"link"} className="m-0 p-0">
							Log in
						</Button>
					</LoginFormDialog>
					<span className="ml-1">to see your messages</span>
				</NotAuthenticated>
			</CardContent>
		</Card>
	);
}

function MyFavoritesCard() {
	const favorites = useMyFavoriteMessages();
	return (
		<Card>
			<CardHeader>
				<h2 className="text-2xl">My Favorites</h2>
			</CardHeader>
			<CardContent>
				<TemplateList templates={favorites.data ?? []} />
				{favorites.data?.length === 0 && (
					<div className="flex gap-1 items-center">
						<StarIcon className="text-yellow-500 mx-2" />
						<p>Star a message to add it to your favorites list.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function TrendingTopicsCard() {
	const topMessagesQuery = useTrendingMessages();
	return (
		<Card>
			<CardHeader>
				<h2 className="text-2xl">Trending Topics</h2>
			</CardHeader>
			<CardContent>
				<TemplateList templates={topMessagesQuery.data ?? []} />
			</CardContent>
		</Card>
	);
}

function useSearch(query: string = "") {
	return useQuery({
		queryKey: queryKeys.search(query),
		queryFn: async () => {
			const result = await supabase.from("templates").select("id, title").textSearch("templates_search", query.trim(), {
				type: "websearch",
			});
			return result.data ?? [];
		},
		initialData: null,
		enabled: query.trim().length > 0,
	});
}

function WelcomeCard() {
	const [query, setQuery] = useState("");
	const searchResults = useSearch(query);
	const { handleSubmit, register } = useForm<{ query: string }>();
	return (
		<Card className="md:col-span-2">
			<CardHeader>
				<CardTitle>
					<h1 className="text-2xl">Contact Congress</h1>
				</CardTitle>
				<CardDescription>Find topics that are important to you and share them with your legislators.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(({ query }) => setQuery(query))} className="flex gap-2 items-center">
					<Input placeholder="Search" className="max-w-80" {...register("query")} />
					<Button size="icon" pending={searchResults.isPending}>
						<SearchIcon />
					</Button>
				</form>
				{searchResults.data && searchResults.data.length > 0 && <TemplateList templates={searchResults.data} />}
				{searchResults.data && searchResults.data.length === 0 && (
					<Label className="text-muted-foreground italic">No results</Label>
				)}
			</CardContent>
		</Card>
	);
}

function MyLegislatorsCard() {
	const myLegislators = useMyLegislators();
	const [mode, setMode] = useState<"view" | "edit">("view");
	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between flex-row items-center">
					<h2 className="text-2xl">My Legislators</h2>
					{mode === "view" && <Button onClick={() => setMode("edit")}>Update</Button>}
				</div>
				{mode === "edit" && (
					<CardDescription>
						<PrivateInfoLabel />
					</CardDescription>
				)}
			</CardHeader>

			<CardContent>
				{mode === "view" && (
					<>
						{myLegislators.data?.legislators === null && <Label>No legislators found. Try updating your location.</Label>}
						<div className="grid grid-cols-[auto_auto_1fr_1fr] lg:grid-cols-[auto_auto_auto_1fr] gap-2 items-center gap-y-8">
							{myLegislators.data?.legislators?.map((l) => {
								return (
									<Fragment key={l.id}>
										<LegislatorImage legislator={l} size="50" />

										<div className="flex flex-col gap-1">
											<div className="gap-2 flex items-center">
												<Label>{l.name}</Label>
												<PartyLabel short party={l.currentTerm.party} />
											</div>
											<LegislatorTypeLabel legislator={l} />
											<a href={`tel:${l.phone}`}>
												<Button variant="link" className="m-0 p-0" size="xs">
													{l.phone}
												</Button>
											</a>
										</div>
										<a href={l.contactForm} target="_blank">
											<Button size="icon" className="justify-self-center">
												<MailIcon />
											</Button>
										</a>
										<a href={l.website} target="_blank">
											<Button size="icon" className="justify-self-center lg:justify-self-start">
												<GlobeIcon />
											</Button>
										</a>
									</Fragment>
								);
							})}
						</div>
					</>
				)}
				{mode === "edit" && <SenderProfileForm onSubmit={() => setMode("view")} onCancel={() => setMode("view")} />}
			</CardContent>
		</Card>
	);
}

function Page() {
	return (
		<div className="px-2 mx-auto w-full max-w-[100rem] flex flex-col gap-2">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
				<WelcomeCard />
				<TrendingTopicsCard />
				<MyLegislatorsCard />
				<MyFavoritesCard />
				<MyMessagesCard />
			</div>
		</div>
	);
}
