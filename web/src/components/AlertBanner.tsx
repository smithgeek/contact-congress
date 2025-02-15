import { cn } from "@/lib/utils";
import { ReactNode } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function AlertBanner({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<Alert
			className={cn("border-2 bg-orange-500 dark:bg-orange-900 border-orange-500 dark:border-orange-900 dark:text-white", className)}
		>
			<AlertDescription className="flex gap-1 items-center">
				<AlertTriangleIcon />
				{children}
			</AlertDescription>
		</Alert>
	);
}
