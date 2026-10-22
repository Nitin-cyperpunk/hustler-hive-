import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-cyan text-brand-bg shadow",
        secondary: "border-transparent bg-brand-surface text-brand-text",
        destructive: "border-transparent bg-brand-error text-white shadow",
        outline: "border-brand-border text-brand-text",
        success: "border-transparent bg-brand-success/15 text-brand-success",
        warning: "border-transparent bg-brand-warning/15 text-brand-warning",
        draft: "border-transparent bg-brand-muted/15 text-brand-muted",
        published: "border-transparent bg-brand-cyan/15 text-brand-cyan",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
