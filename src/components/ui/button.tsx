
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        purple: "bg-[#9b87f5] text-white hover:bg-[#7E69AB] shadow-md hover:shadow-lg active:scale-[0.98]",
        glass: "bg-background/80 backdrop-blur-md border border-border/30 shadow-sm hover:shadow-md hover:bg-background/90 active:scale-[0.98]",
        rose: "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200/50 shadow-sm hover:shadow-md active:scale-[0.98]",
        lavender: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/50 shadow-sm hover:shadow-md active:scale-[0.98]",
        mint: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/50 shadow-sm hover:shadow-md active:scale-[0.98]",
        peach: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/50 shadow-sm hover:shadow-md active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-11 w-11 rounded-full p-0 [&_svg]:size-5",
        "icon-sm": "h-9 w-9 rounded-full p-0 [&_svg]:size-4",
        "icon-lg": "h-14 w-14 rounded-full p-0 [&_svg]:size-6",
        pill: "h-11 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
