import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

import { useAuth } from "@/lib/useAuth";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

function useLogin() {
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<"login" | "signup" | "verifyEmail" | "authenticated">("login");
	const signUp = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await supabase.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: location.href },
			});
			if (result.error) {
				console.error(result.error);
				setError(result.error?.message ?? null);
			}
		},
	});
	const signIn = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (result.error) {
				console.error(result.error);
				setError(result.error?.message ?? null);
			} else {
				setMode("authenticated");
			}
		},
	});
	return {
		signUp,
		signIn,
		error,
		mode,
		setMode,
	};
}

interface LoginFormState {
	email: string;
	password: string;
}

export function LoginFormDialog({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const { session } = useAuth();

	useEffect(() => {
		if (session?.user) {
			setOpen(false);
		}
	}, [session]);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent>
				<LoginForm />
			</DialogContent>
		</Dialog>
	);
}

function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const { signUp, signIn, error, mode, setMode } = useLogin();
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
			{mode === "verifyEmail" && <Label>Check your email to verify your account</Label>}
			{mode !== "verifyEmail" && (
				<form onSubmit={handleSubmit(onSubmit)} {...props}>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" required {...register("email")} tabIndex={1} />
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
								{mode === "login" && (
									<a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline" tabIndex={4}>
										Forgot your password?
									</a>
								)}
							</div>
							<Input id="password" type="password" required {...register("password")} tabIndex={2} />
						</div>
						{error && <Label className="text-red-500">{error}</Label>}
						<Button
							type="submit"
							className="w-full"
							pending={mode === "signup" ? signUp.isPending : signIn.isPending}
							tabIndex={3}
						>
							{mode === "login" ? <span>Login</span> : <span>Create Account</span>}
						</Button>
					</div>
					<div className="mt-4 text-center text-sm">
						<span>{mode === "login" ? "Don't" : "Already"} have an account?</span>
						{mode === "login" && (
							<Button type="button" variant="link" onClick={() => setMode("signup")} pending={signUp.isPending} tabIndex={5}>
								Sign Up
							</Button>
						)}
						{mode === "signup" && (
							<Button type="button" variant="link" onClick={() => setMode("login")} pending={signIn.isPending} tabIndex={6}>
								Login
							</Button>
						)}
					</div>
				</form>
			)}
		</>
	);
}
