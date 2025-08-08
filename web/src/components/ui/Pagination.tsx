interface Props {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-neutral-600 dark:text-neutral-400">Page {page} of {totalPages} · {total} items</div>
      <div className="flex items-center gap-2">
        <button className="btn-ghost px-3 py-1" onClick={() => onPageChange(1)} disabled={!canPrev} aria-disabled={!canPrev} aria-label="First page">«</button>
        <button className="btn-ghost px-3 py-1" onClick={() => onPageChange(page - 1)} disabled={!canPrev} aria-disabled={!canPrev} aria-label="Previous page">Prev</button>
        <button className="btn-ghost px-3 py-1" onClick={() => onPageChange(page + 1)} disabled={!canNext} aria-disabled={!canNext} aria-label="Next page">Next</button>
        <button className="btn-ghost px-3 py-1" onClick={() => onPageChange(totalPages)} disabled={!canNext} aria-disabled={!canNext} aria-label="Last page">»</button>
      </div>
    </div>
  )
}