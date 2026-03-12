import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-4 border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-[color:var(--app-primary)] focus-visible:ring-4 focus-visible:ring-[color:rgba(15,118,110,0.14)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
