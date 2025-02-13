import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function ReportIssueLink({ className }: { className?: string }) {
	return (
		<a href="https://contactmycongress.userjot.com/board/bugs" target="_blank">
			<Button variant="link" type="button" className={cn(className)}>
				Report Issue
			</Button>
		</a>
	);
}
