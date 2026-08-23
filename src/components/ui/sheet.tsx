import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content> & { side?: "left" | "right" }
>(({ side = "right", className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-4 bg-panel border-border p-6 shadow-lg transition data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "right" ? "inset-y-0 right-0 w-[300px] border-l" : "inset-y-0 left-0 w-[300px] border-r",
        className
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-bg-0 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
))
SheetContent.displayName = Dialog.Content.displayName

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1 text-center sm:text-left", className)} {...props} />
)
export const SheetTitle = React.forwardRef<React.ElementRef<typeof Dialog.Title>, React.ComponentPropsWithoutRef<typeof Dialog.Title>>(
  ({ className, ...props }, ref) => <Dialog.Title ref={ref} className={cn("text-lg font-semibold text-text", className)} {...props} />
)
SheetTitle.displayName = Dialog.Title.displayName
