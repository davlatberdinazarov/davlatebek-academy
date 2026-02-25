import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border border-primary/40 bg-gradient-to-r from-violet-500 to-blue-500 text-primary-foreground shadow-[0_0_18px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_30px_rgba(96,165,250,0.5)]",
        secondary:
          "border border-black/10 bg-black/[0.03] text-secondary-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:bg-black/[0.06] dark:border-white/15 dark:bg-white/8 dark:hover:bg-white/14",
        outline:
          "border border-black/20 bg-transparent text-foreground hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/10 dark:border-white/20"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
