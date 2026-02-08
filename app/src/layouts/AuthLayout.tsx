import { NavLink, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Mindful</h1>
        <nav style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#111827' : '#6b7280',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#111827' : '#6b7280',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Register
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
