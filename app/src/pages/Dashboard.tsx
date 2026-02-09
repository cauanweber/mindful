import { useEffect, useState } from 'react'
import http from '../services/http'
import DiarySection from '../sections/DiarySection'
import NotesSection from '../sections/NotesSection'
import TasksSection from '../sections/TasksSection'
import WeeklyGoalsSection from '../sections/WeeklyGoalsSection'
import type { Task } from '../types/task'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Note } from '../types/note'
import type { DiaryEntry } from '../types/diary'

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  background: '#ffffff',
}

export default function Dashboard() {
  const [summary, setSummary] = useState({
    tasksTotal: 0,
    tasksDone: 0,
    goalsTotal: 0,
    goalsDone: 0,
    notesTotal: 0,
    diaryFilled: false,
  })
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const [tasksRes, goalsRes, notesRes, diaryRes] = await Promise.all([
          http.get<Task[]>('/tasks'),
          http.get<{ weekStart: string; goals: WeeklyGoal[] }>('/weekly-goals'),
          http.get<Note[]>('/notes'),
          http.get<DiaryEntry | null>('/diary/today'),
        ])

        if (!active) return

        const tasks = tasksRes.data
        const goals = goalsRes.data.goals
        const notes = notesRes.data
        const diary = diaryRes.data

        setSummary({
          tasksTotal: tasks.length,
          tasksDone: tasks.filter((task) => task.completed).length,
          goalsTotal: goals.length,
          goalsDone: goals.filter((goal) => goal.done).length,
          notesTotal: notes.length,
          diaryFilled: Boolean(diary && diary.content?.trim()),
        })
      } catch {
        if (active) setSummaryError('Não foi possível carregar o progresso.')
      }
    }

    loadSummary()

    return () => {
      active = false
    }
  }, [])

  return (
    <section>
      <h2>Dashboard</h2>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h3>Progresso pessoal</h3>
        {summaryError ? (
          <p style={{ color: '#dc2626' }}>{summaryError}</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <span>
              Diário de hoje: {summary.diaryFilled ? 'preenchido' : 'pendente'}
            </span>
            <span>
              Tarefas: {summary.tasksDone}/{summary.tasksTotal} concluídas
            </span>
            <span>
              Metas semanais: {summary.goalsDone}/{summary.goalsTotal} concluídas
            </span>
            <span>Notas: {summary.notesTotal}</span>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 16,
        }}
      >
        <div style={cardStyle}>
          <DiarySection />
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={cardStyle}>
            <TasksSection />
          </div>
          <div style={cardStyle}>
            <WeeklyGoalsSection />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, ...cardStyle }}>
        <NotesSection />
      </div>
    </section>
  )
}
