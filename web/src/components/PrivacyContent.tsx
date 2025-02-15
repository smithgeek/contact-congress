import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export function PrivacyContent() {
	return (
		<div className="flex flex-col gap-8">
			<section>
				<h2 className="text-xl text-muted-foreground">Address</h2>
				<p>
					We send the address you provide to census.gov to determine your congressional district. This information is never stored
					or linked to any other data on our servers. The data is only stored in your browser and you can reset it at any time.
					This data is also used to complete message templates that other users have created.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">Name and Phone Number</h2>
				<p>
					This information is never stored or linked to any other data on our servers. The data is only stored in your browser and
					you can reset it at any time. This data is also used to complete message templates that other users have created.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">Email</h2>
				<p>
					If you create an account the email address you used during signup is stored along with a hashed version of your password
					that we are not able to reverse. (Feel free to use a disposable email address when signing up.)
				</p>
				<p>
					The email address you enter when filling out your legislators profile is never stored or linked to any other data on our
					servers. The data is only stored in your browser and you can reset it at any time. This data is also used to complete
					message templates that other users have created.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">Likes, Shares, and Interactions</h2>
				<p>
					If you like or a share a message we track that this event has happened and if you've filled out your legislator profile
					we'll record what state and congressional district along with it. Your individual information is not stored with this
					data. We keep this information to help show what topics are trending in your state and/or district.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">Messages</h2>
				<p>
					If you create an account and then create a new message (either public or private) that information is stored on our
					servers. You can delete this message at any time.
				</p>
				<p>
					If you are customizing a message that you didn't create, all of your changes are only stored in your browser and are
					erased when your browser is closed. These changes never touch our servers.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">Analytics</h2>
				<p>
					We track the number of times a page is viewed, the screen size, browser, operating system, country, and referrer. This
					information is not associated with individual users or IP addresses. We use
					<a href="https://plausible.io/" target="_blank" rel="noreferrer">
						<Button variant="inlineLink">plausible</Button>
					</a>
					which is a privacy focused analytics platform. We may track other information to understand how the site is used without
					tracking any information you enter or who is using the site.
				</p>
			</section>
			<section>
				<h2 className="text-xl text-muted-foreground">See for yourself</h2>
				<p>
					This site is open source and you can see all the code for yourself on
					<a href="https://github.com/smithgeek/contact-congress" target="_blank" rel="noreferrer">
						<Button variant="inlineLink">GitHub</Button>
					</a>
					.
				</p>
			</section>
		</div>
	);
}

export function PrivacyContentDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link" className="px-0 mx-2">
					Privacy Policy
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[90vw] max-w-7xl h-[80vh]">
				<DialogHeader>
					<DialogTitle>Privacy Policy</DialogTitle>
				</DialogHeader>
				<ScrollArea>
					<PrivacyContent />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
