import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardHeader from '../components/dashboard/DashboardHeader'

export default function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader userName={user?.name} onLogout={signOut} />
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        <nav className="flex gap-3 mb-6 text-sm text-muted-foreground">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `transition-colors ${isActive ? 'text-foreground font-semibold' : ''}`
            }
          >
            Dashboard
          </NavLink>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
