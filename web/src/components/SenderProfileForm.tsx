import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { LegislativeDistrict, SenderProfile, useSenderProfile } from "@/lib/useSenderProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SenderProfileForm({
	onSubmit,
	onCancel,
}: {
	onSubmit: (senderProfile: SenderProfile | null) => void;
	onCancel?: () => void;
}) {
	const senderProfileQuery = useSenderProfile();
	const { register, handleSubmit, reset } = useForm<SenderProfile>({
		defaultValues: senderProfileQuery.data ?? {},
	});
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (profile: SenderProfile | null) => {
			if (profile) {
				const address = [profile.address.street, profile.address.city, profile.address.state, profile.address.zip]
					.filter(Boolean)
					.join(" ");
				const response = await supabase.functions.invoke<LegislativeDistrict>("district-lookup", {
					body: { address },
				});
				profile.district = response.data;
				localStorage.setItem(queryKeys.localStorage.senderProfile, JSON.stringify(profile));
			} else {
				for (const key of queryKeys.localStorage.localProfile()) {
					localStorage.removeItem(key);
				}
			}
			queryClient.setQueryData(queryKeys.senderProfile(), profile);
		},
		onSuccess(_, profile) {
			onSubmit(profile);
		},
	});
	return (
		<form
			className="flex flex-col gap-1"
			onSubmit={handleSubmit((profile) => {
				mutation.mutate(profile);
			})}
		>
			<Label htmlFor="name">Name</Label>
			<Input id="name" {...register("name")} />
			<Label>Address</Label>
			<fieldset className="grid grid-cols-2 gap-2">
				<Input placeholder="Street" id="address.street" {...register("address.street")} />
				<Input placeholder="City" id="address.city" {...register("address.city")} />
				<Input placeholder="State" id="address.state" {...register("address.state")} />
				<Input placeholder="Zip" id="address.zip" {...register("address.zip")} />
			</fieldset>
			<Label htmlFor="email">Email</Label>
			<Input id="email" {...register("email")} />
			<Label htmlFor="phoneNumber">Phone Number</Label>
			<Input id="phoneNumber" {...register("phoneNumber")} />
			<div className="flex justify-between mt-4">
				<Button type="submit" pending={mutation.isPending}>
					Save
				</Button>
				<div className="flex gap-2">
					<Button
						theme="danger"
						onClick={() =>
							reset({ name: "", address: { city: "", state: "", street: "", zip: "" }, email: "", phoneNumber: "" })
						}
						type="button"
					>
						Reset
					</Button>
					{onCancel && (
						<Button theme="secondary" onClick={onCancel}>
							Cancel
						</Button>
					)}
				</div>
			</div>
		</form>
	);
}
