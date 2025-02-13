/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { copycat } from "@snaplet/copycat";
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
	const seed = await createSeedClient({ dryRun: true });

	// Truncate all tables in the database
	await seed.$resetDatabase();

	await seed.users(x =>
		x(2, modelCtx => ({
			email:
				modelCtx.index === 0
					? "test@example.com"
					: ctx =>
							copycat.email(ctx.seed, {
								domain: "example.com",
							}),
			encrypted_password:
				"$2a$10$y2vvQYePHrHWt66kB9BVMODWGR29DBLBa9ZTm17OVRCCmw5a83qlm",
		}))
	);

	await seed.templates(x =>
		x(20, modelCtx => {
			if (modelCtx.index === 0) {
				return {
					title: "A Call for Congressional Action to Reverse Harmful Tariffs",
					subject: "Please Support the STABLE Trade Policy Act",
					message: `Dear {{legislator.name}},

I am writing to express my strong support for the Stopping Tariffs on Allies and Bolstering Legislative Exercise of (STABLE) Trade Policy Act, introduced by Senators Tim Kaine and Chris Coons. The recent tariffs imposed by the administration are a deeply concerning policy decision that increases costs for American consumers and businesses. This legislation would ensure that Congress has the authority to review and reverse such tariffs, preventing unnecessary economic strain on American households.

For decades, economists across the political spectrum have warned about the negative consequences of tariffs. Protectionist trade measures have historically contributed to economic downturns, as seen during the Great Depression. Even advisors within the administration have voiced concerns over these policies. Congress must have a way to counteract decisions that place undue burdens on businesses and families.

Trade policies should strengthen our economy and reinforce relationships with our allies—not create unnecessary financial hardship. The STABLE Trade Policy Act is a critical step in ensuring that trade decisions reflect sound economic principles rather than unilateral action. I urge you to support this legislation and advocate for its swift passage.

{{sender.custom.personalMessage}}

Thank you for your time and consideration. I appreciate your leadership and look forward to your response.

Best regards,
{{sender.name}}
{{sender.address.street}} {{sender.address.city}}, {{sender.address.state}} {{sender.address.zip}}`,
					template_activity: x =>
						x(100, c => ({
							action: "favorite",
							state: "MO",
							district: "4",
						})),
				};
			}
			return {
				title: ctx => copycat.sentence(ctx.seed),
				subject: ctx => copycat.sentence(ctx.seed),
				message: ctx => copycat.paragraph(ctx.seed),
				template_activity: x =>
					x({ min: 1, max: 30 }, ctx => ({
						state: copycat.oneOfString(ctx.seed, [
							"AL",
							"AK",
							"AZ",
							"AR",
							"CA",
							"CO",
							"CT",
							"DE",
							"FL",
							"GA",
							"HI",
							"ID",
							"IL",
							"IN",
							"IA",
							"KS",
							"KY",
							"LA",
							"ME",
							"MD",
							"MA",
							"MI",
							"MN",
							"MS",
							"MO",
							"MT",
							"NE",
							"NV",
							"NH",
							"NJ",
							"NM",
							"NY",
							"NC",
							"ND",
							"OH",
							"OK",
							"OR",
							"PA",
							"RI",
							"SC",
							"SD",
							"TN",
							"TX",
							"UT",
							"VT",
							"VA",
							"WA",
							"WV",
							"WI",
							"WY",
						]),
						district: copycat
							.int(ctx.seed, { min: 1, max: 60 })
							.toString(),
					})),
			};
		})
	);

	// Type completion not working? You might want to reload your TypeScript Server to pick up the changes

	process.exit();
};

main();
