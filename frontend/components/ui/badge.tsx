'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "success" | "error" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    outline: "border border-zinc-800 text-zinc-400",
    success: "bg-white text-black font-bold",
    error: "bg-red-500 text-white font-bold"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
