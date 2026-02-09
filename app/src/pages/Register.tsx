import { useState } from 'react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    setError('')
  }

  return (
    <section style={{ maxWidth: 420 }}>
      <h2>Cadastro</h2>
      <p>Crie sua conta para começar.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Nome
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ padding: 10 }}
            required
          />
        </label>

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
            placeholder="Crie uma senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ padding: 10 }}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Confirmar senha
          <input
            type="password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            style={{ padding: 10 }}
            required
          />
        </label>

        {error && <span style={{ color: '#dc2626' }}>{error}</span>}

        <button type="submit">Criar conta</button>
      </form>
    </section>
  )
}
