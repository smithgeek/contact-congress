import { PrivacyContent } from "@/components/PrivacyContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Privacy Policy | Contact My Congress",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<div className="flex justify-center mt-4">
			<Card className="max-w-7xl w-full">
				<CardHeader>
					<CardTitle className="text-2xl">
						<h1>Privacy Policy</h1>
					</CardTitle>
					<CardDescription>What do we do with your data?</CardDescription>
				</CardHeader>
				<CardContent>
					<PrivacyContent />
				</CardContent>
			</Card>
		</div>
	);
}
