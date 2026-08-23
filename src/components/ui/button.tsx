import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-bg-0 hover:bg-primary/90",
        gold: "bg-primary text-bg-0 hover:bg-primary/90 shadow-[0_0_20px_rgba(251,191,36,.25)]",
        ghost: "border border-border text-dim hover:text-text hover:border-border-strong bg-transparent",
        primary: "bg-primary text-bg-0 hover:bg-primary-2",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-10 px-7",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = "Button"
export { buttonVariants }
