import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl">Página não encontrada</h2>
        <p className="text-muted-foreground">
          Voltar para o <Link to="/app" className="text-accent">Dashboard</Link>.
        </p>
      </div>
    </div>
  )
}
