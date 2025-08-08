import { useEffect, useMemo, useState } from 'react'
import { debounce } from '../../lib/utils'

interface Props {
  placeholder?: string
  onSearch: (value: string) => void
}

export default function SearchBar({ placeholder = 'Search…', onSearch }: Props) {
  const [value, setValue] = useState('')
  const debounced = useMemo(() => debounce(onSearch, 300), [onSearch])

  useEffect(() => {
    debounced(value)
  }, [value, debounced])

  return (
    <div className="relative">
      <input
        type="search"
        className="input pl-9"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        role="searchbox"
        aria-label="Search"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
    </div>
  )
}