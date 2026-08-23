import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export const DialogRoot = Dialog.Root
export const DialogTrigger = Dialog.Trigger
export const DialogClose = Dialog.Close

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
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
DialogContent.displayName = Dialog.Content.displayName

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
export const DialogTitle = React.forwardRef<React.ElementRef<typeof Dialog.Title>, React.ComponentPropsWithoutRef<typeof Dialog.Title>>(
  ({ className, ...props }, ref) => <Dialog.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-text", className)} {...props} />
)
DialogTitle.displayName = Dialog.Title.displayName
export const DialogDescription = React.forwardRef<React.ElementRef<typeof Dialog.Description>, React.ComponentPropsWithoutRef<typeof Dialog.Description>>(
  ({ className, ...props }, ref) => <Dialog.Description ref={ref} className={cn("text-sm text-muted", className)} {...props} />
)
DialogDescription.displayName = Dialog.Description.displayName
