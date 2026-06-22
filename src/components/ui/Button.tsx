import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[4px] text-sm font-mono tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/50 hover:bg-[#00ff88]/20 shadow-[0_0_10px_rgba(0,255,136,0.2)] hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        outline: "border border-[#00ff88]/20 bg-transparent text-[#00ff88]/70 hover:text-[#00ff88] hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 shadow-[inset_0_0_5px_rgba(0,255,136,0.1)]",
        secondary: "bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/50 hover:bg-[#00e5ff]/20 shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]",
        ghost: "hover:bg-[#00ff88]/10 hover:text-[#00ff88]",
        link: "text-[#00ff88] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[4px] px-3",
        lg: "h-11 rounded-[4px] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
