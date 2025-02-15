import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
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
				<CardContent className="flex flex-col gap-8">
					<section>
						<h2 className="text-xl text-muted-foreground">Address</h2>
						<p>
							We send the address you provide to census.gov to determine your congressional district. This information is
							never stored or linked to any other data on our servers. The data is only stored in your browser and you can
							reset it at any time. This data is also used to complete message templates that other users have created.
						</p>
					</section>
					<section>
						<h2 className="text-xl text-muted-foreground">Name and Phone Number</h2>
						<p>
							This information is never stored or linked to any other data on our servers. The data is only stored in your
							browser and you can reset it at any time. This data is also used to complete message templates that other users
							have created.
						</p>
					</section>
					<section>
						<h2 className="text-xl text-muted-foreground">Email</h2>
						<p>
							If you create an account the email address you used during signup is stored along with a hashed version of your
							password that we are not able to reverse. (Feel free to use a disposable email address when signing up.) The
							email address you enter when filling out your legislators profile is never stored or linked to any other data on
							our servers. The data is only stored in your browser and you can reset it at any time. This data is also used to
							complete message templates that other users have created.
						</p>
					</section>
					<section>
						<h2 className="text-xl text-muted-foreground">Likes, Shares, and Interactions</h2>
						<p>
							If you like or a share a message we track that this event has happened and if you've filled out your legislator
							profile we'll record what state and congressional district along with it. Your individual information is not
							stored with this data. We keep this information to help show what topics are trending in your state and/or
							district.
						</p>
					</section>
					<section>
						<h2 className="text-xl text-muted-foreground">Messages</h2>
						<p>
							If you create an account and then create a new message (either public or private) that information is stored on
							our servers. You can delete this message at any time.
						</p>
						<p>
							If you are customizing a message that you didn't create, all of your changes are only stored in your browser and
							are erased when your browser is closed. These changes never touch our servers.
						</p>
					</section>
				</CardContent>
			</Card>
		</div>
	);
}
