import { Moon, Sun } from 'lucide-react'
import Timer from './components/Timer'

interface AppProps {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

export default function App({ isDark, setIsDark }: AppProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-brand-600 shadow ring-4 ring-brand-500/20"></div>
            <h1 className="text-lg font-semibold tracking-tight">Timeflow</h1>
          </div>
          <button
            className="btn-ghost rounded-full p-2"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-12">
        <section className="card col-span-1 lg:col-span-7">
          <div className="p-6">
            <Timer />
          </div>
        </section>
        <aside className="card col-span-1 lg:col-span-5">
          <div className="p-6 space-y-3">
            <h2 className="text-base font-semibold">Tips</h2>
            <ul className="list-disc pl-5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>Press Space to start/pause</li>
              <li>Press L to add a lap</li>
              <li>Press R to reset</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}