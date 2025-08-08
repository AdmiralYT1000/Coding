import { clsx } from 'clsx'
import React from 'react'

interface BaseProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
}

export const TextInput = React.forwardRef<HTMLInputElement, BaseProps & React.InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { id, label, error, hint, required, ...props },
  ref,
) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-600">*</span>}</label>
      <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={describedBy} className={clsx('input', error && 'ring-2 ring-red-500/30 border-red-500')} {...props} />
      {hint && <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export const Textarea = React.forwardRef<HTMLTextAreaElement, BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { id, label, error, hint, required, ...props },
  ref,
) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-600">*</span>}</label>
      <textarea ref={ref} id={id} aria-invalid={!!error} aria-describedby={describedBy} className={clsx('input min-h-[90px]', error && 'ring-2 ring-red-500/30 border-red-500')} {...props} />
      {hint && <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export function Select({ id, label, error, hint, required, children, ...props }: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-600">*</span>}</label>
      <select id={id} aria-invalid={!!error} aria-describedby={describedBy} className={clsx('input', error && 'ring-2 ring-red-500/30 border-red-500')} {...props}>
        {children}
      </select>
      {hint && <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}