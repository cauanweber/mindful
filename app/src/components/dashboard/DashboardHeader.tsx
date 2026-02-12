import { LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  userName?: string
  userEmail?: string
  onLogout: () => void
}

function getDisplayName(userName?: string, userEmail?: string) {
  const name = userName?.trim()
  if (name) return name

  const email = userEmail?.trim()
  if (!email) return 'usuário'

  return email.split('@')[0]
}

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || 'U'
}

export default function DashboardHeader({
  userName,
  userEmail,
  onLogout,
}: DashboardHeaderProps) {
  const displayName = getDisplayName(userName, userEmail)
  const initials = getInitials(displayName)

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[1.75rem] tracking-[-0.02em]">Mindful</h1>
          <div className="hidden md:block w-px h-6 bg-border" />
          <p className="text-muted-foreground hidden md:block text-[0.9375rem]">
            Bem-vindo, {displayName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 text-foreground"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
