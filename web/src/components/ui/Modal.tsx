import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  initialFocusRef?: React.RefObject<HTMLElement>
}

export default function Modal({ open, title, onClose, children, initialFocusRef }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const container = document.body

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const toFocus = initialFocusRef?.current
    toFocus?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, initialFocusRef])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div ref={overlayRef} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-xl" role="document">
          <div className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-3 dark:border-neutral-800">
            <h2 id="modal-title" className="text-base font-semibold">{title}</h2>
            <button className="btn-ghost rounded-full p-1" aria-label="Close" onClick={onClose}>✕</button>
          </div>
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    container
  )
}