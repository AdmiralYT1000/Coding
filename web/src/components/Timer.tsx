import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, StopCircle, RotateCcw, Flag, Tag, Hash, FolderClosed } from 'lucide-react'
import { clsx } from 'clsx'

type Lap = {
  id: string
  atMs: number
  deltaMs: number
  note?: string
}

const sampleProjects = [
  { id: 'p1', name: 'Acme Website Redesign' },
  { id: 'p2', name: 'Mobile App Prototype' },
  { id: 'p3', name: 'Consulting - Q3' },
]

function formatTime(ms: number): { hh: string; mm: string; ss: string } {
  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)
  return {
    hh: String(hours).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
  }
}

function useRafTicker(active: boolean, onTick: (now: number) => void) {
  const rafRef = useRef<number | null>(null)
  const tick = useCallback((t: number) => {
    onTick(t)
    rafRef.current = requestAnimationFrame(tick)
  }, [onTick])

  useEffect(() => {
    if (!active) return
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, tick])
}

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false)
  const [accumulatedMs, setAccumulatedMs] = useState(0) // time before current run
  const [startTs, setStartTs] = useState<number | null>(null) // performance.now when started

  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [projectId, setProjectId] = useState<string | null>(sampleProjects[0]?.id ?? null)

  const [laps, setLaps] = useState<Lap[]>([])
  const [error, setError] = useState<string | null>(null)

  const elapsedMs = useMemo(() => {
    if (!isRunning || startTs === null) return accumulatedMs
    return accumulatedMs + (performance.now() - startTs)
  }, [isRunning, startTs, accumulatedMs])

  // Trigger rerenders smoothly while running
  useRafTicker(isRunning, () => {
    // noop: elapsedMs derives from performance.now()
  })

  const { hh, mm, ss } = formatTime(elapsedMs)

  const start = useCallback(() => {
    if (isRunning) return
    setError(null)
    setStartTs(performance.now())
    setIsRunning(true)
  }, [isRunning])

  const pause = useCallback(() => {
    if (!isRunning || startTs === null) return
    const delta = performance.now() - startTs
    setAccumulatedMs(prev => prev + delta)
    setStartTs(null)
    setIsRunning(false)
  }, [isRunning, startTs])

  const reset = useCallback(() => {
    setIsRunning(false)
    setStartTs(null)
    setAccumulatedMs(0)
    setLaps([])
  }, [])

  const stop = useCallback(() => {
    if (isRunning) {
      pause()
    }
    // In a future step, this will create a time entry record
  }, [isRunning, pause])

  const addLap = useCallback(() => {
    const nowMs = elapsedMs
    const lastAt = laps.length > 0 ? laps[laps.length - 1].atMs : 0
    const deltaMs = nowMs - lastAt
    setLaps(prev => [
      ...prev,
      { id: crypto.randomUUID(), atMs: nowMs, deltaMs },
    ])
  }, [elapsedMs, laps])

  // Tag handlers
  const commitTagInput = useCallback(() => {
    const raw = tagInput.trim()
    if (!raw) return
    const parts = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    const unique = Array.from(new Set([...tags, ...parts.map(p => p.toLowerCase())]))
    setTags(unique)
    setTagInput('')
  }, [tagInput, tags])

  const removeTag = useCallback((t: string) => {
    setTags(prev => prev.filter(x => x !== t))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (e.code === 'Space') {
        e.preventDefault()
        isRunning ? pause() : start()
      } else if (e.key.toLowerCase() === 'l') {
        if (isRunning) addLap()
      } else if (e.key.toLowerCase() === 'r') {
        reset()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isRunning, start, pause, reset, addLap])

  // Validation example
  useEffect(() => {
    if (name.length > 80) setError('Name is too long (max 80 characters).')
    else setError(null)
  }, [name])

  const timeDigits = useMemo(() => [hh, mm, ss], [hh, mm, ss])

  return (
    <div className="space-y-6" aria-label="Timer Component">
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center gap-2 rounded-2xl border border-neutral-200/70 bg-white/70 px-6 py-4 shadow-soft ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-brand-500/0 via-brand-500/10 to-brand-500/0 blur-2xl" aria-hidden="true" />
          <div className="sr-only" aria-live="polite" aria-atomic="true">{hh}:{mm}:{ss}</div>
          <TimeDisplay parts={timeDigits} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {isRunning ? (
            <button className="btn-primary" onClick={pause} aria-label="Pause timer">
              <Pause className="size-4" /> Pause
            </button>
          ) : (
            <button className="btn-primary animate-pulse-glow" onClick={start} aria-label="Start timer">
              <Play className="size-4" /> Start
            </button>
          )}
          <button className="btn-ghost" onClick={addLap} disabled={!isRunning} aria-disabled={!isRunning} aria-label="Add lap">
            <Flag className="size-4" /> Lap
          </button>
          <button className="btn-ghost" onClick={reset} aria-label="Reset timer">
            <RotateCcw className="size-4" /> Reset
          </button>
          <button className="btn-danger" onClick={stop} aria-label="Stop timer">
            <StopCircle className="size-5" /> Stop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Entry name</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                className="input pr-10"
                placeholder="e.g. Homepage layout review"
                value={name}
                onChange={e => setName(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? 'name-error' : undefined}
              />
              <Hash className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>
          {error && (
            <p id="name-error" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Project</label>
          <div className="relative">
            <FolderClosed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <select
              className="input appearance-none pl-10 pr-8"
              value={projectId ?? ''}
              onChange={e => setProjectId(e.target.value || null)}
              aria-label="Select project"
            >
              {sampleProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="">No project</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(t => (
            <span key={t} className="chip">
              <Tag className="size-3" />
              {t}
              <button className="ml-1 rounded-full p-0.5 hover:bg-neutral-200/80 dark:hover:bg-neutral-700" aria-label={`Remove tag ${t}`} onClick={() => removeTag(t)}>
                ×
              </button>
            </span>
          ))}
          <input
            className="input max-w-xs"
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                commitTagInput()
              }
            }}
            onBlur={commitTagInput}
            aria-label="Add tags"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Laps</h3>
          {laps.length > 0 && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{laps.length} lap{laps.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="max-h-60 overflow-auto rounded-xl border border-neutral-200/70 dark:border-neutral-800">
          {laps.length === 0 ? (
            <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No laps yet. Press Lap to mark segments.</div>
          ) : (
            <ul className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
              {laps.map((lap, idx) => {
                const t = formatTime(lap.deltaMs)
                const total = formatTime(lap.atMs)
                return (
                  <li key={lap.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{idx + 1}</span>
                      <span className="tabular-nums text-neutral-700 dark:text-neutral-300">{t.hh}:{t.mm}:{t.ss}</span>
                    </div>
                    <span className="tabular-nums text-neutral-500 dark:text-neutral-400">Total {total.hh}:{total.mm}:{total.ss}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Digit({ value }: { value: string }) {
  return (
    <div className="relative h-16 w-12 select-none overflow-hidden rounded-xl bg-neutral-100 text-center text-5xl font-bold leading-[4rem] tabular-nums text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="absolute inset-0"
          aria-hidden
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function TimeDisplay({ parts }: { parts: string[] }) {
  const [h, m, s] = parts
  return (
    <div className="flex items-center gap-2">
      <DigitGroup value={h} />
      <Colon />
      <DigitGroup value={m} />
      <Colon />
      <DigitGroup value={s} />
    </div>
  )
}

function DigitGroup({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1">
      <Digit value={value[0]} />
      <Digit value={value[1]} />
    </div>
  )
}

function Colon() {
  return (
    <div className="flex h-16 w-6 items-center justify-center">
      <div className="flex h-10 flex-col items-center justify-between py-1">
        <span className="h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-200" />
        <span className="h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-200" />
      </div>
    </div>
  )
}