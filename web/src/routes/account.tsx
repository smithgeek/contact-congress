import { LoginFormDialog } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Authenticated, NotAuthenticated, useAuth } from "@/lib/useAuth";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
	component: RouteComponent,
});

interface UserAccountForm {
	email: string;
	password: string;
}

function useUpdateUser() {
	const [message, setMessage] = useState<string | null>(null);
	const mutation = useMutation({
		mutationFn: async (form: UserAccountForm) => {
			const result = await supabase.auth.updateUser({
				email: form.email,
				password: form.password.trim().length > 0 ? form.password : undefined,
			});
			if (result.error) {
				setMessage(result.error.message);
			} else {
				setMessage(null);
				toast.success("User updated");
			}
		},
	});
	return {
		mutation,
		message,
	};
}

function RouteComponent() {
	const { session } = useAuth();

	const { register, handleSubmit } = useForm<UserAccountForm>({
		defaultValues: {
			email: session?.user.email,
			password: "",
		},
	});
	const { mutation: updateUser, message } = useUpdateUser();

	function submit(form: UserAccountForm) {
		updateUser.mutate(form);
	}
	return (
		<div className="flex justify-center mt-4">
			<Card className="max-w-7xl w-full">
				<CardContent>
					<CardHeader>
						<CardTitle className="text-2xl">User</CardTitle>
						<CardDescription>User account information</CardDescription>
					</CardHeader>
					<Authenticated>
						<form className="flex flex-col gap-2" onSubmit={handleSubmit(submit)}>
							<fieldset>
								<Label htmlFor="email">Email</Label>
								<Input id="email" {...register("email")} />
							</fieldset>
							<fieldset>
								<Label htmlFor="password">Password</Label>
								<Input id="password" type="password" {...register("password")} />
							</fieldset>
							{message && <Label className="text-red-500">{message}</Label>}
							<Button type="submit" pending={updateUser.isPending} className="self-start">
								Save
							</Button>
						</form>
					</Authenticated>
					<NotAuthenticated>
						<LoginFormDialog>
							<Button>Login</Button>
						</LoginFormDialog>
					</NotAuthenticated>
				</CardContent>
			</Card>
		</div>
	);
}
