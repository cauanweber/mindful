import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <section style={{ maxWidth: 420 }}>
      <h2>Entrar</h2>
      <p>Acesse sua conta para continuar.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          E-mail
          <input
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ padding: 10 }}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Senha
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ padding: 10 }}
            required
          />
        </label>

        {error && <span style={{ color: '#dc2626' }}>{error}</span>}

        <button type="submit">Entrar</button>
      </form>
    </section>
  )
}
