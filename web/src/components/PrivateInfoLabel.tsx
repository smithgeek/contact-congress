import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";

export function PrivateInfoLabel() {
	return (
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
					name, email, and phone number are used solely for inserting personal details into messages and are not shared or stored
					elsewhere. Address information is sent to a separate service only to look up your congressional district, but it is
					never stored or linked to any other data.
				</DialogContent>
			</Dialog>
		</Label>
	);
}
