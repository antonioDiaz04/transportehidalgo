import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Changed from 'rounded-[10%]' to 'rounded-sm' for a subtle corner radius
          "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-base shadow-sm transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground placeholder:transition-opacity placeholder:duration-200 placeholder:ease-in-out focus:placeholder:opacity-70",
          "focus-visible:outline-none focus-visible:border-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[error=true]:border-destructive data-[error=true]:shadow-destructive/25",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }