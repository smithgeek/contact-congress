import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

function useBrowserType() {
	return useQuery({
		queryKey: ["browserType"],
		queryFn: async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const n = navigator as any;
			if (n.userAgentData) {
				const data = await n.userAgentData.getHighEntropyValues(["brands"]);
				const isChrome = data.brands.some(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(brand: any) => brand.brand.includes("Chromium") || brand.brand.includes("Google Chrome")
				);
				if (isChrome) {
					return "chrome";
				}
			}
			if (navigator.userAgent.toLowerCase().includes("firefox")) {
				return "firefox";
			}
			return "unknown";
		},
	});
}

export function BrowserExtensionCard() {
	const browserTypeQuery = useBrowserType();
	if (browserTypeQuery.data === "unknown") {
		return null;
	}
	return (
		<Card className="mt-12">
			<CardHeader>
				<CardTitle className="text-xl">Want a shortcut?</CardTitle>
				<CardDescription>
					It's even easier to send emails to your representatives with our browser extension. Just click the contact button and
					we'll fill in the form for you.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{browserTypeQuery.data === "firefox" && (
					<a href="https://addons.mozilla.org/en-US/firefox/addon/contact-my-congress/" target="_blank" rel="noreferrer">
						<img src="/images/get-firefox-addon.png" alt="Install firefox extension" style={{ width: "172px" }} />
					</a>
				)}
				{browserTypeQuery.data === "chrome" && (
					<a
						href="https://chromewebstore.google.com/detail/contact-my-congress/pgpdcadmlmiokkghnhpndfifnaldgfca"
						target="_blank"
						rel="noreferrer"
					>
						<img src="/images/get-chrome-addon.png" alt="Install firefox extension" style={{ width: "172px" }} />
					</a>
				)}
			</CardContent>
		</Card>
	);
}
