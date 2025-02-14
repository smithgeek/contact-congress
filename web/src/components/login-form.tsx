import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

import { useAuth } from "@/lib/useAuth";
import { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ReportIssueLink } from "./ReportIssueLink";
import { CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

type DisplayModes = "login" | "signup" | "checkEmail" | "authenticated" | "forgotPassword";

function getErrorMessage(error: AuthError) {
	if (error.code == "unexpected_failure") {
		return "Oops, there was an error. Please try again later.";
	}
	return error.message;
}

function useLogin() {
	const [error, setError] = useState<string | null>(null);
	const [emailMessage, setEmailMessage] = useState("Check your email to verify your account");
	const [mode, setMode] = useState<DisplayModes>("login");
	const signUp = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await supabase.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: location.href },
			});
			if (result.error) {
				console.error(result.error);
				setError(getErrorMessage(result.error));
			} else {
				setEmailMessage("Check your email to verify your account");
				setMode("checkEmail");
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
				setError(getErrorMessage(result.error));
			} else {
				setMode("authenticated");
			}
		},
	});
	const resetPassword = useMutation({
		mutationFn: async ({ email }: { email: string }) => {
			const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/account` });
			if (result.error) {
				console.error(result.error);
				setError(getErrorMessage(result.error));
			} else {
				setEmailMessage("Check your email to reset your password");
				setMode("checkEmail");
			}
		},
	});
	return {
		signUp,
		signIn,
		error,
		mode,
		setMode,
		resetPassword,
		emailMessage,
	};
}

interface LoginFormState {
	email: string;
	password: string;
}

export function LoginFormDialog({ children }: { children?: ReactNode }) {
	const [open, setOpen] = useState(false);
	const { session } = useAuth();

	useEffect(() => {
		if (session?.user) {
			setOpen(false);
		}
	}, [session?.user]);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children ?? (
					<Button variant={"link"} className="m-0 p-0">
						Log in
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<LoginForm titleType="dialog" />
			</DialogContent>
		</Dialog>
	);
}

function getTitle(mode: DisplayModes) {
	if (mode === "forgotPassword") {
		return "Password Reset";
	}
	if (mode === "signup") {
		return "Sign up";
	}
	if (mode === "checkEmail") {
		return "Email";
	}
	return "Login";
}

function getButtonAction(mode: DisplayModes) {
	if (mode === "forgotPassword") {
		return "Reset Password";
	}
	if (mode === "signup") {
		return "Create Account";
	}
	return "Login";
}

export function LoginForm({ className, titleType, ...props }: React.ComponentPropsWithoutRef<"form"> & { titleType?: "dialog" | "card" }) {
	const { signUp, signIn, error, mode, setMode, resetPassword, emailMessage } = useLogin();
	const { handleSubmit, register } = useForm<LoginFormState>();

	let pending = signIn.isPending;
	if (mode === "signup") {
		pending = signUp.isPending;
	} else if (mode === "forgotPassword") {
		pending = resetPassword.isPending;
	}
	function onSubmit(form: LoginFormState) {
		if (mode === "signup") {
			signUp.mutate({
				email: form.email,
				password: form.password,
			});
		} else if (mode === "login") {
			signIn.mutate({
				email: form.email,
				password: form.password,
			});
		} else if (mode === "forgotPassword") {
			resetPassword.mutate({ email: form.email });
		}
	}
	return (
		<>
			{titleType === "dialog" && <DialogTitle className="text-2xl">{getTitle(mode)}</DialogTitle>}
			{titleType === "card" && (
				<CardHeader>
					<CardTitle className="text-2xl">{getTitle(mode)}</CardTitle>
				</CardHeader>
			)}
			{titleType === undefined && <div className="text-2xl">{getTitle(mode)}</div>}
			{mode === "checkEmail" && <Label>{emailMessage}</Label>}
			{mode !== "checkEmail" && (
				<form onSubmit={handleSubmit(onSubmit)} {...props}>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" required {...register("email")} tabIndex={1} />
						</div>
						{mode !== "forgotPassword" && (
							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									{mode === "login" && (
										<Button variant="link" tabIndex={4} onClick={() => setMode("forgotPassword")}>
											Forgot your password?
										</Button>
									)}
								</div>
								<Input id="password" type="password" required {...register("password")} tabIndex={2} />
							</div>
						)}
						{error && (
							<div className="flex justify-between items-center">
								<Label className="text-red-500">{error}</Label>
								<ReportIssueLink />
							</div>
						)}
						<Button type="submit" className="w-full" pending={pending} tabIndex={3}>
							<span>{getButtonAction(mode)}</span>
						</Button>
					</div>
					<div className="mt-4 text-center text-sm">
						<span>{mode === "login" ? "Don't" : "Already"} have an account?</span>
						{mode === "login" && (
							<Button type="button" variant="link" onClick={() => setMode("signup")} disabled={pending} tabIndex={5}>
								Sign Up
							</Button>
						)}
						{mode !== "login" && (
							<Button type="button" variant="link" onClick={() => setMode("login")} disabled={pending} tabIndex={6}>
								Login
							</Button>
						)}
					</div>
				</form>
			)}
		</>
	);
}
