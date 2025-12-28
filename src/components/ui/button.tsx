import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-secondary hover:text-secondary-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
        farcaster: "bg-farcaster text-foreground font-semibold hover:bg-farcaster/90 shadow-lg hover:shadow-xl hover:shadow-farcaster/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5",
        hero: "bg-gradient-to-r from-farcaster to-accent text-foreground font-display font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-farcaster/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:brightness-110",
        tier: "font-display font-bold text-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-2xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
