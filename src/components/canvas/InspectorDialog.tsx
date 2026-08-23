import { DialogHeader, DialogTitle } from "../ui/dialog"
import * as Dialog from "@radix-ui/react-dialog"
import { ARCH_DATA, ENT_DATA } from "../../lib/arch-data"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  archKey?: string | null
  entityKey?: string | null
}

export function InspectorDialog({ open, onOpenChange, archKey, entityKey }: Props) {
  const data = archKey ? ARCH_DATA[archKey] : entityKey ? ENT_DATA[entityKey] : null
  if (!data) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-panel p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle>{data.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: data.html }} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
