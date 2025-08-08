import { Moon, Sun } from 'lucide-react'
import Timer from './components/Timer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import ProjectsPage from './pages/ProjectsPage'
import ClientsPage from './pages/ClientsPage'
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/DashboardPage'

interface AppProps {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

export default function App({ isDark, setIsDark }: AppProps) {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
        <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-brand-600 shadow ring-4 ring-brand-500/20" aria-hidden="true"></div>
              <h1 className="text-lg font-semibold tracking-tight">Timeflow</h1>
            </div>
            <div className="flex items-center gap-3">
              <Nav />
              <button
                className="btn-ghost rounded-full p-2"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8">
          <Routes>
            <Route path="/" element={<>
              <DashboardPage />
              <section className="card">
                <div className="p-6">
                  <Timer />
                </div>
              </section>
            </>} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}