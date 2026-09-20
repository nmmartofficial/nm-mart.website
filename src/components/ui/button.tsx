import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nm-primary-border)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--nm-primary)] text-white hover:bg-[var(--nm-primary-dark)] active:bg-[var(--nm-primary-dark)]",
        destructive: "bg-[var(--nm-danger)] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]",
        outline: "border border-[var(--nm-primary-border)] bg-white text-[var(--nm-primary)] hover:bg-[var(--nm-primary-light)] hover:text-[var(--nm-primary-dark)] active:bg-[#DCEEFF]",
        secondary: "bg-[var(--nm-primary-light)] text-[var(--nm-primary)] hover:bg-[#DCEEFF] hover:text-[var(--nm-primary-dark)] active:bg-[#DCEEFF]",
        ghost: "text-[var(--nm-primary)] hover:bg-[var(--nm-primary-light)] hover:text-[var(--nm-primary-dark)] active:bg-[#DCEEFF]",
        link: "text-[var(--nm-primary)] underline-offset-4 hover:underline hover:text-[var(--nm-primary-dark)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
