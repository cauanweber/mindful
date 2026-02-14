import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Flag, Plus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import type { WeeklyGoal } from '../types/weeklyGoal'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import {
  dashboardKeys,
  fetchWeeklyGoals,
  getWeekStartISO,
} from '../services/dashboardQueries'

export default function WeeklyGoalsSection() {
  const isMobile = useIsMobile()
  const toast = useToast()
  const queryClient = useQueryClient()
  const weekStart = useMemo(() => getWeekStartISO(), [])
  const {
    data: goalsResponse,
    isLoading: loading,
    error: goalsLoadError,
  } = useQuery<{ weekStart: string; goals: WeeklyGoal[] }>({
    queryKey: dashboardKeys.weeklyGoals(weekStart),
    queryFn: () => fetchWeeklyGoals(weekStart),
  })
  const goals = goalsResponse?.goals ?? []
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!goalsLoadError) return
    const message = getApiErrorMessage(goalsLoadError, 'Não foi possível carregar as metas.')
    setError((current) => current || message)
    toast.error(message)
  }, [goalsLoadError, toast])

  async function handleAdd() {
    if (!title.trim()) return

    try {
      const { data } = await http.post<WeeklyGoal>('/weekly-goals', {
        title: title.trim(),
        weekStart,
      })
      queryClient.setQueryData<{ weekStart: string; goals: WeeklyGoal[] }>(
        dashboardKeys.weeklyGoals(weekStart),
        (prev: { weekStart: string; goals: WeeklyGoal[] } | undefined) => {
          const nextGoals = [data, ...(prev?.goals ?? [])]
          return { weekStart, goals: nextGoals }
        },
      )
      setTitle('')
      setError('')
      toast.success('Meta criada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível criar a meta.')
      setError(message)
      toast.error(message)
    }
  }

  async function toggleGoal(goal: WeeklyGoal) {
    try {
      const { data } = await http.patch<WeeklyGoal>(`/weekly-goals/${goal.id}`, {
        done: !goal.done,
      })
      queryClient.setQueryData<{ weekStart: string; goals: WeeklyGoal[] }>(
        dashboardKeys.weeklyGoals(weekStart),
        (prev: { weekStart: string; goals: WeeklyGoal[] } | undefined) => {
          const nextGoals = (prev?.goals ?? []).map((item) =>
            item.id === goal.id ? data : item,
          )
          return { weekStart, goals: nextGoals }
        },
      )
      setError('')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a meta.')
      setError(message)
      toast.error(message)
    }
  }

  async function removeGoal(goal: WeeklyGoal) {
    try {
      await http.delete(`/weekly-goals/${goal.id}`)
      queryClient.setQueryData<{ weekStart: string; goals: WeeklyGoal[] }>(
        dashboardKeys.weeklyGoals(weekStart),
        (prev: { weekStart: string; goals: WeeklyGoal[] } | undefined) => {
          const nextGoals = (prev?.goals ?? []).filter((item) => item.id !== goal.id)
          return { weekStart, goals: nextGoals }
        },
      )
      setError('')
      toast.success('Meta removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a meta.')
      setError(message)
      toast.error(message)
    }
  }

  const completedCount = goals.filter((goal) => goal.done).length
  const progress = goals.length ? Math.round((completedCount / goals.length) * 100) : 0

  return (
    <m.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Flag size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[1.125rem]">Metas semanais</h3>
          <p className="text-muted-foreground text-[0.8125rem]">
            {completedCount}/{goals.length} concluídas
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-secondary/60 border border-border p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progresso da semana</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova meta da semana"
          className="flex-1 px-4 py-2.5 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="p-2.5 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label="Adicionar meta semanal"
        >
          <Plus size={18} />
        </button>
      </div>

      {error && (
        <div className="text-center py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && <SectionState type="loading" message="Carregando metas..." />}
        {!loading && goals.length === 0 && (
          <SectionState type="empty" message="Nenhuma meta criada." />
        )}
        <AnimatePresence>
          {goals.map((goal) => (
            <m.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/40 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  goal.done
                    ? 'bg-accent border-accent text-accent-foreground'
                    : 'border-muted-foreground/40 text-muted-foreground'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
                aria-label={
                  goal.done
                    ? `Marcar meta "${goal.title}" como não concluída`
                    : `Marcar meta "${goal.title}" como concluída`
                }
                aria-pressed={goal.done}
              >
                {goal.done && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    goal.done ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {goal.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Semana {goal.weekStart.slice(0, 10)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeGoal(goal)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Remover
              </button>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </m.div>
  )
}
