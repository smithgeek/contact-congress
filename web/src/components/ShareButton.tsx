import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const canShare = "share" in navigator;

export function ShareButton({
	shareData,
	onClick,
}: {
	shareData: Pick<ShareData, "title" | "text"> & Pick<Required<ShareData>, "url">;
	onClick?: () => void;
}) {
	const [_, copyToClipboard] = useCopyToClipboard();
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => {
				if (canShare) {
					navigator.share(shareData);
				} else {
					copyToClipboard(shareData.url);
					toast.success("Link copied to clipboard");
				}
				onClick?.();
			}}
		>
			<Share2Icon />
		</Button>
	);
}
