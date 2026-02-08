import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section>
      <h2>Página não encontrada</h2>
      <p>
        Voltar para o <Link to="/app">Dashboard</Link>.
      </p>
    </section>
  )
}
