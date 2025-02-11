import { DistrictLabel } from "@/components/DistrictLabel";
import { LegislatorImage } from "@/components/LegislatorImage";
import { LegislatorTypeLabel } from "@/components/LegislatorTypeLabel";
import { LoginFormDialog } from "@/components/login-form";
import { MonacoEditor } from "@/components/MonacoEditor";
import { PartyLabel } from "@/components/PartyLabel";
import { SenderProfileForm } from "@/components/SenderProfileForm";
import { ShareButton } from "@/components/ShareButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useFavorites } from "@/lib/useFavorites";
import { SimplifiedLegislator, useMyLegislators } from "@/lib/useMyLegislators";
import { Activity, useFlagTemplate, useSendActivity } from "@/lib/useSendActivity";
import { SenderProfile, useSenderProfile } from "@/lib/useSenderProfile";
import { useSessionStorageState } from "@/lib/useSessionStorageState";
import { cn } from "@/lib/utils";
import { Legislator } from "@/types/legislature";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Liquid } from "liquidjs";
import { AlertTriangleIcon, ExternalLinkIcon, FlagIcon, InfoIcon, Loader2Icon, PencilIcon, StarIcon } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";

const engine = new Liquid({});

export const Route = createFileRoute("/messages/$templateId")({
	component: Page,
});

function createDefaultSenderProfile(): SenderProfile {
	return {
		name: "[Name]",
		address: {
			street: "[Street]",
			city: "[City]",
			state: "[State]",
			zip: "[Zip]",
		},
		email: "[Email]",
		phoneNumber: "[Phone]",
	};
}

function createPlaceholderLegislator(): SimplifiedLegislator {
	return {
		name: "[Legislator Name]",
		address: "[Address]",
		contactForm: "",
		currentTerm: {} as Legislator["terms"][0],
		fullData: {} as Legislator,
		id: uuidv7(),
		phone: "",
		website: "",
	};
}

function removeNonDigits(s: string) {
	return s.replace(/\D/g, "");
}

function SenderProfileEditor({
	onSubmit,
	defaultSenderProfile,
}: {
	onSubmit: (senderProfile: SenderProfile | null) => void;
	defaultSenderProfile: SenderProfile | null;
}) {
	const [mode, setMode] = useState<"edit" | "view">(defaultSenderProfile === null ? "edit" : "view");

	return (
		<div className="flex w-full items-center gap-1">
			<div
				className="flex gap-1 p-2 lg:p-2 border rounded-md items-center w-full hover:bg-muted cursor-pointer"
				onClick={() => {
					setMode("edit");
				}}
			>
				<div className="flex lg:flex-col flex-1 gap-2 lg:gap-0">
					<span>{defaultSenderProfile?.name ?? "Not Created"}</span>
					<span className="hidden lg:block">
						{[defaultSenderProfile?.address.city, defaultSenderProfile?.address.state].filter(Boolean).join(" ")}
					</span>
				</div>
				<PencilIcon className="size-4" />
			</div>
			<Dialog
				open={mode === "edit"}
				onOpenChange={(o) => {
					setMode(o ? "edit" : "view");
				}}
			>
				<DialogContent>
					<DialogTitle>
						<label className="text-2xl">Sender Profile</label>
					</DialogTitle>
					<SenderProfileForm
						onSubmit={(p) => {
							setMode("view");
							onSubmit(p);
						}}
						defaultSenderProfile={defaultSenderProfile}
						showReset
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function CopyButton({ text, className }: { text: string; className?: string }) {
	const [_, copyToClipboard] = useCopyToClipboard();
	return (
		<Button
			onClick={() => {
				copyToClipboard(text).then(
					() => toast.success("Copied to clipboard"),
					() => toast.error("Failed to copy to clipboard")
				);
			}}
			variant="outline"
			className={cn("flex gap-1 p-2", className)}
		>
			<span className="">Copy</span>
		</Button>
	);
}

function CopyArea({
	text,
	children,
	className,
	title,
}: {
	text: string | null | undefined;
	children: ReactNode;
	className?: string;
	title?: string;
}) {
	return (
		<Card className={cn("p-2 relative", className)}>
			<CardHeader className="py-0">
				<CardTitle className="text-2xl">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex-1 pt-4">{children}</div>
				{text && <CopyButton text={text} className="self-start absolute top-0 right-0 h-7" />}
			</CardContent>
		</Card>
	);
}

function LegislatorButtonContent({ legislator }: { legislator: SimplifiedLegislator }) {
	return (
		<div className="flex gap-2 pointer-events-none">
			<LegislatorImage legislator={legislator} />
			<div className="flex flex-col items-start">
				<Label>{legislator.name}</Label>
				<PartyLabel party={legislator.currentTerm.party} />
				<div className="flex gap-1">
					<LegislatorTypeLabel legislator={legislator} />
				</div>
			</div>
		</div>
	);
}

function LegislatorDetails({ legislator, onActivity }: { legislator: SimplifiedLegislator; onActivity: (activity: Activity) => void }) {
	return (
		<div className="grid grid-cols-[auto_1fr] gap-2">
			<span className="col-span-2">
				{legislator.name} <PartyLabel party={legislator.currentTerm.party} />
			</span>

			<span className="col-span-2">
				<DistrictLabel legislator={legislator} />
			</span>
			<span>Phone:</span>
			<a href={`tel:${removeNonDigits(legislator.currentTerm.phone ?? "")}`} onClick={() => onActivity("call")}>
				<Button variant="link" size="xs" className="m-0 p-0">
					{legislator.currentTerm.phone}
				</Button>
			</a>
			<span>Website:</span>
			<a href={legislator.currentTerm.url} target="_blank">
				<Button variant="link" size="xs" className="m-0 p-0">
					{legislator.currentTerm.url}
				</Button>
			</a>
			<span>Address:</span>
			<span>{legislator.currentTerm.address}</span>
			<LegislatorImage legislator={legislator} size="100" className="mx-auto col-span-2" />
		</div>
	);
}

function useTemplate(id: string) {
	return useQuery({
		queryKey: queryKeys.template(id),
		queryFn: async () => {
			const result = await supabase.from("templates").select().eq("id", id);
			return result.data?.[0] ?? null;
		},
	});
}

interface EditableTemplate {
	title: string;
	message: string;
	subject: string;
}

function useSaveTemplate(templateId: string, options?: { onSuccess?: () => void }) {
	const { session } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (template: EditableTemplate) => {
			const result = await supabase
				.from("templates")
				.upsert({
					message: template.message,
					subject: template.subject,
					title: template.title,
					author_id: session?.user.id,
					id: templateId,
				})
				.select();
			return result.data?.[0];
		},
		onSuccess(data) {
			queryClient.setQueryData(["template", templateId], data);
			options?.onSuccess?.();
		},
	});
}

const messagePlaceholder = `Dear {{legislator.name}},

I would like to...

{{sender.custom.personalMessage}}

Thank you for your time and consideration. I appreciate your leadership and look forward to your response.

Best regards,
{{sender.name}}
{{sender.address.street}} {{sender.address.city}}, {{sender.address.state}} {{sender.address.zip}}
`;

function camelToSentence(text: string) {
	return text
		.replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
		.replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

function Page() {
	const myLegislators = useMyLegislators();
	const [selectedLegislatorId, setSelectedLegislatorId] = useState<string | null>(null);
	const selectedLegislator = myLegislators.data?.find((l) => l.id === selectedLegislatorId);
	const { senderProfile, setSenderProfile } = useSenderProfile();
	const { templateId } = Route.useParams();
	const templateQuery = useTemplate(templateId);
	const [senderCustom, setSenderCustom] = useSessionStorageState<{ custom?: { [key: string]: string }; template?: EditableTemplate }>(
		`${templateId}:sender-custom`,
		{}
	);
	const template = { ...templateQuery.data, ...senderCustom.template };
	const { session } = useAuth();
	const [editedTemplate, setEditedTemplate] = useState<EditableTemplate | null>(null);
	const mode = editedTemplate === null ? "send" : "edit";
	const saveTemplate = useSaveTemplate(templateId, {
		onSuccess: () => {
			setEditedTemplate(null);
		},
	});
	const { favorites, addFavorite, removeFavorite } = useFavorites();
	const isFavorite = favorites?.includes(templateId) ?? false;
	const sendActivity = useSendActivity();
	const flagTemplate = useFlagTemplate();

	const userIsAuthor = session?.user.id === template?.author_id || (!template && session?.user.id);

	useEffect(() => {
		if (template === null) {
			const queryParams = new URLSearchParams(location.search);
			setEditedTemplate({
				message: queryParams.get("message") ?? messagePlaceholder,
				subject: queryParams.get("subject") ?? "",
				title: queryParams.get("title") ?? "",
			});
		}
	}, [template]);

	useEffect(() => {
		if (!selectedLegislator && myLegislators.data.length > 0) {
			const legislator = myLegislators.data[0];
			setSelectedLegislatorId(legislator.id);
		}
	}, [myLegislators, selectedLegislator, setSelectedLegislatorId]);

	const renderedText = (
		engine.parseAndRenderSync(template?.message ?? "", {
			sender: {
				...(senderProfile ?? createDefaultSenderProfile()),
				custom: senderCustom.custom,
			},
			legislator: selectedLegislator ?? createPlaceholderLegislator(),
		}) as string
	).replace(/\n{3,}/g, "\n\n");

	const customSenderProperties = engine
		.variableSegmentsSync(template?.message ?? "")
		.filter((s) => s.length === 3 && s[0] === "sender" && s[1] === "custom")
		.map((s) => s[2].toString());

	const setCustomSenderProperty = useCallback(
		(key: string, value: string) => {
			setSenderCustom({
				...senderCustom,
				custom: {
					...senderCustom.custom,
					[key]: value,
				},
			});
		},
		[senderCustom, setSenderCustom]
	);

	return (
		<div className="flex-1 flex flex-col">
			<div className={cn("flex flex-col-reverse lg:flex-row flex-1 items-start", "gap-2")}>
				<div
					id="content1"
					className={cn(
						"w-full border-t gap-x-2 self-stretch",
						"fixed bottom-0 bg-background z-10 items-center grid grid-cols-[auto_1fr]",
						"lg:w-72 lg:relative lg:bg-transparent lg:border-0 lg:grid-cols-1 lg:z-0 lg:items-start lg:flex lg:flex-col lg:border-r"
					)}
				>
					<div className="w-full p-1 px-3 grid-cols-subgrid grid col-span-2 items-center lg:block">
						<label className="lg:text-2xl">Sender Profile</label>
						<SenderProfileEditor
							defaultSenderProfile={senderProfile}
							onSubmit={(profile) => {
								setSenderProfile(profile);
								if (!profile) {
									setSelectedLegislatorId(null);
								}
							}}
						/>
					</div>
					<Separator orientation="horizontal" className="my-2 hidden lg:block" />
					<div className="w-full px-3 grid-cols-subgrid grid col-span-2 items-center lg:block">
						{myLegislators && (
							<>
								<label className="block lg:hidden">Legislator</label>
								<div className="flex gap-1 items-center lg:hidden">
									{myLegislators.isPending && (
										<div>
											<Loader2Icon className="animate-spin" />
										</div>
									)}
									<Select value={selectedLegislatorId ?? ""} onValueChange={setSelectedLegislatorId}>
										<SelectTrigger>{selectedLegislator?.name}</SelectTrigger>
										<SelectContent>
											{myLegislators.data.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													<LegislatorButtonContent legislator={l} />
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Dialog>
										<DialogTrigger>
											<Button variant="ghost" size="icon">
												<InfoIcon />
											</Button>
										</DialogTrigger>
										<DialogContent>
											{selectedLegislator && (
												<LegislatorDetails
													legislator={selectedLegislator}
													onActivity={(a) => sendActivity.mutate({ id: templateId, activity: a })}
												/>
											)}
										</DialogContent>
									</Dialog>
								</div>
								<div className="lg:flex gap-4 flex-col items-start hidden">
									<div className="text-2xl">Your Legislators</div>
									{myLegislators.data.length === 0 && (
										<div className="flex flex-col gap-8">
											<Skeleton className="h-16 w-[250px]" />
											<Skeleton className="h-16 w-[250px]" />
											<Skeleton className="h-16 w-[250px]" />
										</div>
									)}
									{!myLegislators.isPending &&
										myLegislators.data.map((l) => {
											return (
												<div
													key={l.id}
													className={cn(
														"w-full border rounded-md cursor-pointer p-2",
														{
															"bg-blue-300 dark:bg-blue-950":
																selectedLegislator?.fullData.id.bioguide === l.id,
														},
														{
															"hover:bg-muted": selectedLegislator?.fullData.id.bioguide !== l.id,
														}
													)}
													style={{ gridColumn: "1 / -1" }}
													onClick={() => setSelectedLegislatorId(l.id)}
												>
													<LegislatorButtonContent legislator={l} />
												</div>
											);
										})}
								</div>
							</>
						)}
					</div>
					<Separator orientation="horizontal" className="my-2 hidden lg:block" />
					{selectedLegislator && (
						<div className="hidden lg:block px-3">
							<LegislatorDetails
								legislator={selectedLegislator}
								onActivity={(a) => sendActivity.mutate({ id: templateId, activity: a })}
							/>
						</div>
					)}
				</div>
				<div className="flex flex-col gap-2 p-2 mb-28 flex-1">
					{mode === "send" && (
						<>
							<div className="flex justify-between">
								<div className="text-3xl flex-1 flex gap-2 items-center">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => {
											if (isFavorite) {
												removeFavorite(templateId);
											} else {
												addFavorite.mutate(templateId);
											}
										}}
									>
										<StarIcon className={cn("text-yellow-500", { "fill-yellow-500": isFavorite })} />
									</Button>
									<ShareButton
										shareData={{
											title: template?.title,
											text: template?.subject,
											url: window.location.href,
										}}
										onClick={() => sendActivity.mutate({ id: templateId, activity: "share" })}
									/>
									<Dialog>
										<DialogTrigger>
											<Button variant="ghost">
												<FlagIcon className="text-red-500 fill-red-500 opacity-90" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Report</DialogTitle>
											</DialogHeader>
											<Label>Report this message to moderates as inappropriate.</Label>
											<DialogFooter>
												<Button
													theme="danger"
													onClick={() => {
														flagTemplate.mutate(templateId);
													}}
												>
													Report
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
								<Button
									onClick={() =>
										setEditedTemplate({
											title: template?.title ?? "",
											message: template?.message ?? "",
											subject: template?.subject ?? "",
										})
									}
									variant="ghost"
									size="icon"
								>
									<PencilIcon />
								</Button>
							</div>
							<h1 className="text-3xl">{template?.title}</h1>
						</>
					)}
					{editedTemplate && (
						<Card className="border-0 shadow-none">
							<CardHeader>
								<CardTitle className="text-2xl">Title</CardTitle>
							</CardHeader>
							<CardContent>
								<Input
									id="title"
									defaultValue={editedTemplate?.title ?? ""}
									onChange={(e) => setEditedTemplate({ ...editedTemplate, title: e.target.value ?? "" })}
								/>
							</CardContent>
						</Card>
					)}
					{editedTemplate && (
						<Card className="border-0 shadow-none">
							<CardHeader>
								<CardTitle className="text-2xl">Subject</CardTitle>
							</CardHeader>
							<CardContent>
								<Input
									id="subject"
									defaultValue={editedTemplate?.subject ?? ""}
									onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value ?? "" })}
								/>
							</CardContent>
						</Card>
					)}
					{mode === "send" && (
						<CopyArea className="flex-1" text={template?.subject} title="Subject">
							<span>{template?.subject}</span>
						</CopyArea>
					)}

					{editedTemplate && (
						<Card className="border-0 shadow-none">
							<CardHeader>
								<CardTitle className="text-2xl">Message</CardTitle>
							</CardHeader>
							<CardContent>
								<MonacoEditor
									defaultValue={editedTemplate?.message ?? ""}
									onChange={(value) => setEditedTemplate({ ...editedTemplate, message: value ?? "" })}
								/>
							</CardContent>
						</Card>
					)}
					{mode === "send" && (
						<>
							<CopyArea text={renderedText} title="Message">
								<div className="whitespace-pre-wrap">{renderedText}</div>
							</CopyArea>

							{customSenderProperties.map((p) => (
								<Card key={p}>
									<CardHeader>
										<CardTitle>{camelToSentence(p)}</CardTitle>
									</CardHeader>
									<CardContent>
										<Input
											value={senderCustom.custom?.[p]}
											onChange={(e) => setCustomSenderProperty(p, e.target.value ?? "")}
										/>
									</CardContent>
								</Card>
							))}
							{selectedLegislator && (
								<a
									href={selectedLegislator.contactForm}
									target="_blank"
									onClick={() => sendActivity.mutate({ id: templateId, activity: "email" })}
								>
									<Button className="flex gap-2">
										Contact {selectedLegislator.name}
										<ExternalLinkIcon />
									</Button>
								</a>
							)}
						</>
					)}
					{editedTemplate && (
						<>
							{!userIsAuthor && (
								<Alert className="border-2 border-orange-500 dark:border-orange-900 dark:text-white">
									<AlertDescription className="flex gap-1 items-center">
										<AlertTriangleIcon />
										<Label>These changes are temporary and will be lost when you close your browser.</Label>
										{!session?.user && (
											<>
												<LoginFormDialog>
													<Button variant={"link"} className="m-0 p-0">
														Log in
													</Button>
												</LoginFormDialog>
												<Label>to save your own messages.</Label>
											</>
										)}
										{session?.user && (
											<Label className="flex gap-1 items-center">
												<a
													href={`/messages/${uuidv7()}?title=${encodeURIComponent(
														editedTemplate.title
													)}&subject=${encodeURIComponent(editedTemplate.subject)}&message=${encodeURIComponent(
														editedTemplate.message
													)}`}
												>
													<Button className="m-0 p-0" variant="link">
														Create
													</Button>
												</a>
												<span>your own message to save it.</span>
											</Label>
										)}
									</AlertDescription>
								</Alert>
							)}
							<div className="flex gap-1 items-center">
								<Label className="text-muted-foreground">
									We reserve the right to remove messages that discriminate or contain offensive content.
								</Label>
								<Dialog>
									<DialogTrigger>
										<Button variant="link">Learn More</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Allowed Content</DialogTitle>
										</DialogHeader>
										<span>
											We do not tolerate discriminatory or hateful content and reserve the right to remove such
											messages. However, respectful discussions and differing political views are welcome and will not
											be removed.
										</span>
									</DialogContent>
								</Dialog>
							</div>
							<div className="flex gap-4">
								<Button
									theme="success"
									onClick={() => {
										if (userIsAuthor) {
											saveTemplate.mutate(editedTemplate);
										} else {
											setSenderCustom({
												...senderCustom,
												template: editedTemplate,
											});
										}
									}}
									pending={saveTemplate.isPending}
								>
									Save
								</Button>
								<Button theme="danger" onClick={() => setEditedTemplate(null)} disabled={saveTemplate.isPending}>
									Cancel
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
