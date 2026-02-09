import { useEffect, useMemo, useState } from 'react'
import type { WeeklyGoal } from '../types/weeklyGoal'
import http from '../services/http'

function weekStartISO() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

export default function WeeklyGoalsSection() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const weekStart = useMemo(() => weekStartISO(), [])

  useEffect(() => {
    let active = true

    async function loadGoals() {
      try {
        const { data } = await http.get<{ weekStart: string; goals: WeeklyGoal[] }>(
          '/weekly-goals',
          { params: { weekStart } },
        )
        if (active) setGoals(data.goals)
      } catch {
        if (active) setError('Não foi possível carregar as metas.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadGoals()

    return () => {
      active = false
    }
  }, [weekStart])

  async function handleAdd() {
    if (!title.trim()) return

    try {
      const { data } = await http.post<WeeklyGoal>('/weekly-goals', {
        title: title.trim(),
        weekStart,
      })
      setGoals([data, ...goals])
      setTitle('')
    } catch {
      setError('Não foi possível criar a meta.')
    }
  }

  async function toggleGoal(goal: WeeklyGoal) {
    try {
      const { data } = await http.patch<WeeklyGoal>(`/weekly-goals/${goal.id}`, {
        done: !goal.done,
      })
      setGoals(goals.map((item) => (item.id === goal.id ? data : item)))
    } catch {
      setError('Não foi possível atualizar a meta.')
    }
  }

  async function removeGoal(goal: WeeklyGoal) {
    try {
      await http.delete(`/weekly-goals/${goal.id}`)
      setGoals(goals.filter((item) => item.id !== goal.id))
    } catch {
      setError('Não foi possível remover a meta.')
    }
  }

  return (
    <div>
      <h3>Metas semanais</h3>
      <p>Direção de médio prazo para guiar o foco da semana.</p>

      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova meta da semana"
          style={{ padding: 10 }}
        />
        <button type="button" onClick={handleAdd}>
          Adicionar meta
        </button>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {loading && <li>Carregando...</li>}
        {!loading && goals.length === 0 && <li>Nenhuma meta criada.</li>}
        {goals.map((goal) => (
          <li
            key={goal.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              border: '1px solid #e5e7eb',
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              checked={goal.done}
              onChange={() => toggleGoal(goal)}
            />
            <span style={{ textDecoration: goal.done ? 'line-through' : 'none' }}>
              {goal.title}
            </span>
            <small style={{ marginLeft: 'auto' }}>Semana {goal.weekStart}</small>
            <button
              type="button"
              onClick={() => removeGoal(goal)}
              style={{ marginLeft: 8 }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
