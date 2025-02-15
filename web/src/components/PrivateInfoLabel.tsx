import { PrivacyContentDialog } from "./PrivacyContent";
import { Label } from "./ui/label";

export function PrivateInfoLabel() {
	return (
		<Label className="text-muted-foreground">
			<span>We keep your information private</span>
			<PrivacyContentDialog />
		</Label>
	);
}
