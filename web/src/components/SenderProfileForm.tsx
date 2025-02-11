import { SenderProfile, useSenderProfile } from "@/lib/useSenderProfile";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SenderProfileForm({
	onSubmit,
	defaultSenderProfile,
	showReset,
}: {
	onSubmit: (senderProfile: SenderProfile | null) => void;
	defaultSenderProfile?: SenderProfile | null;
	showReset?: boolean;
}) {
	const { setSenderProfile } = useSenderProfile();
	const { register, handleSubmit, reset } = useForm<SenderProfile>({
		defaultValues: defaultSenderProfile ?? {},
	});
	return (
		<form
			className="flex flex-col gap-1"
			onSubmit={handleSubmit((profile) => {
				setSenderProfile(profile);
				onSubmit(profile);
			})}
		>
			<Label className="text-muted-foreground">
				<span>We keep your information private</span>
				<Dialog>
					<DialogTrigger>
						<Button type="button" variant="link">
							Learn More
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Privacy</DialogTitle>
						</DialogHeader>
						We respect your privacy. The information you enter is only stored in your browser and never saved on a server. Your
						name, email, and phone number are used solely for inserting personal details into messages and are not shared or
						stored elsewhere. Address information is sent to a separate service only to look up your congressional district, but
						it is never stored or linked to any other data.
					</DialogContent>
				</Dialog>
			</Label>
			<Label htmlFor="name">Name</Label>
			<Input id="name" {...register("name")} />
			<Label>Address</Label>
			<fieldset className="grid grid-cols-2 gap-2">
				<Input placeholder="Street" id="address.street" {...register("address.street")} />
				<Input placeholder="City" id="address.city" {...register("address.city")} />
				<Input placeholder="State" id="address.state" {...register("address.state")} />
				<Input placeholder="Zip" id="address.zip" {...register("address.zip")} />
			</fieldset>
			<Label htmlFor="email">Email</Label>
			<Input id="email" {...register("email")} />
			<Label htmlFor="phoneNumber">Phone Number</Label>
			<Input id="phoneNumber" {...register("phoneNumber")} />
			<div className="flex justify-between">
				{showReset && (
					<Button
						theme="danger"
						onClick={() => {
							onSubmit(null);
							reset();
						}}
						type="button"
					>
						Reset
					</Button>
				)}
				<Button type="submit">Ok</Button>
			</div>
		</form>
	);
}
