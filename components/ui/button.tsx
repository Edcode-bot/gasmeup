import { cn } from "@/lib/utils"
import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

const buttonVariants = {
  default: "bg-[#FFBF00] text-black hover:bg-[#FFBF00]/90 hover:scale-105 shadow-lg shadow-[#FFBF00]/20",
  secondary: "border border-zinc-200 bg-white text-black hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800",
  ghost: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
  outline: "border border-[#FFBF00] text-[#FFBF00] bg-transparent hover:bg-[#FFBF00]/10",
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]/50 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
