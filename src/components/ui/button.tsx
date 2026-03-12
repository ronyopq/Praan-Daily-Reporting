"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4 border text-sm font-semibold whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-[color:rgba(138,115,248,0.3)] bg-[linear-gradient(180deg,var(--app-primary)_0%,var(--app-primary-strong)_100%)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-[0.99]",
        outline: "border-[color:var(--app-line)] bg-white text-[color:var(--app-ink)] shadow-sm hover:bg-[color:var(--app-panel-soft)]",
        secondary: "border-transparent bg-[color:var(--app-primary-soft)] text-[color:var(--app-primary-strong)] hover:bg-[color:#e8e2ff]",
        ghost: "border-transparent bg-transparent text-[color:var(--app-ink-soft)] hover:bg-[color:var(--app-panel-soft)] hover:text-[color:var(--app-ink)]",
        destructive: "border-[color:rgba(220,98,85,0.48)] bg-[color:var(--app-danger)] text-white shadow-sm hover:bg-[#c95447] hover:-translate-y-0.5",
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
