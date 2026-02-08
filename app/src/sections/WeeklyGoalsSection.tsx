import { useState } from 'react'
import type { WeeklyGoal } from '../types/weeklyGoal'

function weekStartISO() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

export default function WeeklyGoalsSection() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [title, setTitle] = useState('')
  const weekStart = weekStartISO()

  function handleAdd() {
    if (!title.trim()) return

    const newGoal: WeeklyGoal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      weekStart,
      done: false,
    }

    setGoals([newGoal, ...goals])
    setTitle('')
  }

  function toggleGoal(id: string) {
    setGoals(
      goals.map((goal) => (goal.id === id ? { ...goal, done: !goal.done } : goal)),
    )
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

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {goals.length === 0 && <li>Nenhuma meta criada.</li>}
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
              onChange={() => toggleGoal(goal.id)}
            />
            <span style={{ textDecoration: goal.done ? 'line-through' : 'none' }}>
              {goal.title}
            </span>
            <small style={{ marginLeft: 'auto' }}>Semana {goal.weekStart}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
