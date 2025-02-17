import { createFileRoute, redirect } from "@tanstack/react-router";
import slugify from "slugify";
import { templateQueryOptions } from "./$slug.$templateId";

export const Route = createFileRoute("/messages/$templateId")({
	component: RouteComponent,
	loader: async ({ context: { queryClient }, params }) => {
		const data = await queryClient.ensureQueryData(templateQueryOptions(params.templateId));
		return redirect({
			to: "/messages/$slug/$templateId",
			params: { slug: slugify(data?.title ?? "unknown"), templateId: params.templateId },
		});
	},
});

function RouteComponent() {
	return <div>Hello "/messages/$templateId"!</div>;
}
