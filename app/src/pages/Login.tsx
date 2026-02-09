import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.')
      return
    }

    try {
      await signIn(email, password)
      setError('')
      navigate('/app')
    } catch {
      setError('Não foi possível entrar. Verifique seus dados.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="mb-3 text-[2.5rem] tracking-[-0.02em]">Mindful</h1>
          <p className="text-muted-foreground text-[0.9375rem]">
            Seu espaço pessoal para clareza e foco
          </p>
        </div>

        <motion.div
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
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

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
        </motion.div>
      </motion.div>
    </div>
  )
}
