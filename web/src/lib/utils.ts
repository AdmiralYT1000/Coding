export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), delayMs)
  }
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString()
}