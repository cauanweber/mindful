import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(''), 3500)
    return () => window.clearTimeout(timer)
  }, [error])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      await signUp(name, email, password)
      setError('')
      toast.success('Conta criada com sucesso.')
      navigate('/app')
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Não foi possível criar a conta. Tente novamente.',
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
            Crie sua conta e organize sua semana
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-8"
        >
          <h2 className="mb-6 text-[1.5rem]">Cadastro</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-2 text-foreground">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (error) setError('')
                }}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="Seu nome"
                required
              />
            </div>

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
                placeholder="Crie uma senha"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-foreground">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (error) setError('')
                }}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="Repita a senha"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <UserPlus size={18} />
              <span>Criar conta</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-[0.875rem]">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="text-accent hover:underline transition-all duration-200"
              >
                Entrar
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
