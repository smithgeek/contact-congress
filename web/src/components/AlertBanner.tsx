import { cn } from "@/lib/utils";
import { ReactNode } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function AlertBanner({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<Alert className={cn("bg-orange-500 dark:bg-orange-900 dark:text-white px-2", className)}>
			<AlertDescription className="flex gap-2 items-center">
				<AlertTriangleIcon className="size-8 flex-none" />
				{children}
			</AlertDescription>
		</Alert>
	);
}
