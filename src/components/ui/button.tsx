import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-sunrise-coral/40",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-sunrise-coral px-8 py-[15px] text-[15px] font-bold tracking-[-0.009em] text-paper-white hover:bg-[#e85424]",
        secondary:
          "rounded-full bg-secondary text-secondary-foreground px-8 py-[15px] text-[15px] font-bold tracking-[-0.009em] hover:bg-secondary/80",
        outline:
          "rounded-full border border-border bg-card px-8 py-[15px] text-[15px] font-bold tracking-[-0.009em] text-foreground hover:bg-muted",
        ghost:
          "rounded-full px-3 py-2 text-[15px] font-normal tracking-[-0.005em] text-foreground underline-offset-4 hover:underline hover:text-foreground/80",
        link: "text-[15px] font-normal text-foreground underline-offset-4 hover:underline hover:text-foreground/80",
        nav: "rounded-full bg-sunrise-coral px-5 py-2.5 text-[13px] font-bold tracking-[-0.005em] text-paper-white hover:bg-[#e85424]",
        destructive:
          "rounded-full bg-destructive px-8 py-[15px] text-[15px] font-bold text-white hover:opacity-90",
      },
      size: {
        default: "",
        sm: "px-5 py-2.5 text-[13px]",
        lg: "px-10 py-4 text-[17px]",
        icon: "size-10 rounded-full p-0",
        "icon-sm": "size-8 rounded-full p-0",
        "icon-lg": "size-11 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
