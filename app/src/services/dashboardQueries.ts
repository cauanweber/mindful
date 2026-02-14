import http from './http'
import type { Task } from '../types/task'
import type { Note } from '../types/note'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { DiaryEntry } from '../types/diary'

export const dashboardKeys = {
  tasks: ['tasks'] as const,
  notes: ['notes'] as const,
  diaryToday: ['diary', 'today'] as const,
  weeklyGoals: (weekStart: string) => ['weekly-goals', weekStart] as const,
}

export function getWeekStartISO() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

export async function fetchTasks() {
  const { data } = await http.get<Task[]>('/tasks')
  return data
}

export async function fetchNotes() {
  const { data } = await http.get<Note[]>('/notes')
  return data
}

export async function fetchDiaryToday() {
  const { data } = await http.get<DiaryEntry | null>('/diary/today')
  return data
}

export async function fetchWeeklyGoals(weekStart: string) {
  const { data } = await http.get<{ weekStart: string; goals: WeeklyGoal[] }>('/weekly-goals', {
    params: { weekStart },
  })
  return data
}
