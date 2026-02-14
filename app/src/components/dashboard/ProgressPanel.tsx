import { Calendar, CheckCircle, Target, TrendingUp } from 'lucide-react'
import { m } from 'motion/react'
import useIsMobile from '../../hooks/useIsMobile'

interface ProgressPanelProps {
  tasksDone: number
  tasksTotal: number
  goalsDone: number
  goalsTotal: number
  notesTotal: number
  diaryFilled: boolean
}

type ProgressDataInput = Pick<
  ProgressPanelProps,
  'tasksDone' | 'tasksTotal' | 'goalsDone' | 'goalsTotal' | 'notesTotal' | 'diaryFilled'
>

export function buildProgressData({
  tasksDone,
  tasksTotal,
  goalsDone,
  goalsTotal,
  notesTotal,
  diaryFilled,
}: ProgressDataInput) {
  const stats = [
    {
      label: 'Tarefas concluídas',
      value: tasksDone,
      total: tasksTotal,
      percentage: tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Metas semanais',
      value: goalsDone,
      total: goalsTotal,
      percentage: goalsTotal ? Math.round((goalsDone / goalsTotal) * 100) : 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Diário preenchido',
      value: diaryFilled ? 1 : 0,
      total: 1,
      percentage: diaryFilled ? 100 : 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const activeStats = stats.filter((stat) => stat.label === 'Diário preenchido' || stat.total > 0)
  const overallProgress = activeStats.length
    ? Math.round(activeStats.reduce((sum, stat) => sum + stat.percentage, 0) / activeStats.length)
    : 0

  return { stats, overallProgress, notesTotal }
}

export default function ProgressPanel({
  tasksDone,
  tasksTotal,
  goalsDone,
  goalsTotal,
  notesTotal,
  diaryFilled,
}: ProgressPanelProps) {
  const isMobile = useIsMobile()
  const { stats, overallProgress } = buildProgressData({
    tasksDone,
    tasksTotal,
    goalsDone,
    goalsTotal,
    notesTotal,
    diaryFilled,
  })

  return (
    <m.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 16 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.25 } : undefined}
      transition={{ duration: 0.45 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <TrendingUp size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[1.125rem]">Progresso pessoal</h3>
          <p className="text-muted-foreground text-[0.8125rem]">
            Resumo da sua semana
          </p>
        </div>
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="mb-6 p-4 rounded-xl bg-secondary/60 border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Progresso geral</span>
          <span className="text-sm font-semibold text-foreground">{overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <m.div
            className="h-2 rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {notesTotal} notas registradas
        </p>
      </m.div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 + index * 0.08, duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold text-foreground">
                {stat.value}/{stat.total}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{stat.percentage}%</span>
          </m.div>
        ))}
      </div>
    </m.div>
  )
}
