import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { createVariantsValidator } from "@/lib/createVariantsValidator";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variantConfig = {
	button: {
		variants: {
			theme: {
				default: "",
				success: "",
				warning: "",
				danger: "",
				secondary: "",
			},
			variant: {
				default: "",
				outline: "border bg-transparent",
				ghost: "",
				link: "underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				xs: "h-6 px-1 py-4 rounded-md",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			theme: "default",
		} as const,
	},
	pending: {
		variants: {
			pendingLocation: {
				center: "justify-center",
				start: "justify-start pl-1",
				end: "justify-end pr-1",
			},
			variant: {
				default: "bg-black/[.6]",
				outline: "bg-transparent",
				ghost: "bg-black/[.6]",
				link: "bg-transparent",
			},
		},
		defaultVariants: {
			pendingLocation: "center",
			variant: "default",
		} as const,
	},
};

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
	{
		...variantConfig.button,
		compoundVariants: [
			{
				variant: "default",
				theme: "default",
				className: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/70",
			},
			{
				variant: "default",
				theme: "success",
				className:
					"bg-success text-success-foreground hover:bg-success/90 active:bg-success/70 focus:ring-success active:ring-success/80",
			},
			{
				variant: "default",
				theme: "warning",
				className:
					"bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/70 focus:ring-warning active:ring-warning/80",
			},
			{
				variant: "default",
				theme: "danger",
				className:
					"bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/70 focus:ring-danger active:ring-danger/80",
			},
			{
				variant: "default",
				theme: "secondary",
				className: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
			},

			{
				variant: "outline",
				theme: "default",
				className: "hover:bg-primary/20 border-primary active:bg-primary/80",
			},
			{
				variant: "outline",
				theme: "success",
				className: "hover:bg-success/20 border-success active:bg-success/50",
			},
			{
				variant: "outline",
				theme: "warning",
				class: "hover:bg-warning/20 border-warning active:bg-warning/50",
			},
			{
				variant: "outline",
				theme: "danger",
				className: "hover:bg-danger/20 border-danger active:bg-danger/50",
			},
			{
				variant: "outline",
				theme: "secondary",
				className: "hover:bg-secondary/20 border-secondary active:bg-secondary/50",
			},

			{
				variant: "ghost",
				theme: "default",
				className: "hover:bg-primary/50 active:bg-primary/90 active:text-primary-foreground",
			},
			{
				variant: "ghost",
				theme: "success",
				className: "hover:bg-success/50 active:bg-success/90 active:text-success-foreground",
			},
			{
				variant: "ghost",
				theme: "warning",
				class: "hover:bg-warning/50 active:bg-warning/90 active:text-warning-foreground",
			},
			{
				variant: "ghost",
				theme: "danger",
				className: "hover:bg-danger/50 active:bg-danger/90 active:text-danger-foreground",
			},
			{
				variant: "ghost",
				theme: "secondary",
				className: "hover:bg-secondary/50 active:bg-secondary/90 active:text-secondary-foreground",
			},

			{
				variant: "link",
				theme: "default",
				className: "text-primary decoration-primary hover:text-primary",
			},
			{
				variant: "link",
				theme: "success",
				className: "text-foreground decoration-success hover:text-success",
			},
			{
				variant: "link",
				theme: "warning",
				class: "text-foreground decoration-warning hover:text-warning",
			},
			{
				variant: "link",
				theme: "danger",
				className: "text-foreground decoration-danger hover:text-danger",
			},
			{
				variant: "link",
				theme: "secondary",
				className: "text-foreground decoration-secondary hover:text-secondary",
			},
		],
	}
);

const pendingVariants = cva("absolute top-0 bottom-0 right-0 left-0 flex justify-end items-center rounded-md ", variantConfig.pending);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants>,
		VariantProps<typeof pendingVariants> {
	asChild?: boolean;
	pending?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, children, disabled, pending, theme, pendingLocation, type, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className, theme }))}
				disabled={(disabled ?? false) || pending}
				type={type ?? "button"}
				ref={ref}
				{...props}
			>
				{children}
				{pending && (
					<div className={cn(pendingVariants({ pendingLocation, variant }))}>
						<Loader2 className="animate-spin" />
					</div>
				)}
			</Comp>
		);
	}
);
Button.displayName = "Button";

const buttonVariantValidators = {
	variant: createVariantsValidator(variantConfig.button.variants, "variant", variantConfig.button.defaultVariants.variant),
	theme: createVariantsValidator(variantConfig.button.variants, "theme", variantConfig.button.defaultVariants.theme),
	size: createVariantsValidator(variantConfig.button.variants, "size", variantConfig.button.defaultVariants.size),
	pendingLocation: createVariantsValidator(
		variantConfig.pending.variants,
		"pendingLocation",
		variantConfig.pending.defaultVariants.pendingLocation
	),
};

export { Button, buttonVariants, buttonVariantValidators };
