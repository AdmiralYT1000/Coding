import { NavLink } from 'react-router-dom'

export default function Nav() {
  const linkBase = 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
  const active = 'bg-neutral-100 dark:bg-neutral-800'
  return (
    <nav className="flex items-center gap-2">
      <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>Dashboard</NavLink>
      <NavLink to="/projects" className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>Projects</NavLink>
      <NavLink to="/clients" className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>Clients</NavLink>
      <NavLink to="/settings" className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>Settings</NavLink>
    </nav>
  )
}