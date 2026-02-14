import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(''), 3500)
    return () => window.clearTimeout(timer)
  }, [error])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.')
      return
    }

    try {
      await signIn(email, password)
      setError('')
      toast.success('Login realizado com sucesso.')
      navigate('/app')
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Não foi possível entrar. Verifique seus dados.',
      )
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="mb-3 flex items-center justify-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Mindful"
              className="h-10 w-10 rounded-lg object-cover border border-border"
            />
            <h1 className="text-[2.5rem] tracking-[-0.02em]">Mindful</h1>
          </div>
          <p className="text-muted-foreground text-[0.9375rem]">
            Seu espaço pessoal para clareza e foco
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8"
        >
          <h2 className="mb-6 text-[1.5rem]">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-foreground">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError('')
                }}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="voce@exemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError('')
                }}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <LogIn size={18} />
              <span>Entrar</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-[0.875rem]">
              Não tem conta?{' '}
              <Link
                to="/register"
                className="text-accent hover:underline transition-all duration-200"
              >
                Criar agora
              </Link>
            </p>
          </div>
        </m.div>
      </m.div>

      <AnimatePresence>
        {error && (
          <m.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-[10px] z-50 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-destructive text-sm"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  )
}
