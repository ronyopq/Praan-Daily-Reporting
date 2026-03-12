"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4 border text-sm font-semibold whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-transparent text-white shadow-sm hover:-translate-y-0.5",
        outline: "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950",
        secondary: "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        destructive: "border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5",
        link: "rounded-0 border-0 bg-transparent px-0 text-[color:var(--app-primary)] shadow-none hover:text-[color:var(--app-primary-strong)]",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-8 gap-1.5 px-3 text-xs",
        sm: "h-9 gap-1.5 px-3.5 text-[0.82rem]",
        lg: "h-11 gap-2 px-4.5",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        variant === "default" && "bg-[linear-gradient(135deg,var(--app-primary-strong),var(--app-primary))]",
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
