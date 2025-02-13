import { DistrictLabel } from "@/components/DistrictLabel";
import { LegislatorImage } from "@/components/LegislatorImage";
import { LegislatorTypeLabel } from "@/components/LegislatorTypeLabel";
import { LoginFormDialog } from "@/components/login-form";
import { MonacoEditor } from "@/components/MonacoEditor";
import { PartyLabel } from "@/components/PartyLabel";
import { PrivateInfoLabel } from "@/components/PrivateInfoLabel";
import { SenderProfileForm } from "@/components/SenderProfileForm";
import { ShareButton } from "@/components/ShareButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Tables } from "@/generated/database.types";
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
import { AlertTriangleIcon, ExternalLinkIcon, FlagIcon, PencilIcon, StarIcon } from "lucide-react";
import { Fragment, ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";

const engine = new Liquid({});

export const Route = createFileRoute("/messages/$templateId")({
	component: PageWrapper,
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
		memberOf: "[House/Senate]",
		title: "[Representative/Senator]",
	};
}

function removeNonDigits(s: string) {
	return s.replace(/\D/g, "");
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
		<div className="grid grid-cols-[auto_1fr] gap-2 text-left">
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
			<a href={legislator.currentTerm.url} target="_blank" className="overflow-hidden">
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
	return useQuery<Tables<"templates"> | null>({
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

function MyLegislatorsCard({
	selectedLegislator,
	setSelectedLegislatorId,
	templateId,
}: {
	selectedLegislator: SimplifiedLegislator | undefined;
	setSelectedLegislatorId: (id: string) => void;
	templateId: string;
}) {
	const sendActivity = useSendActivity();
	const myLegislators = useMyLegislators();
	const [mode, setMode] = useState<"view" | "edit">("view");
	return (
		<>
			<div className="flex justify-between flex-row items-center mb-2">
				<h2 className="text-2xl text-black dark:text-white">My Legislators</h2>
				{mode === "view" && (
					<Button variant="link" onClick={() => setMode("edit")}>
						Update
					</Button>
				)}
			</div>
			{mode === "edit" && <PrivateInfoLabel />}

			<div>
				{mode === "view" && (
					<>
						{myLegislators.data?.legislators === null && <Label>No legislators found. Try updating your location.</Label>}
						<div className="flex flex-col gap-2">
							{myLegislators.data?.legislators?.map((l) => {
								return (
									<div
										key={l.id}
										className={cn(
											"w-full border rounded-md cursor-pointer p-2",
											{
												"bg-blue-300 dark:bg-blue-950": selectedLegislator?.fullData.id.bioguide === l.id,
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
				{mode === "edit" && <SenderProfileForm onSubmit={() => setMode("view")} onCancel={() => setMode("view")} />}
			</div>
			<Separator orientation="horizontal" className="my-2" />
			{selectedLegislator && (
				<div className="px-3">
					<LegislatorDetails
						legislator={selectedLegislator}
						onActivity={(a) => sendActivity.mutate({ id: templateId, activity: a })}
					/>
				</div>
			)}
		</>
	);
}

function getInitialEditTemplate(template: Tables<"templates"> | null) {
	if (template === null) {
		const queryParams = new URLSearchParams(location.search);
		return {
			message: queryParams.get("message") ?? messagePlaceholder,
			subject: queryParams.get("subject") ?? "",
			title: queryParams.get("title") ?? "",
		};
	}
	return null;
}

function PageWrapper() {
	const { templateId } = Route.useParams();
	const templateQuery = useTemplate(templateId);
	if (templateQuery.isPending) {
		return null;
	}
	return <Page template={templateQuery.data ?? null} />;
}

function Page(props: { template: Tables<"templates"> | null }) {
	const myLegislators = useMyLegislators();
	const [selectedLegislatorId, setSelectedLegislatorId] = useState<string | null>(null);
	const selectedLegislator = myLegislators.data?.legislators?.find((l) => l.id === selectedLegislatorId);
	const senderProfileQuery = useSenderProfile();
	const { templateId } = Route.useParams();

	const [senderCustom, setSenderCustom] = useSessionStorageState<{
		custom?: { [key: string]: string };
		template?: EditableTemplate;
	}>(`${templateId}:sender-custom`, {});
	const template = props.template ? { ...props.template, ...senderCustom.template } : null;
	const { session } = useAuth();
	const [editedTemplate, setEditedTemplate] = useState<EditableTemplate | null>(getInitialEditTemplate(template));
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
		if (!selectedLegislator && myLegislators.isSuccess && myLegislators.data.legislators && myLegislators.data.legislators.length > 0) {
			const legislator = myLegislators.data.legislators[0];
			setSelectedLegislatorId(legislator.id);
		}
	}, [myLegislators, selectedLegislator, setSelectedLegislatorId]);

	const renderedText = (
		engine.parseAndRenderSync(template?.message ?? "", {
			sender: {
				...(senderProfileQuery.data ?? createDefaultSenderProfile()),
				custom: senderCustom.custom,
			},
			legislator: selectedLegislator ?? createPlaceholderLegislator(),
		}) as string
	).replace(/\n{3,}/g, "\n\n");

	const customSenderProperties = engine
		.variableSegmentsSync(template?.message ?? "")
		.filter((s) => s.length === 3 && s[0] === "sender" && s[1] === "custom")
		.map((s) => s[2].toString());

	const usedProperties = engine
		.variableSegmentsSync(template?.message ?? "")
		.filter((s) => s.length > 1 && s[0] === "sender" && s[1] !== "custom")
		.map((s) => s.slice(1));

	const missingProperties = usedProperties.filter((usedProp) => {
		let value: any = senderProfileQuery.data;
		for (let i = 0; i < usedProp.length; ++i) {
			const key = usedProp[i].toString();
			if (value && key in value) {
				value = value[key];
			}
		}
		return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
	});

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
			<div className={cn("flex flex-col-reverse md:flex-row flex-1 items-start", "gap-2")}>
				<div
					id="content1"
					className={cn(
						"w-full gap-x-2 self-stretch",
						"fixed bottom-0 bg-background z-10 items-center grid grid-cols-[auto_1fr]",
						"md:w-72 md:relative md:bg-transparent md:border-0 md:grid-cols-1 md:z-0 md:items-start md:flex md:flex-col md:border-r"
					)}
				>
					<div className="w-full px-3 col-span-2 items-center md:block">
						<div className="flex gap-1 items-center md:hidden w-full">
							<Sheet>
								<SheetTrigger asChild>
									<div className="w-full p-1 m-1 border border-border rounded-md">
										{selectedLegislator && <LegislatorButtonContent legislator={selectedLegislator} />}
									</div>
								</SheetTrigger>
								<SheetContent side="bottom">
									<SheetHeader>
										<SheetDescription>
											<MyLegislatorsCard
												selectedLegislator={selectedLegislator}
												setSelectedLegislatorId={setSelectedLegislatorId}
												templateId={templateId}
											/>
										</SheetDescription>
									</SheetHeader>
								</SheetContent>
							</Sheet>
						</div>
						<div className="hidden md:block">
							<MyLegislatorsCard
								selectedLegislator={selectedLegislator}
								setSelectedLegislatorId={setSelectedLegislatorId}
								templateId={templateId}
							/>
						</div>
					</div>
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

							{customSenderProperties.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="text-xl">Customize</CardTitle>
									</CardHeader>
									<CardContent>
										{customSenderProperties.map((p) => (
											<Fragment key={p}>
												<Label htmlFor={`sender-custom-${p}`}>{camelToSentence(p)}</Label>
												<Input
													id={`sender-custom-${p}`}
													value={senderCustom.custom?.[p]}
													onChange={(e) => setCustomSenderProperty(p, e.target.value ?? "")}
													className="mb-2 mt-1"
												/>
											</Fragment>
										))}
									</CardContent>
								</Card>
							)}

							{missingProperties.length > 0 && (
								<Alert className="border-2 border-orange-500 dark:border-orange-900 dark:text-white">
									<AlertDescription className="flex gap-1 items-center">
										<AlertTriangleIcon />
										<Label>
											The following are used in this message but you have not provided:{" "}
											{missingProperties.map((m) => m.join(".")).join(", ")}
										</Label>
									</AlertDescription>
								</Alert>
							)}

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
										{JSON.stringify(session)}
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
											setEditedTemplate(null);
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
