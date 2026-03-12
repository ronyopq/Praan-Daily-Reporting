import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-4 border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-[color:var(--app-primary)] focus-visible:ring-4 focus-visible:ring-[color:rgba(15,118,110,0.14)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
