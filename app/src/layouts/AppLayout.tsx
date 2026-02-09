import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div style={{ padding: '32px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <header
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
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
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
            {user?.name || 'Usuário'}
          </p>
          <button type="button" onClick={signOut} style={{ marginTop: 8 }}>
            Sair
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
