import { createContext, useContext, useEffect, useState } from 'react'
import * as auth from '../services/auth'

type User = { id: string; name: string; email: string }

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    auth
      .me()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email: string, password: string) {
    const data = await auth.login(email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await auth.register(name, email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  function signOut() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
