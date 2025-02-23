import { Database } from "@/generated/database.types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "./supabase";
import { useSenderProfile } from "./useSenderProfile";

export type Activity = Database["public"]["Enums"]["template_activity_id"];

export function useSendActivity() {
	const senderProfileQuery = useSenderProfile();
	return useMutation({
		mutationFn: async ({ id, activity }: { id: string; activity: Activity }) => {
			await supabase.from("template_activity").insert({
				template_id: id,
				action: activity,
				state: senderProfileQuery.data?.district?.stateAbbreviation,
				district: senderProfileQuery.data?.district?.districtNumber,
			});
		},
	});
}

export function useFlagTemplate() {
	const { mutateAsync } = useSendActivity();
	return useMutation({
		mutationFn: async (id: string) => {
			await mutateAsync({ id, activity: "flag" });
		},
		onSuccess() {
			toast.success("Message has been flagged");
		},
	});
}
