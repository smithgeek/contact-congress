import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

function useLogin() {
	const [error, setError] = useState<string | null>(null);
	const signUp = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await supabase.auth.signUp({
				email,
				password,
			});
			console.error(result.error);
			setError(result.error?.message ?? null);
		},
	});
	const signIn = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			console.error(result.error);
			setError(result.error?.message ?? null);
		},
	});
	return {
		signUp,
		signIn,
		error,
	};
}

interface LoginFormState {
	email: string;
	password: string;
}

export function LoginFormDialog({ children }: { children: ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent>
				<LoginForm />
			</DialogContent>
		</Dialog>
	);
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const [mode, setMode] = useState<"login" | "signup">("login");
	const { signUp, signIn, error } = useLogin();
	const { handleSubmit, register } = useForm<LoginFormState>();

	function onSubmit(form: LoginFormState) {
		if (mode === "signup") {
			signUp.mutate({
				email: form.email,
				password: form.password,
			});
		} else {
			signIn.mutate({
				email: form.email,
				password: form.password,
			});
		}
	}
	return (
		<>
			<DialogTitle className="text-2xl">{mode === "login" ? "Login" : "Sign up"}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)} {...props}>
				<div className="flex flex-col gap-6">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" required {...register("email")} />
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>
							{mode === "login" && (
								<a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
									Forgot your password?
								</a>
							)}
						</div>
						<Input id="password" type="password" required {...register("password")} />
					</div>
					{error && <Label className="text-red-500">{error}</Label>}
					<Button type="submit" className="w-full" pending={mode === "signup" ? signUp.isPending : signIn.isPending}>
						{mode === "login" ? <span>Login</span> : <span>Create Account</span>}
					</Button>
				</div>
				<div className="mt-4 text-center text-sm">
					<span>{mode === "login" ? "Don't" : "Already"} have an account?</span>
					{mode === "login" && (
						<Button type="button" variant="link" onClick={() => setMode("signup")}>
							Sign Up
						</Button>
					)}
					{mode === "signup" && (
						<Button type="button" variant="link" onClick={() => setMode("login")}>
							Login
						</Button>
					)}
				</div>
			</form>
		</>
	);
}
