"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

type ConfirmContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = React.createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions>({})
  const [isOpen, setIsOpen] = React.useState(false)
  const resolveRef = React.useRef<(value: boolean) => void>(() => {})

  const confirm = React.useCallback((options?: ConfirmOptions) => {
    setOptions({
      title: options?.title ?? "Are you absolutely sure?",
      description: options?.description ?? "This action cannot be undone.",
      confirmText: options?.confirmText ?? "Confirm",
      cancelText: options?.cancelText ?? "Cancel",
      variant: options?.variant ?? "default",
    })
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolveRef.current(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolveRef.current(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-black text-white font-mono rounded-none">
          <DialogHeader>
            <DialogTitle>{options.title}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {options.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-zinc-800 bg-transparent hover:bg-zinc-900 text-white hover:text-white rounded-none h-9"
            >
              {options.cancelText}
            </Button>
            <Button
              variant={options.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              className={`rounded-none h-9 ${
                options.variant === "destructive"
                  ? "bg-red-900 hover:bg-red-800 text-white border border-red-800"
                  : "bg-white text-black hover:bg-zinc-200 border border-white"
              }`}
            >
              {options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = React.useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context
}