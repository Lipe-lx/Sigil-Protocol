import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variants = {
      default: "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]",
      outline: "border border-zinc-800 bg-transparent hover:bg-zinc-900 active:scale-[0.98]",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-[0.98]",
      ghost: "hover:bg-zinc-900 active:scale-[0.98]"
    }
    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-14 px-8 text-lg",
      icon: "h-10 w-10"
    }
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-none text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variants[variant as keyof typeof variants],
          sizes[size as keyof typeof sizes],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
