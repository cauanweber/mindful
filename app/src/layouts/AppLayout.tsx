import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.5px' }}>
          Mindful
        </h1>
        <nav style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <NavLink
            to="/app"
            end
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#0f172a' : '#64748b',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            Dashboard
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
